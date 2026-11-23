"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { PdfAlbumControls } from "@/components/tools/PdfAlbumControls";
import { PdfAlbumMetricsPanel } from "@/components/tools/PdfAlbumMetricsPanel";
import { PdfPageList } from "@/components/tools/PdfPageList";
import { PdfPagePreview } from "@/components/tools/PdfPagePreview";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import { useImagesToPdf } from "@/components/tools/use-images-to-pdf";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { PdfOrientation, PdfPageSize, PdfQualityPreset } from "@/lib/image/pdf-album";

function pageSizeLabel(size: PdfPageSize, t: ReturnType<typeof useI18n>["t"]) {
  if (size === "letter") return t.pdfAlbumTool.pageLetter;
  if (size === "fit") return t.pdfAlbumTool.pageFit;
  if (size === "a5") return "A5";
  return "A4";
}

function orientLabel(orientation: PdfOrientation, t: ReturnType<typeof useI18n>["t"]) {
  if (orientation === "portrait") return t.pdfAlbumTool.orientPortrait;
  if (orientation === "landscape") return t.pdfAlbumTool.orientLandscape;
  return t.pdfAlbumTool.orientAuto;
}

function qualityLabel(quality: PdfQualityPreset, t: ReturnType<typeof useI18n>["t"]) {
  if (quality === "email") return t.pdfAlbumTool.qualityEmail;
  if (quality === "print") return t.pdfAlbumTool.qualityPrint;
  return t.pdfAlbumTool.qualityBalanced;
}

function settingsSummary(pdf: ReturnType<typeof useImagesToPdf>, t: ReturnType<typeof useI18n>["t"]) {
  return `${pageSizeLabel(pdf.pageSize, t)} · ${orientLabel(pdf.orientation, t)} · ${qualityLabel(pdf.qualityPreset, t)}`;
}

export function ImagesToPdfTool() {
  const { t } = useI18n();
  const pdf = useImagesToPdf();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevPagesRef = useRef(0);

  const hasWork = pdf.pages.length > 0;
  const focusId = pdf.previewPage?.id ?? pdf.pages[0]?.id ?? null;
  const solePage = pdf.pages.length === 1 ? pdf.pages[0]! : null;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : pdf.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : pdf.busy
        ? "current"
        : pdf.lastResult
          ? "done"
          : "upcoming";

    return [
      { label: t.pdfAlbumTool.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.pdfAlbumTool.workflowSettings, state: settingsState },
      { label: t.pdfAlbumTool.workflowResult, state: resultState },
    ];
  }, [hasWork, pdf.busy, pdf.lastResult, t]);

  useEffect(() => {
    if (pdf.pages.length <= prevPagesRef.current) {
      prevPagesRef.current = pdf.pages.length;
      return;
    }
    const firstBatch = prevPagesRef.current === 0;
    prevPagesRef.current = pdf.pages.length;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [pdf.pages.length]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.pdfAlbumTool.lead}</p>
          <ImageDropzone onFiles={pdf.onFiles} accept={pdf.accept} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="images-to-pdf-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="images-to-pdf-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="images-to-pdf-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.pdfAlbumTool.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-violet-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-violet-500/25 lg:bg-violet-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-violet-200">{t.pdfAlbumTool.pageCountLine(pdf.pages.length)}</span>
                {pdf.busy ? (
                  <>
                    <span className="mx-2 text-slate-600">·</span>
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                      {t.pdfAlbumTool.building}
                    </span>
                  </>
                ) : null}
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">{settingsSummary(pdf, t)}</p>
            </div>

            {solePage ? (
              <ToolUploadedFileCard
                name={solePage.file.name}
                size={formatBytes(solePage.file.size)}
                thumbSrc={solePage.previewUrl}
                busy={pdf.busy}
                statusLabel={pdf.busy ? t.pdfAlbumTool.building : t.pdfAlbumTool.uploadedStatus}
              />
            ) : null}
          </div>

          <div className="space-y-2 lg:hidden">
            <p className="text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={pdf.onFiles} accept={pdf.accept} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
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

              <div className="min-w-0 overflow-x-hidden">
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
              </div>
            </div>

            <div className="order-2 min-w-0 space-y-3">
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

              <PdfAlbumMetricsPanel
                pageCount={pdf.pages.length}
                inputBytes={pdf.inputBytes}
                outputBytes={pdf.lastResult?.outputBytes ?? null}
                processingMs={pdf.lastResult?.processingMs ?? null}
                pageSize={pdf.pageSize}
                busy={pdf.busy}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={pdf.clearAll}
                  disabled={pdf.busy}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.pdfAlbumTool.clearPages}
                </button>
              </div>

              {pdf.busy ? (
                <div className="space-y-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                  <p className="text-center text-xs text-violet-200">{t.pdfAlbumTool.building}</p>
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
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {pdf.buildLabel}
                </button>
              ) : (
                <p className="text-center text-xs text-slate-500">{t.pdfAlbumTool.addPagesHint}</p>
              )}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={pdf.onFiles} accept={pdf.accept} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}