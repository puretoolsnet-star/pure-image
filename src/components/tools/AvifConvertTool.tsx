"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { AvifControls } from "@/components/tools/AvifControls";
import { AvifMetricsPanel } from "@/components/tools/AvifMetricsPanel";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { useAvifConvert } from "@/components/tools/use-avif-convert";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import { cn } from "@/lib/cn";

const AVIF_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/heic,image/heif,.heic,.heif,.svg";

export function AvifConvertTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const avif = useAvifConvert();
  const disabled = avif.supported === false;

  return (
    <div className="space-y-6">
      {avif.supported === false ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {t.avifConvert.unsupported}
        </p>
      ) : null}
      {avif.supported === null ? (
        <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t.avifConvert.checkingSupport}
        </p>
      ) : null}

      <p className="text-sm leading-relaxed text-slate-400">{t.avifConvert.lead}</p>

      <ImageDropzone onFiles={avif.onFiles} accept={AVIF_ACCEPT} />

      <AvifControls
        mode={avif.mode}
        onMode={avif.setMode}
        quality={avif.quality}
        onQuality={avif.setQuality}
        maxWidth={avif.maxWidth}
        onMaxWidth={avif.setMaxWidth}
        alphaMode={avif.alphaMode}
        onAlphaMode={avif.setAlphaMode}
        backdrop={avif.backdrop}
        onBackdrop={avif.setBackdrop}
        effort={avif.effort}
        onEffort={avif.setEffort}
        disabled={disabled || avif.busy}
      />

      {avif.stats.count > 0 ? (
        <p className="text-center text-xs text-slate-500">
          {t.avifConvert.batchTotals(
            avif.stats.count,
            formatBytes(avif.stats.original),
            formatBytes(avif.stats.output),
            avif.stats.pct,
          )}
        </p>
      ) : null}

      {avif.busy && !avif.items.length ? (
        <p className="flex justify-center gap-2 text-sm text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t.avifConvert.encoding}
        </p>
      ) : null}

      {avif.items.length > 1 ? (
        <FileStrip
          items={avif.items}
          activeId={avif.focusId ?? avif.items[0]!.id}
          onSelect={avif.setFocusId}
        />
      ) : null}

      {avif.focusItem ? (
        <section className="space-y-4">
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={avif.focusItem.sourcePreviewUrl}
              afterSrc={avif.focusItem.previewUrl}
              busy={avif.busy}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? avif.focusItem.sourcePreviewUrl
                  : avif.focusItem.previewUrl
              }
              label={compare === "before" ? t.livePreview.before : t.avifConvert.avifLabel}
              busy={avif.busy}
            />
          )}
          <AvifMetricsPanel item={avif.focusItem} busy={avif.busy} />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={avif.busy}
              onClick={() => avif.downloadOne(avif.focusItem!)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t.common.downloadOne}
            </button>
            <button
              type="button"
              onClick={() => avif.remove(avif.focusItem!.id)}
              className="rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
              aria-label={t.common.remove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}

      {avif.items.length > 1 ? (
        <button
          type="button"
          onClick={avif.downloadZip}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {avif.zipLabel}
        </button>
      ) : null}

      {avif.items.length && !disabled ? (
        <ImageDropzone onFiles={avif.onFiles} accept={AVIF_ACCEPT} compact />
      ) : null}
    </div>
  );
}

function FileStrip({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; name: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <span className="mb-2 block text-xs text-slate-500">{t.livePreview.selectFile}</span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 text-xs",
              item.id === activeId
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-slate-700 text-slate-400",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
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
          <Loader2 className="h-8 w-8 animate-spin text-violet-300" />
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