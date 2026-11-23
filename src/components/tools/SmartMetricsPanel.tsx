"use client";

import { Sparkles } from "lucide-react";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { ImageContentKind } from "@/lib/image/smart-analyze";
import type { LivePreviewImage, OutputFormat } from "@/lib/image/types";
import { cn } from "@/lib/cn";

function mimeLabel(mime: OutputFormat | undefined, labels: { jpeg: string; webp: string; png: string }) {
  switch (mime) {
    case "image/webp":
      return labels.webp;
    case "image/png":
      return labels.png;
    default:
      return labels.jpeg;
  }
}

function kindLabel(kind: ImageContentKind | undefined, t: ReturnType<typeof useI18n>["t"]) {
  switch (kind) {
    case "graphic":
      return t.smartCompress.contentGraphic;
    case "text":
      return t.smartCompress.contentText;
    case "transparent":
      return t.smartCompress.contentTransparent;
    case "photo":
      return t.smartCompress.contentPhoto;
    default:
      return null;
  }
}

export function SmartMetricsPanel({
  item,
  busy,
  pendingEstimate,
}: {
  item: LivePreviewImage | null;
  busy?: boolean;
  pendingEstimate?: number | null;
}) {
  const { t } = useI18n();
  if (!item) return null;

  const awaitingOutput = Boolean(item.pending);
  const saved = awaitingOutput ? 0 : Math.max(0, item.originalSize - item.outputSize);
  const pct =
    !awaitingOutput && item.originalSize > 0 ? Math.round((saved / item.originalSize) * 100) : 0;
  const est = pendingEstimate ?? item.estimatedSize ?? null;
  const estSaved =
    est != null && item.originalSize > est ? Math.round(((item.originalSize - est) / item.originalSize) * 100) : null;
  const kind = kindLabel(item.contentKind, t);

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{t.smartCompress.metricsTitle}</h3>
        {kind ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-200">
            <Sparkles className="h-3 w-3 text-violet-300" aria-hidden />
            {t.smartCompress.analysisLabel}: {kind}
          </span>
        ) : null}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <Metric label={t.labels.original} value={formatBytes(item.originalSize)} />
        <Metric
          label={busy || awaitingOutput ? t.smartCompress.savingsPreview : t.smartCompress.actual}
          value={
            awaitingOutput
              ? "…"
              : busy && est != null
                ? formatBytes(est)
                : formatBytes(item.outputSize)
          }
          accent="emerald"
          pulse={(busy && est != null) || awaitingOutput}
        />
        <Metric
          label={t.smartCompress.reduction}
          value={
            busy && estSaved != null
              ? `≈ ${estSaved}%`
              : pct > 0
                ? `${pct}%`
                : "—"
          }
          accent="violet"
        />
        <Metric
          label={t.smartCompress.outputFormat}
          value={mimeLabel(item.outputMime ?? (item.blob.type as OutputFormat), {
            jpeg: t.toolUi.formatJpeg,
            webp: t.toolUi.formatWebp,
            png: t.toolUi.formatPng,
          })}
        />
        <Metric
          label={t.smartCompress.dimensions}
          value={item.width > 0 && item.height > 0 ? `${item.width}×${item.height}` : "…"}
        />
        <Metric
          label={t.smartCompress.processingTime}
          value={
            item.processingMs != null ? t.smartCompress.processingMs(item.processingMs) : busy ? "…" : "—"
          }
        />
      </dl>
      {est != null && !busy ? (
        <p className="mt-3 text-[11px] text-slate-500">
          {t.smartCompress.estimated}: {formatBytes(est)} — {t.smartCompress.savingsPreview}
        </p>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  pulse,
  subdued,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "violet";
  pulse?: boolean;
  subdued?: boolean;
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium tabular-nums",
          subdued ? "text-slate-400" : "text-slate-200",
          accent === "emerald" && "text-emerald-400",
          accent === "violet" && "text-violet-300",
          pulse && "animate-pulse",
        )}
      >
        {value}
      </dd>
    </div>
  );
}