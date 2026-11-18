"use client";

import { Download, Trash2 } from "lucide-react";

import { useI18n } from "@/i18n/context";
import type { ProcessedImage } from "@/lib/image/types";
import { cn } from "@/lib/cn";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ProcessedGrid({
  items,
  onDownload,
  onRemove,
  originalLabel,
  outputLabel,
  savingsLabel,
  showSavings = true,
}: {
  items: ProcessedImage[];
  onDownload: (item: ProcessedImage) => void;
  onRemove: (id: string) => void;
  originalLabel: string;
  outputLabel: string;
  savingsLabel: string;
  showSavings?: boolean;
}) {
  const { t } = useI18n();
  if (!items.length) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const saved = Math.max(0, item.originalSize - item.outputSize);
        const pct =
          item.originalSize > 0 ? Math.round((saved / item.originalSize) * 100) : 0;
        return (
          <li
            key={item.id}
            className="glass-card overflow-hidden rounded-2xl border border-slate-800/80 transition hover:border-emerald-500/25"
          >
            <div className="relative aspect-video bg-slate-900/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
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
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDownload(item)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t.common.downloadOne}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300",
                  )}
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
  );
}