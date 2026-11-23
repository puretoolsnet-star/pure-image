"use client";

import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function ToolFileStrip({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; name: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="min-w-0 max-w-full">
      <span className="mb-2 block text-xs text-slate-500">{t.livePreview.selectFile}</span>
      <div className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "max-w-[min(100%,14rem)] shrink-0 truncate rounded-lg border px-3 py-1.5 text-xs",
              item.id === activeId
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-slate-700 text-slate-400 hover:border-violet-500/35",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}