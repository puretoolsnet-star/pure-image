"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { ToSizeControls } from "@/components/tools/ToSizeControls";
import { ToSizeMetricsPanel } from "@/components/tools/ToSizeMetricsPanel";
import { ToolFileStrip } from "@/components/tools/ToolFileStrip";
import { ToolSinglePreview } from "@/components/tools/ToolSinglePreview";
import { ToolUploadedFileCard } from "@/components/tools/ToolUploadedFileCard";
import { ToolWorkflowSteps, type WorkflowStepState } from "@/components/tools/ToolWorkflowSteps";
import { useToSizeCompress } from "@/components/tools/use-to-size-compress";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";

const TO_SIZE_ACCEPT = "image/jpeg,image/png,image/webp";

export function ToSizeCompressTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const size = useToSizeCompress();
  const workZoneRef = useRef<HTMLElement>(null);
  const hadWorkRef = useRef(false);

  const hasWork = size.hasSources || size.items.length > 0;
  const item = size.focusItem;
  const awaitingFirstOutput = Boolean(item?.pending);
  const resultReady = Boolean(item && !item.pending && item.outputSize > 0);

  const sampleSize = size.getSourceFile?.(item?.id ?? "")?.size ?? null;

  const workflowSteps = useMemo((): { label: string; state: WorkflowStepState }[] => {
    const settingsState: WorkflowStepState = !hasWork
      ? "upcoming"
      : awaitingFirstOutput || size.busy
        ? "current"
        : "done";
    const resultState: WorkflowStepState = !hasWork
      ? "upcoming"
      : resultReady && !size.busy
        ? "done"
        : "current";

    return [
      { label: t.toSizeCompress.workflowUpload, state: hasWork ? "done" : "upcoming" },
      { label: t.toSizeCompress.workflowSettings, state: settingsState },
      { label: t.toSizeCompress.workflowResult, state: resultState },
    ];
  }, [hasWork, size.busy, awaitingFirstOutput, resultReady, t]);

  const statusDetail = useMemo(() => {
    if (!item || awaitingFirstOutput || size.busy) return null;
    const within =
      item.withinLimit ?? item.outputSize <= (item.targetBytes ?? size.targetKb * 1024);
    return `${size.targetKb} KB · ${within ? t.toSizeCompress.statusWithin : t.toSizeCompress.statusOver}`;
  }, [item, awaitingFirstOutput, size.busy, size.targetKb, t]);

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
          <p className="text-sm leading-relaxed text-slate-400">{t.toSizeCompress.lead}</p>
          <ImageDropzone onFiles={size.onFiles} accept={TO_SIZE_ACCEPT} />
        </>
      ) : null}

      {hasWork && item ? (
        <section
          ref={workZoneRef}
          id="to-size-compress-work"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/35 p-3 sm:p-4"
          aria-labelledby="to-size-work-heading"
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="to-size-work-heading" className="text-sm font-semibold text-white sm:text-base">
                {t.toSizeCompress.workZoneTitle}
              </h2>
              <ToolWorkflowSteps steps={workflowSteps} />
            </div>

            <ToolUploadedFileCard
              name={item.name}
              size={formatBytes(item.originalSize)}
              thumbSrc={item.sourcePreviewUrl}
              busy={awaitingFirstOutput || (size.busy && !resultReady)}
              statusLabel={
                awaitingFirstOutput
                  ? t.toSizeCompress.tuning
                  : size.busy
                    ? t.toSizeCompress.tuning
                    : (statusDetail ?? t.toSizeCompress.uploadedStatus)
              }
            />
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
            <div className="order-2 min-w-0 space-y-3 lg:order-1 lg:sticky lg:top-20">
              {size.items.length > 1 ? (
                <ToolFileStrip items={size.items} activeId={item.id} onSelect={size.setFocusId} />
              ) : null}

              <BeforeAfterToggle mode={compare} onChange={setCompare} />

              {compare === "split" ? (
                <SmartCompareSlider
                  beforeSrc={item.sourcePreviewUrl}
                  afterSrc={item.previewUrl}
                  busy={size.busy || awaitingFirstOutput}
                />
              ) : (
                <ToolSinglePreview
                  src={
                    compare === "before" || awaitingFirstOutput
                      ? item.sourcePreviewUrl
                      : item.previewUrl
                  }
                  label={compare === "before" ? t.livePreview.before : t.livePreview.after}
                  busy={size.busy || awaitingFirstOutput}
                />
              )}

              {(awaitingFirstOutput || size.busy) && !resultReady ? (
                <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t.toSizeCompress.tuning}
                </p>
              ) : null}
            </div>

            <div className="order-1 min-w-0 space-y-3 lg:order-2">
              <ToSizeControls
                targetKb={size.targetKb}
                onTargetKb={size.setTargetKb}
                maxWidth={size.maxWidth}
                onMaxWidth={size.setMaxWidth}
                fitMode={size.fitMode}
                onFitMode={size.setFitMode}
                strategy={size.strategy}
                onStrategy={size.setStrategy}
                format={size.format}
                onFormat={size.setFormat}
                sampleSize={sampleSize ?? item.originalSize}
                disabled={size.busy && awaitingFirstOutput}
              />

              <ToSizeMetricsPanel item={item} busy={size.busy} />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={size.busy || awaitingFirstOutput || !resultReady}
                  onClick={() => size.downloadOne(item)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {t.common.downloadOne}
                </button>
                <button
                  type="button"
                  onClick={() => size.remove(item.id)}
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
            <ImageDropzone onFiles={size.onFiles} accept={TO_SIZE_ACCEPT} compact />
          </div>

          {!size.busy && resultReady ? (
            <p className="text-center text-xs text-slate-500">{t.livePreview.liveHint}</p>
          ) : null}
        </section>
      ) : null}

      {size.items.length > 1 ? (
        <button
          type="button"
          onClick={size.downloadZip}
          className="w-full max-w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {size.zipLabel}
        </button>
      ) : null}
    </div>
  );
}