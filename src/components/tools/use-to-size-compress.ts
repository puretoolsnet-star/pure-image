"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLiveTool } from "@/components/tools/use-live-tool";
import {
  compressToTargetKbAdvanced,
  type ToSizeFitMode,
  type ToSizeFormatChoice,
  type ToSizeStrategy,
} from "@/lib/image/compress-to-kb";
import type { LivePreviewImage } from "@/lib/image/types";

export function useToSizeCompress() {
  const [targetKb, setTargetKb] = useState(200);
  const [maxWidth, setMaxWidth] = useState(2560);
  const [fitMode, setFitMode] = useState<ToSizeFitMode>("strict");
  const [strategy, setStrategy] = useState<ToSizeStrategy>("balanced");
  const [format, setFormat] = useState<ToSizeFormatChoice>("auto");
  const [focusId, setFocusId] = useState<string | null>(null);

  const worker = useCallback(
    (file: File) =>
      compressToTargetKbAdvanced(file, {
        targetKb,
        maxWidth,
        fitMode,
        strategy,
        format,
      }),
    [targetKb, maxWidth, fitMode, strategy, format],
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

  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);

  return {
    ...batch,
    targetKb,
    setTargetKb,
    maxWidth,
    setMaxWidth,
    fitMode,
    setFitMode,
    strategy,
    setStrategy,
    format,
    setFormat,
    focusItem,
    setFocusId,
    onFiles,
  };
}