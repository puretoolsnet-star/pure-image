"use client";

import { useCallback, useState } from "react";

import type { ProcessedImage } from "@/lib/image/types";
import { downloadBlob, downloadZip } from "@/lib/image/process";
import { useMandatoryAd } from "@/lib/use-mandatory-ad";
import { useI18n } from "@/i18n/context";

export function useImageBatch() {
  const { t } = useI18n();
  const [items, setItems] = useState<ProcessedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const { requestDownload, modal } = useMandatoryAd();

  const addItems = useCallback((next: ProcessedImage[]) => {
    setItems((prev) => [...prev, ...next]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const hit = prev.find((i) => i.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return [];
    });
  }, []);

  const run = useCallback(
    async (files: File[], worker: (file: File) => Promise<ProcessedImage | null>) => {
      if (!files.length) return;
      setBusy(true);
      try {
        const next: ProcessedImage[] = [];
        for (const file of files) {
          try {
            const result = await worker(file);
            if (result) next.push(result);
          } catch {
            /* skip */
          }
        }
        addItems(next);
      } finally {
        setBusy(false);
      }
    },
    [addItems],
  );

  const zipLabel = t.common.downloadZip;

  return {
    items,
    busy,
    modal,
    run,
    remove,
    clear,
    downloadOne: (item: ProcessedImage) => downloadBlob(item.blob, item.name),
    downloadZip: () => requestDownload(() => downloadZip(items), zipLabel),
    zipLabel,
  };
}