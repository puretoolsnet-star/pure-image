"use client";

import { ShieldCheck } from "lucide-react";

import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function PrivacyBanner({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "glass-card rounded-2xl border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-slate-900/50 to-violet-500/10 p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
            {t.security.badge}
          </p>
          <p className="mt-1 text-sm font-medium text-white">{t.security.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{t.security.body}</p>
          <ul className="mt-3 space-y-1.5">
            {t.security.points.map((point) => (
              <li key={point} className="flex gap-2 text-xs text-slate-500 sm:text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}