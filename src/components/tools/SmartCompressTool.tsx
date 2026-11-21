"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useMemo } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { SmartCompareSlider } from "@/components/tools/SmartCompareSlider";
import { SmartCompressControls } from "@/components/tools/SmartCompressControls";
import { SmartMetricsPanel } from "@/components/tools/SmartMetricsPanel";
import { useSmartCompress } from "@/components/tools/use-smart-compress";
import { useI18n } from "@/i18n/context";
import { resolveMaxWidth, resolveQualityPercent } from "@/lib/image/smart-analyze";
import { cn } from "@/lib/cn";
import { useState } from "react";

const SMART_ACCEPT = "image/jpeg,image/png,image/webp";

export function SmartCompressTool() {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("split");
  const smart = useSmartCompress();

  const applied = useMemo(() => {
    const item = smart.focusItem;
    if (!item?.contentKind) return { quality: smart.quality, maxWidth: smart.maxWidth };
    return {
      quality: resolveQualityPercent(smart.mode, item.contentKind, smart.quality),
      maxWidth: resolveMaxWidth(
        smart.mode,
        {
          kind: item.contentKind,
          width: item.width,
          height: item.height,
          megapixels: (item.width * item.height) / 1e6,
          hasAlpha: item.contentKind === "transparent",
        },
        smart.maxWidth,
      ),
    };
  }, [smart.focusItem, smart.mode, smart.quality, smart.maxWidth]);

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{t.smartCompress.acceptHint}</p>
      <ImageDropzone onFiles={smart.onFiles} accept={SMART_ACCEPT} />

      <SmartCompressControls
        mode={smart.mode}
        onMode={smart.setMode}
        quality={smart.quality}
        maxWidth={smart.maxWidth}
        onQuality={smart.setQuality}
        onMaxWidth={smart.setMaxWidth}
        targetKb={smart.targetKb}
        onTargetKb={smart.setTargetKb}
        appliedQuality={applied.quality}
        appliedMaxWidth={applied.maxWidth}
        disabled={smart.busy}
      />

      {smart.busy && !smart.items.length ? (
        <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t.smartCompress.analyzing}
        </p>
      ) : null}

      {smart.focusItem ? (
        <section className="space-y-4">
          {smart.items.length > 1 ? (
            <FileStrip
              items={smart.items}
              activeId={smart.focusItem.id}
              onSelect={smart.setFocusId}
            />
          ) : null}

          <BeforeAfterToggle mode={compare} onChange={setCompare} />

          {compare === "split" ? (
            <SmartCompareSlider
              beforeSrc={smart.focusItem.sourcePreviewUrl}
              afterSrc={smart.focusItem.previewUrl}
              busy={smart.busy}
            />
          ) : (
            <SinglePreview
              src={
                compare === "before"
                  ? smart.focusItem.sourcePreviewUrl
                  : smart.focusItem.previewUrl
              }
              label={compare === "before" ? t.livePreview.before : t.livePreview.after}
              busy={smart.busy}
            />
          )}

          <SmartMetricsPanel
            item={smart.focusItem}
            busy={smart.busy}
            pendingEstimate={smart.pendingEstimate}
          />

          <div className="flex gap-2">
            <button
              type="button"
              disabled={smart.busy}
              onClick={() => smart.downloadOne(smart.focusItem!)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t.common.downloadOne}
            </button>
            <button
              type="button"
              onClick={() => smart.remove(smart.focusItem!.id)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-400 hover:border-red-500/40 hover:text-red-300"
              aria-label={t.common.remove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}

      {smart.items.length > 1 ? (
        <button
          type="button"
          onClick={smart.downloadZip}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {smart.zipLabel}
        </button>
      ) : null}

      {smart.items.length ? (
        <ImageDropzone onFiles={smart.onFiles} accept={SMART_ACCEPT} compact />
      ) : null}

      {!smart.busy && smart.items.length ? (
        <p className="text-center text-xs text-slate-500">{t.livePreview.liveHint}</p>
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
                : "border-slate-700 text-slate-400 hover:border-violet-500/35",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function SinglePreview({ src, label, busy }: { src: string; label: string; busy?: boolean }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 sm:aspect-video">
      {busy ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/45">
          <Loader2 className="h-8 w-8 animate-spin text-violet-300" aria-hidden />
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