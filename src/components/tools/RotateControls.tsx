"use client";

import { FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from "lucide-react";

import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { RotateBackdropMode, RotateCanvasMode } from "@/lib/image/rotate-flip-export";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function RotateControls({
  angleDeg,
  onAngle,
  onRotateBy,
  flipH,
  onFlipH,
  flipV,
  onFlipV,
  canvasMode,
  onCanvasMode,
  backdropMode,
  onBackdropMode,
  backdrop,
  onBackdrop,
  format,
  onFormat,
  quality,
  onQuality,
  onReset,
  disabled,
}: {
  angleDeg: number;
  onAngle: (deg: number) => void;
  onRotateBy: (delta: number) => void;
  flipH: boolean;
  onFlipH: (v: boolean) => void;
  flipV: boolean;
  onFlipV: (v: boolean) => void;
  canvasMode: RotateCanvasMode;
  onCanvasMode: (m: RotateCanvasMode) => void;
  backdropMode: RotateBackdropMode;
  onBackdropMode: (m: RotateBackdropMode) => void;
  backdrop: string;
  onBackdrop: (c: string) => void;
  format: ResizeFormatChoice;
  onFormat: (f: ResizeFormatChoice) => void;
  quality: number;
  onQuality: (q: number) => void;
  onReset: () => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">{t.rotateTool.settingsHint}</p>

      <div className="flex flex-wrap gap-2">
        <QuickBtn
          disabled={disabled}
          onClick={() => onRotateBy(-90)}
          icon={<RotateCcw className="h-4 w-4" />}
          label={t.rotateTool.rotateCcw}
        />
        <QuickBtn
          disabled={disabled}
          onClick={() => onRotateBy(90)}
          icon={<RotateCw className="h-4 w-4" />}
          label={t.rotateTool.rotateCw}
        />
        <QuickBtn disabled={disabled} onClick={() => onRotateBy(180)} label={t.rotateTool.rotate180} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFlipH(!flipH)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium",
            flipH
              ? "border-violet-500/50 bg-violet-500/15 text-violet-100"
              : "border-slate-700 text-slate-400",
          )}
        >
          <FlipHorizontal className="h-4 w-4" />
          {t.rotateTool.flipHorizontal}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFlipV(!flipV)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium",
            flipV
              ? "border-violet-500/50 bg-violet-500/15 text-violet-100"
              : "border-slate-700 text-slate-400",
          )}
        >
          <FlipVertical className="h-4 w-4" />
          {t.rotateTool.flipVertical}
        </button>
      </div>

      <AngleInputRow
        angleDeg={angleDeg}
        onAngle={onAngle}
        onRotateBy={onRotateBy}
        onReset={onReset}
        disabled={disabled}
        t={t}
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["expand", t.rotateTool.canvasExpand],
            ["fit-size", t.rotateTool.canvasFitSize],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onCanvasMode(id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs",
              canvasMode === id
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                : "border-slate-700 text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["transparent", t.rotateTool.backdropTransparent],
            ["color", t.rotateTool.backdropColor],
            ["blur", t.rotateTool.backdropBlur],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onBackdropMode(id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs",
              backdropMode === id
                ? "border-violet-500/40 text-violet-200"
                : "border-slate-700 text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {backdropMode === "color" ? (
        <label className="flex items-center gap-3 text-xs text-slate-400">
          {t.rotateTool.backdrop}
          <input
            type="color"
            value={backdrop}
            disabled={disabled}
            onChange={(e) => onBackdrop(e.target.value)}
            className="h-8 w-12 rounded border border-slate-700 bg-transparent"
          />
        </label>
      ) : null}

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
          <span>{t.rotateTool.quality}</span>
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

      <p className="text-[11px] text-slate-500">{t.rotateTool.exifHint}</p>
    </div>
  );
}

function QuickBtn({
  label,
  onClick,
  disabled,
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 hover:border-emerald-500/40 disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  );
}

function AngleInputRow({
  angleDeg,
  onAngle,
  onRotateBy,
  onReset,
  disabled,
  t,
}: {
  angleDeg: number;
  onAngle: (n: number) => void;
  onRotateBy: (d: number) => void;
  disabled?: boolean;
  onReset: () => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-800 p-3">
      <div className="flex items-center justify-between text-xs">
        <span>{t.rotateTool.angleLabel}</span>
        <span className="font-mono text-emerald-400">{angleDeg}°</span>
      </div>
      <input
        type="range"
        min={-180}
        max={180}
        step={0.5}
        disabled={disabled}
        value={angleDeg}
        onChange={(e) => onAngle(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex flex-wrap gap-2">
        <input
          type="number"
          min={-180}
          max={180}
          step={0.1}
          disabled={disabled}
          value={angleDeg}
          onChange={(e) => onAngle(Number(e.target.value))}
          className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRotateBy(-1)}
          className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-400"
        >
          −1°
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRotateBy(1)}
          className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-400"
        >
          +1°
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onReset}
          className="ml-auto rounded-lg border border-amber-500/40 px-2 py-1 text-[10px] text-amber-200"
        >
          {t.rotateTool.resetTransform}
        </button>
      </div>
      <p className="text-[10px] text-slate-500">{t.rotateTool.fineAngleHint}</p>
    </div>
  );
}