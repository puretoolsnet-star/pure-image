"use client";

import type { AvifAlphaMode, AvifEffort, AvifMode } from "@/lib/image/convert-avif";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const MODES: AvifMode[] = ["auto", "lossy", "lossless"];
const EFFORTS: AvifEffort[] = ["fast", "balanced", "deep"];
const PRESETS = [
  { q: 55, key: "presetSmall" as const },
  { q: 78, key: "presetBalanced" as const },
  { q: 90, key: "presetHigh" as const },
] as const;

export function AvifControls({
  mode,
  onMode,
  quality,
  onQuality,
  maxWidth,
  onMaxWidth,
  alphaMode,
  onAlphaMode,
  backdrop,
  onBackdrop,
  effort,
  onEffort,
  disabled,
}: {
  mode: AvifMode;
  onMode: (m: AvifMode) => void;
  quality: number;
  onQuality: (q: number) => void;
  maxWidth: number;
  onMaxWidth: (w: number) => void;
  alphaMode: AvifAlphaMode;
  onAlphaMode: (a: AvifAlphaMode) => void;
  backdrop: string;
  onBackdrop: (c: string) => void;
  effort: AvifEffort;
  onEffort: (e: AvifEffort) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  const modeLabels: Record<AvifMode, string> = {
    auto: t.avifConvert.modeAuto,
    lossy: t.avifConvert.modeLossy,
    lossless: t.avifConvert.modeLossless,
  };

  const effortLabels: Record<AvifEffort, string> = {
    fast: t.avifConvert.effortFast,
    balanced: t.avifConvert.effortBalanced,
    deep: t.avifConvert.effortDeep,
  };

  return (
    <div className="glass-card space-y-5 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <p className="text-xs text-slate-500">{t.avifConvert.settingsHint}</p>
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => onMode(m)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-medium",
              mode === m
                ? "border-emerald-500/55 bg-emerald-500/15 text-emerald-200"
                : "border-slate-700 text-slate-400",
            )}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.avifConvert.effortTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {EFFORTS.map((e) => (
            <button
              key={e}
              type="button"
              disabled={disabled}
              onClick={() => onEffort(e)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                effort === e
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {effortLabels[e]}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{t.avifConvert.effortHint}</p>
      </div>

      {mode === "lossy" || mode === "auto" ? (
        <>
          <div>
            <div className="flex justify-between">
              <span>{t.avifConvert.quality}</span>
              <span className="text-emerald-400 tabular-nums">{quality}%</span>
            </div>
            <input
              type="range"
              min={0}
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
                {t.avifConvert[p.key]} ({p.q}%)
              </button>
            ))}
          </div>
        </>
      ) : null}

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
          {t.avifConvert.alphaTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["preserve", t.avifConvert.alphaPreserve],
              ["flatten", t.avifConvert.alphaFlatten],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onAlphaMode(id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                alphaMode === id
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {alphaMode === "flatten" ? (
          <label className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            {t.avifConvert.backdrop}
            <input
              type="color"
              value={backdrop}
              disabled={disabled}
              onChange={(e) => onBackdrop(e.target.value)}
              className="h-8 w-12 cursor-pointer rounded border border-slate-700 bg-transparent"
            />
          </label>
        ) : null}
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">{t.avifConvert.compatHint}</p>
    </div>
  );
}