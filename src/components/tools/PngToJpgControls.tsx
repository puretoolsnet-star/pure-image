"use client";

import type { HeicExifMode } from "@/lib/image/convert-heic-jpg";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const PRESETS = [
  { q: 72, key: "presetNetwork" as const },
  { q: 85, key: "presetBalanced" as const },
  { q: 95, key: "presetMax" as const },
] as const;

const BACKDROPS = [
  { color: "#ffffff", key: "backdropWhite" as const },
  { color: "#000000", key: "backdropBlack" as const },
] as const;

export function PngToJpgControls({
  quality,
  onQuality,
  maxWidth,
  onMaxWidth,
  backdrop,
  onBackdrop,
  exifMode,
  onExifMode,
  useTargetKb,
  onUseTargetKb,
  targetKb,
  onTargetKb,
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
  useTargetKb: boolean;
  onUseTargetKb: (v: boolean) => void;
  targetKb: number | null;
  onTargetKb: (kb: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="glass-card space-y-5 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <p className="text-xs text-slate-500">{t.pngToJpg.settingsHint}</p>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.pngToJpg.backdropTitle}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {BACKDROPS.map((b) => (
            <button
              key={b.key}
              type="button"
              disabled={disabled}
              onClick={() => onBackdrop(b.color)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                backdrop.toLowerCase() === b.color
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {t.pngToJpg[b.key]}
            </button>
          ))}
          <label className="flex items-center gap-2 text-xs text-slate-400">
            {t.pngToJpg.backdropCustom}
            <input
              type="color"
              value={backdrop}
              disabled={disabled}
              onChange={(e) => onBackdrop(e.target.value)}
              className="h-8 w-12 cursor-pointer rounded border border-slate-700 bg-transparent"
            />
          </label>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{t.pngToJpg.backdropHint}</p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onUseTargetKb(!useTargetKb)}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-left text-xs",
          useTargetKb
            ? "border-violet-500/45 bg-violet-500/10 text-violet-100"
            : "border-slate-700 text-slate-400",
        )}
      >
        {t.pngToJpg.targetKbToggle}
      </button>

      {useTargetKb ? (
        <label className="block">
          <span className="font-medium">{t.pngToJpg.targetKbLabel}</span>
          <input
            type="number"
            min={20}
            max={5000}
            disabled={disabled}
            value={targetKb ?? 200}
            onChange={(e) => onTargetKb(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
          <p className="mt-1 text-[11px] text-slate-500">{t.pngToJpg.targetKbHint}</p>
        </label>
      ) : (
        <>
          <div>
            <div className="flex justify-between">
              <span>{t.pngToJpg.quality}</span>
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
                {t.pngToJpg[p.key]} ({p.q}%)
              </button>
            ))}
          </div>
        </>
      )}

      <label className="block">
        <span className="font-medium">{t.toolUi.maxWidth}</span>
        <input
          type="number"
          min={320}
          max={8192}
          step={10}
          disabled={disabled}
          value={maxWidth}
          onChange={(e) => onMaxWidth(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </label>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.pngToJpg.exifTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["strip", t.pngToJpg.exifStrip],
              ["preserve", t.pngToJpg.exifPreserve],
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
      </div>
    </div>
  );
}