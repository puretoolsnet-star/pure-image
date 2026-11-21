"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";

export function BatchStatsPanel({
  total,
  done,
  original,
  output,
  saved,
  pct,
  queued,
  processing,
  errors,
  progress,
}: {
  total: number;
  done: number;
  original: number;
  output: number;
  saved: number;
  pct: number;
  queued: number;
  processing: number;
  errors: number;
  progress: number;
}) {
  const { t } = useI18n();
  if (!total) return null;

  return (
    <div className="glass-card rounded-2xl border-violet-500/15 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{t.batchCompress.statsTitle}</h3>
        <span className="text-xs text-slate-400">
          {t.batchCompress.fileCount(done, total)}
        </span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-violet-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mb-3 text-xs text-slate-500">
        {t.batchCompress.statusLine(queued, processing, done, errors)}
      </p>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Stat label={t.batchCompress.sumBefore} value={formatBytes(original)} />
        <Stat label={t.batchCompress.sumAfter} value={formatBytes(output)} />
        <Stat label={t.batchCompress.sumSaved} value={formatBytes(saved)} accent />
        <Stat label={t.batchCompress.avgReduction} value={`${pct}%`} />
      </dl>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`mt-0.5 font-medium tabular-nums ${accent ? "text-emerald-400" : "text-slate-200"}`}
      >
        {value}
      </dd>
    </div>
  );
}