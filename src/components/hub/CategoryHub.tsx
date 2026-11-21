"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { useI18n } from "@/i18n/context";
import { getCategoryCopy, getToolCopy } from "@/i18n/tool-messages";
import {
  TOOLS_BY_CATEGORY,
  type CategoryId,
  type ToolRouteId,
  toolPath,
} from "@/lib/tools/routes";
import { CATEGORY_ICONS, TOOL_ICONS } from "@/lib/tools/icons";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";
import { cn } from "@/lib/cn";

export function CategoryHub({ categoryId }: { categoryId: CategoryId }) {
  const { lang, t } = useI18n();
  const href = useLocalizedPath();
  const hub = getCategoryCopy(lang, categoryId);
  const Icon = CATEGORY_ICONS[categoryId];
  const subtools = TOOLS_BY_CATEGORY[categoryId];

  return (
    <div className="pureimage-page-shell flex min-h-dvh flex-col bg-slate-950 text-slate-100">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <header className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/35">
                <Icon className="h-6 w-6 text-violet-300" aria-hidden />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">{hub.hubTitle}</h1>
                <p className="mt-2 text-slate-400">{hub.hubLead}</p>
              </div>
            </header>
            <PrivacyBanner className="mt-6" />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subtools.map((sub) => {
                const routeId = `${categoryId}/${sub}` as ToolRouteId;
                const copy = getToolCopy(lang, routeId);
                const SubIcon = TOOL_ICONS[routeId];
                return (
                  <ToolCard
                    key={routeId}
                    href={href(toolPath(routeId))}
                    icon={SubIcon}
                    title={copy.cardTitle}
                    description={copy.cardDescription}
                    cta={t.home.openTool}
                  />
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ToolCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "glass-card group flex h-full flex-col rounded-2xl border border-slate-800 p-5 transition",
          "hover:border-emerald-500/35 hover:shadow-lg hover:shadow-emerald-950/15",
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-violet-500/20">
          <Icon className="h-5 w-5 text-emerald-400" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 flex-1 text-sm text-slate-400">{description}</p>
        <span className="mt-4 text-sm font-medium text-violet-300 group-hover:text-emerald-300">{cta}</span>
      </Link>
    </li>
  );
}