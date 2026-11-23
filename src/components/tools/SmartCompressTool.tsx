"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { SmartCompressControls } from "@/components/tools/SmartCompressControls";
import { SmartMetricsPanel } from "@/components/tools/SmartMetricsPanel";
import { ToolFileStrip } from "@/components/tools/ToolFileStrip";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import { useSmartCompress } from "@/components/tools/use-smart-compress";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import { resolveMaxWidth, resolveQualityPercent } from "@/lib/image/smart-analyze";
const SMART_ACCEPT = "image/jpeg,image/png,image/webp";

export function SmartCompressTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const smart = useSmartCompress();
  const workZoneRef = useRef<HTMLElement>(null);
  const hadWorkRef = useRef(false);

  const hasWork = smart.hasSources || smart.items.length > 0;

  const applied = useMemo(() => {
    const item = smart.focusItem;
    if (!item?.contentKind) return { quality: smart.quality, maxWidth: smart.maxWidth };
    return {
      quality: resolveQualityPercent(smart.mode, item.contentKind, smart.quality),
      maxWidth: resolveMaxWidth(
        smart.mode,
        {
          kind: item.contentKind,
          width: item.width,
          height: item.height,
          megapixels: (item.width * item.height) / 1e6,
          hasAlpha: item.contentKind === "transparent",
        },
        smart.maxWidth,
      ),
    };
  }, [smart.focusItem, smart.mode, smart.quality, smart.maxWidth]);

  const item = smart.focusItem;
  const awaitingFirstOutput = Boolean(item?.pending);
  const resultReady = Boolean(item && !item.pending && item.outputSize > 0);

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : awaitingFirstOutput || smart.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : resultReady && !smart.busy
        ? "done"
        : "current";

    return [
      { label: t.smartCompress.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.smartCompress.workflowSettings, state: settingsState },
      { label: t.smartCompress.workflowResult, state: resultState },
    ];
  }, [hasWork, smart.busy, awaitingFirstOutput, resultReady, t]);

  useEffect(() => {
    if (hasWork && !hadWorkRef.current) {
      requestAnimationFrame(() => {
        workZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    hadWorkRef.current = hasWork;
  }, [hasWork]);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      {!hasWork ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">{t.smartCompress.acceptHint}</p>
          <ImageDropzone onFiles={smart.onFiles} accept={SMART_ACCEPT} />
        </>
      ) : null}

      {hasWork && item ? (
        <section
          ref={workZoneRef}
          id="smart-compress-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="smart-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="smart-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.smartCompress.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <ToolUploadedFileCard
              name={item.name}
              size={formatBytes(item.originalSize)}
              thumbSrc={item.sourcePreviewUrl}
              busy={awaitingFirstOutput}
              statusLabel={
                awaitingFirstOutput
                  ? t.smartCompress.analyzing
                  : smart.busy
                    ? t.livePreview.updating
                    : t.smartCompress.uploadedStatus
              }
            />
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
            <div className="order-2 min-w-0 space-y-3 lg:order-1 lg:sticky lg:top-20">
              {smart.items.length > 1 ? (
                <ToolFileStrip
                  items={smart.items}
                  activeId={item.id}
                  onSelect={smart.setFocusId}
                />
              ) : null}

              <BeforeAfterToggle mode={compare} onChange={setCompare} />

              {compare === "split" ? (
                <SmartCompareSlider
                  beforeSrc={item.sourcePreviewUrl}
                  afterSrc={item.previewUrl}
                  busy={smart.busy || awaitingFirstOutput}
                />
              ) : (
                <ToolSinglePreview
                  src={
                    compare === "before" || awaitingFirstOutput
                      ? item.sourcePreviewUrl
                      : item.previewUrl
                  }
                  label={compare === "before" ? t.livePreview.before : t.livePreview.after}
                  busy={smart.busy || awaitingFirstOutput}
                />
              )}

              {awaitingFirstOutput ? (
                <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t.smartCompress.analyzing}
                </p>
              ) : null}
            </div>

            <div className="order-1 min-w-0 space-y-3 lg:order-2">
              <SmartCompressControls
                mode={smart.mode}
                onMode={smart.setMode}
                quality={smart.quality}
                maxWidth={smart.maxWidth}
                onQuality={smart.setQuality}
                onMaxWidth={smart.setMaxWidth}
                targetKb={smart.targetKb}
                onTargetKb={smart.setTargetKb}
                appliedQuality={applied.quality}
                appliedMaxWidth={applied.maxWidth}
                disabled={smart.busy && awaitingFirstOutput}
              />

              <SmartMetricsPanel
                item={item}
                busy={smart.busy}
                pendingEstimate={smart.pendingEstimate}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={smart.busy || awaitingFirstOutput || !resultReady}
                  onClick={() => smart.downloadOne(item)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {t.common.downloadOne}
                </button>
                <button
                  type="button"
                  onClick={() => smart.remove(item.id)}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-400 hover:border-red-500/40 hover:text-red-300"
                  aria-label={t.common.remove}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-3">
            <p className="mb-2 text-center text-[11px] text-slate-500">{t.dropzone.addMore}</p>
            <ImageDropzone onFiles={smart.onFiles} accept={SMART_ACCEPT} compact />
          </div>

          {!smart.busy && resultReady ? (
            <p className="text-center text-xs text-slate-500">{t.livePreview.liveHint}</p>
          ) : null}
        </section>
      ) : null}

      {smart.items.length > 1 ? (
        <button
          type="button"
          onClick={smart.downloadZip}
          className="w-full max-w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {smart.zipLabel}
        </button>
      ) : null}
    </div>
  );
}