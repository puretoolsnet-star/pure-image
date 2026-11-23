"use client";

import { FileImage, Loader2 } from "lucide-react";

export function ToolUploadedFileCard({
  name,
  size,
  thumbSrc,
  statusLabel,
  busy,
}: {
  name: string;
  size: string;
  thumbSrc: string;
  statusLabel: string;
  busy?: boolean;
}) {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-2.5 sm:p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbSrc} alt="" className="h-full w-full object-cover" />
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
            <Loader2 className="h-5 w-5 animate-spin text-violet-300" aria-hidden />
          </div>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-white">
          <FileImage className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
          <span className="truncate">{name}</span>
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          <span className="text-slate-500">{size}</span>
          <span className="mx-1.5 text-slate-600">·</span>
          <span className={busy ? "text-violet-300" : "text-emerald-300/90"}>{statusLabel}</span>
        </p>
      </div>
    </div>
  );
}