"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { ScanEnhanceControls } from "@/components/tools/ScanEnhanceControls";
import { ScanEnhanceMetricsPanel } from "@/components/tools/ScanEnhanceMetricsPanel";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { useScanEnhanceTool } from "@/components/tools/use-scan-enhance-tool";
import { useI18n } from "@/i18n/context";

export function ScanEnhanceTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const scan = useScanEnhanceTool();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.scanEnhanceTool.lead}</p>

      <ImageDropzone onFiles={scan.onFiles} accept={scan.accept} multiple />

      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <ScanEnhanceControls
          preset={scan.preset}
          onPreset={scan.applyPreset}
          flatten={scan.flatten}
          onFlatten={scan.setFlatten}
          brightness={scan.brightness}
          onBrightness={scan.setBrightness}
          contrast={scan.contrast}
          onContrast={scan.setContrast}
          sharpness={scan.sharpness}
          onSharpness={scan.setSharpness}
          denoise={scan.denoise}
          onDenoise={scan.setDenoise}
          useThreshold={scan.useThreshold}
          onUseThreshold={scan.setUseThreshold}
          threshold={scan.threshold}
          onThreshold={scan.setThreshold}
          format={scan.format}
          onFormat={scan.setFormat}
          quality={scan.quality}
          onQuality={scan.setQuality}
          useMaxSize={scan.useMaxSize}
          onUseMaxSize={scan.setUseMaxSize}
          maxWidth={scan.maxWidth}
          onMaxWidth={scan.setMaxWidth}
          maxHeight={scan.maxHeight}
          onMaxHeight={scan.setMaxHeight}
          useTargetKb={scan.useTargetKb}
          onUseTargetKb={scan.setUseTargetKb}
          targetKb={scan.targetKb}
          onTargetKb={scan.setTargetKb}
          disabled={scan.stats.busy}
        />
      </div>

      <BatchStatsPanel
        total={scan.stats.total}
        done={scan.stats.done}
        original={scan.stats.original}
        output={scan.stats.output}
        saved={scan.stats.saved}
        pct={scan.stats.pct}
        queued={scan.stats.queued}
        processing={scan.stats.processing}
        errors={scan.stats.errors}
        progress={scan.stats.progress}
      />

      {scan.stats.busy ? (
        <button
          type="button"
          onClick={scan.cancelRun}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-xs text-amber-200"
        >
          <OctagonX className="h-3.5 w-3.5" />
          {t.batchCompress.cancelRun}
        </button>
      ) : scan.stats.total ? (
        <button
          type="button"
          onClick={scan.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

      <BatchQueueList
        rows={scan.queue}
        focusId={scan.focusId}
        globalQuality={scan.quality}
        onFocus={scan.setFocusId}
        onRemove={scan.remove}
        onRetry={scan.retry}
        onDownload={(id) => {
          const row = scan.queue.find((r) => r.id === id);
          if (row?.result) scan.downloadOne(row.result);
        }}
        onOverrides={() => {}}
      />

      {scan.focusItem ? (
        <section className="space-y-4">
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={scan.focusItem.sourcePreviewUrl}
              afterSrc={scan.focusItem.previewUrl}
              busy={scan.stats.busy && scan.focusRow?.status === "processing"}
              beforeLabel={t.scanEnhanceTool.beforeLabel}
              afterLabel={t.scanEnhanceTool.afterLabel}
              maxZoom={8}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? scan.focusItem.sourcePreviewUrl
                  : scan.focusItem.previewUrl
              }
              label={
                compare === "before" ? t.scanEnhanceTool.beforeLabel : t.scanEnhanceTool.afterLabel
              }
            />
          )}
          <ScanEnhanceMetricsPanel
            item={scan.focusItem}
            busy={scan.stats.busy && scan.focusRow?.status === "processing"}
          />
          <DownloadActionsRow
            busy={scan.stats.busy && scan.focusRow?.status === "processing"}
            onDownload={() => scan.downloadOne(scan.focusItem!)}
            onRemove={() => scan.remove(scan.focusItem!.id)}
            t={t}
          />
        </section>
      ) : null}

      {scan.stats.done > 1 ? (
        <button
          type="button"
          onClick={scan.downloadZipAll}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950"
        >
          {scan.zipLabel}
        </button>
      ) : null}

      {scan.stats.total ? (
        <ImageDropzone onFiles={scan.onFiles} accept={scan.accept} compact multiple />
      ) : null}
    </div>
  );
}

function SinglePreview({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
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