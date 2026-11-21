"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useState } from "react";

import { AspectCropEditor } from "@/components/tools/AspectCropEditor";
import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { CropControls } from "@/components/tools/CropControls";
import { CropMetricsPanel } from "@/components/tools/CropMetricsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { useCropTool } from "@/components/tools/use-crop-tool";
import { useI18n } from "@/i18n/context";

export function CropTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const crop = useCropTool();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.cropTool.lead}</p>

      <ImageDropzone onFiles={crop.onFiles} accept={crop.accept} multiple />

      <div className="glass-card rounded-2xl p-4 sm:p-5">
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
      </div>

      {crop.focusFile ? (
        <div className="glass-card rounded-2xl p-4">
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
            className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
          >
            {t.cropTool.applyToFile}
          </button>
        </div>
      ) : null}

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

      {crop.stats.busy ? (
        <button
          type="button"
          onClick={crop.cancelRun}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-xs text-amber-200"
        >
          <OctagonX className="h-3.5 w-3.5" />
          {t.batchCompress.cancelRun}
        </button>
      ) : crop.stats.total ? (
        <button
          type="button"
          onClick={crop.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

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

      {crop.focusItem ? (
        <section className="space-y-4">
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={crop.focusItem.sourcePreviewUrl}
              afterSrc={crop.focusItem.previewUrl}
              busy={crop.stats.busy && crop.focusRow?.status === "processing"}
              beforeLabel={t.cropTool.beforeLabel}
              afterLabel={t.cropTool.afterLabel}
              maxZoom={6}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? crop.focusItem.sourcePreviewUrl
                  : crop.focusItem.previewUrl
              }
              label={compare === "before" ? t.cropTool.beforeLabel : t.cropTool.afterLabel}
            />
          )}
          <CropMetricsPanel
            item={crop.focusItem}
            busy={crop.stats.busy && crop.focusRow?.status === "processing"}
          />
          <DownloadActionsRow
            busy={crop.stats.busy && crop.focusRow?.status === "processing"}
            onDownload={() => crop.downloadOne(crop.focusItem!)}
            onRemove={() => crop.remove(crop.focusItem!.id)}
            t={t}
          />
        </section>
      ) : null}

      {crop.stats.done > 1 ? (
        <button
          type="button"
          onClick={crop.downloadZipAll}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950"
        >
          {crop.zipLabel}
        </button>
      ) : null}

      {crop.stats.total ? (
        <ImageDropzone onFiles={crop.onFiles} accept={crop.accept} compact multiple />
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
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
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