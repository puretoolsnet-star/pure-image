"use client";

import { Download, Loader2, OctagonX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { ScanEnhanceControls } from "@/components/tools/ScanEnhanceControls";
import { ScanEnhanceMetricsPanel } from "@/components/tools/ScanEnhanceMetricsPanel";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { useScanEnhanceTool } from "@/components/tools/use-scan-enhance-tool";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { ScanPresetId } from "@/lib/image/scan-enhance";
import type { LivePreviewImage } from "@/lib/image/types";

function rowStatusLabel(row: BatchQueueRow, t: ReturnType<typeof useI18n>["t"]): string {
  switch (row.status) {
    case "processing":
      return t.scanEnhanceTool.converting;
    case "queued":
      return t.batchCompress.statusQueued;
    case "done":
      return t.scanEnhanceTool.uploadedStatus;
    case "error":
      return row.errorMessage ?? t.scanEnhanceTool.errorProcessing;
    default:
      return t.scanEnhanceTool.converting;
  }
}

function formatLabel(format: ResizeFormatChoice, t: ReturnType<typeof useI18n>["t"]) {
  if (format === "jpeg") return t.toolUi.formatJpeg;
  if (format === "webp") return t.toolUi.formatWebp;
  if (format === "png") return t.toolUi.formatPng;
  return t.scanEnhanceTool.formatAuto;
}

function presetLabel(preset: ScanPresetId, t: ReturnType<typeof useI18n>["t"]) {
  return t.scanEnhanceTool.presetLabels[preset];
}

function settingsSummary(scan: ReturnType<typeof useScanEnhanceTool>, t: ReturnType<typeof useI18n>["t"]) {
  return `${presetLabel(scan.preset, t)} · ${formatLabel(scan.format, t)}`;
}

export function ScanEnhanceTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const scan = useScanEnhanceTool();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = scan.stats.total > 0;
  const focusRow = scan.focusRow;

  const allDone =
    hasWork &&
    scan.stats.done === scan.stats.total - scan.stats.errors &&
    !scan.stats.busy &&
    scan.stats.queued === 0 &&
    scan.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : scan.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : scan.stats.done > 0 && (allDone || !scan.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : scan.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.scanEnhanceTool.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.scanEnhanceTool.workflowSettings, state: settingsState },
      { label: t.scanEnhanceTool.workflowResult, state: resultState },
    ];
  }, [hasWork, scan.stats.busy, scan.stats.done, allDone, t]);

  useEffect(() => {
    if (scan.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = scan.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = scan.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [scan.stats.total]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.scanEnhanceTool.lead}</p>
          <ImageDropzone onFiles={scan.onFiles} accept={scan.accept} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="scan-enhance-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="scan-enhance-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="scan-enhance-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.scanEnhanceTool.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-emerald-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-emerald-500/25 lg:bg-emerald-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-emerald-200">
                  {t.batchCompress.fileCount(scan.stats.done, scan.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    scan.stats.queued,
                    scan.stats.processing,
                    scan.stats.done,
                    scan.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">{settingsSummary(scan, t)}</p>
            </div>

            {focusRow && scan.stats.total === 1 ? (
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
            <ImageDropzone onFiles={scan.onFiles} accept={scan.accept} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {scan.stats.total > 1 ? (
                <div className="max-h-none overflow-visible lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <BatchQueueList
                    rows={scan.queue}
                    focusId={scan.focusId}
                    globalQuality={scan.quality}
                    onFocus={scan.setFocusId}
                    onRemove={scan.remove}
                    onRetry={scan.retry}
                    onDownload={(id) => {
                      const row = scan.queue.find((r) => r.id === id);
                      if (row?.result) scan.downloadOne(row.result);
                    }}
                    onOverrides={() => {}}
                  />
                </div>
              ) : null}

              {focusRow ? (
                <ScanDetailPreview
                  row={focusRow}
                  item={scan.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  busyGlobal={scan.stats.busy}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <ScanEnhanceControls
                preset={scan.preset}
                onPreset={scan.applyPreset}
                flatten={scan.flatten}
                onFlatten={scan.setFlatten}
                brightness={scan.brightness}
                onBrightness={scan.setBrightness}
                contrast={scan.contrast}
                onContrast={scan.setContrast}
                sharpness={scan.sharpness}
                onSharpness={scan.setSharpness}
                denoise={scan.denoise}
                onDenoise={scan.setDenoise}
                useThreshold={scan.useThreshold}
                onUseThreshold={scan.setUseThreshold}
                threshold={scan.threshold}
                onThreshold={scan.setThreshold}
                format={scan.format}
                onFormat={scan.setFormat}
                quality={scan.quality}
                onQuality={scan.setQuality}
                useMaxSize={scan.useMaxSize}
                onUseMaxSize={scan.setUseMaxSize}
                maxWidth={scan.maxWidth}
                onMaxWidth={scan.setMaxWidth}
                maxHeight={scan.maxHeight}
                onMaxHeight={scan.setMaxHeight}
                useTargetKb={scan.useTargetKb}
                onUseTargetKb={scan.setUseTargetKb}
                targetKb={scan.targetKb}
                onTargetKb={scan.setTargetKb}
                disabled={scan.stats.busy}
              />

              <BatchStatsPanel
                total={scan.stats.total}
                done={scan.stats.done}
                original={scan.stats.original}
                output={scan.stats.output}
                saved={scan.stats.saved}
                pct={scan.stats.pct}
                queued={scan.stats.queued}
                processing={scan.stats.processing}
                errors={scan.stats.errors}
                progress={scan.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {scan.stats.busy ? (
                  <button
                    type="button"
                    onClick={scan.cancelRun}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
                  >
                    <OctagonX className="h-3.5 w-3.5" />
                    {t.batchCompress.cancelRun}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={scan.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {scan.focusItem ? (
                <>
                  <ScanEnhanceMetricsPanel
                    item={scan.focusItem}
                    busy={scan.stats.busy && scan.focusRow?.status === "processing"}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={scan.focusRow?.status !== "done"}
                      onClick={() => scan.downloadOne(scan.focusItem!)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.common.downloadOne}
                    </button>
                    <button
                      type="button"
                      onClick={() => scan.remove(scan.focusItem!.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
                      aria-label={t.common.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {scan.stats.done > 1 ? (
                <button
                  type="button"
                  onClick={scan.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950"
                >
                  <Download className="h-4 w-4" />
                  {scan.zipLabel}
                  <span className="text-emerald-900/70">({scan.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={scan.onFiles} accept={scan.accept} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ScanDetailPreview({
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
      <p className="text-xs text-slate-500">{t.scanEnhanceTool.detailPreview}</p>
      {row.status === "error" ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {row.errorMessage ?? t.scanEnhanceTool.errorProcessing}
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
              beforeLabel={t.scanEnhanceTool.beforeLabel}
              afterLabel={t.scanEnhanceTool.afterLabel}
              maxZoom={8}
            />
          ) : (
            <ToolSinglePreview
              src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
              label={compare === "before" ? t.scanEnhanceTool.beforeLabel : t.scanEnhanceTool.afterLabel}
            />
          )}
        </>
      ) : (
        <>
          <ToolSinglePreview
            src={row.sourcePreviewUrl}
            label={
              row.status === "processing"
                ? t.scanEnhanceTool.converting
                : row.status === "queued"
                  ? t.batchCompress.statusQueued
                  : t.scanEnhanceTool.beforeLabel
            }
            busy={busy && row.status !== "error"}
          />
          {busy ? (
            <p className="flex items-center justify-center gap-2 text-sm text-emerald-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.scanEnhanceTool.converting}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}