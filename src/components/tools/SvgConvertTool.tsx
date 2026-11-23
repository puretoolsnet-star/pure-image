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
import { SvgConvertControls } from "@/components/tools/SvgConvertControls";
import { SvgMetricsPanel } from "@/components/tools/SvgMetricsPanel";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { useSvgConvert } from "@/components/tools/use-svg-convert";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { SvgOutputFormat } from "@/lib/image/convert-svg";
import type { LivePreviewImage } from "@/lib/image/types";

const SVG_ACCEPT = "image/svg+xml,.svg";

function rowStatusLabel(row: BatchQueueRow, t: ReturnType<typeof useI18n>["t"]): string {
  switch (row.status) {
    case "processing":
      return t.svgConvert.converting;
    case "queued":
      return t.batchCompress.statusQueued;
    case "done":
      return t.svgConvert.uploadedStatus;
    case "error":
      return row.errorMessage ?? t.svgConvert.errorProcessing;
    default:
      return t.svgConvert.converting;
  }
}

function settingsSummary(
  svg: ReturnType<typeof useSvgConvert>,
  t: ReturnType<typeof useI18n>["t"],
): string {
  const fmt =
    svg.format === "image/jpeg" ? t.toolUi.formatJpeg : t.toolUi.formatPng;
  const size =
    svg.sizeMode === "scale"
      ? `${svg.scaleMultiplier}×`
      : `${svg.outputWidth}×${svg.outputHeight} px`;
  const parts = [fmt, size];
  if (svg.format === "image/jpeg") {
    parts.push(`${t.svgConvert.quality} ${svg.quality}%`);
  } else if (svg.pngBackground === "solid") {
    parts.push(t.svgConvert.pngSolid);
  }
  return parts.join(" · ");
}

export function SvgConvertTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const svg = useSvgConvert();
  const workZoneRef = useRef<HTMLElement>(null);
  const queueAnchorRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);

  const hasWork = svg.stats.total > 0;
  const focusRow = svg.focusRow;

  const sanitizeNote = useMemo(() => {
    const w = (svg.focusItem as { sanitizeWarnings?: string[] } | null)?.sanitizeWarnings;
    if (!w?.length) return null;
    return t.svgConvert.sanitizeNotice;
  }, [svg.focusItem, t.svgConvert.sanitizeNotice]);

  const allDone =
    hasWork &&
    svg.stats.done === svg.stats.total - svg.stats.errors &&
    !svg.stats.busy &&
    svg.stats.queued === 0 &&
    svg.stats.processing === 0;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : svg.stats.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : svg.stats.done > 0 && (allDone || !svg.stats.busy)
        ? allDone
          ? "done"
          : "current"
        : svg.stats.busy
          ? "current"
          : "upcoming";

    return [
      { label: t.svgConvert.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.svgConvert.workflowSettings, state: settingsState },
      { label: t.svgConvert.workflowResult, state: resultState },
    ];
  }, [hasWork, svg.stats.busy, svg.stats.done, allDone, t]);

  useEffect(() => {
    if (svg.stats.total <= prevTotalRef.current) {
      prevTotalRef.current = svg.stats.total;
      return;
    }
    const firstBatch = prevTotalRef.current === 0;
    prevTotalRef.current = svg.stats.total;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !firstBatch) return;

    const target = mobile ? queueAnchorRef.current ?? workZoneRef.current : workZoneRef.current;
    const runScroll = () => scrollToolWorkZone(target);

    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [svg.stats.total]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.svgConvert.lead}</p>
          <ImageDropzone onFiles={svg.onFiles} accept={SVG_ACCEPT} multiple />
        </>
      ) : null}

      {hasWork ? (
        <section
          ref={workZoneRef}
          id="svg-convert-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="svg-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="svg-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.svgConvert.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <div className="sticky top-14 z-10 -mx-0.5 min-w-0 rounded-xl border border-emerald-500/25 bg-slate-950/95 px-3 py-2.5 shadow-lg shadow-black/25 backdrop-blur-sm lg:static lg:z-auto lg:border-emerald-500/25 lg:bg-emerald-500/5 lg:shadow-none lg:backdrop-blur-none">
              <p className="min-w-0 text-xs text-slate-300">
                <span className="font-medium text-emerald-200">
                  {t.batchCompress.fileCount(svg.stats.done, svg.stats.total)}
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.batchCompress.statusLine(
                    svg.stats.queued,
                    svg.stats.processing,
                    svg.stats.done,
                    svg.stats.errors,
                  )}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 lg:hidden">{settingsSummary(svg, t)}</p>
            </div>

            {focusRow && svg.stats.total === 1 ? (
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
            <ImageDropzone onFiles={svg.onFiles} accept={SVG_ACCEPT} compact multiple />
          </div>

          <div
            ref={queueAnchorRef}
            className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5"
          >
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {svg.stats.total > 1 ? (
                <div className="max-h-none overflow-visible lg:max-h-[min(52vh,28rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <BatchQueueList
                    rows={svg.queue}
                    focusId={svg.focusId}
                    globalQuality={svg.quality}
                    onFocus={svg.setFocusId}
                    onRemove={svg.remove}
                    onRetry={svg.retry}
                    onDownload={(id) => {
                      const row = svg.queue.find((r) => r.id === id);
                      if (row?.result) svg.downloadOne(row.result);
                    }}
                    onOverrides={(_id, q) => svg.setQuality(q)}
                  />
                </div>
              ) : null}

              {focusRow ? (
                <SvgDetailPreview
                  row={focusRow}
                  item={svg.focusItem}
                  compare={compare}
                  onCompare={setCompare}
                  format={svg.format}
                  t={t}
                />
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <SvgConvertControls
                format={svg.format}
                onFormat={svg.setFormat}
                sizeMode={svg.sizeMode}
                onSizeMode={svg.setSizeMode}
                scaleMultiplier={svg.scaleMultiplier}
                onScale={svg.setScaleMultiplier}
                outputWidth={svg.outputWidth}
                onOutputWidth={svg.setOutputWidth}
                outputHeight={svg.outputHeight}
                onOutputHeight={svg.setOutputHeight}
                lockAspect={svg.lockAspect}
                onLockAspect={svg.setLockAspect}
                pngBackground={svg.pngBackground}
                onPngBackground={svg.setPngBackground}
                backdrop={svg.backdrop}
                onBackdrop={svg.setBackdrop}
                quality={svg.quality}
                onQuality={svg.setQuality}
                onPixelPreset={svg.applyPixelPreset}
                disabled={false}
              />

              {sanitizeNote ? (
                <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  {sanitizeNote}
                </p>
              ) : null}

              <BatchStatsPanel
                total={svg.stats.total}
                done={svg.stats.done}
                original={svg.stats.original}
                output={svg.stats.output}
                saved={svg.stats.saved}
                pct={svg.stats.pct}
                queued={svg.stats.queued}
                processing={svg.stats.processing}
                errors={svg.stats.errors}
                progress={svg.stats.progress}
              />

              <div className="flex flex-wrap gap-2">
                {svg.stats.busy ? (
                  <button
                    type="button"
                    onClick={svg.cancelRun}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
                  >
                    <OctagonX className="h-3.5 w-3.5" />
                    {t.batchCompress.cancelRun}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={svg.clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.batchCompress.clearQueue}
                  </button>
                )}
              </div>

              {svg.focusItem ? (
                <>
                  <SvgMetricsPanel
                    item={svg.focusItem}
                    busy={svg.focusRow?.status === "processing"}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={svg.focusRow?.status !== "done"}
                      onClick={() => svg.downloadOne(svg.focusItem!)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.common.downloadOne}
                    </button>
                    <button
                      type="button"
                      onClick={() => svg.remove(svg.focusItem!.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
                      aria-label={t.common.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {svg.stats.done > 1 ? (
                <button
                  type="button"
                  onClick={svg.downloadZipAll}
                  className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  {svg.zipLabel}
                  <span className="text-violet-200/80">({svg.stats.done})</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={svg.onFiles} accept={SVG_ACCEPT} compact multiple />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SvgDetailPreview({
  row,
  item,
  compare,
  onCompare,
  format,
  t,
}: {
  row: BatchQueueRow;
  item: LivePreviewImage | null;
  compare: CompareMode;
  onCompare: (m: CompareMode) => void;
  format: SvgOutputFormat;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const busy = row.status === "processing" || row.status === "queued";
  const canCompare = row.status === "done" && item != null;
  const afterLabel =
    format === "image/jpeg" ? t.toolUi.formatJpeg : t.toolUi.formatPng;

  return (
    <div className="min-w-0 space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
      <p className="text-xs text-slate-500">{t.svgConvert.detailPreview}</p>
      {row.status === "error" ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {row.errorMessage ?? t.svgConvert.errorProcessing}
        </p>
      ) : null}
      {canCompare ? (
        <>
          <BeforeAfterToggle mode={compare} onChange={onCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={item.sourcePreviewUrl}
              afterSrc={item.previewUrl}
              maxZoom={8}
              zoomStep={0.5}
              beforeLabel={t.svgConvert.beforeLabel}
              afterLabel={afterLabel}
            />
          ) : (
            <ToolSinglePreview
              src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
              label={compare === "before" ? t.svgConvert.beforeLabel : afterLabel}
            />
          )}
        </>
      ) : (
        <>
          <ToolSinglePreview
            src={row.sourcePreviewUrl}
            label={
              row.status === "processing"
                ? t.svgConvert.converting
                : row.status === "queued"
                  ? t.batchCompress.statusQueued
                  : t.svgConvert.beforeLabel
            }
            busy={busy && row.status !== "error"}
          />
          {busy ? (
            <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.svgConvert.converting}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}