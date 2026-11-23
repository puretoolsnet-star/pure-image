"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { AvifControls } from "@/components/tools/AvifControls";
import { AvifMetricsPanel } from "@/components/tools/AvifMetricsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolFileStrip } from "@/components/tools/ToolFileStrip";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import { useAvifConvert } from "@/components/tools/use-avif-convert";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { AvifEffort, AvifMode } from "@/lib/image/convert-avif";

const AVIF_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/heic,image/heif,.heic,.heif,.svg";

function modeLabel(mode: AvifMode, t: ReturnType<typeof useI18n>["t"]) {
  return { auto: t.avifConvert.modeAuto, lossy: t.avifConvert.modeLossy, lossless: t.avifConvert.modeLossless }[
    mode
  ];
}

function effortLabel(effort: AvifEffort, t: ReturnType<typeof useI18n>["t"]) {
  return {
    fast: t.avifConvert.effortFast,
    balanced: t.avifConvert.effortBalanced,
    deep: t.avifConvert.effortDeep,
  }[effort];
}

export function AvifConvertTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const avif = useAvifConvert();
  const workZoneRef = useRef<HTMLElement>(null);
  const prevCountRef = useRef(0);

  const disabled = avif.supported === false;
  const hasWork = !disabled && (avif.hasSources || avif.items.length > 0);
  const item = avif.focusItem;
  const awaitingFirstOutput = Boolean(item?.pending);
  const resultReady = Boolean(item && !item.pending && item.outputSize > 0);

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : awaitingFirstOutput || avif.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : resultReady && !avif.busy
        ? "done"
        : "current";

    return [
      { label: t.avifConvert.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.avifConvert.workflowSettings, state: settingsState },
      { label: t.avifConvert.workflowResult, state: resultState },
    ];
  }, [hasWork, avif.busy, awaitingFirstOutput, resultReady, t]);

  useEffect(() => {
    const count = avif.stats.count;
    if (count <= prevCountRef.current) {
      prevCountRef.current = count;
      return;
    }
    const first = prevCountRef.current === 0;
    prevCountRef.current = count;

    const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !first) return;

    const runScroll = () => scrollToolWorkZone(workZoneRef.current);
    requestAnimationFrame(() => {
      runScroll();
      if (mobile) window.setTimeout(runScroll, 120);
    });
  }, [avif.stats.count]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {avif.supported === false ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {t.avifConvert.unsupported}
        </p>
      ) : null}
      {avif.supported === null ? (
        <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t.avifConvert.checkingSupport}
        </p>
      ) : null}

      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.avifConvert.lead}</p>
          <ImageDropzone onFiles={avif.onFiles} accept={AVIF_ACCEPT} />
        </>
      ) : null}

      {hasWork && item ? (
        <section
          ref={workZoneRef}
          id="avif-convert-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="avif-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="avif-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.avifConvert.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <ToolUploadedFileCard
              name={item.name}
              size={formatBytes(item.originalSize)}
              thumbSrc={item.sourcePreviewUrl}
              busy={awaitingFirstOutput || (avif.busy && !resultReady)}
              statusLabel={
                awaitingFirstOutput || (avif.busy && !resultReady)
                  ? t.avifConvert.encoding
                  : t.avifConvert.uploadedStatus
              }
            />

            {avif.stats.count > 1 ? (
              <p className="min-w-0 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-center text-[11px] text-slate-400">
                {t.avifConvert.batchTotals(
                  avif.stats.count,
                  formatBytes(avif.stats.original),
                  formatBytes(avif.stats.output),
                  avif.stats.pct,
                )}
              </p>
            ) : null}

            <p className="text-[11px] text-slate-500 lg:hidden">
              {modeLabel(avif.mode, t)}
              {avif.mode !== "lossless" ? (
                <>
                  {" · "}
                  {t.avifConvert.quality}{" "}
                  <span className="font-medium text-emerald-200">{avif.quality}%</span>
                </>
              ) : null}
              {" · "}
              {t.avifConvert.effortTitle}{" "}
              <span className="font-medium text-emerald-200">{effortLabel(avif.effort, t)}</span>
            </p>
          </div>

          <div className="space-y-2 lg:hidden">
            <p className="text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={avif.onFiles} accept={AVIF_ACCEPT} compact />
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {avif.items.length > 1 ? (
                <ToolFileStrip items={avif.items} activeId={item.id} onSelect={avif.setFocusId} />
              ) : null}

              <BeforeAfterToggle mode={compare} onChange={setCompare} />

              {compare === "split" ? (
                <SmartCompareSlider
                  beforeSrc={item.sourcePreviewUrl}
                  afterSrc={item.previewUrl}
                  busy={avif.busy || awaitingFirstOutput}
                />
              ) : (
                <ToolSinglePreview
                  src={
                    compare === "before" || awaitingFirstOutput
                      ? item.sourcePreviewUrl
                      : item.previewUrl
                  }
                  label={compare === "before" ? t.livePreview.before : t.avifConvert.avifLabel}
                  busy={avif.busy || awaitingFirstOutput}
                />
              )}

              {awaitingFirstOutput ? (
                <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t.avifConvert.encoding}
                </p>
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <AvifControls
                mode={avif.mode}
                onMode={avif.setMode}
                quality={avif.quality}
                onQuality={avif.setQuality}
                maxWidth={avif.maxWidth}
                onMaxWidth={avif.setMaxWidth}
                alphaMode={avif.alphaMode}
                onAlphaMode={avif.setAlphaMode}
                backdrop={avif.backdrop}
                onBackdrop={avif.setBackdrop}
                effort={avif.effort}
                onEffort={avif.setEffort}
                disabled={disabled || (avif.busy && awaitingFirstOutput)}
              />

              <AvifMetricsPanel item={item} busy={avif.busy} />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={avif.busy || awaitingFirstOutput || !resultReady}
                  onClick={() => avif.downloadOne(item)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {t.common.downloadOne}
                </button>
                <button
                  type="button"
                  onClick={() => avif.remove(item.id)}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  aria-label={t.common.remove}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden border-t border-slate-800/60 pt-3 lg:block">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={avif.onFiles} accept={AVIF_ACCEPT} compact />
          </div>

          {!avif.busy && resultReady ? (
            <p className="text-center text-xs text-slate-500">{t.livePreview.liveHint}</p>
          ) : null}
        </section>
      ) : null}

      {avif.items.length > 1 ? (
        <button
          type="button"
          onClick={avif.downloadZip}
          className="w-full max-w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {avif.zipLabel}
        </button>
      ) : null}
    </div>
  );
}