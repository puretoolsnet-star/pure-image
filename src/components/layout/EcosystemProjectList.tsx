"use client";

import {
  FileSpreadsheet,
  FileText,
  ImageIcon,
  PenLine,
  QrCode,
} from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/i18n/context";
import {
  CURRENT_ECOSYSTEM_PROJECT_ID,
  ECOSYSTEM_PROJECTS,
  ecosystemHref,
  isCurrentEcosystemProject,
  type EcosystemProjectId,
} from "@/lib/ecosystem";
import { cn } from "@/lib/cn";

const PROJECT_ICONS: Record<EcosystemProjectId, typeof ImageIcon> = {
  purepdf: FileText,
  pureQr: QrCode,
  pureTable: FileSpreadsheet,
  pureSign: PenLine,
  pureImage: ImageIcon,
};

type EcosystemProjectListProps = {
  onNavigate?: () => void;
  className?: string;
  cardsGrid?: "responsive" | "two-columns";
};

export function EcosystemProjectList({
  onNavigate,
  className,
  cardsGrid = "responsive",
}: EcosystemProjectListProps) {
  const { t, lang } = useI18n();

  return (
    <ul
      role="menu"
      className={cn(
        "grid gap-2 sm:gap-3",
        cardsGrid === "two-columns" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
        className,
      )}
    >
      {ECOSYSTEM_PROJECTS.map((project) => {
        const copy = t.ecosystem.items[project.id];
        const Icon = PROJECT_ICONS[project.id];
        const isActive = project.status === "active";
        const isCurrent = isCurrentEcosystemProject(project.id);
        const href = ecosystemHref(project, lang);
        const badgeLabel = isCurrent
          ? t.ecosystem.current
          : isActive
            ? t.ecosystem.openSite
            : t.ecosystem.comingSoon;

        const cardClass = cn(
          "glass-card flex h-full min-w-0 flex-col gap-2 rounded-xl border border-slate-800 p-3 transition-colors hover:border-violet-500/35 sm:gap-3 sm:p-4",
          isCurrent
            ? "bg-emerald-500/15 ring-1 ring-emerald-400/40"
            : isActive
              ? "bg-violet-500/10 ring-1 ring-violet-500/25"
              : "bg-slate-900/40",
        );

        const inner = (
          <>
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/10",
                  isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-300",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <span
                className={cn(
                  "max-w-[9.5rem] shrink rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  isCurrent
                    ? "border border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                    : isActive
                      ? "border border-violet-400/35 bg-violet-500/15 text-violet-200"
                      : "border border-amber-500/30 bg-amber-500/10 text-amber-200/90",
                )}
              >
                {badgeLabel}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">{copy.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{copy.tagline}</p>
            </div>
          </>
        );

        return (
          <li key={project.id} role="none" className="min-w-0">
            {href && project.external ? (
              <a
                role="menuitem"
                href={href}
                rel="noopener noreferrer"
                className={cardClass}
                onClick={onNavigate}
              >
                {inner}
              </a>
            ) : href ? (
              <Link
                role="menuitem"
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={cardClass}
                onClick={onNavigate}
              >
                {inner}
              </Link>
            ) : (
              <div role="menuitem" aria-disabled className={cn(cardClass, "cursor-default opacity-60")}>
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}