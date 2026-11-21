"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { ScanPresetId } from "@/lib/image/scan-enhance";
import type { LivePreviewImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

type Item = LivePreviewImage & {
  originalWidth?: number;
  originalHeight?: number;
  presetTag?: string;
};

export function ScanEnhanceMetricsPanel({ item, busy }: { item: Item | null; busy?: boolean }) {
  const { t } = useI18n();
  if (!item) return null;

  const ow = item.originalWidth ?? 0;
  const oh = item.originalHeight ?? 0;
  const delta = item.outputSize - item.originalSize;
  const pct =
    item.originalSize > 0 ? Math.round((delta / item.originalSize) * 100) : 0;

  const presetId = (item.presetTag ?? "bw-text") as ScanPresetId;
  const presetName =
    t.scanEnhanceTool.presetLabels[presetId] ?? item.presetTag ?? "—";

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{t.scanEnhanceTool.metricsTitle}</h3>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-7">
        <Cell label={t.scanEnhanceTool.presetApplied} value={presetName} />
        <Cell label={t.scanEnhanceTool.originalDims} value={ow && oh ? `${ow}×${oh}` : "—"} />
        <Cell label={t.scanEnhanceTool.outputDims} value={`${item.width}×${item.height}`} accent="emerald" />
        <Cell label={t.labels.original} value={formatBytes(item.originalSize)} />
        <Cell label={t.scanEnhanceTool.outputSize} value={formatBytes(item.outputSize)} pulse={busy} />
        <Cell
          label={t.scanEnhanceTool.fileDelta}
          value={`${pct >= 0 ? "+" : ""}${pct}%`}
          accent={delta <= 0 ? "emerald" : "amber"}
        />
        <Cell
          label={t.scanEnhanceTool.processTime}
          value={item.processingMs != null ? `${item.processingMs} ms` : "—"}
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