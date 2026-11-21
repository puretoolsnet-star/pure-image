"use client";

import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { ScanPresetId } from "@/lib/image/scan-enhance";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const PRESETS: ScanPresetId[] = ["bw-text", "gray-contrast", "photo-scan", "soft"];

export function ScanEnhanceControls({
  preset,
  onPreset,
  flatten,
  onFlatten,
  brightness,
  onBrightness,
  contrast,
  onContrast,
  sharpness,
  onSharpness,
  denoise,
  onDenoise,
  useThreshold,
  onUseThreshold,
  threshold,
  onThreshold,
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
  useTargetKb,
  onUseTargetKb,
  targetKb,
  onTargetKb,
  disabled,
}: {
  preset: ScanPresetId;
  onPreset: (p: ScanPresetId) => void;
  flatten: number;
  onFlatten: (n: number) => void;
  brightness: number;
  onBrightness: (n: number) => void;
  contrast: number;
  onContrast: (n: number) => void;
  sharpness: number;
  onSharpness: (n: number) => void;
  denoise: number;
  onDenoise: (n: number) => void;
  useThreshold: boolean;
  onUseThreshold: (v: boolean) => void;
  threshold: number;
  onThreshold: (n: number) => void;
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
  useTargetKb: boolean;
  onUseTargetKb: (v: boolean) => void;
  targetKb: number;
  onTargetKb: (n: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const presetLabels = t.scanEnhanceTool.presetLabels;

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">{t.scanEnhanceTool.settingsHint}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {PRESETS.map((id) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onPreset(id)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-xs",
              preset === id
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                : "border-slate-700 text-slate-400 hover:border-slate-600",
            )}
          >
            <span className="font-medium">{presetLabels[id]}</span>
            <span className="mt-0.5 block text-[10px] text-slate-500">
              {t.scanEnhanceTool.presetHints[id]}
            </span>
          </button>
        ))}
      </div>

      <SliderRow
        label={t.scanEnhanceTool.flatten}
        value={flatten}
        min={0}
        max={100}
        disabled={disabled}
        onChange={onFlatten}
      />
      <SliderRow
        label={t.scanEnhanceTool.brightness}
        value={brightness}
        min={80}
        max={140}
        disabled={disabled}
        onChange={onBrightness}
      />
      <SliderRow
        label={t.scanEnhanceTool.contrast}
        value={contrast}
        min={80}
        max={200}
        disabled={disabled}
        onChange={onContrast}
      />
      <SliderRow
        label={t.scanEnhanceTool.sharpness}
        value={sharpness}
        min={0}
        max={100}
        disabled={disabled}
        onChange={onSharpness}
      />
      <SliderRow
        label={t.scanEnhanceTool.denoise}
        value={denoise}
        min={0}
        max={100}
        disabled={disabled}
        onChange={onDenoise}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => onUseThreshold(!useThreshold)}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-left text-xs",
          useThreshold ? "border-violet-500/40 text-violet-100" : "border-slate-700 text-slate-400",
        )}
      >
        {t.scanEnhanceTool.thresholdToggle}
      </button>
      {useThreshold ? (
        <SliderRow
          label={t.scanEnhanceTool.threshold}
          value={threshold}
          min={100}
          max={220}
          disabled={disabled}
          onChange={onThreshold}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["auto", t.scanEnhanceTool.formatAuto],
            ["png", t.toolUi.formatPng],
            ["jpeg", t.toolUi.formatJpeg],
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

      <SliderRow
        label={t.scanEnhanceTool.quality}
        value={quality}
        min={50}
        max={100}
        disabled={disabled}
        onChange={onQuality}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => onUseMaxSize(!useMaxSize)}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-left text-xs",
          useMaxSize ? "border-violet-500/40 text-violet-100" : "border-slate-700 text-slate-400",
        )}
      >
        {t.scanEnhanceTool.maxSizeToggle}
      </button>
      {useMaxSize ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            {t.scanEnhanceTool.maxWidth}
            <input
              type="number"
              min={320}
              max={8000}
              value={maxWidth}
              disabled={disabled}
              onChange={(e) => onMaxWidth(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <label className="text-xs">
            {t.scanEnhanceTool.maxHeight}
            <input
              type="number"
              min={320}
              max={8000}
              value={maxHeight}
              disabled={disabled}
              onChange={(e) => onMaxHeight(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onUseTargetKb(!useTargetKb)}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-left text-xs",
          useTargetKb ? "border-violet-500/40 text-violet-100" : "border-slate-700 text-slate-400",
        )}
      >
        {t.scanEnhanceTool.targetKbToggle}
      </button>
      {useTargetKb ? (
        <input
          type="number"
          min={50}
          max={8000}
          value={targetKb}
          disabled={disabled}
          onChange={(e) => onTargetKb(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      ) : null}

      <p className="text-[11px] text-slate-500">{t.scanEnhanceTool.exifHint}</p>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block text-xs text-slate-400">
      <div className="mb-1 flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-slate-200">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
    </label>
  );
}