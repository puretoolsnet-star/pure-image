"use client";

import type {
  ResizeFitMode,
  ResizeFormatChoice,
  ResizePresetKey,
  ResizeSizeMode,
} from "@/lib/image/resize-advanced";
import { RESIZE_PRESETS } from "@/lib/image/types";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const SOCIAL_KEYS = Object.keys(RESIZE_PRESETS) as (keyof typeof RESIZE_PRESETS)[];

export function ResizeControls({
  sizeMode,
  onSizeMode,
  width,
  onWidth,
  height,
  onHeight,
  percent,
  onPercent,
  lockAspect,
  onLockAspect,
  fitMode,
  onFitMode,
  format,
  onFormat,
  quality,
  onQuality,
  backdrop,
  onBackdrop,
  onPreset,
  onReset,
  disabled,
}: {
  sizeMode: ResizeSizeMode;
  onSizeMode: (m: ResizeSizeMode) => void;
  width: number;
  onWidth: (w: number) => void;
  height: number;
  onHeight: (h: number) => void;
  percent: number;
  onPercent: (p: number) => void;
  lockAspect: boolean;
  onLockAspect: (v: boolean) => void;
  fitMode: ResizeFitMode;
  onFitMode: (f: ResizeFitMode) => void;
  format: ResizeFormatChoice;
  onFormat: (f: ResizeFormatChoice) => void;
  quality: number;
  onQuality: (q: number) => void;
  backdrop: string;
  onBackdrop: (c: string) => void;
  onPreset: (key: ResizePresetKey) => void;
  onReset: () => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  const socialLabel = (key: keyof typeof RESIZE_PRESETS) => {
    const map: Record<keyof typeof RESIZE_PRESETS, string> = {
      instagram: t.toolUi.presetInstagram,
      facebook: t.toolUi.presetFacebook,
      twitter: t.toolUi.presetTwitter,
      youtube: t.toolUi.presetYoutube,
      linkedin: t.toolUi.presetLinkedin,
      avatar: t.toolUi.presetAvatar,
    };
    return map[key];
  };

  return (
    <div className="glass-card space-y-5 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <p className="text-xs text-slate-500">{t.resizeTool.settingsHint}</p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["px", t.resizeTool.sizePx],
            ["percent", t.resizeTool.sizePercent],
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

      {sizeMode === "percent" ? (
        <div>
          <div className="flex justify-between">
            <span>{t.resizeTool.percentLabel}</span>
            <span className="text-emerald-400 tabular-nums">{percent}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={200}
            disabled={disabled}
            value={percent}
            onChange={(e) => onPercent(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-500"
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            {t.toolUi.width}
            <input
              type="number"
              min={1}
              max={8192}
              disabled={disabled}
              value={width}
              onChange={(e) => onWidth(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-xs">
            {t.toolUi.height}
            <input
              type="number"
              min={1}
              max={8192}
              disabled={disabled || (lockAspect && fitMode !== "stretch")}
              value={height}
              onChange={(e) => onHeight(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
            />
          </label>
        </div>
      )}

      <label className="flex items-center gap-2 text-xs text-slate-400">
        <input
          type="checkbox"
          checked={lockAspect}
          disabled={disabled || fitMode === "stretch" || sizeMode === "percent"}
          onChange={(e) => onLockAspect(e.target.checked)}
          className="accent-violet-500"
        />
        {t.toolUi.keepAspect}
      </label>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.resizeTool.fitModeTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["fit", t.resizeTool.fitFit],
              ["fill", t.resizeTool.fitFill],
              ["stretch", t.resizeTool.fitStretch],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onFitMode(id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                fitMode === id
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{t.resizeTool.fitModeHint}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.resizeTool.presetsTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          <PresetChip disabled={disabled} onClick={onReset} label={t.resizeTool.presetOriginal} />
          <PresetChip disabled={disabled} onClick={() => onPreset("half")} label={t.resizeTool.presetHalf} />
          <PresetChip disabled={disabled} onClick={() => onPreset("quarter")} label={t.resizeTool.presetQuarter} />
          <PresetChip disabled={disabled} onClick={() => onPreset("fhd")} label={t.resizeTool.presetFhd} />
          <PresetChip disabled={disabled} onClick={() => onPreset("fourk")} label={t.resizeTool.preset4k} />
          {SOCIAL_KEYS.map((key) => (
            <PresetChip
              key={key}
              disabled={disabled}
              onClick={() => onPreset(key)}
              label={socialLabel(key)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.resizeTool.formatTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["auto", t.resizeTool.formatAuto],
              ["jpeg", t.toolUi.formatJpeg],
              ["png", t.toolUi.formatPng],
              ["webp", t.toolUi.formatWebp],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onFormat(id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                format === id
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {format !== "png" ? (
        <div>
          <div className="flex justify-between">
            <span>{t.resizeTool.quality}</span>
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
      ) : null}

      <label className="flex items-center gap-3 text-xs text-slate-400">
        {t.resizeTool.backdrop}
        <input
          type="color"
          value={backdrop}
          disabled={disabled}
          onChange={(e) => onBackdrop(e.target.value)}
          className="h-8 w-12 cursor-pointer rounded border border-slate-700 bg-transparent"
        />
      </label>
    </div>
  );
}

function PresetChip({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:border-violet-500/40"
    >
      {label}
    </button>
  );
}