"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

function inputFormatLabel(mime: string | undefined, t: ReturnType<typeof useI18n>["t"]) {
  if (!mime) return "—";
  if (mime.includes("png")) return t.toolUi.formatPng;
  if (mime.includes("jpeg") || mime.includes("jpg")) return t.toolUi.formatJpeg;
  if (mime.includes("webp")) return t.toolUi.formatWebp;
  if (mime.includes("avif")) return "AVIF";
  if (mime.includes("gif")) return "GIF";
  if (mime.includes("svg")) return "SVG";
  return mime.split("/").pop()?.toUpperCase() ?? mime;
}

export function AvifMetricsPanel({
  item,
  busy,
}: {
  item: LivePreviewImage | null;
  busy?: boolean;
}) {
  const { t } = useI18n();
  if (!item) return null;

  const awaitingOutput = Boolean(item.pending);
  const delta = awaitingOutput ? 0 : item.outputSize - item.originalSize;
  const pct =
    !awaitingOutput && item.originalSize > 0
      ? Math.round((delta / item.originalSize) * 100)
      : 0;

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{t.avifConvert.metricsTitle}</h3>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <Cell label={t.avifConvert.inputFormat} value={inputFormatLabel(item.inputMime, t)} />
        <Cell label={t.labels.original} value={formatBytes(item.originalSize)} />
        <Cell
          label={t.avifConvert.avifSize}
          value={awaitingOutput ? "…" : formatBytes(item.outputSize)}
          accent="emerald"
          pulse={busy || awaitingOutput}
        />
        <Cell
          label={t.avifConvert.sizeDelta}
          value={
            awaitingOutput
              ? "…"
              : `${delta >= 0 ? "+" : "−"}${formatBytes(Math.abs(delta))} (${pct >= 0 ? "+" : ""}${pct}%)`
          }
          accent={delta <= 0 ? "emerald" : "amber"}
        />
        <Cell
          label={t.smartCompress.dimensions}
          value={item.width > 0 && item.height > 0 ? `${item.width}×${item.height}` : "…"}
        />
        <Cell
          label={t.avifConvert.encodeTime}
          value={
            item.processingMs != null
              ? t.smartCompress.processingMs(item.processingMs)
              : busy
                ? "…"
                : "—"
          }
        />
      </dl>
      <p className="mt-2 text-[11px] text-slate-500">{t.avifConvert.outputMime}: AVIF</p>
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