"use client";

import { Loader2 } from "lucide-react";

export function ToolSinglePreview({ src, label, busy }: { src: string; label: string; busy?: boolean }) {
  return (
    <div className="relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 sm:aspect-video">
      {busy ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/45">
          <Loader2 className="h-8 w-8 animate-spin text-violet-300" aria-hidden />
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" />
      <span className="absolute bottom-2 left-2 rounded bg-slate-950/75 px-2 py-0.5 text-[10px] text-slate-300">
        {label}
      </span>
    </div>
  );
}