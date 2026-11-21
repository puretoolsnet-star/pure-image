"use client";

import { Trash2 } from "lucide-react";

import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { PdfAlbumControls } from "@/components/tools/PdfAlbumControls";
import { PdfAlbumMetricsPanel } from "@/components/tools/PdfAlbumMetricsPanel";
import { PdfPageList } from "@/components/tools/PdfPageList";
import { PdfPagePreview } from "@/components/tools/PdfPagePreview";
import { useImagesToPdf } from "@/components/tools/use-images-to-pdf";
import { useI18n } from "@/i18n/context";

export function ImagesToPdfTool() {
  const { t } = useI18n();
  const pdf = useImagesToPdf();
  const focusId = pdf.previewPage?.id ?? pdf.pages[0]?.id ?? null;

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.pdfAlbumTool.lead}</p>

      <ImageDropzone onFiles={pdf.onFiles} accept={pdf.accept} multiple />

      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <PdfAlbumControls
          pageSize={pdf.pageSize}
          onPageSize={pdf.setPageSize}
          orientation={pdf.orientation}
          onOrientation={pdf.setOrientation}
          margin={pdf.margin}
          onMargin={pdf.setMargin}
          pageBackground={pdf.pageBackground}
          onPageBackground={pdf.setPageBackground}
          imageFit={pdf.imageFit}
          onImageFit={pdf.setImageFit}
          qualityPreset={pdf.qualityPreset}
          onQualityPreset={pdf.setQualityPreset}
          outputMode={pdf.outputMode}
          onOutputMode={pdf.setOutputMode}
          fileName={pdf.fileName}
          onFileName={pdf.setFileName}
          disabled={pdf.busy}
        />
      </div>

      <PdfAlbumMetricsPanel
        pageCount={pdf.pages.length}
        inputBytes={pdf.inputBytes}
        outputBytes={pdf.lastResult?.outputBytes ?? null}
        processingMs={pdf.lastResult?.processingMs ?? null}
        pageSize={pdf.pageSize}
        busy={pdf.busy}
      />

      {pdf.pages.length ? (
        <PdfPagePreview
          page={pdf.previewPage}
          pageIndex={pdf.previewIndex}
          pageCount={pdf.pages.length}
          onPrev={() => pdf.setPreviewIndex((i) => Math.max(0, i - 1))}
          onNext={() => pdf.setPreviewIndex((i) => Math.min(pdf.pages.length - 1, i + 1))}
          pageSize={pdf.pageSize}
          margin={pdf.margin}
          pageBackground={pdf.pageBackground}
          imageFit={pdf.imageFit}
        />
      ) : null}

      <PdfPageList
        pages={pdf.pages}
        focusId={focusId}
        onFocus={(id) => {
          const i = pdf.pages.findIndex((p) => p.id === id);
          if (i >= 0) pdf.setPreviewIndex(i);
        }}
        onRemove={pdf.remove}
        onMoveUp={pdf.moveUp}
        onMoveDown={pdf.moveDown}
        onRotate={pdf.rotatePage}
        onDragStart={pdf.onDragStart}
        onDropOn={pdf.onDropOn}
        disabled={pdf.busy}
      />

      {pdf.pages.length ? (
        <button
          type="button"
          onClick={pdf.clearAll}
          disabled={pdf.busy}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.pdfAlbumTool.clearPages}
        </button>
      ) : null}

      {pdf.busy ? (
        <div className="space-y-2">
          <p className="text-center text-xs text-violet-300">{t.pdfAlbumTool.building}</p>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-violet-500 transition-all"
              style={{ width: `${pdf.progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {pdf.canBuild ? (
        <button
          type="button"
          disabled={pdf.busy}
          onClick={() => void pdf.buildAndDownload()}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pdf.buildLabel}
        </button>
      ) : (
        <p className="text-center text-xs text-slate-500">{t.pdfAlbumTool.addPagesHint}</p>
      )}

      {pdf.pages.length ? (
        <ImageDropzone onFiles={pdf.onFiles} accept={pdf.accept} compact multiple />
      ) : null}
    </div>
  );
}