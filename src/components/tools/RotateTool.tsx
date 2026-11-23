"use client";

import { Download, Loader2, OctagonX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { RotateControls } from "@/components/tools/RotateControls";
import { RotateMetricsPanel } from "@/components/tools/RotateMetricsPanel";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { useRotateTool } from "@/components/tools/use-rotate-tool";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { LivePreviewImage } from "@/lib/image/types";

function rowStatusLabel(row: BatchQueueRow, t: ReturnType<typeof useI18n>["t"]): string {
  switch (row.status) {
    case "processing":
      return t.rotateTool.converting;
    case "queued":
      return t.batchCompress.statusQueued;
    case "done":
      return t.rotateTool.uploadedStatus;
    case "error":
      return row.errorMessage ?? t.rotateTool.errorProcessing;
    default:
      return t.rotateTool.converting;
  }
}

function formatLabel(format: ResizeFormatChoice, t: ReturnType<typeof useI18n>["t"]) {
  if (format === "jpeg") return t.toolUi.formatJpeg;
  if (format === "webp") return t.toolUi.formatWebp;
  if (format === "png") return t.toolUi.formatPng;
  return t.resizeTool.formatAuto;
}

function flipSummary(rotate: ReturnType<typeof useRotateTool>, t: ReturnType<typeof useI18n>["t"]) {
  if (rotate.flipH && rotate.flipV) return t.rotateTool.flipBoth;
  if (rotate.flipH) return t.rotateTool.flipHorizontalShort;
  if (rotate.flipV) return t.rotateTool.flipVerticalShort;
  return t.rotateTool.flipNone;
}

function settingsSummary(rotate: ReturnType<typeof useRotateTool>, t: ReturnType<typeof useI18n>["t"]) {
  return `${rotate.angleDeg}° · ${flipSummary(rotate, t)} · ${formatLabel(rotate.format, t)}`;
}

export function RotateTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const rotate = useRotateTool();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = rotate.stats.total > 0;
  const focusRow = rotate.focusRow;

  const allDone =
    hasWork &&
    rotate.stats.done === rotate.stats.total - rotate.stats.errors &&
    !rotate.stats.busy &&
    rotate.stats.queued === 0 &&
    rotate.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : rotate.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : rotate.stats.done > 0 && (allDone || !rotate.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : rotate.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.rotateTool.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.rotateTool.workflowSettings, state: settingsState },
      { label: t.rotateTool.workflowResult, state: resultState },
    ];
  }, [hasWork, rotate.stats.busy, rotate.stats.done, allDone, t]);

  useEffect(() => {
    if (rotate.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = rotate.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = rotate.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [rotate.stats.total]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.rotateTool.lead}</p>
          <ImageDropzone onFiles={rotate.onFiles} accept={rotate.accept} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="rotate-tool-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="rotate-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="rotate-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.rotateTool.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-violet-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-violet-500/25 lg:bg-violet-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-violet-200">
                  {t.batchCompress.fileCount(rotate.stats.done, rotate.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    rotate.stats.queued,
                    rotate.stats.processing,
                    rotate.stats.done,
                    rotate.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">{settingsSummary(rotate, t)}</p>
            </div>

            {focusRow && rotate.stats.total === 1 ? (
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
            <ImageDropzone onFiles={rotate.onFiles} accept={rotate.accept} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {rotate.stats.total > 1 ? (
                <div className="max-h-none overflow-visible lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <BatchQueueList
                    rows={rotate.queue}
                    focusId={rotate.focusId}
                    globalQuality={rotate.quality}
                    onFocus={rotate.setFocusId}
                    onRemove={rotate.remove}
                    onRetry={rotate.retry}
                    onDownload={(id) => {
                      const row = rotate.queue.find((r) => r.id === id);
                      if (row?.result) rotate.downloadOne(row.result);
                    }}
                    onOverrides={() => {}}
                  />
                </div>
              ) : null}

              {focusRow ? (
                <RotateDetailPreview
                  row={focusRow}
                  item={rotate.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  busyGlobal={rotate.stats.busy}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <RotateControls
                angleDeg={rotate.angleDeg}
                onAngle={rotate.setAngleDeg}
                onRotateBy={rotate.rotateBy}
                flipH={rotate.flipH}
                onFlipH={rotate.setFlipH}
                flipV={rotate.flipV}
                onFlipV={rotate.setFlipV}
                canvasMode={rotate.canvasMode}
                onCanvasMode={rotate.setCanvasMode}
                backdropMode={rotate.backdropMode}
                onBackdropMode={rotate.setBackdropMode}
                backdrop={rotate.backdrop}
                onBackdrop={rotate.setBackdrop}
                format={rotate.format}
                onFormat={rotate.setFormat}
                quality={rotate.quality}
                onQuality={rotate.setQuality}
                onReset={rotate.resetTransform}
                disabled={rotate.stats.busy}
              />

              {rotate.focusId ? (
                <button
                  type="button"
                  disabled={rotate.stats.busy}
                  onClick={rotate.applyToFocus}
                  className="w-full rounded-xl border border-violet-500/40 bg-violet-500/15 px-4 py-2.5 text-sm font-medium text-violet-100 disabled:opacity-50"
                >
                  {t.rotateTool.applyToFile}
                </button>
              ) : null}

              <BatchStatsPanel
                total={rotate.stats.total}
                done={rotate.stats.done}
                original={rotate.stats.original}
                output={rotate.stats.output}
                saved={rotate.stats.saved}
                pct={rotate.stats.pct}
                queued={rotate.stats.queued}
                processing={rotate.stats.processing}
                errors={rotate.stats.errors}
                progress={rotate.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {rotate.stats.busy ? (
                  <button
                    type="button"
                    onClick={rotate.cancelRun}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
                  >
                    <OctagonX className="h-3.5 w-3.5" />
                    {t.batchCompress.cancelRun}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={rotate.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {rotate.focusItem ? (
                <>
                  <RotateMetricsPanel
                    item={rotate.focusItem}
                    busy={rotate.stats.busy && rotate.focusRow?.status === "processing"}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={rotate.focusRow?.status !== "done"}
                      onClick={() => rotate.downloadOne(rotate.focusItem!)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-violet-400 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.common.downloadOne}
                    </button>
                    <button
                      type="button"
                      onClick={() => rotate.remove(rotate.focusItem!.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
                      aria-label={t.common.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {rotate.stats.done > 1 ? (
                <button
                  type="button"
                  onClick={rotate.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  {rotate.zipLabel}
                  <span className="text-violet-200/80">({rotate.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={rotate.onFiles} accept={rotate.accept} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function RotateDetailPreview({
  row,
  item,
  compare,
  onCompare,
  busyGlobal,
  t,
}: {
  row: BatchQueueRow;
  item: LivePreviewImage | null;
  compare: CompareMode;
  onCompare: (m: CompareMode) => void;
  busyGlobal: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const busy = row.status === "processing" || row.status === "queued";
  const canCompare = row.status === "done" && item != null;
  const compareBusy = busyGlobal && row.status === "processing";

  return (
    <div className="min-w-0 space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
      <p className="text-xs text-slate-500">{t.rotateTool.detailPreview}</p>
      {row.status === "error" ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {row.errorMessage ?? t.rotateTool.errorProcessing}
        </p>
      ) : null}
      {canCompare ? (
        <>
          <BeforeAfterToggle mode={compare} onChange={onCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={item.sourcePreviewUrl}
              afterSrc={item.previewUrl}
              busy={compareBusy}
              beforeLabel={t.rotateTool.beforeLabel}
              afterLabel={t.rotateTool.afterLabel}
              maxZoom={6}
            />
          ) : (
            <ToolSinglePreview
              src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
              label={compare === "before" ? t.rotateTool.beforeLabel : t.rotateTool.afterLabel}
            />
          )}
        </>
      ) : (
        <>
          <ToolSinglePreview
            src={row.sourcePreviewUrl}
            label={
              row.status === "processing"
                ? t.rotateTool.converting
                : row.status === "queued"
                  ? t.batchCompress.statusQueued
                  : t.rotateTool.beforeLabel
            }
            busy={busy && row.status !== "error"}
          />
          {busy ? (
            <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.rotateTool.converting}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}