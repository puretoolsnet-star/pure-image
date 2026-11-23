"use client";

import { Download, Loader2, OctagonX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { PngToJpgControls } from "@/components/tools/PngToJpgControls";
import { PngToJpgMetricsPanel } from "@/components/tools/PngToJpgMetricsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { usePngToJpg } from "@/components/tools/use-png-to-jpg";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage } from "@/lib/image/types";

const PNG_ACCEPT = "image/png,.png";

function rowStatusLabel(row: BatchQueueRow, t: ReturnType<typeof useI18n>["t"]): string {
  switch (row.status) {
    case "processing":
      return t.pngToJpg.converting;
    case "queued":
      return t.batchCompress.statusQueued;
    case "done":
      return t.pngToJpg.uploadedStatus;
    case "error":
      return row.errorMessage ?? t.pngToJpg.errorProcessing;
    default:
      return t.pngToJpg.converting;
  }
}

function backdropSummary(backdrop: string, t: ReturnType<typeof useI18n>["t"]) {
  const c = backdrop.toLowerCase();
  if (c === "#ffffff" || c === "white") return t.pngToJpg.backdropWhite;
  if (c === "#000000" || c === "black") return t.pngToJpg.backdropBlack;
  return t.pngToJpg.backdropCustom;
}

function settingsSummary(
  png: ReturnType<typeof usePngToJpg>,
  t: ReturnType<typeof useI18n>["t"],
) {
  const parts = [
    `${t.pngToJpg.backdropTitle}: ${backdropSummary(png.backdrop, t)}`,
    png.useTargetKb && png.targetKb
      ? `${png.targetKb} KB`
      : `${t.pngToJpg.quality} ${png.quality}%`,
  ];
  return parts.join(" · ");
}

export function PngToJpgTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const png = usePngToJpg();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = png.stats.total > 0;
  const focusRow = png.focusRow;

  const allDone =
    hasWork &&
    png.stats.done === png.stats.total - png.stats.errors &&
    !png.stats.busy &&
    png.stats.queued === 0 &&
    png.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : png.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : png.stats.done > 0 && (allDone || !png.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : png.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.pngToJpg.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.pngToJpg.workflowSettings, state: settingsState },
      { label: t.pngToJpg.workflowResult, state: resultState },
    ];
  }, [hasWork, png.stats.busy, png.stats.done, allDone, t]);

  useEffect(() => {
    if (png.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = png.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = png.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [png.stats.total]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.pngToJpg.lead}</p>
          <ImageDropzone onFiles={png.onFiles} accept={PNG_ACCEPT} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="png-to-jpg-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="png-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="png-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.pngToJpg.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-violet-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-violet-500/25 lg:bg-violet-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-violet-200">
                  {t.batchCompress.fileCount(png.stats.done, png.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    png.stats.queued,
                    png.stats.processing,
                    png.stats.done,
                    png.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">{settingsSummary(png, t)}</p>
            </div>

            {focusRow && png.stats.total === 1 ? (
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
            <ImageDropzone onFiles={png.onFiles} accept={PNG_ACCEPT} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {png.stats.total > 1 ? (
                <div className="max-h-none overflow-visible lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <BatchQueueList
                    rows={png.queue}
                    focusId={png.focusId}
                    globalQuality={png.quality}
                    onFocus={png.setFocusId}
                    onRemove={png.remove}
                    onRetry={png.retry}
                    onDownload={(id) => {
                      const row = png.queue.find((r) => r.id === id);
                      if (row?.result) png.downloadOne(row.result);
                    }}
                    onOverrides={(id, q) => png.applyOverrides(id, { quality: q })}
                  />
                </div>
              ) : null}

              {focusRow ? (
                <PngDetailPreview
                  row={focusRow}
                  item={png.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <PngToJpgControls
                quality={png.quality}
                onQuality={png.setQuality}
                maxWidth={png.maxWidth}
                onMaxWidth={png.setMaxWidth}
                backdrop={png.backdrop}
                onBackdrop={png.setBackdrop}
                exifMode={png.exifMode}
                onExifMode={png.setExifMode}
                useTargetKb={png.useTargetKb}
                onUseTargetKb={png.setUseTargetKb}
                targetKb={png.targetKb}
                onTargetKb={png.setTargetKb}
                disabled={false}
              />

              <BatchStatsPanel
                total={png.stats.total}
                done={png.stats.done}
                original={png.stats.original}
                output={png.stats.output}
                saved={png.stats.saved}
                pct={png.stats.pct}
                queued={png.stats.queued}
                processing={png.stats.processing}
                errors={png.stats.errors}
                progress={png.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {png.stats.busy ? (
                  <button
                    type="button"
                    onClick={png.cancelRun}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
                  >
                    <OctagonX className="h-3.5 w-3.5" />
                    {t.batchCompress.cancelRun}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={png.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {png.focusItem ? (
                <>
                  <PngToJpgMetricsPanel
                    item={png.focusItem}
                    busy={png.focusRow?.status === "processing"}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={png.focusRow?.status !== "done"}
                      onClick={() => png.downloadOne(png.focusItem!)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.common.downloadOne}
                    </button>
                    <button
                      type="button"
                      onClick={() => png.remove(png.focusItem!.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
                      aria-label={t.common.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {png.stats.done > 1 ? (
                <button
                  type="button"
                  onClick={png.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  {png.zipLabel}
                  <span className="text-violet-200/80">({png.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={png.onFiles} accept={PNG_ACCEPT} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PngDetailPreview({
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
      <p className="text-xs text-slate-500">{t.pngToJpg.detailPreview}</p>
      {row.status === "error" ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {row.errorMessage ?? t.pngToJpg.errorProcessing}
        </p>
      ) : null}
      {canCompare ? (
        <>
          <BeforeAfterToggle mode={compare} onChange={onCompare} />
          {compare === "split" ? (
            <SmartCompareSlider beforeSrc={item.sourcePreviewUrl} afterSrc={item.previewUrl} />
          ) : (
            <ToolSinglePreview
              src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
              label={compare === "before" ? t.pngToJpg.beforeLabel : t.pngToJpg.afterLabel}
            />
          )}
        </>
      ) : (
        <>
          <ToolSinglePreview
            src={row.sourcePreviewUrl}
            label={
              row.status === "processing"
                ? t.pngToJpg.converting
                : row.status === "queued"
                  ? t.batchCompress.statusQueued
                  : t.pngToJpg.beforeLabel
            }
            busy={busy && row.status !== "error"}
          />
          {busy ? (
            <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.pngToJpg.converting}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}