"use client";

import type { CompressFormatChoice } from "@/lib/image/compress-advanced";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function BatchCompressControls({
  quality,
  onQuality,
  maxWidth,
  onMaxWidth,
  preservePixels,
  onPreservePixels,
  format,
  onFormat,
  disabled,
}: {
  quality: number;
  onQuality: (q: number) => void;
  maxWidth: number;
  onMaxWidth: (w: number) => void;
  preservePixels: boolean;
  onPreservePixels: (v: boolean) => void;
  format: CompressFormatChoice;
  onFormat: (f: CompressFormatChoice) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const formats: { id: CompressFormatChoice; label: string }[] = [
    { id: "auto", label: t.batchCompress.formatAuto },
    { id: "jpeg", label: t.toolUi.formatJpeg },
    { id: "webp", label: t.toolUi.formatWebp },
  ];

  return (
    <div className="glass-card space-y-4 rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
      <p className="text-xs text-slate-500">{t.batchCompress.globalSettingsHint}</p>
      <div>
        <div className="flex justify-between gap-2">
          <span className="font-medium">{t.toolUi.quality}</span>
          <span className="text-emerald-400 tabular-nums">{quality}%</span>
        </div>
        <input
          type="range"
          min={35}
          max={95}
          disabled={disabled}
          value={quality}
          onChange={(e) => onQuality(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-500"
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={preservePixels}
          disabled={disabled}
          onChange={(e) => onPreservePixels(e.target.checked)}
          className="rounded border-slate-600 bg-slate-900 accent-emerald-500"
        />
        {t.batchCompress.preservePixels}
      </label>
      {!preservePixels ? (
        <label className="block">
          <span className="font-medium">{t.toolUi.maxWidth}</span>
          <input
            type="number"
            min={480}
            max={4096}
            step={10}
            disabled={disabled}
            value={maxWidth}
            onChange={(e) => onMaxWidth(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
      ) : null}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.batchCompress.formatTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {formats.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onFormat(opt.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                format === opt.id
                  ? "border-emerald-500/55 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}