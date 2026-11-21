"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  compressWithQuality,
  type CompressFormatChoice,
} from "@/lib/image/compress-advanced";
import { downloadBlob, downloadZip } from "@/lib/image/process";
import type { LivePreviewImage } from "@/lib/image/types";
import { useI18n } from "@/i18n/context";

const CONCURRENCY = 2;

export type BatchQueueStatus = "queued" | "processing" | "done" | "error";

export type BatchFileOverrides = { quality?: number; maxWidth?: number };

export type BatchQueueRow = {
  id: string;
  name: string;
  status: BatchQueueStatus;
  originalSize: number;
  sourcePreviewUrl: string;
  result?: LivePreviewImage;
  errorMessage?: string;
  overrides?: BatchFileOverrides;
};

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useBatchCompress() {
  const { t } = useI18n();
  const filesRef = useRef<Map<string, File>>(new Map());
  const overridesRef = useRef<Map<string, BatchFileOverrides>>(new Map());
  const abortRef = useRef(false);
  const pumpingRef = useRef(false);
  const requeueTimerRef = useRef<number | null>(null);

  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [preservePixels, setPreservePixels] = useState(false);
  const [format, setFormat] = useState<CompressFormatChoice>("auto");
  const [queue, setQueue] = useState<BatchQueueRow[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);

  const effectiveMaxWidth = preservePixels ? 16_384 : maxWidth;

  const stats = useMemo(() => {
    const done = queue.filter((q) => q.status === "done" && q.result);
    const original = done.reduce((s, q) => s + q.originalSize, 0);
    const output = done.reduce((s, q) => s + (q.result?.outputSize ?? 0), 0);
    const saved = Math.max(0, original - output);
    const pct = original > 0 ? Math.round((saved / original) * 100) : 0;
    return {
      total: queue.length,
      done: done.length,
      original,
      output,
      saved,
      pct,
      processing: queue.filter((q) => q.status === "processing").length,
      queued: queue.filter((q) => q.status === "queued").length,
      errors: queue.filter((q) => q.status === "error").length,
      busy: queue.some((q) => q.status === "processing" || q.status === "queued"),
      progress:
        queue.length > 0
          ? Math.round(
              (queue.filter((q) => q.status === "done" || q.status === "error").length /
                queue.length) *
                100,
            )
          : 0,
    };
  }, [queue]);

  const focusRow = useMemo(() => {
    const id = focusId ?? queue.find((q) => q.status === "done")?.id;
    return id ? queue.find((q) => q.id === id) ?? null : null;
  }, [queue, focusId]);

  const focusItem = focusRow?.result ?? null;

  const processOne = useCallback(
    async (
      id: string,
      sourcePreviewUrl: string,
      qGlobal: number,
      mw: number,
      fmt: CompressFormatChoice,
    ) => {
      const file = filesRef.current.get(id);
      if (!file) return;
      const ov = overridesRef.current.get(id);
      const q = ov?.quality ?? qGlobal;
      const m = ov?.maxWidth ?? mw;

      setQueue((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: "processing", errorMessage: undefined } : row,
        ),
      );

      try {
        const result = await compressWithQuality(file, q, m, fmt);
        if (abortRef.current) {
          setQueue((prev) =>
            prev.map((row) => (row.id === id ? { ...row, status: "queued" } : row)),
          );
          return;
        }
        const live: LivePreviewImage = {
          ...result,
          id,
          sourcePreviewUrl,
        };
        setQueue((prev) =>
          prev.map((row) =>
            row.id === id
              ? { ...row, status: "done", result: live, errorMessage: undefined }
              : row,
          ),
        );
      } catch {
        if (abortRef.current) return;
        setQueue((prev) =>
          prev.map((row) =>
            row.id === id
              ? {
                  ...row,
                  status: "error",
                  errorMessage: t.batchCompress.errorProcessing,
                }
              : row,
          ),
        );
      }
    },
    [t.batchCompress.errorProcessing],
  );

  const runPump = useCallback(async () => {
    if (pumpingRef.current) return;
    pumpingRef.current = true;
    abortRef.current = false;
    try {
      for (;;) {
        if (abortRef.current) break;
        const snapshot = await new Promise<BatchQueueRow[]>((resolve) => {
          setQueue((prev) => {
            resolve(prev);
            return prev;
          });
        });
        const next = snapshot.filter((r) => r.status === "queued").slice(0, CONCURRENCY);
        if (!next.length) break;
        await Promise.all(
          next.map((row) =>
            processOne(row.id, row.sourcePreviewUrl, quality, effectiveMaxWidth, format),
          ),
        );
      }
    } finally {
      pumpingRef.current = false;
    }
  }, [effectiveMaxWidth, format, processOne, quality]);

  const schedulePump = useCallback(() => {
    void runPump();
  }, [runPump]);

  const addFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      const rows: BatchQueueRow[] = files.map((file) => {
        const id = makeId();
        filesRef.current.set(id, file);
        return {
          id,
          name: file.name,
          status: "queued" as const,
          originalSize: file.size,
          sourcePreviewUrl: URL.createObjectURL(file),
        };
      });
      setQueue((prev) => [...prev, ...rows]);
      setFocusId((f) => f ?? rows[0]?.id ?? null);
      schedulePump();
    },
    [schedulePump],
  );

  useEffect(() => {
    if (!queue.some((q) => q.status === "queued")) return;
    if (!pumpingRef.current) schedulePump();
  }, [queue, schedulePump]);

  useEffect(() => {
    if (requeueTimerRef.current) window.clearTimeout(requeueTimerRef.current);
    requeueTimerRef.current = window.setTimeout(() => {
      setQueue((prev) => {
        if (!prev.some((r) => r.status === "done" || r.status === "error")) return prev;
        return prev.map((row) =>
          row.status === "done" || row.status === "error"
            ? { ...row, status: "queued", result: undefined, errorMessage: undefined }
            : row,
        );
      });
      abortRef.current = false;
      schedulePump();
    }, 450);
    return () => {
      if (requeueTimerRef.current) window.clearTimeout(requeueTimerRef.current);
    };
  }, [quality, maxWidth, format, preservePixels, schedulePump]);

  const remove = useCallback((id: string) => {
    filesRef.current.delete(id);
    overridesRef.current.delete(id);
    setQueue((prev) => {
      const hit = prev.find((r) => r.id === id);
      if (hit) {
        URL.revokeObjectURL(hit.sourcePreviewUrl);
        if (hit.result) URL.revokeObjectURL(hit.result.previewUrl);
      }
      return prev.filter((r) => r.id !== id);
    });
    setFocusId((f) => (f === id ? null : f));
  }, []);

  const clearAll = useCallback(() => {
    abortRef.current = true;
    setQueue((prev) => {
      prev.forEach((r) => {
        URL.revokeObjectURL(r.sourcePreviewUrl);
        if (r.result) URL.revokeObjectURL(r.result.previewUrl);
      });
      return [];
    });
    filesRef.current.clear();
    overridesRef.current.clear();
    setFocusId(null);
  }, []);

  const cancelRun = useCallback(() => {
    abortRef.current = true;
    setQueue((prev) =>
      prev.map((row) =>
        row.status === "processing" ? { ...row, status: "queued" } : row,
      ),
    );
  }, []);

  const retry = useCallback(
    (id: string) => {
      setQueue((prev) =>
        prev.map((row) =>
          row.id === id
            ? { ...row, status: "queued", result: undefined, errorMessage: undefined }
            : row,
        ),
      );
      abortRef.current = false;
      schedulePump();
    },
    [schedulePump],
  );

  const applyOverrides = useCallback(
    (id: string, overrides: BatchFileOverrides) => {
      overridesRef.current.set(id, overrides);
      setQueue((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                overrides,
                status: "queued",
                result: undefined,
                errorMessage: undefined,
              }
            : row,
        ),
      );
      abortRef.current = false;
      schedulePump();
    },
    [schedulePump],
  );

  const downloadOne = useCallback((item: LivePreviewImage) => {
    downloadBlob(item.blob, item.name);
  }, []);

  const downloadZipAll = useCallback(() => {
    const ready = queue
      .filter((q) => q.status === "done" && q.result)
      .map((q) => q.result!);
    if (ready.length) void downloadZip(ready);
  }, [queue]);

  return {
    quality,
    setQuality,
    maxWidth,
    setMaxWidth,
    preservePixels,
    setPreservePixels,
    format,
    setFormat,
    queue,
    stats,
    focusItem,
    focusRow,
    focusId,
    setFocusId,
    addFiles,
    remove,
    clearAll,
    cancelRun,
    retry,
    applyOverrides,
    downloadOne,
    downloadZipAll,
    zipLabel: t.common.downloadZip,
  };
}