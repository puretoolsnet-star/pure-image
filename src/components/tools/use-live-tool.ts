"use client";

import { useCallback, useEffect, useRef } from "react";

import { useImageBatch } from "@/components/tools/use-image-batch";
import type { ProcessedImage } from "@/lib/image/types";

/** Wires batch ingest + debounced reprocess whenever the worker (settings) changes. */
export function useLiveTool(worker: (file: File) => Promise<ProcessedImage | null>) {
  const batch = useImageBatch();
  const skipReprocessRef = useRef(false);

  const onFiles = useCallback(
    (files: File[]) => {
      skipReprocessRef.current = true;
      void batch.run(files, worker);
    },
    [batch, worker],
  );

  const { reprocess, sourceCount } = batch;

  useEffect(() => {
    if (skipReprocessRef.current) {
      skipReprocessRef.current = false;
      return;
    }
    if (!sourceCount) return;
    const timer = window.setTimeout(() => {
      void reprocess(worker);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [worker, sourceCount, reprocess]);

  return { ...batch, onFiles };
}