"use client";

import { useEffect, useMemo } from "react";

import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";

export function PdfLivePreview({ files }: { files: File[] }) {
  const { t } = useI18n();
  const pages = useMemo(
    () =>
      files.map((file, i) => ({
        id: `${file.name}-${i}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      pages.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [pages]);

  if (!pages.length) return null;

  const total = pages.reduce((sum, p) => sum + p.size, 0);

  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-slate-500">
        {t.livePreview.liveHint} {t.toolUi.pdfPageCount(pages.length, formatBytes(total))}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {pages.map((page, index) => (
          <li key={page.id} className="glass-card overflow-hidden rounded-xl border border-slate-800/80">
            <div className="relative aspect-[3/4] bg-slate-900/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={page.url} alt="" className="h-full w-full object-contain" />
              <span className="absolute left-2 top-2 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] text-violet-300">
                {index + 1}
              </span>
            </div>
            <p className="truncate p-2 text-[11px] text-slate-400">{page.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}