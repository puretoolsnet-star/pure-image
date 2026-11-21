"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildPdfAlbum,
  type PdfAlbumOptions,
  type PdfImageFit,
  type PdfMarginPreset,
  type PdfOrientation,
  type PdfOutputMode,
  type PdfPageSize,
  type PdfQualityPreset,
} from "@/lib/image/pdf-album";
import { downloadPdf } from "@/lib/image/pdf";
import { downloadBlob } from "@/lib/image/process";
import { useI18n } from "@/i18n/context";

const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,.heic,.heif";

export type PdfPageState = {
  id: string;
  file: File;
  previewUrl: string;
  rotationDeg: 0 | 90 | 180 | 270;
};

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useImagesToPdf() {
  const { t } = useI18n();
  const dragIndexRef = useRef<number | null>(null);

  const [pages, setPages] = useState<PdfPageState[]>([]);
  const [pageSize, setPageSize] = useState<PdfPageSize>("a4");
  const [orientation, setOrientation] = useState<PdfOrientation>("auto");
  const [margin, setMargin] = useState<PdfMarginPreset>("medium");
  const [pageBackground, setPageBackground] = useState("#ffffff");
  const [imageFit, setImageFit] = useState<PdfImageFit>("contain");
  const [qualityPreset, setQualityPreset] = useState<PdfQualityPreset>("balanced");
  const [outputMode, setOutputMode] = useState<PdfOutputMode>("single");
  const [fileName, setFileName] = useState("pure-image-album");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState<{
    outputBytes: number;
    processingMs: number;
    pageCount: number;
  } | null>(null);

  const inputBytes = useMemo(() => pages.reduce((s, p) => s + p.file.size, 0), [pages]);

  const buildOptions = useCallback(
    (): PdfAlbumOptions => ({
      pageSize,
      orientation,
      margin,
      pageBackground,
      imageFit,
      qualityPreset,
      outputMode,
      fileName,
    }),
    [
      fileName,
      imageFit,
      margin,
      orientation,
      outputMode,
      pageBackground,
      pageSize,
      qualityPreset,
    ],
  );

  const addFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    const rows: PdfPageState[] = files.map((file) => ({
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
      rotationDeg: 0,
    }));
    setPages((prev) => {
      const next = [...prev, ...rows];
      if (!prev.length) setPreviewIndex(0);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setPages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
    setPreviewIndex(0);
    setLastResult(null);
  }, []);

  const remove = useCallback((id: string) => {
    setPages((prev) => {
      const hit = prev.find((p) => p.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const movePage = useCallback((from: number, to: number) => {
    setPages((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(from, 1);
      if (!row) return prev;
      next.splice(to, 0, row);
      return next;
    });
    setPreviewIndex(to);
  }, []);

  const rotatePage = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              rotationDeg: ((p.rotationDeg + 90) % 360) as PdfPageState["rotationDeg"],
            }
          : p,
      ),
    );
  }, []);

  const onDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const onDropOn = useCallback(
    (index: number) => {
      const from = dragIndexRef.current;
      if (from == null || from === index) return;
      movePage(from, index);
      dragIndexRef.current = null;
    },
    [movePage],
  );

  const buildAndDownload = useCallback(async () => {
    if (!pages.length) return;
    setBusy(true);
    setProgress(0);
    try {
      const result = await buildPdfAlbum(
        pages.map((p) => ({ file: p.file, rotationDeg: p.rotationDeg })),
        buildOptions(),
        (done, total) => setProgress(Math.round((done / total) * 100)),
      );
      setLastResult({
        outputBytes: result.outputBytes,
        processingMs: result.processingMs,
        pageCount: result.pageCount,
      });
      if (result.files.length === 1) {
        downloadPdf(result.files[0]!.blob, result.files[0]!.name);
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (const f of result.files) zip.file(f.name, f.blob);
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, `${fileName.replace(/\.pdf$/i, "")}-pages.zip`);
      }
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }, [buildOptions, fileName, pages]);

  useEffect(() => {
    if (previewIndex >= pages.length) setPreviewIndex(Math.max(0, pages.length - 1));
  }, [pages.length, previewIndex]);

  const previewPage = pages[previewIndex] ?? null;

  return {
    pages,
    onFiles: addFiles,
    clearAll,
    remove,
    moveUp: (id: string) => {
      const i = pages.findIndex((p) => p.id === id);
      if (i > 0) movePage(i, i - 1);
    },
    moveDown: (id: string) => {
      const i = pages.findIndex((p) => p.id === id);
      if (i >= 0 && i < pages.length - 1) movePage(i, i + 1);
    },
    rotatePage,
    onDragStart,
    onDropOn,
    pageSize,
    setPageSize,
    orientation,
    setOrientation,
    margin,
    setMargin,
    pageBackground,
    setPageBackground,
    imageFit,
    setImageFit,
    qualityPreset,
    setQualityPreset,
    outputMode,
    setOutputMode,
    fileName,
    setFileName,
    previewIndex,
    setPreviewIndex,
    previewPage,
    inputBytes,
    lastResult,
    busy,
    progress,
    buildAndDownload,
    accept: IMAGE_ACCEPT,
    canBuild: pages.length > 0,
    buildLabel:
      outputMode === "per-page" && pages.length > 1
        ? t.pdfAlbumTool.downloadZipPages
        : t.common.downloadPdf,
  };
}