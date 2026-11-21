"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/i18n/context";
import type { Dictionary } from "@/i18n/types";
import type { Lang } from "@/i18n/locales";
import {
  ECOSYSTEM_PROJECTS,
  ecosystemHref,
  isCurrentEcosystemProject,
  kixtHubHref,
} from "@/lib/ecosystem";
import { cn } from "@/lib/cn";

export function SiteFooter({ className }: { className?: string }) {
  const { t, lang } = useI18n();

  return (
    <footer
      className={cn(
        "mt-auto border-t border-slate-800/80 bg-slate-950/90 py-8",
        className,
      )}
      aria-label={t.footer.networkAria}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <EcosystemFooterStrip
          title={t.footer.ecosystemTitle}
          lead={t.footer.ecosystemLead}
          hubLabel={t.footer.kixtHub}
          hubHref={kixtHubHref(lang)}
          lang={lang}
          t={t}
        />
        <p className="mt-6 text-center text-[11px] text-slate-600">
          {t.brand.name} · {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}

function EcosystemFooterStrip({
  title,
  lead,
  hubLabel,
  hubHref,
  lang,
  t,
}: {
  title: string;
  lead: string;
  hubLabel: string;
  hubHref: string;
  lang: Lang;
  t: Dictionary;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">{lead}</p>
      <ul className="mt-4 flex flex-wrap gap-2" role="list">
        {ECOSYSTEM_PROJECTS.map((project) => {
          const copy = t.ecosystem.items[project.id];
          const isCurrent = isCurrentEcosystemProject(project.id);
          const href = ecosystemHref(project, lang);
          const pillClass = cn(
            "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            isCurrent
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : href
                ? "border-slate-700 text-slate-300 hover:border-violet-500/40 hover:text-violet-200"
                : "cursor-default border-slate-800 text-slate-500 opacity-60",
          );

          const label = (
            <>
              <span className="truncate">{copy.name}</span>
              {isCurrent ? (
                <span className="shrink-0 text-[10px] uppercase text-emerald-400">
                  {t.ecosystem.currentShort}
                </span>
              ) : href && project.external ? (
                <ExternalLink className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
              ) : null}
            </>
          );

          return (
            <li key={project.id}>
              {href && project.external ? (
                <a
                  href={href}
                  rel="noopener noreferrer"
                  className={pillClass}
                  title={copy.tagline}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {label}
                </a>
              ) : href ? (
                <Link href={href} className={pillClass} title={copy.tagline} aria-current="page">
                  {label}
                </Link>
              ) : (
                <span className={pillClass}>{label}</span>
              )}
            </li>
          );
        })}
        <li>
          <a
            href={hubHref}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 hover:border-violet-400/50"
          >
            {hubLabel}
            <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
          </a>
        </li>
      </ul>
    </section>
  );
}