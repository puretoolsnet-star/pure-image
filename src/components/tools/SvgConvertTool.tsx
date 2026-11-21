"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { SvgConvertControls } from "@/components/tools/SvgConvertControls";
import { SvgMetricsPanel } from "@/components/tools/SvgMetricsPanel";
import { useSvgConvert } from "@/components/tools/use-svg-convert";
import { useI18n } from "@/i18n/context";

const SVG_ACCEPT = "image/svg+xml,.svg";

export function SvgConvertTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const svg = useSvgConvert();

  const sanitizeNote = useMemo(() => {
    const w = (svg.focusItem as { sanitizeWarnings?: string[] } | null)?.sanitizeWarnings;
    if (!w?.length) return null;
    return t.svgConvert.sanitizeNotice;
  }, [svg.focusItem, t.svgConvert.sanitizeNotice]);

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.svgConvert.lead}</p>

      <ImageDropzone onFiles={svg.onFiles} accept={SVG_ACCEPT} multiple />

      <SvgConvertControls
        format={svg.format}
        onFormat={svg.setFormat}
        sizeMode={svg.sizeMode}
        onSizeMode={svg.setSizeMode}
        scaleMultiplier={svg.scaleMultiplier}
        onScale={svg.setScaleMultiplier}
        outputWidth={svg.outputWidth}
        onOutputWidth={svg.setOutputWidth}
        outputHeight={svg.outputHeight}
        onOutputHeight={svg.setOutputHeight}
        lockAspect={svg.lockAspect}
        onLockAspect={svg.setLockAspect}
        pngBackground={svg.pngBackground}
        onPngBackground={svg.setPngBackground}
        backdrop={svg.backdrop}
        onBackdrop={svg.setBackdrop}
        quality={svg.quality}
        onQuality={svg.setQuality}
        onPixelPreset={svg.applyPixelPreset}
        disabled={svg.stats.busy}
      />

      {sanitizeNote ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {sanitizeNote}
        </p>
      ) : null}

      <BatchStatsPanel
        total={svg.stats.total}
        done={svg.stats.done}
        original={svg.stats.original}
        output={svg.stats.output}
        saved={svg.stats.saved}
        pct={svg.stats.pct}
        queued={svg.stats.queued}
        processing={svg.stats.processing}
        errors={svg.stats.errors}
        progress={svg.stats.progress}
      />

      {svg.stats.busy ? (
        <button
          type="button"
          onClick={svg.cancelRun}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-xs text-amber-200"
        >
          <OctagonX className="h-3.5 w-3.5" />
          {t.batchCompress.cancelRun}
        </button>
      ) : svg.stats.total ? (
        <button
          type="button"
          onClick={svg.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

      <BatchQueueList
        rows={svg.queue}
        focusId={svg.focusId}
        globalQuality={svg.quality}
        onFocus={svg.setFocusId}
        onRemove={svg.remove}
        onRetry={svg.retry}
        onDownload={(id) => {
          const row = svg.queue.find((r) => r.id === id);
          if (row?.result) svg.downloadOne(row.result);
        }}
        onOverrides={(id, q) => {
          svg.setQuality(q);
          void id;
        }}
      />

      {svg.focusItem ? (
        <section className="space-y-4">
          <p className="text-xs text-slate-500">{t.svgConvert.detailPreview}</p>
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={svg.focusItem.sourcePreviewUrl}
              afterSrc={svg.focusItem.previewUrl}
              busy={svg.stats.busy && svg.focusRow?.status === "processing"}
              maxZoom={8}
              zoomStep={0.5}
              beforeLabel={t.svgConvert.beforeLabel}
              afterLabel={t.svgConvert.afterLabel}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? svg.focusItem.sourcePreviewUrl
                  : svg.focusItem.previewUrl
              }
              label={compare === "before" ? t.svgConvert.beforeLabel : t.svgConvert.afterLabel}
              busy={svg.stats.busy && svg.focusRow?.status === "processing"}
            />
          )}
          <SvgMetricsPanel
            item={svg.focusItem}
            busy={svg.stats.busy && svg.focusRow?.status === "processing"}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={svg.stats.busy && svg.focusRow?.status === "processing"}
              onClick={() => svg.downloadOne(svg.focusItem!)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t.common.downloadOne}
            </button>
            <button
              type="button"
              onClick={() => svg.remove(svg.focusItem!.id)}
              className="rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
              aria-label={t.common.remove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}

      {svg.stats.done > 1 ? (
        <button
          type="button"
          onClick={svg.downloadZipAll}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {svg.zipLabel}
        </button>
      ) : null}

      {svg.stats.total ? (
        <ImageDropzone onFiles={svg.onFiles} accept={SVG_ACCEPT} compact multiple />
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