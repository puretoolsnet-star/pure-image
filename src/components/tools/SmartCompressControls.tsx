"use client";

import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const PRESETS = [
  { id: "high", quality: 90 },
  { id: "balanced", quality: 78 },
  { id: "web", quality: 65 },
  { id: "small", quality: 45 },
] as const;

export function SmartCompressControls({
  quality,
  maxWidth,
  onQuality,
  onMaxWidth,
}: {
  quality: number;
  maxWidth: number;
  onQuality: (q: number) => void;
  onMaxWidth: (w: number) => void;
}) {
  const { t } = useI18n();
  const presetLabels: Record<(typeof PRESETS)[number]["id"], string> = {
    high: t.smartCompress.presetHigh,
    balanced: t.smartCompress.presetBalanced,
    web: t.smartCompress.presetWeb,
    small: t.smartCompress.presetSmall,
  };

  return (
    <div className="glass-card space-y-4 rounded-2xl p-4 text-sm text-slate-200">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">{t.toolUi.quality}</span>
          <span className="text-emerald-400 tabular-nums">{quality}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          value={quality}
          onChange={(e) => onQuality(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-500"
        />
        <p className="mt-1 text-xs text-slate-500">{t.smartCompress.qualityHint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onQuality(preset.quality)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              quality === preset.quality
                ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                : "border-slate-700 text-slate-400 hover:border-violet-500/40 hover:text-violet-200",
            )}
          >
            {presetLabels[preset.id]} ({preset.quality}%)
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
          value={maxWidth}
          onChange={(e) => onMaxWidth(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </label>
    </div>
  );
}