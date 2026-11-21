"use client";

import type {
  SvgOutputFormat,
  SvgPngBackground,
  SvgSizeMode,
} from "@/lib/image/convert-svg";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const SCALES = [1, 2, 3, 4, 8] as const;
const JPG_PRESETS = [
  { q: 72, key: "presetNetwork" as const },
  { q: 85, key: "presetBalanced" as const },
  { q: 95, key: "presetMax" as const },
] as const;

const PIXEL_PRESETS = [
  { w: 512, h: 512, key: "preset512" as const },
  { w: 1024, h: 1024, key: "preset1024" as const },
  { w: 1920, h: 1080, key: "presetFhd" as const },
  { w: 3840, h: 2160, key: "preset4k" as const },
] as const;

export function SvgConvertControls({
  format,
  onFormat,
  sizeMode,
  onSizeMode,
  scaleMultiplier,
  onScale,
  outputWidth,
  onOutputWidth,
  outputHeight,
  onOutputHeight,
  lockAspect,
  onLockAspect,
  pngBackground,
  onPngBackground,
  backdrop,
  onBackdrop,
  quality,
  onQuality,
  onPixelPreset,
  disabled,
}: {
  format: SvgOutputFormat;
  onFormat: (f: SvgOutputFormat) => void;
  sizeMode: SvgSizeMode;
  onSizeMode: (m: SvgSizeMode) => void;
  scaleMultiplier: number;
  onScale: (s: number) => void;
  outputWidth: number;
  onOutputWidth: (w: number) => void;
  outputHeight: number;
  onOutputHeight: (h: number) => void;
  lockAspect: boolean;
  onLockAspect: (v: boolean) => void;
  pngBackground: SvgPngBackground;
  onPngBackground: (b: SvgPngBackground) => void;
  backdrop: string;
  onBackdrop: (c: string) => void;
  quality: number;
  onQuality: (q: number) => void;
  onPixelPreset: (w: number, h: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="glass-card space-y-5 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <p className="text-xs text-slate-500">{t.svgConvert.settingsHint}</p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["image/png", t.toolUi.formatPng],
            ["image/jpeg", t.toolUi.formatJpeg],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onFormat(id)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-medium",
              format === id
                ? "border-emerald-500/55 bg-emerald-500/15 text-emerald-200"
                : "border-slate-700 text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.svgConvert.sizeTitle}
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {(
            [
              ["scale", t.svgConvert.sizeModeScale],
              ["pixels", t.svgConvert.sizeModePixels],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onSizeMode(id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                sizeMode === id
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {sizeMode === "scale" ? (
          <div className="flex flex-wrap gap-2">
            {SCALES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => onScale(s)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums",
                  scaleMultiplier === s
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                    : "border-slate-700 text-slate-400",
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PIXEL_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPixelPreset(p.w, p.h)}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:border-violet-500/40"
                >
                  {t.svgConvert[p.key]}
                </button>
              ))}
            </div>
            <SvgDimensionInputs
              outputWidth={outputWidth}
              outputHeight={outputHeight}
              onOutputWidth={onOutputWidth}
              onOutputHeight={onOutputHeight}
              lockAspect={lockAspect}
              onLockAspect={onLockAspect}
              disabled={disabled}
              t={t}
            />
          </div>
        )}
      </div>

      {format === "image/png" ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.svgConvert.pngBgTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["transparent", t.svgConvert.pngTransparent],
                ["solid", t.svgConvert.pngSolid],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => onPngBackground(id)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium",
                  pngBackground === id
                    ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                    : "border-slate-700 text-slate-400",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {format === "image/jpeg" || (format === "image/png" && pngBackground === "solid") ? (
        <label className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          {t.svgConvert.backdrop}
          <input
            type="color"
            value={backdrop}
            disabled={disabled}
            onChange={(e) => onBackdrop(e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-slate-700 bg-transparent"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onBackdrop("#ffffff")}
            className="rounded border border-slate-700 px-2 py-1 text-[10px]"
          >
            {t.svgConvert.backdropWhite}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onBackdrop("#000000")}
            className="rounded border border-slate-700 px-2 py-1 text-[10px]"
          >
            {t.svgConvert.backdropBlack}
          </button>
        </label>
      ) : null}

      {format === "image/jpeg" ? (
        <>
          <div>
            <div className="flex justify-between">
              <span>{t.svgConvert.quality}</span>
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
            {JPG_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                disabled={disabled}
                onClick={() => onQuality(p.q)}
                className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] text-slate-300"
              >
                {t.svgConvert[p.key]} ({p.q}%)
              </button>
            ))}
          </div>
        </>
      ) : null}

      <p className="text-[11px] leading-relaxed text-slate-500">{t.svgConvert.sanitizeHint}</p>
    </div>
  );
}

function SvgDimensionInputs({
  outputWidth,
  outputHeight,
  onOutputWidth,
  onOutputHeight,
  lockAspect,
  onLockAspect,
  disabled,
  t,
}: {
  outputWidth: number;
  outputHeight: number;
  onOutputWidth: (w: number) => void;
  onOutputHeight: (h: number) => void;
  lockAspect: boolean;
  onLockAspect: (v: boolean) => void;
  disabled?: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-xs">
        {t.svgConvert.widthPx}
        <input
          type="number"
          min={16}
          max={8192}
          disabled={disabled}
          value={outputWidth}
          onChange={(e) => onOutputWidth(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs">
        {t.svgConvert.heightPx}
        <input
          type="number"
          min={16}
          max={8192}
          disabled={disabled || lockAspect}
          value={outputHeight}
          onChange={(e) => onOutputHeight(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-400 sm:col-span-2">
        <input
          type="checkbox"
          checked={lockAspect}
          disabled={disabled}
          onChange={(e) => onLockAspect(e.target.checked)}
          className="accent-violet-500"
        />
        {t.svgConvert.lockAspect}
      </label>
    </div>
  );
}