"use client";

import { FlipHorizontal } from "lucide-react";

import { CROP_ASPECT_PRESETS, type CropAspectPresetId } from "@/lib/image/crop-aspect";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function CropControls({
  presetId,
  onPreset,
  customRatioW,
  onCustomRatioW,
  customRatioH,
  onCustomRatioH,
  customPxW,
  onCustomPxW,
  customPxH,
  onCustomPxH,
  showGrid,
  onShowGrid,
  onFlip,
  format,
  onFormat,
  quality,
  onQuality,
  useMaxSize,
  onUseMaxSize,
  maxWidth,
  onMaxWidth,
  maxHeight,
  onMaxHeight,
  disabled,
}: {
  presetId: CropAspectPresetId;
  onPreset: (id: CropAspectPresetId) => void;
  customRatioW: number;
  onCustomRatioW: (n: number) => void;
  customRatioH: number;
  onCustomRatioH: (n: number) => void;
  customPxW: number;
  onCustomPxW: (n: number) => void;
  customPxH: number;
  onCustomPxH: (n: number) => void;
  showGrid: boolean;
  onShowGrid: (v: boolean) => void;
  onFlip: () => void;
  format: ResizeFormatChoice;
  onFormat: (f: ResizeFormatChoice) => void;
  quality: number;
  onQuality: (q: number) => void;
  useMaxSize: boolean;
  onUseMaxSize: (v: boolean) => void;
  maxWidth: number;
  onMaxWidth: (n: number) => void;
  maxHeight: number;
  onMaxHeight: (n: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const labels = t.cropTool.aspectLabels;

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">{t.cropTool.settingsHint}</p>

      <div className="flex flex-wrap gap-2">
        {CROP_ASPECT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onPreset(p.id)}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium",
              presetId === p.id
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                : "border-slate-700 text-slate-400",
            )}
          >
            {labels[p.labelKey as keyof typeof labels]}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onPreset("custom-ratio")}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[11px]",
            presetId === "custom-ratio"
              ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
              : "border-slate-700 text-slate-400",
          )}
        >
          {labels.customRatio}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onPreset("custom-px")}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[11px]",
            presetId === "custom-px"
              ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
              : "border-slate-700 text-slate-400",
          )}
        >
          {labels.customPx}
        </button>
      </div>

      {presetId === "custom-ratio" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            {t.cropTool.ratioW}
            <input
              type="number"
              min={1}
              max={100}
              value={customRatioW}
              disabled={disabled}
              onChange={(e) => onCustomRatioW(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <label className="text-xs">
            {t.cropTool.ratioH}
            <input
              type="number"
              min={1}
              max={100}
              value={customRatioH}
              disabled={disabled}
              onChange={(e) => onCustomRatioH(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
        </div>
      ) : null}

      {presetId === "custom-px" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            {t.toolUi.width}
            <input
              type="number"
              min={16}
              max={8192}
              value={customPxW}
              disabled={disabled}
              onChange={(e) => onCustomPxW(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <label className="text-xs">
            {t.toolUi.height}
            <input
              type="number"
              min={16}
              max={8192}
              value={customPxH}
              disabled={disabled}
              onChange={(e) => onCustomPxH(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onFlip}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-violet-500/40"
        >
          <FlipHorizontal className="h-3.5 w-3.5" />
          {t.cropTool.flipOrientation}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onShowGrid(!showGrid)}
          className={cn(
            "rounded-xl border px-3 py-2 text-xs",
            showGrid ? "border-emerald-500/40 text-emerald-200" : "border-slate-700 text-slate-400",
          )}
        >
          {t.cropTool.ruleOfThirds}
        </button>
      </div>

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
              "rounded-lg border px-3 py-1.5 text-xs",
              format === id ? "border-violet-500/50 text-violet-200" : "border-slate-700 text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs">
          <span>{t.cropTool.quality}</span>
          <span className="text-emerald-400">{quality}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={100}
          disabled={disabled}
          value={quality}
          onChange={(e) => onQuality(Number(e.target.value))}
          className="mt-1 w-full accent-emerald-500"
        />
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onUseMaxSize(!useMaxSize)}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-left text-xs",
          useMaxSize ? "border-violet-500/40 bg-violet-500/10 text-violet-100" : "border-slate-700 text-slate-400",
        )}
      >
        {t.cropTool.maxSizeToggle}
      </button>
      {useMaxSize ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            {t.cropTool.maxWidth}
            <input
              type="number"
              min={64}
              max={8192}
              value={maxWidth}
              disabled={disabled}
              onChange={(e) => onMaxWidth(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <label className="text-xs">
            {t.cropTool.maxHeight}
            <input
              type="number"
              min={64}
              max={8192}
              value={maxHeight}
              disabled={disabled}
              onChange={(e) => onMaxHeight(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
        </div>
      ) : null}

      <p className="text-[11px] text-slate-500">{t.cropTool.exifHint}</p>
    </div>
  );
}