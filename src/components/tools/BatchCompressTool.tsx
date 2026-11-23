"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchCompressControls } from "@/components/tools/BatchCompressControls";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { useBatchCompress } from "@/components/tools/use-batch-compress";
import { useI18n } from "@/i18n/context";

const BATCH_ACCEPT = "image/jpeg,image/png,image/webp";

export function BatchCompressTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const batch = useBatchCompress();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = batch.stats.total > 0;
  const allDone =
    hasWork &&
    batch.stats.done === batch.stats.total - batch.stats.errors &&
    batch.stats.errors >= 0 &&
    !batch.stats.busy &&
    batch.stats.queued === 0 &&
    batch.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : batch.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : batch.stats.done > 0 && (allDone || !batch.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : batch.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.batchCompress.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.batchCompress.workflowSettings, state: settingsState },
      { label: t.batchCompress.workflowResult, state: resultState },
    ];
  }, [hasWork, batch.stats.busy, batch.stats.done, allDone, t]);

  useEffect(() => {
    if (batch.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = batch.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = batch.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [batch.stats.total]);

  const formatLabel =
    batch.format === "auto"
      ? t.batchCompress.formatAuto
      : batch.format === "webp"
        ? t.toolUi.formatWebp
        : t.toolUi.formatJpeg;

  const focusRow = batch.focusRow;

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.batchCompress.lead}</p>
          <ImageDropzone onFiles={batch.addFiles} accept={BATCH_ACCEPT} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="batch-compress-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="batch-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="batch-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.batchCompress.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-emerald-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-emerald-200">
                  {t.batchCompress.fileCount(batch.stats.done, batch.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    batch.stats.queued,
                    batch.stats.processing,
                    batch.stats.done,
                    batch.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">
                {t.toolUi.quality}:{" "}
                <span className="font-medium text-violet-200">{batch.quality}%</span>
                {" · "}
                {t.toolUi.maxWidth}:{" "}
                <span className="font-medium text-violet-200">{batch.maxWidth}px</span>
                {" · "}
                {t.batchCompress.formatTitle}:{" "}
                <span className="font-medium text-violet-200">{formatLabel}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 lg:hidden">
            <p className="text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={batch.addFiles} accept={BATCH_ACCEPT} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              <div className="max-h-none overflow-visible pr-0 lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:pr-0.5 lg:[-webkit-overflow-scrolling:touch]">
                <BatchQueueList
                  rows={batch.queue}
                  focusId={batch.focusId}
                  globalQuality={batch.quality}
                  onFocus={batch.setFocusId}
                  onRemove={batch.remove}
                  onRetry={batch.retry}
                  onDownload={(id) => {
                    const row = batch.queue.find((r) => r.id === id);
                    if (row?.result) batch.downloadOne(row.result);
                  }}
                  onOverrides={(id, q) => batch.applyOverrides(id, { quality: q })}
                />
              </div>

              {focusRow ? (
                <BatchDetailPreview
                  row={focusRow}
                  item={batch.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <BatchCompressControls
                quality={batch.quality}
                onQuality={batch.setQuality}
                maxWidth={batch.maxWidth}
                onMaxWidth={batch.setMaxWidth}
                preservePixels={batch.preservePixels}
                onPreservePixels={batch.setPreservePixels}
                format={batch.format}
                onFormat={batch.setFormat}
                disabled={false}
              />

              <BatchStatsPanel
                total={batch.stats.total}
                done={batch.stats.done}
                original={batch.stats.original}
                output={batch.stats.output}
                saved={batch.stats.saved}
                pct={batch.stats.pct}
                queued={batch.stats.queued}
                processing={batch.stats.processing}
                errors={batch.stats.errors}
                progress={batch.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {batch.stats.busy ? (
                  <CancelRunButton onCancel={batch.cancelRun} label={t.batchCompress.cancelRun} />
                ) : (
                  <button
                    type="button"
                    onClick={batch.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {batch.stats.done > 0 ? (
                <button
                  type="button"
                  onClick={batch.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400"
                >
                  <Download className="h-4 w-4" />
                  {batch.zipLabel}
                  <span className="text-emerald-900/70">({batch.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={batch.addFiles} accept={BATCH_ACCEPT} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function BatchDetailPreview({
  row,
  item,
  compare,
  onCompare,
  t,
}: {
  row: NonNullable<ReturnType<typeof useBatchCompress>["focusRow"]>;
  item: ReturnType<typeof useBatchCompress>["focusItem"];
  compare: CompareMode;
  onCompare: (m: CompareMode) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const busy = row.status === "processing" || row.status === "queued";
  const canCompare = row.status === "done" && item != null;

  return (
    <div className="min-w-0 space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
      <h3 className="text-sm font-semibold text-white">{t.batchCompress.detailPreview}</h3>
      {canCompare ? (
        <>
          <BeforeAfterToggle mode={compare} onChange={onCompare} />
          {compare === "split" ? (
            <SmartCompareSlider beforeSrc={item.sourcePreviewUrl} afterSrc={item.previewUrl} />
          ) : (
            <ToolSinglePreview
              src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
              label={compare === "before" ? t.livePreview.before : t.livePreview.after}
            />
          )}
        </>
      ) : (
        <ToolSinglePreview
          src={row.sourcePreviewUrl}
          label={
            row.status === "processing"
              ? t.batchCompress.statusProcessing
              : row.status === "error"
                ? t.batchCompress.statusError
                : t.batchCompress.statusQueued
          }
          busy={busy && row.status !== "error"}
        />
      )}
    </div>
  );
}

function CancelRunButton({ onCancel, label }: { onCancel: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onCancel}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
    >
      <OctagonX className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}