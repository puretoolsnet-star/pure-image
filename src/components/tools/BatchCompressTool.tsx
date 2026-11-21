"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchCompressControls } from "@/components/tools/BatchCompressControls";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { useBatchCompress } from "@/components/tools/use-batch-compress";
import { useI18n } from "@/i18n/context";

const BATCH_ACCEPT = "image/jpeg,image/png,image/webp";

export function BatchCompressTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const batch = useBatchCompress();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.batchCompress.lead}</p>

      <ImageDropzone onFiles={batch.addFiles} accept={BATCH_ACCEPT} multiple />

      <BatchCompressControls
        quality={batch.quality}
        onQuality={batch.setQuality}
        maxWidth={batch.maxWidth}
        onMaxWidth={batch.setMaxWidth}
        preservePixels={batch.preservePixels}
        onPreservePixels={batch.setPreservePixels}
        format={batch.format}
        onFormat={batch.setFormat}
        disabled={false}
      />

      <BatchStatsPanel
        total={batch.stats.total}
        done={batch.stats.done}
        original={batch.stats.original}
        output={batch.stats.output}
        saved={batch.stats.saved}
        pct={batch.stats.pct}
        queued={batch.stats.queued}
        processing={batch.stats.processing}
        errors={batch.stats.errors}
        progress={batch.stats.progress}
      />

      {batch.stats.busy ? (
        <CancelRunButton onCancel={batch.cancelRun} label={t.batchCompress.cancelRun} />
      ) : batch.stats.total ? (
        <button
          type="button"
          onClick={batch.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

      <BatchQueueList
        rows={batch.queue}
        focusId={batch.focusId}
        globalQuality={batch.quality}
        onFocus={batch.setFocusId}
        onRemove={batch.remove}
        onRetry={batch.retry}
        onDownload={(id) => {
          const row = batch.queue.find((r) => r.id === id);
          if (row?.result) batch.downloadOne(row.result);
        }}
        onOverrides={(id, q) => batch.applyOverrides(id, { quality: q })}
      />

      {batch.focusItem && batch.focusRow?.status === "done" ? (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-white">{t.batchCompress.detailPreview}</h3>
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={batch.focusItem.sourcePreviewUrl}
              afterSrc={batch.focusItem.previewUrl}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? batch.focusItem.sourcePreviewUrl
                  : batch.focusItem.previewUrl
              }
              label={compare === "before" ? t.livePreview.before : t.livePreview.after}
            />
          )}
        </section>
      ) : null}

      {batch.stats.done > 0 ? (
        <button
          type="button"
          onClick={batch.downloadZipAll}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          {batch.zipLabel}
          <span className="text-violet-200/80">({batch.stats.done})</span>
        </button>
      ) : null}

      {batch.stats.total ? (
        <ImageDropzone onFiles={batch.addFiles} accept={BATCH_ACCEPT} compact multiple />
      ) : null}
    </div>
  );
}

function CancelRunButton({ onCancel, label }: { onCancel: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onCancel}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200"
    >
      <OctagonX className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function SinglePreview({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 sm:aspect-video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" />
      <span className="absolute bottom-2 left-2 rounded bg-slate-950/75 px-2 py-0.5 text-[10px] text-slate-300">
        {label}
      </span>
    </div>
  );
}