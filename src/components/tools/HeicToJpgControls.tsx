"use client";

import type { HeicExifMode } from "@/lib/image/convert-heic-jpg";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const PRESETS = [
  { q: 72, key: "presetMessenger" as const },
  { q: 85, key: "presetBalanced" as const },
  { q: 95, key: "presetMax" as const },
] as const;

export function HeicToJpgControls({
  quality,
  onQuality,
  maxWidth,
  onMaxWidth,
  backdrop,
  onBackdrop,
  exifMode,
  onExifMode,
  disabled,
}: {
  quality: number;
  onQuality: (q: number) => void;
  maxWidth: number;
  onMaxWidth: (w: number) => void;
  backdrop: string;
  onBackdrop: (c: string) => void;
  exifMode: HeicExifMode;
  onExifMode: (m: HeicExifMode) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="glass-card space-y-5 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <p className="text-xs text-slate-500">{t.heicToJpg.settingsHint}</p>

      <div>
        <div className="flex justify-between">
          <span>{t.heicToJpg.quality}</span>
          <span className="text-emerald-400 tabular-nums">{quality}%</span>
        </div>
        <input
          type="range"
          min={40}
          max={100}
          disabled={disabled}
          value={quality}
          onChange={(e) => onQuality(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            disabled={disabled}
            onClick={() => onQuality(p.q)}
            className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:border-violet-500/40"
          >
            {t.heicToJpg[p.key]} ({p.q}%)
          </button>
        ))}
      </div>

      <label className="block">
        <span className="font-medium">{t.toolUi.maxWidth}</span>
        <input
          type="number"
          min={640}
          max={8192}
          step={10}
          disabled={disabled}
          value={maxWidth}
          onChange={(e) => onMaxWidth(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </label>

      <label className="flex items-center gap-3 text-xs text-slate-400">
        {t.heicToJpg.backdrop}
        <input
          type="color"
          value={backdrop}
          disabled={disabled}
          onChange={(e) => onBackdrop(e.target.value)}
          className="h-8 w-12 cursor-pointer rounded border border-slate-700 bg-transparent"
        />
      </label>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.heicToJpg.exifTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["strip", t.heicToJpg.exifStrip],
              ["preserve", t.heicToJpg.exifPreserve],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onExifMode(id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                exifMode === id
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{t.heicToJpg.exifHint}</p>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">{t.heicToJpg.orientationHint}</p>
    </div>
  );
}