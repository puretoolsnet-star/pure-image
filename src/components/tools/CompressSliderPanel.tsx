"use client";

import type { ReactNode } from "react";

import { useQualityEstimate } from "@/components/tools/use-quality-estimate";
import { useI18n } from "@/i18n/context";
import { formatKb } from "@/lib/image/estimate";

export function CompressSliderPanel({
  sample,
  quality,
  maxWidth,
  targetKb,
  onQuality,
  onMaxWidth,
  onTargetKb,
  showTarget = false,
  showQuality = true,
  extra,
}: {
  sample: File | null;
  quality: number;
  maxWidth: number;
  targetKb?: number;
  onQuality: (q: number) => void;
  onMaxWidth: (w: number) => void;
  onTargetKb?: (kb: number) => void;
  showTarget?: boolean;
  showQuality?: boolean;
  extra?: ReactNode;
}) {
  const { t } = useI18n();
  const { estimate, estimating } = useQualityEstimate(sample, quality, maxWidth);

  return (
    <div className="glass-card space-y-4 rounded-2xl p-4 text-sm text-slate-200">
      {showQuality ? (
        <label className="block">
          <span className="font-medium">{t.toolUi.quality}</span>
          <input
            type="range"
            min={35}
            max={95}
            value={quality}
            onChange={(e) => onQuality(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-500"
          />
          <span className="text-emerald-400">{quality}%</span>
        </label>
      ) : null}
      <label className="block">
        <span className="font-medium">{t.toolUi.maxWidth}</span>
        <input
          type="number"
          min={320}
          max={4096}
          step={10}
          value={maxWidth}
          onChange={(e) => onMaxWidth(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </label>
      {showTarget && onTargetKb ? (
        <label className="block">
          <span className="font-medium">{t.toolUi.targetKb}</span>
          <input
            type="number"
            min={16}
            max={5000}
            value={targetKb ?? 200}
            onChange={(e) => onTargetKb(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
      ) : null}
      {sample ? (
        <p className="text-xs text-slate-400">
          {t.toolUi.originalSize}: {formatKb(sample.size)}
          {estimating ? (
            <span className="ml-2 text-violet-300">…</span>
          ) : estimate ? (
            <span className="ml-2 text-emerald-300">
              → {t.toolUi.estimated} {estimate}
            </span>
          ) : null}
        </p>
      ) : (
        <p className="text-xs text-slate-500">{t.toolUi.dropForEstimate}</p>
      )}
      {extra}
    </div>
  );
}