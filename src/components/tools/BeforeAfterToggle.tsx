"use client";

import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export type CompareMode = "after" | "before" | "split";

export function BeforeAfterToggle({
  mode,
  onChange,
}: {
  mode: CompareMode;
  onChange: (mode: CompareMode) => void;
}) {
  const { t } = useI18n();
  const modes: { id: CompareMode; label: string }[] = [
    { id: "before", label: t.livePreview.before },
    { id: "split", label: t.livePreview.beforeAfter },
    { id: "after", label: t.livePreview.after },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-slate-500">{t.livePreview.compare}:</span>
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition",
            mode === m.id
              ? "bg-violet-600 text-white"
              : "border border-slate-700 text-slate-400 hover:border-violet-500/40",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}