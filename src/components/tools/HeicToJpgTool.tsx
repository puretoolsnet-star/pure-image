"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { HeicToJpgControls } from "@/components/tools/HeicToJpgControls";
import { HeicToJpgMetricsPanel } from "@/components/tools/HeicToJpgMetricsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { useHeicToJpg } from "@/components/tools/use-heic-to-jpg";
import { useI18n } from "@/i18n/context";

const HEIC_ACCEPT =
  "image/heic,image/heif,.heic,.heif,image/jpeg,image/png,image/webp,image/gif,image/bmp";

export function HeicToJpgTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const heic = useHeicToJpg();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.heicToJpg.lead}</p>

      <ImageDropzone onFiles={heic.addFiles} accept={HEIC_ACCEPT} multiple />

      <HeicToJpgControls
        quality={heic.quality}
        onQuality={heic.setQuality}
        maxWidth={heic.maxWidth}
        onMaxWidth={heic.setMaxWidth}
        backdrop={heic.backdrop}
        onBackdrop={heic.setBackdrop}
        exifMode={heic.exifMode}
        onExifMode={heic.setExifMode}
        disabled={heic.stats.busy}
      />

      <BatchStatsPanel
        total={heic.stats.total}
        done={heic.stats.done}
        original={heic.stats.original}
        output={heic.stats.output}
        saved={heic.stats.saved}
        pct={heic.stats.pct}
        queued={heic.stats.queued}
        processing={heic.stats.processing}
        errors={heic.stats.errors}
        progress={heic.stats.progress}
      />

      {heic.stats.busy ? (
        <button
          type="button"
          onClick={heic.cancelRun}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-xs text-amber-200"
        >
          <OctagonX className="h-3.5 w-3.5" />
          {t.batchCompress.cancelRun}
        </button>
      ) : heic.stats.total ? (
        <button
          type="button"
          onClick={heic.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

      <BatchQueueList
        rows={heic.queue}
        focusId={heic.focusId}
        globalQuality={heic.quality}
        onFocus={heic.setFocusId}
        onRemove={heic.remove}
        onRetry={heic.retry}
        onDownload={(id) => {
          const row = heic.queue.find((r) => r.id === id);
          if (row?.result) heic.downloadOne(row.result);
        }}
        onOverrides={(id, q) => heic.applyOverrides(id, { quality: q })}
      />

      {heic.focusItem ? (
        <CompareSection
          compare={compare}
          onCompare={setCompare}
          item={heic.focusItem}
          busy={heic.stats.busy && heic.focusRow?.status === "processing"}
          onDownload={() => heic.downloadOne(heic.focusItem!)}
          onRemove={() => heic.remove(heic.focusItem!.id)}
        />
      ) : null}

      {heic.stats.done > 1 ? (
        <button
          type="button"
          onClick={heic.downloadZipAll}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {heic.zipLabel}
        </button>
      ) : null}

      {heic.stats.total ? (
        <ImageDropzone onFiles={heic.addFiles} accept={HEIC_ACCEPT} compact multiple />
      ) : null}
    </div>
  );
}

function CompareSection({
  compare,
  onCompare,
  item,
  busy,
  onDownload,
  onRemove,
}: {
  compare: CompareMode;
  onCompare: (m: CompareMode) => void;
  item: NonNullable<ReturnType<typeof useHeicToJpg>["focusItem"]>;
  busy?: boolean;
  onDownload: () => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <p className="text-xs text-slate-500">{t.heicToJpg.detailPreview}</p>
      <BeforeAfterToggle mode={compare} onChange={onCompare} />
      {compare === "split" ? (
        <SmartCompareSlider
          beforeSrc={item.sourcePreviewUrl}
          afterSrc={item.previewUrl}
          busy={busy}
        />
      ) : (
        <SinglePreview
          src={compare === "before" ? item.sourcePreviewUrl : item.previewUrl}
          label={compare === "before" ? t.heicToJpg.beforeLabel : t.heicToJpg.jpgLabel}
          busy={busy}
        />
      )}
      <HeicToJpgMetricsPanel item={item} busy={busy} />
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
          className="rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
          aria-label={t.common.remove}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </section>
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