"use client";

import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type {
  SocialContainBackdrop,
  SocialFillMode,
} from "@/lib/image/social-preset-export";
import type { SocialFormatKind, SocialPlatform, SocialPresetDef } from "@/lib/image/social-presets";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function SocialPresetsControls({
  presets,
  presetId,
  onPreset,
  platformFilter,
  onPlatform,
  kindFilter,
  onKind,
  search,
  onSearch,
  customWidth,
  onCustomWidth,
  customHeight,
  onCustomHeight,
  fillMode,
  onFillMode,
  containBackdrop,
  onContainBackdrop,
  backdrop,
  onBackdrop,
  format,
  onFormat,
  quality,
  onQuality,
  useTargetKb,
  onUseTargetKb,
  targetKb,
  onTargetKb,
  disabled,
}: {
  presets: SocialPresetDef[];
  presetId: string;
  onPreset: (id: string) => void;
  platformFilter: SocialPlatform;
  onPlatform: (p: SocialPlatform) => void;
  kindFilter: SocialFormatKind | "all";
  onKind: (k: SocialFormatKind | "all") => void;
  search: string;
  onSearch: (q: string) => void;
  customWidth: number;
  onCustomWidth: (w: number) => void;
  customHeight: number;
  onCustomHeight: (h: number) => void;
  fillMode: SocialFillMode;
  onFillMode: (m: SocialFillMode) => void;
  containBackdrop: SocialContainBackdrop;
  onContainBackdrop: (b: SocialContainBackdrop) => void;
  backdrop: string;
  onBackdrop: (c: string) => void;
  format: ResizeFormatChoice;
  onFormat: (f: ResizeFormatChoice) => void;
  quality: number;
  onQuality: (q: number) => void;
  useTargetKb: boolean;
  onUseTargetKb: (v: boolean) => void;
  targetKb: number | null;
  onTargetKb: (kb: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  const platforms: SocialPlatform[] = [
    "all",
    "instagram",
    "facebook",
    "x",
    "youtube",
    "linkedin",
    "tiktok",
    "pinterest",
  ];

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">{t.socialPresets.settingsHint}</p>

      <input
        type="search"
        placeholder={t.socialPresets.searchPlaceholder}
        value={search}
        disabled={disabled}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
      />

      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => onPlatform(p)}
            className={cn(
              "rounded-lg border px-2 py-1 text-[11px] capitalize",
              platformFilter === p
                ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                : "border-slate-700 text-slate-400",
            )}
          >
            {p === "all" ? t.socialPresets.platformAll : t.socialPresets.platforms[p]}
          </button>
        ))}
      </div>

      <KindFilterRow disabled={disabled} kindFilter={kindFilter} onKind={onKind} t={t} />

      <ul className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-slate-800 p-2">
        {presets.map((p) => {
          const label = t.socialPresets.presetLabels[p.labelKey as keyof typeof t.socialPresets.presetLabels];
          return (
            <li key={p.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPreset(p.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs",
                  presetId === p.id
                    ? "bg-emerald-500/15 text-emerald-200"
                    : "text-slate-300 hover:bg-slate-800/80",
                )}
              >
                <span>{label}</span>
                <span className="tabular-nums text-slate-500">
                  {p.width}×{p.height}
                </span>
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPreset("custom")}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs",
              presetId === "custom"
                ? "bg-emerald-500/15 text-emerald-200"
                : "text-slate-300 hover:bg-slate-800/80",
            )}
          >
            <span>{t.socialPresets.presetLabels.custom}</span>
            <span className="text-slate-500">{t.socialPresets.customHint}</span>
          </button>
        </li>
      </ul>

      {presetId === "custom" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            {t.toolUi.width}
            <input
              type="number"
              min={16}
              max={4096}
              value={customWidth}
              disabled={disabled}
              onChange={(e) => onCustomWidth(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <label className="text-xs">
            {t.toolUi.height}
            <input
              type="number"
              min={16}
              max={4096}
              value={customHeight}
              disabled={disabled}
              onChange={(e) => onCustomHeight(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["cover", t.socialPresets.fillCover],
            ["contain", t.socialPresets.fillContain],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onFillMode(id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium",
              fillMode === id
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                : "border-slate-700 text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {fillMode === "contain" ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["color", t.socialPresets.backdropColor],
              ["blur", t.socialPresets.backdropBlur],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onContainBackdrop(id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs",
                containBackdrop === id
                  ? "border-violet-500/50 text-violet-200"
                  : "border-slate-700 text-slate-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <label className="flex items-center gap-3 text-xs text-slate-400">
        {t.socialPresets.backdrop}
        <input
          type="color"
          value={backdrop}
          disabled={disabled}
          onChange={(e) => onBackdrop(e.target.value)}
          className="h-8 w-12 rounded border border-slate-700 bg-transparent"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {(
          [
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
          <span>{t.socialPresets.quality}</span>
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
        onClick={() => onUseTargetKb(!useTargetKb)}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-left text-xs",
          useTargetKb ? "border-violet-500/40 bg-violet-500/10 text-violet-100" : "border-slate-700 text-slate-400",
        )}
      >
        {t.socialPresets.targetKbToggle}
      </button>
      {useTargetKb ? (
        <input
          type="number"
          min={20}
          max={8000}
          value={targetKb ?? 500}
          disabled={disabled}
          onChange={(e) => onTargetKb(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      ) : null}

      <p className="text-[11px] text-slate-500">{t.socialPresets.safeZoneHint}</p>
    </div>
  );
}

function KindFilterRow({
  kindFilter,
  onKind,
  disabled,
  t,
}: {
  kindFilter: SocialFormatKind | "all";
  onKind: (k: SocialFormatKind | "all") => void;
  disabled?: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const kinds: (SocialFormatKind | "all")[] = [
    "all",
    "square",
    "portrait",
    "story",
    "landscape",
    "banner",
    "avatar",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {kinds.map((k) => (
        <button
          key={k}
          type="button"
          disabled={disabled}
          onClick={() => onKind(k)}
          className={cn(
            "rounded-lg border px-2 py-1 text-[10px]",
            kindFilter === k
              ? "border-emerald-500/50 text-emerald-200"
              : "border-slate-700 text-slate-500",
          )}
        >
          {k === "all" ? t.socialPresets.kindAll : t.socialPresets.kinds[k]}
        </button>
      ))}
    </div>
  );
}