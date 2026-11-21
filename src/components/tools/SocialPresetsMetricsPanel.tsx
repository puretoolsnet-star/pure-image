"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

type Item = LivePreviewImage & {
  presetTag?: string;
  upscaleWarning?: boolean;
  originalWidth?: number;
  originalHeight?: number;
};

export function SocialPresetsMetricsPanel({
  item,
  presetLabel,
  busy,
}: {
  item: Item | null;
  presetLabel: string;
  busy?: boolean;
}) {
  const { t } = useI18n();
  if (!item) return null;

  const ow = item.originalWidth ?? 0;
  const oh = item.originalHeight ?? 0;
  const delta = item.outputSize - item.originalSize;
  const pct =
    item.originalSize > 0 ? Math.round((delta / item.originalSize) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl border-emerald-500/15 p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{t.socialPresets.metricsTitle}</h3>
      {item.upscaleWarning ? (
        <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {t.socialPresets.upscaleWarning}
        </p>
      ) : null}
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <Cell label={t.socialPresets.presetName} value={presetLabel} />
        <Cell label={t.socialPresets.originalDims} value={ow && oh ? `${ow}×${oh}` : "—"} />
        <Cell label={t.socialPresets.outputDims} value={`${item.width}×${item.height}`} accent="emerald" />
        <Cell label={t.labels.original} value={formatBytes(item.originalSize)} />
        <Cell label={t.socialPresets.outputSize} value={formatBytes(item.outputSize)} pulse={busy} />
        <Cell
          label={t.socialPresets.fileDelta}
          value={`${pct >= 0 ? "+" : ""}${pct}%`}
          accent={delta <= 0 ? "emerald" : "amber"}
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