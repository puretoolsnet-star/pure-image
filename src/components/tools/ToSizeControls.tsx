"use client";

import {
  type ToSizeFitMode,
  type ToSizeFormatChoice,
  type ToSizeStrategy,
} from "@/lib/image/compress-to-kb";
import { useI18n } from "@/i18n/context";
import { formatKb } from "@/lib/image/estimate";
import { cn } from "@/lib/cn";

const PRESETS_KB = [50, 100, 200, 500, 1024] as const;

export function ToSizeControls({
  targetKb,
  onTargetKb,
  maxWidth,
  onMaxWidth,
  fitMode,
  onFitMode,
  strategy,
  onStrategy,
  format,
  onFormat,
  sampleSize,
  disabled,
}: {
  targetKb: number;
  onTargetKb: (kb: number) => void;
  maxWidth: number;
  onMaxWidth: (w: number) => void;
  fitMode: ToSizeFitMode;
  onFitMode: (m: ToSizeFitMode) => void;
  strategy: ToSizeStrategy;
  onStrategy: (s: ToSizeStrategy) => void;
  format: ToSizeFormatChoice;
  onFormat: (f: ToSizeFormatChoice) => void;
  sampleSize?: number | null;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  const formatOptions: { id: ToSizeFormatChoice; label: string }[] = [
    { id: "auto", label: t.toSizeCompress.formatAuto },
    { id: "jpeg", label: t.toolUi.formatJpeg },
    { id: "webp", label: t.toolUi.formatWebp },
    { id: "png", label: t.toolUi.formatPng },
  ];

  return (
    <div className="glass-card space-y-5 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">{t.toolUi.targetKb}</span>
          {sampleSize != null ? (
            <span className="text-xs text-slate-500">
              {t.labels.original}: {formatKb(sampleSize)}
            </span>
          ) : null}
        </div>
        <input
          type="number"
          min={8}
          max={50000}
          step={1}
          disabled={disabled}
          value={targetKb}
          onChange={(e) => onTargetKb(Math.max(8, Number(e.target.value) || 8))}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white tabular-nums"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS_KB.map((kb) => (
            <button
              key={kb}
              type="button"
              disabled={disabled}
              onClick={() => onTargetKb(kb)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition",
                targetKb === kb
                  ? "border-emerald-500/55 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 text-slate-400 hover:border-violet-500/35",
              )}
            >
              {kb >= 1024 ? t.toSizeCompress.presetMb : `${kb} KB`}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">{t.toSizeCompress.targetHint}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.toSizeCompress.fitModeTitle}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["strict", t.toSizeCompress.fitStrict],
              ["closest", t.toSizeCompress.fitClosest],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onFitMode(id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium",
                fitMode === id
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                  : "border-slate-700 text-slate-400 hover:border-violet-500/35",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.toSizeCompress.strategyTitle}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["balanced", t.toSizeCompress.strategyBalanced],
              ["preservePixels", t.toSizeCompress.strategyPixels],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onStrategy(id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium",
                strategy === id
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 text-slate-400 hover:border-emerald-500/35",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.toSizeCompress.formatTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {formatOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onFormat(opt.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                format === opt.id
                  ? "border-emerald-500/55 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="font-medium">{t.toSizeCompress.maxDimensionHint}</span>
        <input
          type="number"
          min={320}
          max={4096}
          step={10}
          disabled={disabled}
          value={maxWidth}
          onChange={(e) => onMaxWidth(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </label>
    </div>
  );
}