"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { ResizeControls } from "@/components/tools/ResizeControls";
import { ResizeMetricsPanel } from "@/components/tools/ResizeMetricsPanel";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { useResizeTool } from "@/components/tools/use-resize-tool";
import { useI18n } from "@/i18n/context";

export function ResizeTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const resize = useResizeTool();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.resizeTool.lead}</p>

      <ImageDropzone onFiles={resize.onFiles} accept={resize.accept} multiple />

      <ResizeControls
        sizeMode={resize.sizeMode}
        onSizeMode={resize.setSizeMode}
        width={resize.width}
        onWidth={resize.setWidth}
        height={resize.height}
        onHeight={resize.setHeight}
        percent={resize.percent}
        onPercent={resize.setPercent}
        lockAspect={resize.lockAspect}
        onLockAspect={resize.setLockAspect}
        fitMode={resize.fitMode}
        onFitMode={resize.setFitMode}
        format={resize.format}
        onFormat={resize.setFormat}
        quality={resize.quality}
        onQuality={resize.setQuality}
        backdrop={resize.backdrop}
        onBackdrop={resize.setBackdrop}
        onPreset={resize.applyPreset}
        onReset={resize.resetToOriginal}
        disabled={resize.stats.busy}
      />

      <BatchStatsPanel
        total={resize.stats.total}
        done={resize.stats.done}
        original={resize.stats.original}
        output={resize.stats.output}
        saved={resize.stats.saved}
        pct={resize.stats.pct}
        queued={resize.stats.queued}
        processing={resize.stats.processing}
        errors={resize.stats.errors}
        progress={resize.stats.progress}
      />

      {resize.stats.busy ? (
        <button
          type="button"
          onClick={resize.cancelRun}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-xs text-amber-200"
        >
          <OctagonX className="h-3.5 w-3.5" />
          {t.batchCompress.cancelRun}
        </button>
      ) : resize.stats.total ? (
        <button
          type="button"
          onClick={resize.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

      <BatchQueueList
        rows={resize.queue}
        focusId={resize.focusId}
        globalQuality={resize.quality}
        onFocus={resize.setFocusId}
        onRemove={resize.remove}
        onRetry={resize.retry}
        onDownload={(id) => {
          const row = resize.queue.find((r) => r.id === id);
          if (row?.result) resize.downloadOne(row.result);
        }}
        onOverrides={(id, q) => {
          resize.setQuality(q);
          void id;
        }}
      />

      {resize.focusItem ? (
        <section className="space-y-4">
          <p className="text-xs text-slate-500">{t.resizeTool.detailPreview}</p>
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={resize.focusItem.sourcePreviewUrl}
              afterSrc={resize.focusItem.previewUrl}
              busy={resize.stats.busy && resize.focusRow?.status === "processing"}
              maxZoom={4}
              beforeLabel={t.resizeTool.beforeLabel}
              afterLabel={t.resizeTool.afterLabel}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? resize.focusItem.sourcePreviewUrl
                  : resize.focusItem.previewUrl
              }
              label={
                compare === "before" ? t.resizeTool.beforeLabel : t.resizeTool.afterLabel
              }
              busy={resize.stats.busy && resize.focusRow?.status === "processing"}
            />
          )}
          <ResizeMetricsPanel
            item={resize.focusItem}
            busy={resize.stats.busy && resize.focusRow?.status === "processing"}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={resize.stats.busy && resize.focusRow?.status === "processing"}
              onClick={() => resize.downloadOne(resize.focusItem!)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t.common.downloadOne}
            </button>
            <button
              type="button"
              onClick={() => resize.remove(resize.focusItem!.id)}
              className="rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
              aria-label={t.common.remove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}

      {resize.stats.done > 1 ? (
        <button
          type="button"
          onClick={resize.downloadZipAll}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {resize.zipLabel}
        </button>
      ) : null}

      {resize.stats.total ? (
        <ImageDropzone onFiles={resize.onFiles} accept={resize.accept} compact multiple />
      ) : null}
    </div>
  );
}

function SinglePreview({
  src,
  label,
  busy,
}: {
  src: string;
  label: string;
  busy?: boolean;
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 sm:aspect-video">
      {busy ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/45">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" />
      <span className="absolute bottom-2 left-2 rounded bg-slate-950/75 px-2 py-0.5 text-[10px] text-slate-300">
        {label}
      </span>
    </div>
  );
}