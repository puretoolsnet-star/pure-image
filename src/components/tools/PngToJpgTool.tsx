"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { PngToJpgControls } from "@/components/tools/PngToJpgControls";
import { PngToJpgMetricsPanel } from "@/components/tools/PngToJpgMetricsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { usePngToJpg } from "@/components/tools/use-png-to-jpg";
import { useI18n } from "@/i18n/context";

const PNG_ACCEPT = "image/png,.png";

export function PngToJpgTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const png = usePngToJpg();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.pngToJpg.lead}</p>

      <ImageDropzone onFiles={png.onFiles} accept={PNG_ACCEPT} multiple />

      <PngToJpgControls
        quality={png.quality}
        onQuality={png.setQuality}
        maxWidth={png.maxWidth}
        onMaxWidth={png.setMaxWidth}
        backdrop={png.backdrop}
        onBackdrop={png.setBackdrop}
        exifMode={png.exifMode}
        onExifMode={png.setExifMode}
        useTargetKb={png.useTargetKb}
        onUseTargetKb={png.setUseTargetKb}
        targetKb={png.targetKb}
        onTargetKb={png.setTargetKb}
        disabled={png.stats.busy}
      />

      <BatchStatsPanel
        total={png.stats.total}
        done={png.stats.done}
        original={png.stats.original}
        output={png.stats.output}
        saved={png.stats.saved}
        pct={png.stats.pct}
        queued={png.stats.queued}
        processing={png.stats.processing}
        errors={png.stats.errors}
        progress={png.stats.progress}
      />

      {png.stats.busy ? (
        <button
          type="button"
          onClick={png.cancelRun}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-xs text-amber-200"
        >
          <OctagonX className="h-3.5 w-3.5" />
          {t.batchCompress.cancelRun}
        </button>
      ) : png.stats.total ? (
        <button
          type="button"
          onClick={png.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

      <BatchQueueList
        rows={png.queue}
        focusId={png.focusId}
        globalQuality={png.quality}
        onFocus={png.setFocusId}
        onRemove={png.remove}
        onRetry={png.retry}
        onDownload={(id) => {
          const row = png.queue.find((r) => r.id === id);
          if (row?.result) png.downloadOne(row.result);
        }}
        onOverrides={(id, q) => png.applyOverrides(id, { quality: q })}
      />

      {png.focusItem ? (
        <section className="space-y-4">
          <p className="text-xs text-slate-500">{t.pngToJpg.detailPreview}</p>
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={png.focusItem.sourcePreviewUrl}
              afterSrc={png.focusItem.previewUrl}
              busy={png.stats.busy && png.focusRow?.status === "processing"}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before" ? png.focusItem.sourcePreviewUrl : png.focusItem.previewUrl
              }
              label={compare === "before" ? t.pngToJpg.beforeLabel : t.pngToJpg.afterLabel}
              busy={png.stats.busy && png.focusRow?.status === "processing"}
            />
          )}
          <PngToJpgMetricsPanel
            item={png.focusItem}
            busy={png.stats.busy && png.focusRow?.status === "processing"}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={png.stats.busy && png.focusRow?.status === "processing"}
              onClick={() => png.downloadOne(png.focusItem!)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t.common.downloadOne}
            </button>
            <button
              type="button"
              onClick={() => png.remove(png.focusItem!.id)}
              className="rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
              aria-label={t.common.remove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}

      {png.stats.done > 1 ? (
        <button
          type="button"
          onClick={png.downloadZipAll}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {png.zipLabel}
        </button>
      ) : null}

      {png.stats.total ? (
        <ImageDropzone onFiles={png.onFiles} accept={PNG_ACCEPT} compact multiple />
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