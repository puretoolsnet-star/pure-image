"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import {
  applyCropZoom,
  aspectNumber,
  cropFromPixelTarget,
  defaultCropForAspect,
  flipConfig,
  type CropAspectConfig,
  type CropAspectPresetId,
  presetToConfig,
} from "@/lib/image/crop-aspect";
import { exportCroppedImage, type CropExportOptions } from "@/lib/image/crop-export";
import type { NormalizedCrop } from "@/lib/image/effects";
import { loadImageFromFile } from "@/lib/image/decode";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import { downloadBlob, downloadZip } from "@/lib/image/process";
import type { LivePreviewImage } from "@/lib/image/types";
import { useI18n } from "@/i18n/context";

const CONCURRENCY = 2;
const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,.heic,.heif";

const DEFAULT_CROP: NormalizedCrop = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useCropTool() {
  const { t } = useI18n();
  const filesRef = useRef<Map<string, File>>(new Map());
  const cropOverridesRef = useRef<Map<string, NormalizedCrop>>(new Map());
  const zoomOverridesRef = useRef<Map<string, number>>(new Map());
  const abortRef = useRef(false);
  const pumpingRef = useRef(false);
  const requeueTimerRef = useRef<number | null>(null);

  const [presetId, setPresetId] = useState<CropAspectPresetId>("1x1");
  const [customRatioW, setCustomRatioW] = useState(4);
  const [customRatioH, setCustomRatioH] = useState(3);
  const [customPxW, setCustomPxW] = useState(1080);
  const [customPxH, setCustomPxH] = useState(1080);
  const [aspectConfig, setAspectConfig] = useState<CropAspectConfig>({ mode: "ratio", width: 1, height: 1 });
  const [baseCrop, setBaseCrop] = useState<NormalizedCrop>(DEFAULT_CROP);
  const [crop, setCrop] = useState<NormalizedCrop>(DEFAULT_CROP);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [format, setFormat] = useState<ResizeFormatChoice>("auto");
  const [quality, setQuality] = useState(88);
  const [useMaxSize, setUseMaxSize] = useState(false);
  const [maxWidth, setMaxWidth] = useState(2048);
  const [maxHeight, setMaxHeight] = useState(2048);
  const [queue, setQueue] = useState<BatchQueueRow[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);

  const syncAspectConfig = useCallback(
    (id: CropAspectPresetId) => {
      setAspectConfig(presetToConfig(id, customRatioW, customRatioH, customPxW, customPxH));
    },
    [customPxH, customPxW, customRatioH, customRatioW],
  );

  useEffect(() => {
    syncAspectConfig(presetId);
  }, [presetId, customRatioW, customRatioH, customPxW, customPxH, syncAspectConfig]);

  const ar = aspectNumber(aspectConfig);

  const buildSlug = useCallback(() => {
    if (presetId === "free") return "free";
    if (presetId === "custom-ratio") return `${customRatioW}x${customRatioH}`;
    if (presetId === "custom-px") return `${customPxW}x${customPxH}`;
    return presetId.replace("x", "by");
  }, [customPxH, customPxW, customRatioH, customRatioW, presetId]);

  const buildOptions = useCallback(
    (cropOverride?: NormalizedCrop): CropExportOptions => ({
      crop: cropOverride ?? crop,
      format,
      quality,
      maxWidth: useMaxSize ? maxWidth : null,
      maxHeight: useMaxSize ? maxHeight : null,
      slug: buildSlug(),
    }),
    [buildSlug, crop, format, maxHeight, maxWidth, quality, useMaxSize],
  );

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
  const focusFile = focusRow ? filesRef.current.get(focusRow.id) ?? null : null;

  const processOne = useCallback(
    async (id: string, sourcePreviewUrl: string) => {
      const file = filesRef.current.get(id);
      if (!file) return;
      let cropOv = cropOverridesRef.current.get(id);
      if (!cropOv) {
        const img = await loadImageFromFile(file);
        const imgAr = img.naturalWidth / img.naturalHeight;
        if (aspectConfig.mode === "pixels") {
          cropOv = cropFromPixelTarget(
            img.naturalWidth,
            img.naturalHeight,
            aspectConfig.width,
            aspectConfig.height,
          );
        } else {
          cropOv = defaultCropForAspect(ar, imgAr);
        }
      }

      setQueue((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: "processing", errorMessage: undefined } : row,
        ),
      );

      try {
        const result = await exportCroppedImage(file, buildOptions(cropOv));
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
              ? { ...row, status: "error", errorMessage: t.cropTool.errorProcessing }
              : row,
          ),
        );
      }
    },
    [ar, aspectConfig, buildOptions, t.cropTool.errorProcessing],
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
    aspectConfig,
    format,
    quality,
    useMaxSize,
    maxWidth,
    maxHeight,
    schedulePump,
  ]);

  const resetCropForFile = useCallback(
    async (file: File) => {
      const img = await loadImageFromFile(file);
      const imgAr = img.naturalWidth / img.naturalHeight;
      if (aspectConfig.mode === "pixels") {
        return cropFromPixelTarget(img.naturalWidth, img.naturalHeight, aspectConfig.width, aspectConfig.height);
      }
      return defaultCropForAspect(ar, imgAr);
    },
    [ar, aspectConfig],
  );

  useEffect(() => {
    if (!focusFile) return;
    const ov = cropOverridesRef.current.get(focusRow?.id ?? "");
    const z = zoomOverridesRef.current.get(focusRow?.id ?? "") ?? 1;
    setZoom(z);
    if (ov) {
      setBaseCrop(ov);
      setCrop(ov);
      return;
    }
    void resetCropForFile(focusFile).then((c) => {
      setBaseCrop(c);
      setCrop(applyCropZoom(c, z, ar));
    });
  }, [focusFile, focusRow?.id, presetId, aspectConfig, ar, resetCropForFile]);

  const setPresetWithSync = useCallback((id: CropAspectPresetId) => {
    setPresetId(id);
    cropOverridesRef.current.clear();
    zoomOverridesRef.current.clear();
    setZoom(1);
  }, []);

  const flipOrientation = useCallback(() => {
    const flipped = flipConfig(aspectConfig);
    if (flipped.mode === "ratio") {
      setCustomRatioW(flipped.width);
      setCustomRatioH(flipped.height);
      setPresetId("custom-ratio");
    } else if (flipped.mode === "pixels") {
      setCustomPxW(flipped.width);
      setCustomPxH(flipped.height);
      setPresetId("custom-px");
    }
    setAspectConfig(flipped);
    cropOverridesRef.current.clear();
    zoomOverridesRef.current.clear();
    setZoom(1);
  }, [aspectConfig]);

  const onCropFromEditor = useCallback((c: NormalizedCrop) => {
    setBaseCrop(c);
    setCrop(c);
    setZoom(1);
  }, []);

  const onZoomChange = useCallback(
    (z: number) => {
      setZoom(z);
      setCrop(applyCropZoom(baseCrop, z, ar));
    },
    [ar, baseCrop],
  );

  const applyCropToFocus = useCallback(() => {
    if (!focusId) return;
    cropOverridesRef.current.set(focusId, crop);
    zoomOverridesRef.current.set(focusId, zoom);
    setQueue((prev) =>
      prev.map((row) =>
        row.id === focusId
          ? { ...row, status: "queued", result: undefined, errorMessage: undefined }
          : row,
      ),
    );
    abortRef.current = false;
    schedulePump();
  }, [crop, focusId, schedulePump, zoom]);

  const remove = useCallback((id: string) => {
    filesRef.current.delete(id);
    cropOverridesRef.current.delete(id);
    zoomOverridesRef.current.delete(id);
    setQueue((prev) => {
      const hit = prev.find((r) => r.id === id);
      if (hit) {
        URL.revokeObjectURL(hit.sourcePreviewUrl);
        if (hit.result) {
          URL.revokeObjectURL(hit.result.previewUrl);
          URL.revokeObjectURL(hit.result.sourcePreviewUrl);
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
    cropOverridesRef.current.clear();
    zoomOverridesRef.current.clear();
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
    presetId,
    setPresetId: setPresetWithSync,
    customRatioW,
    setCustomRatioW,
    customRatioH,
    setCustomRatioH,
    customPxW,
    setCustomPxW,
    customPxH,
    setCustomPxH,
    aspectConfig,
    crop,
    setCrop: onCropFromEditor,
    zoom,
    onZoomChange,
    showGrid,
    setShowGrid,
    flipOrientation,
    format,
    setFormat,
    quality,
    setQuality,
    useMaxSize,
    setUseMaxSize,
    maxWidth,
    setMaxWidth,
    maxHeight,
    setMaxHeight,
    queue,
    stats,
    focusItem,
    focusRow,
    focusFile,
    focusId,
    setFocusId,
    onFiles: addFiles,
    remove,
    clearAll,
    cancelRun,
    retry,
    downloadOne,
    downloadZipAll,
    applyCropToFocus,
    zipLabel: t.common.downloadZip,
    accept: IMAGE_ACCEPT,
  };
}