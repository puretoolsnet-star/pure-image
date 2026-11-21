"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage, ProcessedImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

type PngResult = LivePreviewImage & { hadAlpha?: boolean };

export function PngToJpgMetricsPanel({
  item,
  busy,
}: {
  item: PngResult | null;
  busy?: boolean;
}) {
  const { t } = useI18n();
  if (!item) return null;

  const delta = item.outputSize - item.originalSize;
  const pct =
    item.originalSize > 0 ? Math.round((delta / item.originalSize) * 100) : 0;
  const hadAlpha = (item as ProcessedImage & { hadAlpha?: boolean }).hadAlpha;

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-white">{t.pngToJpg.metricsTitle}</h3>
        {hadAlpha ? (
          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-200">
            {t.pngToJpg.alphaDetected}
          </span>
        ) : (
          <span className="rounded-full bg-slate-700/40 px-2 py-0.5 text-[10px] text-slate-400">
            {t.pngToJpg.alphaNone}
          </span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <Cell label={t.pngToJpg.pngSize} value={formatBytes(item.originalSize)} />
        <Cell label={t.pngToJpg.jpgSize} value={formatBytes(item.outputSize)} accent="emerald" pulse={busy} />
        <Cell
          label={t.pngToJpg.sizeDelta}
          value={`${delta >= 0 ? "+" : "−"}${formatBytes(Math.abs(delta))} (${pct >= 0 ? "+" : ""}${pct}%)`}
          accent={delta <= 0 ? "emerald" : "amber"}
        />
        <Cell label={t.smartCompress.dimensions} value={`${item.width}×${item.height}`} />
        <Cell
          label={t.pngToJpg.processTime}
          value={
            item.processingMs != null
              ? t.smartCompress.processingMs(item.processingMs)
              : busy
                ? "…"
                : "—"
          }
        />
        <Cell
          label={t.pngToJpg.qualityUsed}
          value={
            item.targetKb
              ? t.pngToJpg.targetApplied(item.targetKb, item.appliedQuality ?? qualityFallback(item))
              : item.appliedQuality != null
                ? `${item.appliedQuality}%`
                : "—"
          }
        />
      </dl>
      {item.toSizeWarning === "cannotMeet" ? (
        <p className="mt-2 text-[11px] text-amber-300/90">{t.pngToJpg.warnCannotMeet}</p>
      ) : null}
    </div>
  );
}

function qualityFallback(item: LivePreviewImage): number {
  return item.appliedQuality ?? 85;
}

function Cell({
  label,
  value,
  accent,
  pulse,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "amber";
  pulse?: boolean;
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium tabular-nums text-slate-200",
          accent === "emerald" && "text-emerald-400",
          accent === "amber" && "text-amber-300",
          pulse && "animate-pulse",
        )}
      >
        {value}
      </dd>
    </div>
  );
}