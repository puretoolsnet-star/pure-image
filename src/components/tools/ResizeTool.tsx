"use client";

import { Download, Loader2, OctagonX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { ResizeControls } from "@/components/tools/ResizeControls";
import { ResizeMetricsPanel } from "@/components/tools/ResizeMetricsPanel";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { useResizeTool } from "@/components/tools/use-resize-tool";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { ResizeFitMode, ResizeFormatChoice, ResizeSizeMode } from "@/lib/image/resize-advanced";
import type { LivePreviewImage } from "@/lib/image/types";

function rowStatusLabel(row: BatchQueueRow, t: ReturnType<typeof useI18n>["t"]): string {
  switch (row.status) {
    case "processing":
      return t.resizeTool.converting;
    case "queued":
      return t.batchCompress.statusQueued;
    case "done":
      return t.resizeTool.uploadedStatus;
    case "error":
      return row.errorMessage ?? t.resizeTool.errorProcessing;
    default:
      return t.resizeTool.converting;
  }
}

function fitLabel(fit: ResizeFitMode, t: ReturnType<typeof useI18n>["t"]) {
  if (fit === "fill") return t.resizeTool.fitFill;
  if (fit === "stretch") return t.resizeTool.fitStretch;
  return t.resizeTool.fitFit;
}

function formatLabel(format: ResizeFormatChoice, t: ReturnType<typeof useI18n>["t"]) {
  if (format === "jpeg") return t.toolUi.formatJpeg;
  if (format === "webp") return t.toolUi.formatWebp;
  if (format === "png") return t.toolUi.formatPng;
  return t.resizeTool.formatAuto;
}

function settingsSummary(resize: ReturnType<typeof useResizeTool>, t: ReturnType<typeof useI18n>["t"]) {
  const size =
    resize.sizeMode === "percent"
      ? `${resize.percent}%`
      : `${resize.width}×${resize.height}`;
  return `${size} · ${fitLabel(resize.fitMode, t)} · ${formatLabel(resize.format, t)}`;
}

export function ResizeTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const resize = useResizeTool();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = resize.stats.total > 0;
  const focusRow = resize.focusRow;

  const allDone =
    hasWork &&
    resize.stats.done === resize.stats.total - resize.stats.errors &&
    !resize.stats.busy &&
    resize.stats.queued === 0 &&
    resize.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : resize.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : resize.stats.done > 0 && (allDone || !resize.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : resize.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.resizeTool.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.resizeTool.workflowSettings, state: settingsState },
      { label: t.resizeTool.workflowResult, state: resultState },
    ];
  }, [hasWork, resize.stats.busy, resize.stats.done, allDone, t]);

  useEffect(() => {
    if (resize.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = resize.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = resize.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [resize.stats.total]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.resizeTool.lead}</p>
          <ImageDropzone onFiles={resize.onFiles} accept={resize.accept} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="resize-tool-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="resize-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="resize-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.resizeTool.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-violet-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-violet-500/25 lg:bg-violet-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-violet-200">
                  {t.batchCompress.fileCount(resize.stats.done, resize.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    resize.stats.queued,
                    resize.stats.processing,
                    resize.stats.done,
                    resize.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">
                {settingsSummary(resize, t)}
              </p>
            </div>

            {focusRow && resize.stats.total === 1 ? (
              <ToolUploadedFileCard
                name={focusRow.name}
                size={formatBytes(focusRow.originalSize)}
                thumbSrc={focusRow.sourcePreviewUrl}
                busy={focusRow.status === "processing" || focusRow.status === "queued"}
                statusLabel={rowStatusLabel(focusRow, t)}
              />
            ) : null}
          </div>

          <div className="space-y-2 lg:hidden">
            <p className="text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={resize.onFiles} accept={resize.accept} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {resize.stats.total > 1 ? (
                <div className="max-h-none overflow-visible lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <BatchQueueList
                    rows={resize.queue}
                    focusId={resize.focusId}
                    globalQuality={resize.quality}
                    onFocus={resize.setFocusId}
                    onRemove={resize.remove}
                    onRetry={resize.retry}
                    onDownload={(id) => {
                      const row = resize.queue.find((r) => r.id === id);
                      if (row?.result) resize.downloadOne(row.result);
                    }}
                    onOverrides={(_id, q) => resize.setQuality(q)}
                  />
                </div>
              ) : null}

              {focusRow ? (
                <ResizeDetailPreview
                  row={focusRow}
                  item={resize.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <ResizeControls
                sizeMode={resize.sizeMode}
                onSizeMode={resize.setSizeMode}
                width={resize.width}
                onWidth={resize.setWidth}
                height={resize.height}
                onHeight={resize.setHeight}
                percent={resize.percent}
                onPercent={resize.setPercent}
                lockAspect={resize.lockAspect}
                onLockAspect={resize.setLockAspect}
                fitMode={resize.fitMode}
                onFitMode={resize.setFitMode}
                format={resize.format}
                onFormat={resize.setFormat}
                quality={resize.quality}
                onQuality={resize.setQuality}
                backdrop={resize.backdrop}
                onBackdrop={resize.setBackdrop}
                onPreset={resize.applyPreset}
                onReset={resize.resetToOriginal}
                disabled={false}
              />

              <BatchStatsPanel
                total={resize.stats.total}
                done={resize.stats.done}
                original={resize.stats.original}
                output={resize.stats.output}
                saved={resize.stats.saved}
                pct={resize.stats.pct}
                queued={resize.stats.queued}
                processing={resize.stats.processing}
                errors={resize.stats.errors}
                progress={resize.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {resize.stats.busy ? (
                  <button
                    type="button"
                    onClick={resize.cancelRun}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
                  >
                    <OctagonX className="h-3.5 w-3.5" />
                    {t.batchCompress.cancelRun}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resize.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {resize.focusItem ? (
                <>
                  <ResizeMetricsPanel
                    item={resize.focusItem}
                    busy={resize.focusRow?.status === "processing"}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={resize.focusRow?.status !== "done"}
                      onClick={() => resize.downloadOne(resize.focusItem!)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.common.downloadOne}
                    </button>
                    <button
                      type="button"
                      onClick={() => resize.remove(resize.focusItem!.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
                      aria-label={t.common.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {resize.stats.done > 1 ? (
                <button
                  type="button"
                  onClick={resize.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  {resize.zipLabel}
                  <span className="text-violet-200/80">({resize.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={resize.onFiles} accept={resize.accept} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ResizeDetailPreview({
  row,
  item,
  compare,
  onCompare,
  t,
}: {
  row: BatchQueueRow;
  item: LivePreviewImage | null;
  compare: CompareMode;
  onCompare: (m: CompareMode) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const busy = row.status === "processing" || row.status === "queued";
  const canCompare = row.status === "done" && item != null;

  return (
    <div className="min-w-0 space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
      <p className="text-xs text-slate-500">{t.resizeTool.detailPreview}</p>
      {row.status === "error" ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {row.errorMessage ?? t.resizeTool.errorProcessing}
        </p>
      ) : null}
      {canCompare ? (
        <>
          <BeforeAfterToggle mode={compare} onChange={onCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={item.sourcePreviewUrl}
              afterSrc={item.previewUrl}
              maxZoom={4}
              beforeLabel={t.resizeTool.beforeLabel}
              afterLabel={t.resizeTool.afterLabel}
            />
          ) : (
            <ToolSinglePreview
              src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
              label={compare === "before" ? t.resizeTool.beforeLabel : t.resizeTool.afterLabel}
            />
          )}
        </>
      ) : (
        <>
          <ToolSinglePreview
            src={row.sourcePreviewUrl}
            label={
              row.status === "processing"
                ? t.resizeTool.converting
                : row.status === "queued"
                  ? t.batchCompress.statusQueued
                  : t.resizeTool.beforeLabel
            }
            busy={busy && row.status !== "error"}
          />
          {busy ? (
            <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.resizeTool.converting}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}