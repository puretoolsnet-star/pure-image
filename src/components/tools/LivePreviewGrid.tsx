"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CompareMode } from "@/components/tools/BeforeAfterToggle";
import { BeforeAfterToggle } from "@/components/tools/BeforeAfterToggle";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { LivePreviewImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

export function LivePreviewGrid({
  items,
  busy,
  onDownload,
  onRemove,
  originalLabel,
  outputLabel,
  savingsLabel,
  showSavings = true,
}: {
  items: LivePreviewImage[];
  busy: boolean;
  onDownload: (item: LivePreviewImage) => void;
  onRemove: (id: string) => void;
  originalLabel: string;
  outputLabel: string;
  savingsLabel: string;
  showSavings?: boolean;
}) {
  const { t } = useI18n();
  const [compare, setCompare] = useState<CompareMode>("after");
  const [focusId, setFocusId] = useState<string | null>(null);

  if (!items.length) return null;

  const activeId = focusId && items.some((i) => i.id === focusId) ? focusId : items[0]!.id;
  const visible = items.length > 1 ? items.filter((i) => i.id === activeId) : items;

  return (
    <div className="space-y-4">
      {items.length > 1 ? (
        <h2>
          <span className="mb-2 block text-xs text-slate-500">{t.livePreview.selectFile}</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFocusId(item.id)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-1.5 text-xs",
                  item.id === activeId
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-700 text-slate-400",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </h2>
      ) : null}
      <BeforeAfterToggle mode={compare} onChange={setCompare} />
      {busy ? (
        <p className="flex items-center justify-center gap-2 text-center text-sm text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t.livePreview.updating}
        </p>
      ) : (
        <p className="text-center text-xs text-slate-500">{t.livePreview.liveHint}</p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2">
        {visible.map((item) => {
          const saved = Math.max(0, item.originalSize - item.outputSize);
          const pct =
            item.originalSize > 0 ? Math.round((saved / item.originalSize) * 100) : 0;
          return (
            <li
              key={item.id}
              className={cn(
                "glass-card overflow-hidden rounded-2xl border border-slate-800/80 transition",
                busy ? "border-violet-500/30 opacity-90" : "hover:border-emerald-500/25",
              )}
            >
              <MotionPreview compare={compare} item={item} busy={busy} />
              <div className="space-y-3 p-4">
                <p className="truncate text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {item.width}×{item.height}px
                </p>
                {showSavings ? (
                  <dl className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                    <div>
                      <dt>{originalLabel}</dt>
                      <dd className="text-slate-300">{formatBytes(item.originalSize)}</dd>
                    </div>
                    <div>
                      <dt>{outputLabel}</dt>
                      <dd className="text-emerald-400">{formatBytes(item.outputSize)}</dd>
                    </div>
                    <div>
                      <dt>{savingsLabel}</dt>
                      <dd className="text-violet-300">{pct}%</dd>
                    </div>
                  </dl>
                ) : (
                  <dl className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <dt>{originalLabel}</dt>
                      <dd className="text-slate-300">{formatBytes(item.originalSize)}</dd>
                    </div>
                    <div>
                      <dt>{outputLabel}</dt>
                      <dd className="text-emerald-400">{formatBytes(item.outputSize)}</dd>
                    </div>
                  </dl>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDownload(item)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t.common.downloadOne}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                    aria-label={t.common.remove}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MotionPreview({
  compare,
  item,
  busy,
}: {
  compare: CompareMode;
  item: LivePreviewImage;
  busy: boolean;
}) {
  if (compare === "before") {
    return (
      <PreviewPane src={item.sourcePreviewUrl} label="before" busy={busy} />
    );
  }
  if (compare === "split") {
    return (
      <div className="relative aspect-video grid grid-cols-2 bg-slate-900/80">
        <PreviewPane src={item.sourcePreviewUrl} label="before" busy={busy} compact />
        <PreviewPane src={item.previewUrl} label="after" busy={busy} compact showAfterBadge />
      </div>
    );
  }
  return <PreviewPane src={item.previewUrl} label="after" busy={busy} />;
}

function PreviewPane({
  src,
  busy,
  compact,
  showAfterBadge,
}: {
  src: string;
  label?: string;
  busy: boolean;
  compact?: boolean;
  showAfterBadge?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("relative bg-slate-900/80", compact ? "aspect-video" : "aspect-video")}>
      {busy ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40">
          <Loader2 className="h-8 w-8 animate-spin text-violet-300" aria-hidden />
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" />
      {compact ? (
        <span className="absolute bottom-1 left-1 rounded bg-slate-950/70 px-1.5 py-0.5 text-[10px] text-slate-300">
          {showAfterBadge ? t.livePreview.after : t.livePreview.before}
        </span>
      ) : null}
    </div>
  );
}