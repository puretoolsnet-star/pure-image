"use client";

import type { WebpAlphaMode, WebpMode } from "@/lib/image/convert-webp";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const MODES: WebpMode[] = ["auto", "lossy", "lossless"];
const PRESETS = [
  { q: 65, key: "presetWeb" as const },
  { q: 82, key: "presetBalanced" as const },
  { q: 92, key: "presetHigh" as const },
] as const;

export function WebPControls({
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
  disabled,
}: {
  mode: WebpMode;
  onMode: (m: WebpMode) => void;
  quality: number;
  onQuality: (q: number) => void;
  maxWidth: number;
  onMaxWidth: (w: number) => void;
  alphaMode: WebpAlphaMode;
  onAlphaMode: (a: WebpAlphaMode) => void;
  backdrop: string;
  onBackdrop: (c: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  const modeLabels: Record<WebpMode, string> = {
    auto: t.webpConvert.modeAuto,
    lossy: t.webpConvert.modeLossy,
    lossless: t.webpConvert.modeLossless,
  };

  return (
    <div className="glass-card space-y-5 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <p className="text-xs text-slate-500">{t.webpConvert.settingsHint}</p>
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

      {mode === "lossy" ? (
        <>
          <div>
            <div className="flex justify-between">
              <span>{t.webpConvert.quality}</span>
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
                {t.smartCompress[p.key]} ({p.q}%)
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
          {t.webpConvert.alphaTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["preserve", t.webpConvert.alphaPreserve],
              ["flatten", t.webpConvert.alphaFlatten],
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
            {t.webpConvert.backdrop}
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

      <p className="text-[11px] leading-relaxed text-slate-500">{t.webpConvert.metaHint}</p>
    </div>
  );
}