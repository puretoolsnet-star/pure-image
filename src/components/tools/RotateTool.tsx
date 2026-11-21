"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { RotateControls } from "@/components/tools/RotateControls";
import { RotateMetricsPanel } from "@/components/tools/RotateMetricsPanel";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { useRotateTool } from "@/components/tools/use-rotate-tool";
import { useI18n } from "@/i18n/context";

export function RotateTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const rotate = useRotateTool();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.rotateTool.lead}</p>

      <ImageDropzone onFiles={rotate.onFiles} accept={rotate.accept} multiple />

      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <RotateControls
          angleDeg={rotate.angleDeg}
          onAngle={rotate.setAngleDeg}
          onRotateBy={rotate.rotateBy}
          flipH={rotate.flipH}
          onFlipH={rotate.setFlipH}
          flipV={rotate.flipV}
          onFlipV={rotate.setFlipV}
          canvasMode={rotate.canvasMode}
          onCanvasMode={rotate.setCanvasMode}
          backdropMode={rotate.backdropMode}
          onBackdropMode={rotate.setBackdropMode}
          backdrop={rotate.backdrop}
          onBackdrop={rotate.setBackdrop}
          format={rotate.format}
          onFormat={rotate.setFormat}
          quality={rotate.quality}
          onQuality={rotate.setQuality}
          onReset={rotate.resetTransform}
          disabled={rotate.stats.busy}
        />
      </div>

      {rotate.focusId ? (
        <button
          type="button"
          disabled={rotate.stats.busy}
          onClick={rotate.applyToFocus}
          className="w-full rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-100 disabled:opacity-50"
        >
          {t.rotateTool.applyToFile}
        </button>
      ) : null}

      <BatchStatsPanel
        total={rotate.stats.total}
        done={rotate.stats.done}
        original={rotate.stats.original}
        output={rotate.stats.output}
        saved={rotate.stats.saved}
        pct={rotate.stats.pct}
        queued={rotate.stats.queued}
        processing={rotate.stats.processing}
        errors={rotate.stats.errors}
        progress={rotate.stats.progress}
      />

      {rotate.stats.busy ? (
        <button
          type="button"
          onClick={rotate.cancelRun}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-xs text-amber-200"
        >
          <OctagonX className="h-3.5 w-3.5" />
          {t.batchCompress.cancelRun}
        </button>
      ) : rotate.stats.total ? (
        <button
          type="button"
          onClick={rotate.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

      <BatchQueueList
        rows={rotate.queue}
        focusId={rotate.focusId}
        globalQuality={rotate.quality}
        onFocus={rotate.setFocusId}
        onRemove={rotate.remove}
        onRetry={rotate.retry}
        onDownload={(id) => {
          const row = rotate.queue.find((r) => r.id === id);
          if (row?.result) rotate.downloadOne(row.result);
        }}
        onOverrides={() => {}}
      />

      {rotate.focusItem ? (
        <section className="space-y-4">
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={rotate.focusItem.sourcePreviewUrl}
              afterSrc={rotate.focusItem.previewUrl}
              busy={rotate.stats.busy && rotate.focusRow?.status === "processing"}
              beforeLabel={t.rotateTool.beforeLabel}
              afterLabel={t.rotateTool.afterLabel}
              maxZoom={6}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? rotate.focusItem.sourcePreviewUrl
                  : rotate.focusItem.previewUrl
              }
              label={compare === "before" ? t.rotateTool.beforeLabel : t.rotateTool.afterLabel}
            />
          )}
          <RotateMetricsPanel
            item={rotate.focusItem}
            busy={rotate.stats.busy && rotate.focusRow?.status === "processing"}
          />
          <DownloadActionsRow
            busy={rotate.stats.busy && rotate.focusRow?.status === "processing"}
            onDownload={() => rotate.downloadOne(rotate.focusItem!)}
            onRemove={() => rotate.remove(rotate.focusItem!.id)}
            t={t}
          />
        </section>
      ) : null}

      {rotate.stats.done > 1 ? (
        <button
          type="button"
          onClick={rotate.downloadZipAll}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {rotate.zipLabel}
        </button>
      ) : null}

      {rotate.stats.total ? (
        <ImageDropzone onFiles={rotate.onFiles} accept={rotate.accept} compact multiple />
      ) : null}
    </div>
  );
}

function SinglePreview({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" />
      <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-300">
        {label}
      </span>
    </div>
  );
}

function DownloadActionsRow({
  busy,
  onDownload,
  onRemove,
  t,
}: {
  busy?: boolean;
  onDownload: () => void;
  onRemove: () => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={onDownload}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {t.common.downloadOne}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-xl border border-slate-700 px-4 py-3 text-slate-400"
        aria-label={t.common.remove}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}