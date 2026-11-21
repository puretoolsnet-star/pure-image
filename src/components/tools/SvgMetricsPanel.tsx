"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

export function SvgMetricsPanel({
  item,
  busy,
}: {
  item: LivePreviewImage | null;
  busy?: boolean;
}) {
  const { t } = useI18n();
  if (!item) return null;

  const fmt =
    item.outputMime === "image/jpeg"
      ? t.toolUi.formatJpeg
      : item.outputMime === "image/png"
        ? t.toolUi.formatPng
        : "—";

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{t.svgConvert.metricsTitle}</h3>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <Cell label={t.svgConvert.svgSize} value={formatBytes(item.originalSize)} />
        <Cell label={t.svgConvert.outputFormat} value={fmt} />
        <Cell
          label={t.svgConvert.outputSize}
          value={`${item.width}×${item.height} px`}
          accent="emerald"
        />
        <Cell label={t.svgConvert.fileSize} value={formatBytes(item.outputSize)} pulse={busy} />
        <Cell
          label={t.svgConvert.renderTime}
          value={
            item.processingMs != null
              ? t.smartCompress.processingMs(item.processingMs)
              : busy
                ? "…"
                : "—"
          }
        />
        <Cell label="SVG" value="SVG" />
      </dl>
    </div>
  );
}

function Cell({
  label,
  value,
  accent,
  pulse,
}: {
  label: string;
  value: string;
  accent?: "emerald";
  pulse?: boolean;
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium tabular-nums text-slate-200",
          accent === "emerald" && "text-emerald-400",
          pulse && "animate-pulse",
        )}
      >
        {value}
      </dd>
    </div>
  );
}