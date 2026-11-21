"use client";

import { Download, OctagonX, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { BatchQueueList } from "@/components/tools/BatchQueueList";
import { BatchStatsPanel } from "@/components/tools/BatchStatsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { SocialCropViewport } from "@/components/tools/SocialCropViewport";
import { SocialPresetsControls } from "@/components/tools/SocialPresetsControls";
import { SocialPresetsMetricsPanel } from "@/components/tools/SocialPresetsMetricsPanel";
import { useSocialPresets } from "@/components/tools/use-social-presets";
import { useI18n } from "@/i18n/context";

export function SocialPresetsTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const social = useSocialPresets();

  const presetLabel = useMemo(() => {
    if (social.presetId === "custom") return t.socialPresets.presetLabels.custom;
    const key = social.activePreset.labelKey as keyof typeof t.socialPresets.presetLabels;
    return t.socialPresets.presetLabels[key] ?? social.presetId;
  }, [social.activePreset.labelKey, social.presetId, t.socialPresets.presetLabels]);

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.socialPresets.lead}</p>

      <ImageDropzone onFiles={social.onFiles} accept={social.accept} multiple />

      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <SocialPresetsControls
          presets={social.filteredPresets}
          presetId={social.presetId}
          onPreset={social.setPresetId}
          platformFilter={social.platformFilter}
          onPlatform={social.setPlatformFilter}
          kindFilter={social.kindFilter}
          onKind={social.setKindFilter}
          search={social.search}
          onSearch={social.setSearch}
          customWidth={social.customWidth}
          onCustomWidth={social.setCustomWidth}
          customHeight={social.customHeight}
          onCustomHeight={social.setCustomHeight}
          fillMode={social.fillMode}
          onFillMode={social.setFillMode}
          containBackdrop={social.containBackdrop}
          onContainBackdrop={social.setContainBackdrop}
          backdrop={social.backdrop}
          onBackdrop={social.setBackdrop}
          format={social.format}
          onFormat={social.setFormat}
          quality={social.quality}
          onQuality={social.setQuality}
          useTargetKb={social.useTargetKb}
          onUseTargetKb={social.setUseTargetKb}
          targetKb={social.targetKb}
          onTargetKb={social.setTargetKb}
          disabled={social.stats.busy}
        />
      </div>

      {social.focusFile ? (
        <div className="glass-card rounded-2xl p-4">
          <SocialCropViewport
            file={social.focusFile}
            preset={social.activePreset}
            pan={social.pan}
            onPan={social.setPan}
            fillMode={social.fillMode}
            disabled={social.stats.busy}
          />
          <button
            type="button"
            disabled={social.stats.busy}
            onClick={social.applyPanToFocus}
            className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t.socialPresets.applyCropToFile}
          </button>
        </div>
      ) : null}

      <BatchStatsPanel
        total={social.stats.total}
        done={social.stats.done}
        original={social.stats.original}
        output={social.stats.output}
        saved={social.stats.saved}
        pct={social.stats.pct}
        queued={social.stats.queued}
        processing={social.stats.processing}
        errors={social.stats.errors}
        progress={social.stats.progress}
      />

      {social.stats.busy ? (
        <button
          type="button"
          onClick={social.cancelRun}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-xs text-amber-200"
        >
          <OctagonX className="h-3.5 w-3.5" />
          {t.batchCompress.cancelRun}
        </button>
      ) : social.stats.total ? (
        <button
          type="button"
          onClick={social.clearAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 hover:border-red-500/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.batchCompress.clearQueue}
        </button>
      ) : null}

      <BatchQueueList
        rows={social.queue}
        focusId={social.focusId}
        globalQuality={social.quality}
        onFocus={social.setFocusId}
        onRemove={social.remove}
        onRetry={social.retry}
        onDownload={(id) => {
          const row = social.queue.find((r) => r.id === id);
          if (row?.result) social.downloadOne(row.result);
        }}
        onOverrides={(id, q) => {
          social.setQuality(q);
          void id;
        }}
      />

      {social.focusItem ? (
        <section className="space-y-4">
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={social.focusItem.sourcePreviewUrl}
              afterSrc={social.focusItem.previewUrl}
              busy={social.stats.busy && social.focusRow?.status === "processing"}
              beforeLabel={t.socialPresets.beforeLabel}
              afterLabel={t.socialPresets.afterLabel}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? social.focusItem.sourcePreviewUrl
                  : social.focusItem.previewUrl
              }
              label={
                compare === "before" ? t.socialPresets.beforeLabel : t.socialPresets.afterLabel
              }
            />
          )}
          <SocialPresetsMetricsPanel
            item={social.focusItem}
            presetLabel={presetLabel}
            busy={social.stats.busy && social.focusRow?.status === "processing"}
          />
          <DownloadActionsRow
            busy={social.stats.busy && social.focusRow?.status === "processing"}
            onDownload={() => social.downloadOne(social.focusItem!)}
            onRemove={() => social.remove(social.focusItem!.id)}
            t={t}
          />
        </section>
      ) : null}

      {social.stats.done > 1 ? (
        <button
          type="button"
          onClick={social.downloadZipAll}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {social.zipLabel}
        </button>
      ) : null}

      {social.stats.total ? (
        <ImageDropzone onFiles={social.onFiles} accept={social.accept} compact multiple />
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