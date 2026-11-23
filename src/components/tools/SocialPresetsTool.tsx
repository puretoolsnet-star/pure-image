"use client";

import { Download, Loader2, OctagonX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { SocialCropViewport } from "@/components/tools/SocialCropViewport";
import { SocialPresetsControls } from "@/components/tools/SocialPresetsControls";
import { SocialPresetsMetricsPanel } from "@/components/tools/SocialPresetsMetricsPanel";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { useSocialPresets } from "@/components/tools/use-social-presets";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { LivePreviewImage } from "@/lib/image/types";

function rowStatusLabel(row: BatchQueueRow, t: ReturnType<typeof useI18n>["t"]): string {
  switch (row.status) {
    case "processing":
      return t.socialPresets.converting;
    case "queued":
      return t.batchCompress.statusQueued;
    case "done":
      return t.socialPresets.uploadedStatus;
    case "error":
      return row.errorMessage ?? t.socialPresets.errorProcessing;
    default:
      return t.socialPresets.converting;
  }
}

function formatLabel(format: ResizeFormatChoice, t: ReturnType<typeof useI18n>["t"]) {
  if (format === "jpeg") return t.toolUi.formatJpeg;
  if (format === "webp") return t.toolUi.formatWebp;
  if (format === "png") return t.toolUi.formatPng;
  return t.resizeTool.formatAuto;
}

function presetLabelForSocial(
  social: ReturnType<typeof useSocialPresets>,
  t: ReturnType<typeof useI18n>["t"],
) {
  if (social.presetId === "custom") return t.socialPresets.presetLabels.custom;
  const key = social.activePreset.labelKey as keyof typeof t.socialPresets.presetLabels;
  return t.socialPresets.presetLabels[key] ?? social.presetId;
}

function settingsSummary(social: ReturnType<typeof useSocialPresets>, t: ReturnType<typeof useI18n>["t"]) {
  const preset = presetLabelForSocial(social, t);
  const fill =
    social.fillMode === "cover" ? t.socialPresets.fillCover : t.socialPresets.fillContain;
  return `${preset} · ${social.activePreset.width}×${social.activePreset.height} · ${fill} · ${formatLabel(social.format, t)}`;
}

export function SocialPresetsTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const social = useSocialPresets();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = social.stats.total > 0;
  const focusRow = social.focusRow;

  const presetLabel = useMemo(
    () => presetLabelForSocial(social, t),
    [social.activePreset.labelKey, social.presetId, t],
  );

  const allDone =
    hasWork &&
    social.stats.done === social.stats.total - social.stats.errors &&
    !social.stats.busy &&
    social.stats.queued === 0 &&
    social.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : social.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : social.stats.done > 0 && (allDone || !social.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : social.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.socialPresets.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.socialPresets.workflowSettings, state: settingsState },
      { label: t.socialPresets.workflowResult, state: resultState },
    ];
  }, [hasWork, social.stats.busy, social.stats.done, allDone, t]);

  useEffect(() => {
    if (social.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = social.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = social.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [social.stats.total]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.socialPresets.lead}</p>
          <ImageDropzone onFiles={social.onFiles} accept={social.accept} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="social-presets-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="social-presets-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="social-presets-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.socialPresets.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-violet-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-violet-500/25 lg:bg-violet-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-violet-200">
                  {t.batchCompress.fileCount(social.stats.done, social.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    social.stats.queued,
                    social.stats.processing,
                    social.stats.done,
                    social.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">{settingsSummary(social, t)}</p>
            </div>

            {focusRow && social.stats.total === 1 ? (
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
            <ImageDropzone onFiles={social.onFiles} accept={social.accept} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {social.stats.total > 1 ? (
                <div className="max-h-none overflow-visible lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <BatchQueueList
                    rows={social.queue}
                    focusId={social.focusId}
                    globalQuality={social.quality}
                    onFocus={social.setFocusId}
                    onRemove={social.remove}
                    onRetry={social.retry}
                    onDownload={(id) => {
                      const row = social.queue.find((r) => r.id === id);
                      if (row?.result) social.downloadOne(row.result);
                    }}
                    onOverrides={(id, q) => {
                      social.setQuality(q);
                      void id;
                    }}
                  />
                </div>
              ) : null}

              {social.focusFile ? (
                <div className="min-w-0 space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                  <p className="text-xs text-slate-500">{t.socialPresets.cropHint}</p>
                  <SocialCropViewport
                    file={social.focusFile}
                    preset={social.activePreset}
                    pan={social.pan}
                    onPan={social.setPan}
                    fillMode={social.fillMode}
                    disabled={social.stats.busy}
                  />
                  <button
                    type="button"
                    disabled={social.stats.busy}
                    onClick={social.applyPanToFocus}
                    className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {t.socialPresets.applyCropToFile}
                  </button>
                </div>
              ) : null}

              {focusRow ? (
                <SocialDetailPreview
                  row={focusRow}
                  item={social.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  busyGlobal={social.stats.busy}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <SocialPresetsControls
                presets={social.filteredPresets}
                presetId={social.presetId}
                onPreset={social.setPresetId}
                platformFilter={social.platformFilter}
                onPlatform={social.setPlatformFilter}
                kindFilter={social.kindFilter}
                onKind={social.setKindFilter}
                search={social.search}
                onSearch={social.setSearch}
                customWidth={social.customWidth}
                onCustomWidth={social.setCustomWidth}
                customHeight={social.customHeight}
                onCustomHeight={social.setCustomHeight}
                fillMode={social.fillMode}
                onFillMode={social.setFillMode}
                containBackdrop={social.containBackdrop}
                onContainBackdrop={social.setContainBackdrop}
                backdrop={social.backdrop}
                onBackdrop={social.setBackdrop}
                format={social.format}
                onFormat={social.setFormat}
                quality={social.quality}
                onQuality={social.setQuality}
                useTargetKb={social.useTargetKb}
                onUseTargetKb={social.setUseTargetKb}
                targetKb={social.targetKb}
                onTargetKb={social.setTargetKb}
                disabled={social.stats.busy}
              />

              <BatchStatsPanel
                total={social.stats.total}
                done={social.stats.done}
                original={social.stats.original}
                output={social.stats.output}
                saved={social.stats.saved}
                pct={social.stats.pct}
                queued={social.stats.queued}
                processing={social.stats.processing}
                errors={social.stats.errors}
                progress={social.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {social.stats.busy ? (
                  <button
                    type="button"
                    onClick={social.cancelRun}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
                  >
                    <OctagonX className="h-3.5 w-3.5" />
                    {t.batchCompress.cancelRun}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={social.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {social.focusItem ? (
                <>
                  <SocialPresetsMetricsPanel
                    item={social.focusItem}
                    presetLabel={presetLabel}
                    busy={social.stats.busy && social.focusRow?.status === "processing"}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={social.focusRow?.status !== "done"}
                      onClick={() => social.downloadOne(social.focusItem!)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.common.downloadOne}
                    </button>
                    <button
                      type="button"
                      onClick={() => social.remove(social.focusItem!.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
                      aria-label={t.common.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {social.stats.done > 1 ? (
                <button
                  type="button"
                  onClick={social.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  {social.zipLabel}
                  <span className="text-violet-200/80">({social.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={social.onFiles} accept={social.accept} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SocialDetailPreview({
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
      <p className="text-xs text-slate-500">{t.socialPresets.detailPreview}</p>
      {row.status === "error" ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {row.errorMessage ?? t.socialPresets.errorProcessing}
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
              beforeLabel={t.socialPresets.beforeLabel}
              afterLabel={t.socialPresets.afterLabel}
              maxZoom={4}
            />
          ) : (
            <ToolSinglePreview
              src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
              label={compare === "before" ? t.socialPresets.beforeLabel : t.socialPresets.afterLabel}
            />
          )}
        </>
      ) : (
        <>
          <ToolSinglePreview
            src={row.sourcePreviewUrl}
            label={
              row.status === "processing"
                ? t.socialPresets.converting
                : row.status === "queued"
                  ? t.batchCompress.statusQueued
                  : t.socialPresets.beforeLabel
            }
            busy={busy && row.status !== "error"}
          />
          {busy ? (
            <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.socialPresets.converting}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}