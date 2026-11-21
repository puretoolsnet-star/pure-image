"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLiveTool } from "@/components/tools/use-live-tool";
import {
  convertToWebpAdvanced,
  type WebpAlphaMode,
  type WebpMode,
} from "@/lib/image/convert-webp";
import type { LivePreviewImage } from "@/lib/image/types";

export function useWebpConvert() {
  const [mode, setMode] = useState<WebpMode>("auto");
  const [quality, setQuality] = useState(82);
  const [maxWidth, setMaxWidth] = useState(4096);
  const [alphaMode, setAlphaMode] = useState<WebpAlphaMode>("preserve");
  const [backdrop, setBackdrop] = useState("#ffffff");
  const [focusId, setFocusId] = useState<string | null>(null);

  const worker = useCallback(
    (file: File) =>
      convertToWebpAdvanced(file, {
        mode,
        quality,
        maxWidth,
        alphaMode,
        backdrop,
      }),
    [alphaMode, backdrop, maxWidth, mode, quality],
  );

  const batch = useLiveTool(worker);

  useEffect(() => {
    if (batch.items.length && !focusId) setFocusId(batch.items[0]!.id);
  }, [batch.items, focusId]);

  const focusItem: LivePreviewImage | null = useMemo(() => {
    if (!batch.items.length) return null;
    const id = focusId && batch.items.some((i) => i.id === focusId) ? focusId : batch.items[0]!.id;
    return batch.items.find((i) => i.id === id) ?? null;
  }, [batch.items, focusId]);

  const stats = useMemo(() => {
    const items = batch.items;
    const original = items.reduce((s, i) => s + i.originalSize, 0);
    const output = items.reduce((s, i) => s + i.outputSize, 0);
    const delta = output - original;
    const pct = original > 0 ? Math.round((delta / original) * 100) : 0;
    return { count: items.length, original, output, delta, pct };
  }, [batch.items]);

  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);

  return {
    ...batch,
    mode,
    setMode,
    quality,
    setQuality,
    maxWidth,
    setMaxWidth,
    alphaMode,
    setAlphaMode,
    backdrop,
    setBackdrop,
    focusItem,
    focusId,
    setFocusId,
    stats,
    onFiles,
  };
}