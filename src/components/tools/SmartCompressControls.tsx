"use client";

import type { SmartCompressMode } from "@/lib/image/smart-analyze";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const MODES: SmartCompressMode[] = ["auto", "maxQuality", "maxSavings", "manual"];

const MANUAL_PRESETS = [
  { quality: 90, labelKey: "presetHigh" as const },
  { quality: 78, labelKey: "presetBalanced" as const },
  { quality: 65, labelKey: "presetWeb" as const },
  { quality: 45, labelKey: "presetSmall" as const },
];

export function SmartCompressControls({
  mode,
  onMode,
  quality,
  maxWidth,
  onQuality,
  onMaxWidth,
  targetKb,
  onTargetKb,
  appliedQuality,
  appliedMaxWidth,
  disabled,
}: {
  mode: SmartCompressMode;
  onMode: (m: SmartCompressMode) => void;
  quality: number;
  maxWidth: number;
  onQuality: (q: number) => void;
  onMaxWidth: (w: number) => void;
  targetKb: number;
  onTargetKb: (kb: number) => void;
  appliedQuality?: number;
  appliedMaxWidth?: number;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const manual = mode === "manual";

  const modeLabels: Record<SmartCompressMode, string> = {
    auto: t.smartCompress.modeAuto,
    maxQuality: t.smartCompress.modeMaxQuality,
    maxSavings: t.smartCompress.modeMaxSavings,
    manual: t.smartCompress.modeManual,
  };

  return (
    <div className="glass-card space-y-5 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.smartCompress.modesTitle}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => onMode(m)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium transition",
                mode === m
                  ? "border-emerald-500/55 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 text-slate-400 hover:border-violet-500/35 hover:text-violet-100",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {!manual && appliedQuality != null ? (
        <p className="text-xs text-slate-500">
          {t.toolUi.quality}:{" "}
          <span className="font-medium text-emerald-400">{appliedQuality}%</span>
          {" · "}
          {t.toolUi.maxWidth}:{" "}
          <span className="font-medium text-emerald-400">{appliedMaxWidth ?? maxWidth}px</span>
        </p>
      ) : null}

      {manual ? (
        <>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{t.toolUi.quality}</span>
              <span className="text-emerald-400 tabular-nums">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              disabled={disabled}
              value={quality}
              onChange={(e) => onQuality(Number(e.target.value))}
              className="mt-2 w-full accent-emerald-500"
            />
            <p className="mt-1 text-xs text-slate-500">{t.smartCompress.qualityHint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MANUAL_PRESETS.map((preset) => (
              <button
                key={preset.labelKey}
                type="button"
                disabled={disabled}
                onClick={() => onQuality(preset.quality)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  quality === preset.quality
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                    : "border-slate-700 text-slate-400 hover:border-violet-500/40 hover:text-violet-200",
                )}
              >
                {t.smartCompress[preset.labelKey]} ({preset.quality}%)
              </button>
            ))}
          </div>
          <label className="block">
            <span className="font-medium">{t.toolUi.maxWidth}</span>
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
          <label className="block">
            <span className="font-medium">{t.smartCompress.targetSizeLabel}</span>
            <input
              type="number"
              min={0}
              max={50000}
              step={10}
              disabled={disabled}
              value={targetKb || ""}
              placeholder={t.smartCompress.targetSizeOff}
              onChange={(e) => onTargetKb(Math.max(0, Number(e.target.value) || 0))}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
            <p className="mt-1 text-xs text-slate-500">{t.smartCompress.targetSizeHint}</p>
          </label>
        </>
      ) : null}
    </div>
  );
}