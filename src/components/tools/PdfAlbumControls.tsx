"use client";

import type {
  PdfImageFit,
  PdfMarginPreset,
  PdfOrientation,
  PdfOutputMode,
  PdfPageSize,
  PdfQualityPreset,
} from "@/lib/image/pdf-album";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function PdfAlbumControls({
  pageSize,
  onPageSize,
  orientation,
  onOrientation,
  margin,
  onMargin,
  pageBackground,
  onPageBackground,
  imageFit,
  onImageFit,
  qualityPreset,
  onQualityPreset,
  outputMode,
  onOutputMode,
  fileName,
  onFileName,
  disabled,
}: {
  pageSize: PdfPageSize;
  onPageSize: (v: PdfPageSize) => void;
  orientation: PdfOrientation;
  onOrientation: (v: PdfOrientation) => void;
  margin: PdfMarginPreset;
  onMargin: (v: PdfMarginPreset) => void;
  pageBackground: string;
  onPageBackground: (c: string) => void;
  imageFit: PdfImageFit;
  onImageFit: (v: PdfImageFit) => void;
  qualityPreset: PdfQualityPreset;
  onQualityPreset: (v: PdfQualityPreset) => void;
  outputMode: PdfOutputMode;
  onOutputMode: (v: PdfOutputMode) => void;
  fileName: string;
  onFileName: (n: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">{t.pdfAlbumTool.settingsHint}</p>

      <ChipGroup
        label={t.pdfAlbumTool.pageSizeTitle}
        disabled={disabled}
        value={pageSize}
        onChange={onPageSize}
        options={(
          [
            ["a4", "A4"],
            ["letter", t.pdfAlbumTool.pageLetter],
            ["a5", "A5"],
            ["fit", t.pdfAlbumTool.pageFit],
          ] as const
        ).map(([id, label]) => ({ id, label }))}
      />

      <ChipGroup
        label={t.pdfAlbumTool.orientationTitle}
        disabled={disabled}
        value={orientation}
        onChange={onOrientation}
        options={(
          [
            ["auto", t.pdfAlbumTool.orientAuto],
            ["portrait", t.pdfAlbumTool.orientPortrait],
            ["landscape", t.pdfAlbumTool.orientLandscape],
          ] as const
        ).map(([id, label]) => ({ id, label }))}
      />

      <ChipGroup
        label={t.pdfAlbumTool.marginTitle}
        disabled={disabled}
        value={margin}
        onChange={onMargin}
        options={(
          [
            ["none", t.pdfAlbumTool.marginNone],
            ["small", t.pdfAlbumTool.marginSmall],
            ["medium", t.pdfAlbumTool.marginMedium],
            ["large", t.pdfAlbumTool.marginLarge],
          ] as const
        ).map(([id, label]) => ({ id, label }))}
      />

      <label className="flex items-center gap-3 text-xs text-slate-400">
        {t.pdfAlbumTool.pageBackground}
        <input
          type="color"
          value={pageBackground}
          disabled={disabled}
          onChange={(e) => onPageBackground(e.target.value)}
          className="h-8 w-12 rounded border border-slate-700 bg-transparent"
        />
      </label>

      <ChipGroup
        label={t.pdfAlbumTool.placementTitle}
        disabled={disabled}
        value={imageFit}
        onChange={onImageFit}
        options={(
          [
            ["contain", t.pdfAlbumTool.fitContain],
            ["fill", t.pdfAlbumTool.fitFill],
          ] as const
        ).map(([id, label]) => ({ id, label }))}
      />

      <ChipGroup
        label={t.pdfAlbumTool.qualityTitle}
        disabled={disabled}
        value={qualityPreset}
        onChange={onQualityPreset}
        options={(
          [
            ["email", t.pdfAlbumTool.qualityEmail],
            ["balanced", t.pdfAlbumTool.qualityBalanced],
            ["print", t.pdfAlbumTool.qualityPrint],
          ] as const
        ).map(([id, label]) => ({ id, label }))}
      />

      <ChipGroup
        label={t.pdfAlbumTool.outputTitle}
        disabled={disabled}
        value={outputMode}
        onChange={onOutputMode}
        options={(
          [
            ["single", t.pdfAlbumTool.outputSingle],
            ["per-page", t.pdfAlbumTool.outputPerPage],
          ] as const
        ).map(([id, label]) => ({ id, label }))}
      />

      <label className="block text-xs text-slate-400">
        {t.pdfAlbumTool.fileName}
        <input
          type="text"
          value={fileName}
          disabled={disabled}
          onChange={(e) => onFileName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
      </label>

      <p className="text-[11px] text-slate-500">{t.pdfAlbumTool.exifHint}</p>
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-[11px]",
              value === opt.id
                ? "border-violet-500/50 bg-violet-500/15 text-violet-100"
                : "border-slate-700 text-slate-400",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}