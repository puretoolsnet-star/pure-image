"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import {
  presetDimensions,
  resizeImageAdvanced,
  type ResizeAdvancedOptions,
  type ResizeFitMode,
  type ResizeFormatChoice,
  type ResizePresetKey,
  type ResizeSizeMode,
} from "@/lib/image/resize-advanced";
import { downloadBlob, downloadZip } from "@/lib/image/process";
import type { LivePreviewImage } from "@/lib/image/types";
import { useI18n } from "@/i18n/context";

const CONCURRENCY = 2;
const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,.heic,.heif";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useResizeTool() {
  const { t } = useI18n();
  const filesRef = useRef<Map<string, File>>(new Map());
  const abortRef = useRef(false);
  const pumpingRef = useRef(false);
  const requeueTimerRef = useRef<number | null>(null);
  const aspectRef = useRef(16 / 9);

  const [sizeMode, setSizeMode] = useState<ResizeSizeMode>("px");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [percent, setPercent] = useState(100);
  const [lockAspect, setLockAspect] = useState(true);
  const [fitMode, setFitMode] = useState<ResizeFitMode>("fit");
  const [format, setFormat] = useState<ResizeFormatChoice>("auto");
  const [quality, setQuality] = useState(88);
  const [backdrop, setBackdrop] = useState("#ffffff");
  const [queue, setQueue] = useState<BatchQueueRow[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);

  const buildOptions = useCallback((): ResizeAdvancedOptions => {
    const mode = fitMode === "stretch" ? "stretch" : fitMode;
    return {
      sizeMode,
      width,
      height,
      percent,
      fitMode: mode,
      format,
      quality,
      backdrop,
    };
  }, [backdrop, fitMode, format, height, percent, quality, sizeMode, width]);

  const stats = useMemo(() => {
    const done = queue.filter((r) => r.status === "done" && r.result);
    const original = done.reduce((s, r) => s + r.originalSize, 0);
    const output = done.reduce((s, r) => s + (r.result?.outputSize ?? 0), 0);
    const saved = Math.max(0, original - output);
    const pct = original > 0 ? Math.round((saved / original) * 100) : 0;
    return {
      total: queue.length,
      done: done.length,
      original,
      output,
      saved,
      pct,
      processing: queue.filter((r) => r.status === "processing").length,
      queued: queue.filter((r) => r.status === "queued").length,
      errors: queue.filter((r) => r.status === "error").length,
      busy: queue.some((r) => r.status === "processing" || r.status === "queued"),
      progress:
        queue.length > 0
          ? Math.round(
              (queue.filter((r) => r.status === "done" || r.status === "error").length /
                queue.length) *
                100,
            )
          : 0,
    };
  }, [queue]);

  const focusRow = useMemo(() => {
    const id = focusId ?? queue.find((r) => r.status === "done")?.id;
    return id ? queue.find((r) => r.id === id) ?? null : null;
  }, [queue, focusId]);

  const focusItem = focusRow?.result ?? null;

  const processOne = useCallback(
    async (id: string, sourcePreviewUrl: string) => {
      const file = filesRef.current.get(id);
      if (!file) return;

      setQueue((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: "processing", errorMessage: undefined } : row,
        ),
      );

      try {
        const result = await resizeImageAdvanced(file, buildOptions());
        if (result.originalWidth && result.originalHeight) {
          aspectRef.current = result.originalWidth / result.originalHeight;
        }
        if (abortRef.current) {
          URL.revokeObjectURL(result.previewUrl);
          setQueue((prev) =>
            prev.map((row) => (row.id === id ? { ...row, status: "queued" } : row)),
          );
          return;
        }
        const live: LivePreviewImage = {
          ...result,
          id,
          sourcePreviewUrl: result.beforePreviewUrl || sourcePreviewUrl,
        };
        setQueue((prev) =>
          prev.map((row) =>
            row.id === id
              ? {
                  ...row,
                  status: "done",
                  result: live,
                  sourcePreviewUrl: live.sourcePreviewUrl,
                  errorMessage: undefined,
                }
              : row,
          ),
        );
      } catch {
        if (abortRef.current) return;
        setQueue((prev) =>
          prev.map((row) =>
            row.id === id
              ? { ...row, status: "error", errorMessage: t.resizeTool.errorProcessing }
              : row,
          ),
        );
      }
    },
    [buildOptions, t.resizeTool.errorProcessing],
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
        await Promise.all(next.map((row) => processOne(row.id, row.sourcePreviewUrl)));
        await new Promise<void>((r) => window.setTimeout(r, 0));
      }
    } finally {
      pumpingRef.current = false;
    }
  }, [processOne]);

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
    if (!queue.some((r) => r.status === "queued")) return;
    if (!pumpingRef.current) schedulePump();
  }, [queue, schedulePump]);

  useEffect(() => {
    if (requeueTimerRef.current) window.clearTimeout(requeueTimerRef.current);
    requeueTimerRef.current = window.setTimeout(() => {
      setQueue((prev) => {
        if (!prev.some((r) => r.status === "done" || r.status === "error")) return prev;
        return prev.map((row) => {
          if (row.status !== "done" && row.status !== "error") return row;
          if (row.result) URL.revokeObjectURL(row.result.previewUrl);
          return {
            ...row,
            status: "queued" as const,
            result: undefined,
            errorMessage: undefined,
          };
        });
      });
      abortRef.current = false;
      schedulePump();
    }, 450);
    return () => {
      if (requeueTimerRef.current) window.clearTimeout(requeueTimerRef.current);
    };
  }, [
    sizeMode,
    width,
    height,
    percent,
    fitMode,
    format,
    quality,
    backdrop,
    schedulePump,
  ]);

  const setWidthLocked = useCallback(
    (w: number) => {
      setWidth(w);
      if (lockAspect && sizeMode === "px" && fitMode !== "stretch") {
        setHeight(Math.max(1, Math.round(w / aspectRef.current)));
      }
    },
    [fitMode, lockAspect, sizeMode],
  );

  const setHeightLocked = useCallback(
    (h: number) => {
      setHeight(h);
      if (lockAspect && sizeMode === "px" && fitMode !== "stretch") {
        setWidth(Math.max(1, Math.round(h * aspectRef.current)));
      }
    },
    [fitMode, lockAspect, sizeMode],
  );

  const applyPreset = useCallback((key: ResizePresetKey) => {
    const p = presetDimensions(key);
    setSizeMode(p.sizeMode);
    if (p.sizeMode === "percent") {
      setPercent(p.percent);
    } else {
      setWidth(p.width);
      setHeight(p.height);
    }
    if (key !== "original") setFitMode("fit");
  }, []);

  const resetToOriginal = useCallback(() => {
    applyPreset("original");
  }, [applyPreset]);

  const remove = useCallback((id: string) => {
    filesRef.current.delete(id);
    setQueue((prev) => {
      const hit = prev.find((r) => r.id === id);
      if (hit) {
        URL.revokeObjectURL(hit.sourcePreviewUrl);
        if (hit.result) {
          URL.revokeObjectURL(hit.result.previewUrl);
          if (hit.result.sourcePreviewUrl !== hit.sourcePreviewUrl) {
            URL.revokeObjectURL(hit.result.sourcePreviewUrl);
          }
        }
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
        if (r.result) {
          URL.revokeObjectURL(r.result.previewUrl);
          URL.revokeObjectURL(r.result.sourcePreviewUrl);
        }
      });
      return [];
    });
    filesRef.current.clear();
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

  const downloadOne = useCallback((item: LivePreviewImage) => {
    downloadBlob(item.blob, item.name);
  }, []);

  const downloadZipAll = useCallback(() => {
    const ready = queue
      .filter((r) => r.status === "done" && r.result)
      .map((r) => r.result!);
    if (ready.length) void downloadZip(ready);
  }, [queue]);

  return {
    sizeMode,
    setSizeMode,
    width,
    setWidth: setWidthLocked,
    height,
    setHeight: setHeightLocked,
    percent,
    setPercent,
    lockAspect,
    setLockAspect,
    fitMode,
    setFitMode,
    format,
    setFormat,
    quality,
    setQuality,
    backdrop,
    setBackdrop,
    applyPreset,
    resetToOriginal,
    queue,
    stats,
    focusItem,
    focusRow,
    focusId,
    setFocusId,
    onFiles: addFiles,
    remove,
    clearAll,
    cancelRun,
    retry,
    downloadOne,
    downloadZipAll,
    zipLabel: t.common.downloadZip,
    accept: IMAGE_ACCEPT,
  };
}