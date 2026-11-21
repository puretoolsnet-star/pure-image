"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { WebPControls } from "@/components/tools/WebPControls";
import { WebPMetricsPanel } from "@/components/tools/WebPMetricsPanel";
import { useWebpConvert } from "@/components/tools/use-webp-convert";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import { cn } from "@/lib/cn";

const WEBP_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/heic,image/heif,.heic,.heif,.svg";

export function WebPConvertTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const webp = useWebpConvert();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.webpConvert.lead}</p>

      <ImageDropzone onFiles={webp.onFiles} accept={WEBP_ACCEPT} />

      <WebPControls
        mode={webp.mode}
        onMode={webp.setMode}
        quality={webp.quality}
        onQuality={webp.setQuality}
        maxWidth={webp.maxWidth}
        onMaxWidth={webp.setMaxWidth}
        alphaMode={webp.alphaMode}
        onAlphaMode={webp.setAlphaMode}
        backdrop={webp.backdrop}
        onBackdrop={webp.setBackdrop}
        disabled={webp.busy}
      />

      {webp.stats.count > 0 ? (
        <p className="text-center text-xs text-slate-500">
          {t.webpConvert.batchTotals(
            webp.stats.count,
            formatBytes(webp.stats.original),
            formatBytes(webp.stats.output),
            webp.stats.pct,
          )}
        </p>
      ) : null}

      {webp.busy && !webp.items.length ? (
        <p className="flex justify-center gap-2 text-sm text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t.webpConvert.processing}
        </p>
      ) : null}

      {webp.items.length > 1 ? (
        <FileStrip
          items={webp.items}
          activeId={webp.focusId ?? webp.items[0]!.id}
          onSelect={webp.setFocusId}
        />
      ) : null}

      {webp.focusItem ? (
        <section className="space-y-4">
          <BeforeAfterToggle mode={compare} onChange={setCompare} />
          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={webp.focusItem.sourcePreviewUrl}
              afterSrc={webp.focusItem.previewUrl}
              busy={webp.busy}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? webp.focusItem.sourcePreviewUrl
                  : webp.focusItem.previewUrl
              }
              label={compare === "before" ? t.livePreview.before : t.webpConvert.webpLabel}
              busy={webp.busy}
            />
          )}
          <WebPMetricsPanel item={webp.focusItem} busy={webp.busy} />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={webp.busy}
              onClick={() => webp.downloadOne(webp.focusItem!)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t.common.downloadOne}
            </button>
            <button
              type="button"
              onClick={() => webp.remove(webp.focusItem!.id)}
              className="rounded-xl border border-slate-700 px-4 py-3 text-slate-400 hover:border-red-500/40"
              aria-label={t.common.remove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}

      {webp.items.length > 1 ? (
        <button
          type="button"
          onClick={webp.downloadZip}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {webp.zipLabel}
        </button>
      ) : null}

      {webp.items.length ? (
        <ImageDropzone onFiles={webp.onFiles} accept={WEBP_ACCEPT} compact />
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