"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

export function HeicToJpgMetricsPanel({
  item,
  busy,
}: {
  item: LivePreviewImage | null;
  busy?: boolean;
}) {
  const { t } = useI18n();
  if (!item) return null;

  const delta = item.outputSize - item.originalSize;
  const pct =
    item.originalSize > 0 ? Math.round((delta / item.originalSize) * 100) : 0;

  const inputFmt =
    item.inputMime?.includes("heic") || item.inputMime?.includes("heif")
      ? "HEIC/HEIF"
      : item.inputMime?.includes("jpeg")
        ? t.toolUi.formatJpeg
        : item.inputMime?.split("/").pop()?.toUpperCase() ?? "—";

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{t.heicToJpg.metricsTitle}</h3>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <Cell label={t.heicToJpg.inputFormat} value={inputFmt} />
        <Cell label={t.labels.original} value={formatBytes(item.originalSize)} />
        <Cell label={t.heicToJpg.jpgSize} value={formatBytes(item.outputSize)} accent="emerald" pulse={busy} />
        <Cell
          label={t.heicToJpg.sizeDelta}
          value={`${delta >= 0 ? "+" : "−"}${formatBytes(Math.abs(delta))} (${pct >= 0 ? "+" : ""}${pct}%)`}
          accent={delta <= 0 ? "emerald" : "amber"}
        />
        <Cell label={t.smartCompress.dimensions} value={`${item.width}×${item.height}`} />
        <Cell
          label={t.heicToJpg.convertTime}
          value={
            item.processingMs != null
              ? t.smartCompress.processingMs(item.processingMs)
              : busy
                ? "…"
                : "—"
          }
        />
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