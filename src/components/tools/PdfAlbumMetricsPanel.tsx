"use client";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import type { PdfPageSize } from "@/lib/image/pdf-album";
import { cn } from "@/lib/cn";

export function PdfAlbumMetricsPanel({
  pageCount,
  inputBytes,
  outputBytes,
  processingMs,
  pageSize,
  busy,
}: {
  pageCount: number;
  inputBytes: number;
  outputBytes: number | null;
  processingMs: number | null;
  pageSize: PdfPageSize;
  busy?: boolean;
}) {
  const { t } = useI18n();
  const pct =
    outputBytes != null && inputBytes > 0
      ? Math.round(((outputBytes - inputBytes) / inputBytes) * 100)
      : null;

  return (
    <div className="glass-card rounded-2xl border-violet-500/15 p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{t.pdfAlbumTool.metricsTitle}</h3>
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-5">
        <Cell label={t.pdfAlbumTool.pageCount} value={String(pageCount)} accent="emerald" />
        <Cell label={t.pdfAlbumTool.inputWeight} value={formatBytes(inputBytes)} />
        <Cell
          label={t.pdfAlbumTool.outputWeight}
          value={outputBytes != null ? formatBytes(outputBytes) : "—"}
          pulse={busy}
        />
        <Cell
          label={t.pdfAlbumTool.sizeChange}
          value={pct != null ? `${pct >= 0 ? "+" : ""}${pct}%` : "—"}
          accent={pct != null && pct <= 0 ? "emerald" : "amber"}
        />
        <Cell
          label={t.pdfAlbumTool.processTime}
          value={processingMs != null ? `${processingMs} ms` : "—"}
        />
        <Cell label={t.pdfAlbumTool.pageFormatLabel} value={pageSize.toUpperCase()} />
      </dl>
    </div>
  );
}

function Cell({
  label,
  value,
  accent,
  pulse,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "amber";
  pulse?: boolean;
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium tabular-nums text-slate-200",
          accent === "emerald" && "text-emerald-400",
          accent === "amber" && "text-amber-300",
          pulse && "animate-pulse",
        )}
      >
        {value}
      </dd>
    </div>
  );
}