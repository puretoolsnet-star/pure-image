"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import {
  exportSocialPreset,
  type SocialContainBackdrop,
  type SocialExportOptions,
  type SocialFillMode,
  type SocialPan,
} from "@/lib/image/social-preset-export";
import {
  SOCIAL_PRESET_CATALOG,
  type SocialFormatKind,
  type SocialPlatform,
} from "@/lib/image/social-presets";
import { downloadBlob, downloadZip } from "@/lib/image/process";
import type { LivePreviewImage } from "@/lib/image/types";
import { useI18n } from "@/i18n/context";

const CONCURRENCY = 2;
const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,.heic,.heif";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_PAN: SocialPan = { focusX: 0.5, focusY: 0.5, zoom: 1 };

export function useSocialPresets() {
  const { t } = useI18n();
  const filesRef = useRef<Map<string, File>>(new Map());
  const panOverridesRef = useRef<Map<string, SocialPan>>(new Map());
  const abortRef = useRef(false);
  const pumpingRef = useRef(false);
  const requeueTimerRef = useRef<number | null>(null);

  const [presetId, setPresetId] = useState(SOCIAL_PRESET_CATALOG[0]!.id);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform>("all");
  const [kindFilter, setKindFilter] = useState<SocialFormatKind | "all">("all");
  const [search, setSearch] = useState("");
  const [fillMode, setFillMode] = useState<SocialFillMode>("cover");
  const [containBackdrop, setContainBackdrop] = useState<SocialContainBackdrop>("color");
  const [backdrop, setBackdrop] = useState("#0f1118");
  const [format, setFormat] = useState<ResizeFormatChoice>("jpeg");
  const [quality, setQuality] = useState(88);
  const [targetKb, setTargetKb] = useState<number | null>(null);
  const [useTargetKb, setUseTargetKb] = useState(false);
  const [pan, setPan] = useState<SocialPan>(DEFAULT_PAN);
  const [queue, setQueue] = useState<BatchQueueRow[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);

  const presetDef = useMemo(
    () => SOCIAL_PRESET_CATALOG.find((p) => p.id === presetId) ?? SOCIAL_PRESET_CATALOG[0]!,
    [presetId],
  );

  const filteredPresets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SOCIAL_PRESET_CATALOG.filter((p) => {
      if (platformFilter !== "all" && p.platform !== platformFilter) return false;
      if (kindFilter !== "all" && p.kind !== kindFilter) return false;
      if (!q) return true;
      const label = t.socialPresets.presetLabels[p.labelKey as keyof typeof t.socialPresets.presetLabels] ?? "";
      return (
        label.toLowerCase().includes(q) ||
        p.id.includes(q) ||
        `${p.width}x${p.height}`.includes(q)
      );
    });
  }, [kindFilter, platformFilter, search, t.socialPresets.presetLabels]);

  const buildOptions = useCallback(
    (panOverride?: SocialPan): SocialExportOptions => ({
      presetId,
      customWidth: presetId === "custom" ? customWidth : undefined,
      customHeight: presetId === "custom" ? customHeight : undefined,
      fillMode,
      containBackdrop,
      backdrop,
      format,
      quality,
      targetKb: useTargetKb && targetKb ? targetKb : null,
      pan: panOverride ?? pan,
    }),
    [
      backdrop,
      containBackdrop,
      customHeight,
      customWidth,
      fillMode,
      format,
      pan,
      presetId,
      quality,
      targetKb,
      useTargetKb,
    ],
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
      const panOv = panOverridesRef.current.get(id);

      setQueue((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: "processing", errorMessage: undefined } : row,
        ),
      );

      try {
        const result = await exportSocialPreset(file, buildOptions(panOv));
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
              ? { ...row, status: "error", errorMessage: t.socialPresets.errorProcessing }
              : row,
          ),
        );
      }
    },
    [buildOptions, t.socialPresets.errorProcessing],
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
    presetId,
    customWidth,
    customHeight,
    fillMode,
    containBackdrop,
    backdrop,
    format,
    quality,
    targetKb,
    useTargetKb,
    pan,
    schedulePump,
  ]);

  const applyPanToFocus = useCallback(() => {
    if (!focusId) return;
    panOverridesRef.current.set(focusId, pan);
    setQueue((prev) =>
      prev.map((row) =>
        row.id === focusId
          ? { ...row, status: "queued", result: undefined, errorMessage: undefined }
          : row,
      ),
    );
    abortRef.current = false;
    schedulePump();
  }, [focusId, pan, schedulePump]);

  useEffect(() => {
    if (focusId) {
      const ov = panOverridesRef.current.get(focusId);
      setPan(ov ?? DEFAULT_PAN);
    }
  }, [focusId]);

  const remove = useCallback((id: string) => {
    filesRef.current.delete(id);
    panOverridesRef.current.delete(id);
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
    panOverridesRef.current.clear();
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

  const activePreset =
    presetId === "custom"
      ? {
          id: "custom",
          platform: "instagram" as const,
          kind: "square" as const,
          width: customWidth,
          height: customHeight,
          safeZone: "none" as const,
          labelKey: "custom",
        }
      : presetDef;

  return {
    presetId,
    setPresetId,
    customWidth,
    setCustomWidth,
    customHeight,
    setCustomHeight,
    platformFilter,
    setPlatformFilter,
    kindFilter,
    setKindFilter,
    search,
    setSearch,
    fillMode,
    setFillMode,
    containBackdrop,
    setContainBackdrop,
    backdrop,
    setBackdrop,
    format,
    setFormat,
    quality,
    setQuality,
    targetKb,
    setTargetKb,
    useTargetKb,
    setUseTargetKb,
    pan,
    setPan,
    filteredPresets,
    activePreset,
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
    applyPanToFocus,
    zipLabel: t.common.downloadZip,
    accept: IMAGE_ACCEPT,
  };
}