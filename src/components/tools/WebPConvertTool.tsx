"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { scrollToolWorkZone } from "@/components/tools/scroll-tool-work-zone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToolFileStrip } from "@/components/tools/ToolFileStrip";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import { WebPControls } from "@/components/tools/WebPControls";
import { WebPMetricsPanel } from "@/components/tools/WebPMetricsPanel";
import { useWebpConvert } from "@/components/tools/use-webp-convert";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { WebpMode } from "@/lib/image/convert-webp";

const WEBP_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/heic,image/heif,.heic,.heif,.svg";

function modeLabel(mode: WebpMode, t: ReturnType<typeof useI18n>["t"]) {
  const map = {
    auto: t.webpConvert.modeAuto,
    lossy: t.webpConvert.modeLossy,
    lossless: t.webpConvert.modeLossless,
  };
  return map[mode];
}

export function WebPConvertTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const webp = useWebpConvert();
  const workZoneRef = useRef<HTMLElement>(null);
  const prevCountRef = useRef(0);

  const hasWork = webp.hasSources || webp.items.length > 0;
  const item = webp.focusItem;
  const awaitingFirstOutput = Boolean(item?.pending);
  const resultReady = Boolean(item && !item.pending && item.outputSize > 0);

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : awaitingFirstOutput || webp.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : resultReady && !webp.busy
        ? "done"
        : "current";

    return [
      { label: t.webpConvert.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.webpConvert.workflowSettings, state: settingsState },
      { label: t.webpConvert.workflowResult, state: resultState },
    ];
  }, [hasWork, webp.busy, awaitingFirstOutput, resultReady, t]);

  useEffect(() => {
    const count = webp.stats.count;
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
  }, [webp.stats.count]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.webpConvert.lead}</p>
          <ImageDropzone onFiles={webp.onFiles} accept={WEBP_ACCEPT} />
        </>
      ) : null}

      {hasWork && item ? (
        <section
          ref={workZoneRef}
          id="webp-convert-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="webp-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="webp-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.webpConvert.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <ToolUploadedFileCard
              name={item.name}
              size={formatBytes(item.originalSize)}
              thumbSrc={item.sourcePreviewUrl}
              busy={awaitingFirstOutput || (webp.busy && !resultReady)}
              statusLabel={
                awaitingFirstOutput || (webp.busy && !resultReady)
                  ? t.webpConvert.processing
                  : t.webpConvert.uploadedStatus
              }
            />

            {webp.stats.count > 1 ? (
              <p className="min-w-0 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-center text-[11px] text-slate-400">
                {t.webpConvert.batchTotals(
                  webp.stats.count,
                  formatBytes(webp.stats.original),
                  formatBytes(webp.stats.output),
                  webp.stats.pct,
                )}
              </p>
            ) : null}

            <p className="text-[11px] text-slate-500 lg:hidden">
              {modeLabel(webp.mode, t)}
              {webp.mode !== "lossless" ? (
                <>
                  {" · "}
                  {t.webpConvert.quality}{" "}
                  <span className="font-medium text-violet-200">{webp.quality}%</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="space-y-2 lg:hidden">
            <p className="text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={webp.onFiles} accept={WEBP_ACCEPT} compact />
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
            <div className="order-1 min-w-0 space-y-3 lg:sticky lg:top-20">
              {webp.items.length > 1 ? (
                <ToolFileStrip
                  items={webp.items}
                  activeId={item.id}
                  onSelect={webp.setFocusId}
                />
              ) : null}

              <BeforeAfterToggle mode={compare} onChange={setCompare} />

              {compare === "split" ? (
                <SmartCompareSlider
                  beforeSrc={item.sourcePreviewUrl}
                  afterSrc={item.previewUrl}
                  busy={webp.busy || awaitingFirstOutput}
                />
              ) : (
                <ToolSinglePreview
                  src={
                    compare === "before" || awaitingFirstOutput
                      ? item.sourcePreviewUrl
                      : item.previewUrl
                  }
                  label={compare === "before" ? t.livePreview.before : t.webpConvert.webpLabel}
                  busy={webp.busy || awaitingFirstOutput}
                />
              )}

              {awaitingFirstOutput ? (
                <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t.webpConvert.processing}
                </p>
              ) : null}
            </div>

            <div className="order-2 min-w-0 space-y-3">
              <WebPControls
                mode={webp.mode}
                onMode={webp.setMode}
                quality={webp.quality}
                onQuality={webp.setQuality}
                maxWidth={webp.maxWidth}
                onMaxWidth={webp.setMaxWidth}
                alphaMode={webp.alphaMode}
                onAlphaMode={webp.setAlphaMode}
                backdrop={webp.backdrop}
                onBackdrop={webp.setBackdrop}
                disabled={webp.busy && awaitingFirstOutput}
              />

              <WebPMetricsPanel item={item} busy={webp.busy} />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={webp.busy || awaitingFirstOutput || !resultReady}
                  onClick={() => webp.downloadOne(item)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {t.common.downloadOne}
                </button>
                <button
                  type="button"
                  onClick={() => webp.remove(item.id)}
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
            <ImageDropzone onFiles={webp.onFiles} accept={WEBP_ACCEPT} compact />
          </div>

          {!webp.busy && resultReady ? (
            <p className="text-center text-xs text-slate-500">{t.livePreview.liveHint}</p>
          ) : null}
        </section>
      ) : null}

      {webp.items.length > 1 ? (
        <button
          type="button"
          onClick={webp.downloadZip}
          className="w-full max-w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {webp.zipLabel}
        </button>
      ) : null}
    </div>
  );
}