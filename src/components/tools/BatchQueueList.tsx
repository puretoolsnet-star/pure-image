"use client";

import { Download, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

import type { BatchQueueRow } from "@/components/tools/use-batch-compress";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import { cn } from "@/lib/cn";

export function BatchQueueList({
  rows,
  focusId,
  globalQuality,
  onFocus,
  onRemove,
  onRetry,
  onDownload,
  onOverrides,
}: {
  rows: BatchQueueRow[];
  focusId: string | null;
  globalQuality: number;
  onFocus: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDownload: (id: string) => void;
  onOverrides: (id: string, quality: number) => void;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!rows.length) return null;

  return (
    <ul className="min-w-0 max-w-full space-y-2">
      {rows.map((row) => {
        const active = row.id === focusId;
        const out = row.result?.outputSize;
        const pct =
          out != null && row.originalSize > 0
            ? Math.round(((row.originalSize - out) / row.originalSize) * 100)
            : null;
        return (
          <li
            key={row.id}
            className={cn(
              "glass-card min-w-0 max-w-full rounded-xl border p-3 transition",
              active ? "border-emerald-500/40" : "border-slate-800/80",
            )}
          >
            <QueueRowBody
              active={active}
              row={row}
              pct={pct}
              onFocus={() => onFocus(row.id)}
              onRemove={() => onRemove(row.id)}
              onRetry={() => onRetry(row.id)}
              onDownload={() => onDownload(row.id)}
              onExpand={() => setExpanded((e) => (e === row.id ? null : row.id))}
              expanded={expanded === row.id}
              globalQuality={globalQuality}
              onOverrides={onOverrides}
              t={t}
            />
          </li>
        );
      })}
    </ul>
  );
}

function QueueRowBody({
  active,
  row,
  pct,
  onFocus,
  onRemove,
  onRetry,
  onDownload,
  onExpand,
  expanded,
  globalQuality,
  onOverrides,
  t,
}: {
  active: boolean;
  row: BatchQueueRow;
  pct: number | null;
  onFocus: () => void;
  onRemove: () => void;
  onRetry: () => void;
  onDownload: () => void;
  onExpand: () => void;
  expanded: boolean;
  globalQuality: number;
  onOverrides: (id: string, quality: number) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const statusLabel = {
    queued: t.batchCompress.statusQueued,
    processing: t.batchCompress.statusProcessing,
    done: t.batchCompress.statusDone,
    error: t.batchCompress.statusError,
  }[row.status];

  return (
    <>
      <QueueRowHead row={row} onFocus={onFocus} pct={pct} active={active} statusLabel={statusLabel} t={t} />
      <div className="mt-2 flex flex-wrap gap-2">
        {row.status === "error" ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-lg border border-violet-500/40 px-2 py-1 text-[10px] text-violet-200"
          >
            <RefreshCw className="h-3 w-3" />
            {t.batchCompress.retry}
          </button>
        ) : null}
        {row.status === "done" ? (
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 px-2 py-1 text-[10px] text-emerald-200"
          >
            <Download className="h-3 w-3" />
            {t.common.downloadOne}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onExpand}
          className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-400"
        >
          {t.batchCompress.tuneFile}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto rounded-lg border border-slate-700 p-1 text-slate-500 hover:border-red-500/40"
          aria-label={t.common.remove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {expanded ? (
        <div className="mt-3 border-t border-slate-800 pt-3">
          <label className="block text-xs text-slate-400">
            {t.batchCompress.fileQuality} ({row.overrides?.quality ?? globalQuality}%)
            <input
              type="range"
              min={35}
              max={95}
              defaultValue={row.overrides?.quality ?? globalQuality}
              onChange={(e) => onOverrides(row.id, Number(e.target.value))}
              className="mt-1 w-full accent-violet-500"
            />
          </label>
        </div>
      ) : null}
      {row.errorMessage ? (
        <p className="mt-2 text-xs text-red-300/90">{row.errorMessage}</p>
      ) : null}
    </>
  );
}

function QueueRowHead({
  row,
  onFocus,
  pct,
  active,
  statusLabel,
  t,
}: {
  row: BatchQueueRow;
  onFocus: () => void;
  pct: number | null;
  active: boolean;
  statusLabel: string;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <button
      type="button"
      onClick={onFocus}
      className="flex w-full min-w-0 max-w-full items-start gap-3 text-left"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={row.sourcePreviewUrl} alt="" className="h-full w-full object-cover" />
        {row.status === "processing" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
            <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
          </div>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", active ? "text-emerald-200" : "text-white")}>
          {row.name}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {formatBytes(row.originalSize)}
          {row.result ? (
            <span className="text-emerald-400">
              {" → "}
              {formatBytes(row.result.outputSize)}
              {pct != null ? ` (−${pct}%)` : ""}
            </span>
          ) : null}
        </p>
        <span
          className={cn(
            "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
            row.status === "done" && "bg-emerald-500/15 text-emerald-300",
            row.status === "processing" && "bg-violet-500/15 text-violet-200",
            row.status === "queued" && "bg-slate-700/50 text-slate-400",
            row.status === "error" && "bg-red-500/15 text-red-300",
          )}
        >
          {statusLabel}
        </span>
      </div>
    </button>
  );
}