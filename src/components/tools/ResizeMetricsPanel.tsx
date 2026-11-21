"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

type ResizeResult = LivePreviewImage & { originalWidth?: number; originalHeight?: number };

export function ResizeMetricsPanel({
  item,
  busy,
}: {
  item: ResizeResult | null;
  busy?: boolean;
}) {
  const { t } = useI18n();
  if (!item) return null;

  const ow = item.originalWidth ?? item.width;
  const oh = item.originalHeight ?? item.height;
  const dimDeltaW =
    ow > 0 ? Math.round(((item.width - ow) / ow) * 100) : 0;
  const sizeDelta = item.outputSize - item.originalSize;
  const sizePct =
    item.originalSize > 0 ? Math.round((sizeDelta / item.originalSize) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{t.resizeTool.metricsTitle}</h3>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <Cell label={t.resizeTool.originalDims} value={`${ow}×${oh}`} />
        <Cell label={t.labels.original} value={formatBytes(item.originalSize)} />
        <Cell label={t.resizeTool.newDims} value={`${item.width}×${item.height}`} accent="emerald" />
        <Cell
          label={t.resizeTool.dimChange}
          value={`${dimDeltaW >= 0 ? "+" : ""}${dimDeltaW}%`}
        />
        <Cell
          label={t.resizeTool.fileChange}
          value={`${sizeDelta >= 0 ? "+" : "−"}${formatBytes(Math.abs(sizeDelta))} (${sizePct >= 0 ? "+" : ""}${sizePct}%)`}
          accent={sizeDelta <= 0 ? "emerald" : "amber"}
          pulse={busy}
        />
        <Cell
          label={t.resizeTool.processTime}
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