"use client";

import { useState } from "react";

import type { PdfPageState } from "@/components/tools/use-images-to-pdf";
import type { PdfImageFit, PdfMarginPreset, PdfPageSize } from "@/lib/image/pdf-album";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

function marginRatio(preset: PdfMarginPreset): number {
  if (preset === "none") return 0;
  if (preset === "small") return 0.04;
  if (preset === "medium") return 0.08;
  return 0.12;
}

function pageAspect(pageSize: PdfPageSize): number {
  if (pageSize === "letter") return 215.9 / 279.4;
  if (pageSize === "a5") return 148 / 210;
  if (pageSize === "fit") return 3 / 4;
  return 210 / 297;
}

export function PdfPagePreview({
  page,
  pageIndex,
  pageCount,
  onPrev,
  onNext,
  pageSize,
  margin,
  pageBackground,
  imageFit,
}: {
  page: PdfPageState | null;
  pageIndex: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  pageSize: PdfPageSize;
  margin: PdfMarginPreset;
  pageBackground: string;
  imageFit: PdfImageFit;
}) {
  const { t } = useI18n();
  const [zoom, setZoom] = useState(1);
  if (!page) return null;

  const pad = marginRatio(margin);
  const aspect = pageAspect(pageSize);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{t.pdfAlbumTool.previewTitle}</span>
        <span>
          {pageIndex + 1} / {pageCount}
        </span>
      </div>
      <div
        className="relative mx-auto w-full max-w-lg overflow-auto rounded-2xl border border-slate-800 bg-slate-950"
        style={{ maxHeight: "min(70vh, 640px)" }}
      >
        <div
          className="relative mx-auto my-4 shadow-lg"
          style={{
            width: `${Math.min(100, 100 * zoom)}%`,
            aspectRatio: `${aspect}`,
            background: pageBackground,
            padding: `${pad * 100}%`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.previewUrl}
            alt=""
            className={cn(
              "h-full w-full",
              imageFit === "contain" ? "object-contain" : "object-cover",
            )}
            style={{ transform: `rotate(${page.rotationDeg}deg)` }}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={pageIndex <= 0}
          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 disabled:opacity-40"
        >
          {t.pdfAlbumTool.prevPage}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={pageIndex >= pageCount - 1}
          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 disabled:opacity-40"
        >
          {t.pdfAlbumTool.nextPage}
        </button>
        <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          {t.pdfAlbumTool.zoom}
          <input
            type="range"
            min={100}
            max={200}
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            className="w-24 accent-violet-500"
          />
        </label>
      </div>
    </div>
  );
}