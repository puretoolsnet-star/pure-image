"use client";

import { Download, Loader2, OctagonX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { HeicToJpgControls } from "@/components/tools/HeicToJpgControls";
import { HeicToJpgMetricsPanel } from "@/components/tools/HeicToJpgMetricsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import { useHeicToJpg } from "@/components/tools/use-heic-to-jpg";
import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage } from "@/lib/image/types";
import type { HeicExifMode } from "@/lib/image/convert-heic-jpg";

const HEIC_ACCEPT =
  "image/heic,image/heif,.heic,.heif,image/jpeg,image/png,image/webp,image/gif,image/bmp";

function rowStatusLabel(row: BatchQueueRow, t: ReturnType<typeof useI18n>["t"]): string {
  switch (row.status) {
    case "processing":
      return t.heicToJpg.converting;
    case "queued":
      return t.batchCompress.statusQueued;
    case "done":
      return t.heicToJpg.uploadedStatus;
    case "error":
      return row.errorMessage ?? t.batchCompress.statusError;
    default:
      return t.heicToJpg.converting;
  }
}

function exifLabel(mode: HeicExifMode, t: ReturnType<typeof useI18n>["t"]) {
  return mode === "preserve" ? t.heicToJpg.exifPreserve : t.heicToJpg.exifStrip;
}

export function HeicToJpgTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const heic = useHeicToJpg();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = heic.stats.total > 0;
  const focusRow = heic.focusRow;

  const allDone =
    hasWork &&
    heic.stats.done === heic.stats.total - heic.stats.errors &&
    !heic.stats.busy &&
    heic.stats.queued === 0 &&
    heic.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : heic.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : heic.stats.done > 0 && (allDone || !heic.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : heic.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.heicToJpg.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.heicToJpg.workflowSettings, state: settingsState },
      { label: t.heicToJpg.workflowResult, state: resultState },
    ];
  }, [hasWork, heic.stats.busy, heic.stats.done, allDone, t]);

  useEffect(() => {
    if (heic.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = heic.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = heic.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [heic.stats.total]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.heicToJpg.lead}</p>
          <ImageDropzone onFiles={heic.addFiles} accept={HEIC_ACCEPT} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="heic-to-jpg-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="heic-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="heic-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.heicToJpg.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-emerald-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-emerald-500/25 lg:bg-emerald-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-emerald-200">
                  {t.batchCompress.fileCount(heic.stats.done, heic.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    heic.stats.queued,
                    heic.stats.processing,
                    heic.stats.done,
                    heic.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">
                {t.heicToJpg.quality}{" "}
                <span className="font-medium text-emerald-200">{heic.quality}%</span>
                {" · "}
                {t.heicToJpg.exifTitle}:{" "}
                <span className="font-medium text-emerald-200">{exifLabel(heic.exifMode, t)}</span>
              </p>
            </div>

            {focusRow && heic.stats.total === 1 ? (
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
            <ImageDropzone onFiles={heic.addFiles} accept={HEIC_ACCEPT} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {heic.stats.total > 1 ? (
                <div className="max-h-none overflow-visible lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <BatchQueueList
                    rows={heic.queue}
                    focusId={heic.focusId}
                    globalQuality={heic.quality}
                    onFocus={heic.setFocusId}
                    onRemove={heic.remove}
                    onRetry={heic.retry}
                    onDownload={(id) => {
                      const row = heic.queue.find((r) => r.id === id);
                      if (row?.result) heic.downloadOne(row.result);
                    }}
                    onOverrides={(id, q) => heic.applyOverrides(id, { quality: q })}
                  />
                </div>
              ) : null}

              {focusRow ? (
                <HeicDetailPreview
                  row={focusRow}
                  item={heic.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <HeicToJpgControls
                quality={heic.quality}
                onQuality={heic.setQuality}
                maxWidth={heic.maxWidth}
                onMaxWidth={heic.setMaxWidth}
                backdrop={heic.backdrop}
                onBackdrop={heic.setBackdrop}
                exifMode={heic.exifMode}
                onExifMode={heic.setExifMode}
                disabled={false}
              />

              <BatchStatsPanel
                total={heic.stats.total}
                done={heic.stats.done}
                original={heic.stats.original}
                output={heic.stats.output}
                saved={heic.stats.saved}
                pct={heic.stats.pct}
                queued={heic.stats.queued}
                processing={heic.stats.processing}
                errors={heic.stats.errors}
                progress={heic.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {heic.stats.busy ? (
                  <button
                    type="button"
                    onClick={heic.cancelRun}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
                  >
                    <OctagonX className="h-3.5 w-3.5" />
                    {t.batchCompress.cancelRun}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={heic.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {heic.focusItem ? (
                <>
                  <HeicToJpgMetricsPanel
                    item={heic.focusItem}
                    busy={heic.focusRow?.status === "processing"}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={heic.focusRow?.status !== "done"}
                      onClick={() => heic.downloadOne(heic.focusItem!)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.common.downloadOne}
                    </button>
                    <button
                      type="button"
                      onClick={() => heic.remove(heic.focusItem!.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
                      aria-label={t.common.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {heic.stats.done > 1 ? (
                <button
                  type="button"
                  onClick={heic.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  {heic.zipLabel}
                  <span className="text-violet-200/80">({heic.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={heic.addFiles} accept={HEIC_ACCEPT} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function HeicDetailPreview({
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
      <p className="text-xs text-slate-500">{t.heicToJpg.detailPreview}</p>
      {row.status === "error" ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {row.errorMessage ?? t.heicToJpg.errorDecode}
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
              label={compare === "before" ? t.heicToJpg.beforeLabel : t.heicToJpg.jpgLabel}
            />
          )}
        </>
      ) : (
        <>
          <ToolSinglePreview
            src={row.sourcePreviewUrl}
            label={
              row.status === "processing"
                ? t.heicToJpg.converting
                : row.status === "queued"
                  ? t.batchCompress.statusQueued
                  : t.heicToJpg.beforeLabel
            }
            busy={busy && row.status !== "error"}
          />
          {busy ? (
            <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.heicToJpg.converting}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}