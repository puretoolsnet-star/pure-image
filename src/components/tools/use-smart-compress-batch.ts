"use client";

const modal = null;
const requestDownload = (fn: () => unknown, _meta?: unknown) => { void fn(); };

import { useCallback, useRef, useState } from "react";

import { compressWithQuality } from "@/lib/image/compress-advanced";
import { estimateOutputBytes } from "@/lib/image/estimate";
import type { ProcessedImage } from "@/lib/image/types";
import { downloadBlob, downloadZip } from "@/lib/image/process";
import { useI18n } from "@/i18n/context";

export type SmartCompressedItem = ProcessedImage & { estimatedSize?: number };

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSmartCompressBatch() {
  const { t } = useI18n();
  const sourcesRef = useRef<Map<string, File>>(new Map());
  const [items, setItems] = useState<SmartCompressedItem[]>([]);
  const [busy, setBusy] = useState(false);

  const remove = useCallback((id: string) => {
    sourcesRef.current.delete(id);
    setItems((prev) => {
      const hit = prev.find((i) => i.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const compressFile = useCallback(
    async (file: File, quality: number, maxWidth: number, id: string) => {
      const estimatedSize = await estimateOutputBytes(file, quality, maxWidth);
      const result = await compressWithQuality(file, quality, maxWidth);
      return { ...result, id, estimatedSize };
    },
    [],
  );

  const addFiles = useCallback(
    async (files: File[], quality: number, maxWidth: number) => {
      if (!files.length) return;
      setBusy(true);
      try {
        const next: SmartCompressedItem[] = [];
        for (const file of files) {
          try {
            const id = makeId();
            sourcesRef.current.set(id, file);
            const result = await compressFile(file, quality, maxWidth, id);
            next.push(result);
          } catch {
            /* skip unreadable */
          }
        }
        setItems((prev) => [...prev, ...next]);
      } finally {
        setBusy(false);
      }
    },
    [compressFile],
  );

  const recompressAll = useCallback(
    async (quality: number, maxWidth: number) => {
      const entries = Array.from(sourcesRef.current.entries());
      if (!entries.length) return;
      setBusy(true);
      try {
        const planned = await Promise.all(
          entries.map(async ([id, file]) => ({
            id,
            file,
            estimatedSize: await estimateOutputBytes(file, quality, maxWidth),
          })),
        );
        setItems((prev) =>
          prev.map((item) => {
            const row = planned.find((p) => p.id === item.id);
            return row ? { ...item, estimatedSize: row.estimatedSize } : item;
          }),
        );
        const next: SmartCompressedItem[] = [];
        for (const row of planned) {
          try {
            setItems((prev) => {
              const hit = prev.find((i) => i.id === row.id);
              if (hit) URL.revokeObjectURL(hit.previewUrl);
              return prev;
            });
            const result = await compressFile(row.file, quality, maxWidth, row.id);
            next.push(result);
          } catch {
            sourcesRef.current.delete(row.id);
          }
        }
        setItems(next);
      } finally {
        setBusy(false);
      }
    },
    [compressFile],
  );

  const downloadOne = useCallback(
    (item: SmartCompressedItem) => {
      requestDownload(() => downloadBlob(item.blob, item.name), {
        downloadLabel: t.common.downloadOne,
        kind: "single",
      });
    },
    [requestDownload, t.common.downloadOne],
  );

  const downloadZipAll = useCallback(() => {
    requestDownload(() => downloadZip(items), {
      downloadLabel: t.common.downloadZip,
      kind: "zip",
    });
  }, [items, requestDownload, t.common.downloadZip]);

  return {
    items,
    busy,
    modal,
    addFiles,
    recompressAll,
    remove,
    downloadOne,
    downloadZipAll,
    zipLabel: t.common.downloadZip,
  };
}