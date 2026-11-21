"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage, OutputFormat } from "@/lib/image/types";
import { cn } from "@/lib/cn";

function mimeLabel(mime: OutputFormat | undefined, t: ReturnType<typeof useI18n>["t"]) {
  if (mime === "image/webp") return t.toolUi.formatWebp;
  if (mime === "image/png") return t.toolUi.formatPng;
  return t.toolUi.formatJpeg;
}

export function ToSizeMetricsPanel({
  item,
  busy,
}: {
  item: LivePreviewImage | null;
  busy?: boolean;
}) {
  const { t } = useI18n();
  if (!item) return null;

  const targetKb = item.targetKb ?? 0;
  const saved = Math.max(0, item.originalSize - item.outputSize);
  const pct =
    item.originalSize > 0 ? Math.round((saved / item.originalSize) * 100) : 0;
  const within = item.withinLimit ?? item.outputSize <= (item.targetBytes ?? targetKb * 1024);
  const delta = item.deltaBytes ?? item.outputSize - targetKb * 1024;

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <StatusHeader within={within} busy={busy} t={t} />
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <Cell label={t.labels.original} value={formatBytes(item.originalSize)} />
        <Cell label={t.toSizeCompress.targetLabel} value={formatBytes(targetKb * 1024)} accent="violet" />
        <Cell label={t.smartCompress.actual} value={formatBytes(item.outputSize)} accent="emerald" />
        <Cell label={t.toSizeCompress.deltaLabel} value={formatDelta(delta, t)} />
        <Cell label={t.smartCompress.reduction} value={`${pct}%`} />
        <Cell
          label={t.toSizeCompress.qualityUsed}
          value={
            item.appliedQuality != null ? `${item.appliedQuality}%` : busy ? "…" : "—"
          }
        />
        <Cell label={t.smartCompress.outputFormat} value={mimeLabel(item.outputMime, t)} />
        <Cell label={t.smartCompress.dimensions} value={`${item.width}×${item.height}`} />
        <Cell
          label={t.smartCompress.processingTime}
          value={
            item.processingMs != null
              ? t.smartCompress.processingMs(item.processingMs)
              : "—"
          }
        />
      </dl>
      {item.toSizeWarning ? (
        <p className="mt-3 flex items-start gap-2 text-xs text-amber-300/95">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {item.toSizeWarning === "tooAggressive"
            ? t.toSizeCompress.warnTooAggressive
            : t.toSizeCompress.warnCannotMeet}
        </p>
      ) : null}
    </div>
  );
}

function formatDelta(delta: number, t: ReturnType<typeof useI18n>["t"]) {
  if (delta === 0) return t.toSizeCompress.deltaExact;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${formatBytes(Math.abs(delta))}`;
}

function StatusHeader({
  within,
  busy,
  t,
}: {
  within: boolean;
  busy?: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-semibold text-white">{t.toSizeCompress.metricsTitle}</h3>
      {!busy ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            within
              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border border-amber-500/40 bg-amber-500/10 text-amber-200",
          )}
        >
          {within ? (
            <CheckCircle2 className="h-3 w-3" aria-hidden />
          ) : (
            <AlertTriangle className="h-3 w-3" aria-hidden />
          )}
          {within ? t.toSizeCompress.statusWithin : t.toSizeCompress.statusOver}
        </span>
      ) : (
        <span className="text-xs text-violet-300">{t.toSizeCompress.tuning}</span>
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "violet";
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium tabular-nums text-slate-200",
          accent === "emerald" && "text-emerald-400",
          accent === "violet" && "text-violet-300",
        )}
      >
        {value}
      </dd>
    </div>
  );
}