"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLiveTool } from "@/components/tools/use-live-tool";
import { supportsAvif } from "@/lib/image/effects";
import {
  convertToAvifAdvanced,
  type AvifAlphaMode,
  type AvifEffort,
  type AvifMode,
} from "@/lib/image/convert-avif";
import type { LivePreviewImage } from "@/lib/image/types";

export function useAvifConvert() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [mode, setMode] = useState<AvifMode>("auto");
  const [quality, setQuality] = useState(78);
  const [maxWidth, setMaxWidth] = useState(4096);
  const [alphaMode, setAlphaMode] = useState<AvifAlphaMode>("preserve");
  const [backdrop, setBackdrop] = useState("#ffffff");
  const [effort, setEffort] = useState<AvifEffort>("balanced");
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    void supportsAvif().then(setSupported);
  }, []);

  const worker = useCallback(
    (file: File) => {
      if (!supported) return Promise.reject(new Error("avif-unsupported"));
      return convertToAvifAdvanced(file, {
        mode,
        quality,
        maxWidth,
        alphaMode,
        backdrop,
        effort,
      });
    },
    [alphaMode, backdrop, effort, maxWidth, mode, quality, supported],
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

  const onFiles = useCallback(
    (files: File[]) => {
      if (!supported) return;
      batch.onFiles(files);
    },
    [batch, supported],
  );

  return {
    supported,
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
    effort,
    setEffort,
    focusItem,
    focusId,
    setFocusId,
    stats,
    onFiles,
  };
}