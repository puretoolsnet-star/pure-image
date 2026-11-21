"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLiveTool } from "@/components/tools/use-live-tool";
import { useQualityEstimate } from "@/components/tools/use-quality-estimate";
import { compressToTargetKb, compressWithQuality } from "@/lib/image/compress-advanced";
import { estimateOutputBytes } from "@/lib/image/estimate";
import { pickOutputMime } from "@/lib/image/output-mime";
import {
  analyzeImageFile,
  resolveMaxWidth,
  resolveQualityPercent,
  type SmartCompressMode,
} from "@/lib/image/smart-analyze";
import type { LivePreviewImage } from "@/lib/image/types";

export function useSmartCompress() {
  const [mode, setMode] = useState<SmartCompressMode>("auto");
  const [quality, setQuality] = useState(78);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [targetKb, setTargetKb] = useState(0);
  const [focusId, setFocusId] = useState<string | null>(null);

  const worker = useCallback(
    async (file: File) => {
      const analysis = await analyzeImageFile(file);
      const q = resolveQualityPercent(mode, analysis.kind, quality);
      const mw = resolveMaxWidth(mode, analysis, maxWidth);
      const estimate = await estimateOutputBytes(file, q, mw);
      const t0 = performance.now();

      const result =
        targetKb > 0 && mode === "manual"
          ? await compressToTargetKb(file, targetKb, mw)
          : await compressWithQuality(file, q, mw);

      return {
        ...result,
        outputMime: pickOutputMime(file.type),
        processingMs: Math.round(performance.now() - t0),
        contentKind: analysis.kind,
        estimatedSize: estimate,
      };
    },
    [mode, quality, maxWidth, targetKb],
  );

  const batch = useLiveTool(worker);

  const focusItem: LivePreviewImage | null = useMemo(() => {
    if (!batch.items.length) return null;
    const id = focusId && batch.items.some((i) => i.id === focusId) ? focusId : batch.items[0]!.id;
    return batch.items.find((i) => i.id === id) ?? null;
  }, [batch.items, focusId]);

  useEffect(() => {
    if (batch.items.length && !focusId) setFocusId(batch.items[0]!.id);
  }, [batch.items, focusId]);

  const focusSource =
    focusItem && batch.getSourceFile ? batch.getSourceFile(focusItem.id) ?? null : null;
  const effectiveQuality =
    focusItem?.contentKind != null
      ? resolveQualityPercent(mode, focusItem.contentKind, quality)
      : quality;
  const { estimate: estimateLabel, estimating } = useQualityEstimate(
    focusSource,
    effectiveQuality,
    resolveMaxWidth(
      mode,
      {
        kind: focusItem?.contentKind ?? "photo",
        width: focusItem?.width ?? 1920,
        height: focusItem?.height ?? 1080,
        megapixels: 1,
        hasAlpha: false,
      },
      maxWidth,
    ),
  );

  const pendingEstimateBytes = useMemo(() => {
    if (!estimateLabel) return null;
    const n = Number.parseFloat(estimateLabel);
    if (Number.isNaN(n)) return null;
    return n * 1024;
  }, [estimateLabel]);

  const onFiles = useCallback(
    (files: File[]) => {
      batch.onFiles(files);
    },
    [batch],
  );

  return {
    ...batch,
    mode,
    setMode,
    quality,
    setQuality,
    maxWidth,
    setMaxWidth,
    targetKb,
    setTargetKb,
    focusItem,
    setFocusId,
    pendingEstimate: batch.busy ? pendingEstimateBytes : null,
    estimatingPreview: estimating,
    onFiles,
  };
}