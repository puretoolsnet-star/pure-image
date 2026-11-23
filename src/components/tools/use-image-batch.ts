"use client";

import { useCallback, useRef, useState } from "react";

import type { LivePreviewImage, ProcessedImage } from "@/lib/image/types";
import { downloadBlob, downloadZip } from "@/lib/image/process";
import { useI18n } from "@/i18n/context";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function makePendingItem(id: string, file: File, sourcePreviewUrl: string): LivePreviewImage {
  return {
    id,
    name: file.name,
    originalSize: file.size,
    outputSize: 0,
    blob: new Blob(),
    previewUrl: sourcePreviewUrl,
    sourcePreviewUrl,
    width: 0,
    height: 0,
    pending: true,
  };
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
        for (const file of files) {
          const id = makeId();
          const sourcePreviewUrl = URL.createObjectURL(file);
          sourcesRef.current.set(id, file);
          sourceUrlsRef.current.set(id, sourcePreviewUrl);
          setItems((prev) => [...prev, makePendingItem(id, file, sourcePreviewUrl)]);
          setSourceCount(sourcesRef.current.size);
          try {
            const result = await worker(file);
            if (result) {
              setItems((prev) =>
                prev.map((item) =>
                  item.id === id ? attachLiveMeta(id, { ...result, id, pending: false }) : item,
                ),
              );
            } else {
              setItems((prev) => prev.filter((item) => item.id !== id));
              sourcesRef.current.delete(id);
              URL.revokeObjectURL(sourcePreviewUrl);
              sourceUrlsRef.current.delete(id);
            }
          } catch {
            setItems((prev) => prev.filter((item) => item.id !== id));
            sourcesRef.current.delete(id);
            URL.revokeObjectURL(sourcePreviewUrl);
            sourceUrlsRef.current.delete(id);
          }
        }
        setSourceCount(sourcesRef.current.size);
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
    run,
    reprocess,
    remove,
    clear,
    sourceCount,
    hasSources: sourceCount > 0,
    downloadOne: (item: LivePreviewImage) => downloadBlob(item.blob, item.name),
    downloadZip: () => void downloadZip(items),
    zipLabel,
    getSourceFile: (id: string) => sourcesRef.current.get(id),
  };
}