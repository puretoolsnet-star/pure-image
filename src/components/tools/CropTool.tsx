"use client";

import { Download, Loader2, OctagonX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AspectCropEditor } from "@/components/tools/AspectCropEditor";
import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { CropControls } from "@/components/tools/CropControls";
import { CropMetricsPanel } from "@/components/tools/CropMetricsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { useCropTool } from "@/components/tools/use-crop-tool";
import { useI18n } from "@/i18n/context";
import { CROP_ASPECT_PRESETS } from "@/lib/image/crop-aspect";
import { formatBytes } from "@/lib/image/estimate";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { LivePreviewImage } from "@/lib/image/types";

function rowStatusLabel(row: BatchQueueRow, t: ReturnType<typeof useI18n>["t"]): string {
  switch (row.status) {
    case "processing":
      return t.cropTool.converting;
    case "queued":
      return t.batchCompress.statusQueued;
    case "done":
      return t.cropTool.uploadedStatus;
    case "error":
      return row.errorMessage ?? t.cropTool.errorProcessing;
    default:
      return t.cropTool.converting;
  }
}

function formatLabel(format: ResizeFormatChoice, t: ReturnType<typeof useI18n>["t"]) {
  if (format === "jpeg") return t.toolUi.formatJpeg;
  if (format === "webp") return t.toolUi.formatWebp;
  if (format === "png") return t.toolUi.formatPng;
  return t.resizeTool.formatAuto;
}

function aspectLabel(crop: ReturnType<typeof useCropTool>, t: ReturnType<typeof useI18n>["t"]) {
  if (crop.presetId === "custom-ratio") return `${crop.customRatioW}:${crop.customRatioH}`;
  if (crop.presetId === "custom-px") return `${crop.customPxW}×${crop.customPxH} px`;
  const preset = CROP_ASPECT_PRESETS.find((p) => p.id === crop.presetId);
  if (preset) {
    return t.cropTool.aspectLabels[preset.labelKey as keyof typeof t.cropTool.aspectLabels];
  }
  return crop.presetId;
}

function settingsSummary(crop: ReturnType<typeof useCropTool>, t: ReturnType<typeof useI18n>["t"]) {
  return `${aspectLabel(crop, t)} · ${formatLabel(crop.format, t)}`;
}

export function CropTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const crop = useCropTool();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = crop.stats.total > 0;
  const focusRow = crop.focusRow;

  const allDone =
    hasWork &&
    crop.stats.done === crop.stats.total - crop.stats.errors &&
    !crop.stats.busy &&
    crop.stats.queued === 0 &&
    crop.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : crop.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : crop.stats.done > 0 && (allDone || !crop.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : crop.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.cropTool.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.cropTool.workflowSettings, state: settingsState },
      { label: t.cropTool.workflowResult, state: resultState },
    ];
  }, [hasWork, crop.stats.busy, crop.stats.done, allDone, t]);

  useEffect(() => {
    if (crop.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = crop.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = crop.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [crop.stats.total]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.cropTool.lead}</p>
          <ImageDropzone onFiles={crop.onFiles} accept={crop.accept} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="crop-tool-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="crop-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="crop-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.cropTool.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-emerald-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-emerald-500/25 lg:bg-emerald-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-emerald-200">
                  {t.batchCompress.fileCount(crop.stats.done, crop.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    crop.stats.queued,
                    crop.stats.processing,
                    crop.stats.done,
                    crop.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">{settingsSummary(crop, t)}</p>
            </div>

            {focusRow && crop.stats.total === 1 ? (
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
            <ImageDropzone onFiles={crop.onFiles} accept={crop.accept} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {crop.stats.total > 1 ? (
                <div className="max-h-none overflow-visible lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <BatchQueueList
                    rows={crop.queue}
                    focusId={crop.focusId}
                    globalQuality={crop.quality}
                    onFocus={crop.setFocusId}
                    onRemove={crop.remove}
                    onRetry={crop.retry}
                    onDownload={(id) => {
                      const row = crop.queue.find((r) => r.id === id);
                      if (row?.result) crop.downloadOne(row.result);
                    }}
                    onOverrides={() => {}}
                  />
                </div>
              ) : null}

              {crop.focusFile ? (
                <div className="overscroll-contain min-w-0 space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                  <AspectCropEditor
                    file={crop.focusFile}
                    aspectConfig={crop.aspectConfig}
                    crop={crop.crop}
                    onCrop={crop.setCrop}
                    zoom={crop.zoom}
                    onZoom={crop.onZoomChange}
                    showGrid={crop.showGrid}
                    disabled={crop.stats.busy}
                  />
                  <button
                    type="button"
                    disabled={crop.stats.busy}
                    onClick={crop.applyCropToFocus}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
                  >
                    {t.cropTool.applyToFile}
                  </button>
                </div>
              ) : null}

              {focusRow ? (
                <CropDetailPreview
                  row={focusRow}
                  item={crop.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  busyGlobal={crop.stats.busy}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <CropControls
                presetId={crop.presetId}
                onPreset={crop.setPresetId}
                customRatioW={crop.customRatioW}
                onCustomRatioW={crop.setCustomRatioW}
                customRatioH={crop.customRatioH}
                onCustomRatioH={crop.setCustomRatioH}
                customPxW={crop.customPxW}
                onCustomPxW={crop.setCustomPxW}
                customPxH={crop.customPxH}
                onCustomPxH={crop.setCustomPxH}
                showGrid={crop.showGrid}
                onShowGrid={crop.setShowGrid}
                onFlip={crop.flipOrientation}
                format={crop.format}
                onFormat={crop.setFormat}
                quality={crop.quality}
                onQuality={crop.setQuality}
                useMaxSize={crop.useMaxSize}
                onUseMaxSize={crop.setUseMaxSize}
                maxWidth={crop.maxWidth}
                onMaxWidth={crop.setMaxWidth}
                maxHeight={crop.maxHeight}
                onMaxHeight={crop.setMaxHeight}
                disabled={crop.stats.busy}
              />

              <BatchStatsPanel
                total={crop.stats.total}
                done={crop.stats.done}
                original={crop.stats.original}
                output={crop.stats.output}
                saved={crop.stats.saved}
                pct={crop.stats.pct}
                queued={crop.stats.queued}
                processing={crop.stats.processing}
                errors={crop.stats.errors}
                progress={crop.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {crop.stats.busy ? (
                  <button
                    type="button"
                    onClick={crop.cancelRun}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
                  >
                    <OctagonX className="h-3.5 w-3.5" />
                    {t.batchCompress.cancelRun}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={crop.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {crop.focusItem ? (
                <>
                  <CropMetricsPanel
                    item={crop.focusItem}
                    busy={crop.stats.busy && crop.focusRow?.status === "processing"}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={crop.focusRow?.status !== "done"}
                      onClick={() => crop.downloadOne(crop.focusItem!)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.common.downloadOne}
                    </button>
                    <button
                      type="button"
                      onClick={() => crop.remove(crop.focusItem!.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
                      aria-label={t.common.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {crop.stats.done > 1 ? (
                <button
                  type="button"
                  onClick={crop.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950"
                >
                  <Download className="h-4 w-4" />
                  {crop.zipLabel}
                  <span className="text-emerald-900/70">({crop.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={crop.onFiles} accept={crop.accept} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CropDetailPreview({
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
      <p className="text-xs text-slate-500">{t.cropTool.detailPreview}</p>
      {row.status === "error" ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {row.errorMessage ?? t.cropTool.errorProcessing}
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
              beforeLabel={t.cropTool.beforeLabel}
              afterLabel={t.cropTool.afterLabel}
              maxZoom={6}
            />
          ) : (
            <ToolSinglePreview
              src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
              label={compare === "before" ? t.cropTool.beforeLabel : t.cropTool.afterLabel}
            />
          )}
        </>
      ) : (
        <>
          <ToolSinglePreview
            src={row.sourcePreviewUrl}
            label={
              row.status === "processing"
                ? t.cropTool.converting
                : row.status === "queued"
                  ? t.batchCompress.statusQueued
                  : t.cropTool.beforeLabel
            }
            busy={busy && row.status !== "error"}
          />
          {busy ? (
            <p className="flex items-center justify-center gap-2 text-sm text-emerald-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.cropTool.converting}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}