"use client";

const modal = null;
const requestDownload = (fn: () => unknown, _meta?: unknown) => { void fn(); };

import { useCallback, useRef, useState } from "react";

import type { LivePreviewImage, ProcessedImage } from "@/lib/image/types";
import { downloadBlob, downloadZip } from "@/lib/image/process";
import { useI18n } from "@/i18n/context";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useImageBatch() {
  const { t } = useI18n();
  const sourcesRef = useRef<Map<string, File>>(new Map());
  const sourceUrlsRef = useRef<Map<string, string>>(new Map());
  const [items, setItems] = useState<LivePreviewImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [sourceCount, setSourceCount] = useState(0);

  const attachLiveMeta = useCallback(
    (id: string, result: ProcessedImage): LivePreviewImage => ({
      ...result,
      id,
      sourcePreviewUrl: sourceUrlsRef.current.get(id) ?? result.previewUrl,
    }),
    [],
  );

  const reprocess = useCallback(
    async (worker: (file: File) => Promise<ProcessedImage | null>) => {
      const entries = Array.from(sourcesRef.current.entries());
      if (!entries.length) return;
      setBusy(true);
      try {
        setItems((prev) => {
          prev.forEach((i) => URL.revokeObjectURL(i.previewUrl));
          return prev;
        });
        const next: LivePreviewImage[] = [];
        for (const [id, file] of entries) {
          try {
            const result = await worker(file);
            if (result) next.push(attachLiveMeta(id, { ...result, id }));
          } catch {
            /* skip */
          }
        }
        setItems(next);
      } finally {
        setBusy(false);
      }
    },
    [attachLiveMeta],
  );

  const run = useCallback(
    async (files: File[], worker: (file: File) => Promise<ProcessedImage | null>) => {
      if (!files.length) return;
      setBusy(true);
      try {
        const appended: LivePreviewImage[] = [];
        for (const file of files) {
          try {
            const id = makeId();
            sourcesRef.current.set(id, file);
            sourceUrlsRef.current.set(id, URL.createObjectURL(file));
            const result = await worker(file);
            if (result) appended.push(attachLiveMeta(id, { ...result, id }));
          } catch {
            /* skip */
          }
        }
        setSourceCount(sourcesRef.current.size);
        setItems((prev) => [...prev, ...appended]);
      } finally {
        setBusy(false);
      }
    },
    [attachLiveMeta],
  );

  const remove = useCallback((id: string) => {
    sourcesRef.current.delete(id);
    const src = sourceUrlsRef.current.get(id);
    if (src) URL.revokeObjectURL(src);
    sourceUrlsRef.current.delete(id);
    setSourceCount(sourcesRef.current.size);
    setItems((prev) => {
      const hit = prev.find((i) => i.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    sourcesRef.current.clear();
    sourceUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    sourceUrlsRef.current.clear();
    setSourceCount(0);
    setItems((prev) => {
      prev.forEach((i) => {
        URL.revokeObjectURL(i.previewUrl);
        if (i.sourcePreviewUrl !== i.previewUrl) URL.revokeObjectURL(i.sourcePreviewUrl);
      });
      return [];
    });
  }, []);

  const zipLabel = t.common.downloadZip;

  return {
    items,
    busy,
    modal,
    run,
    reprocess,
    remove,
    clear,
    sourceCount,
    hasSources: sourceCount > 0,
    downloadOne: (item: LivePreviewImage) =>
      requestDownload(() => downloadBlob(item.blob, item.name), {
        downloadLabel: t.common.downloadOne,
        kind: "single",
      }),
    downloadZip: () =>
      requestDownload(
        () => downloadZip(items),
        { downloadLabel: zipLabel, kind: "zip" },
      ),
    zipLabel,
  };
}