"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useI18n } from "@/i18n/context";
import { getCategoryCopy } from "@/i18n/tool-messages";
import { CATEGORIES } from "@/lib/tools/routes";
import { CATEGORY_ICONS } from "@/lib/tools/icons";
import { PageSeoSection } from "@/components/seo/PageSeoSection";
import { getHomeSeoContent } from "@/i18n/seo/page-content";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";
import { cn } from "@/lib/cn";

export function HomePage() {
  const { lang, t } = useI18n();
  const href = useLocalizedPath();
  const homeSeo = getHomeSeoContent(lang);

  return (
    <div className="pureimage-page-shell flex min-h-dvh flex-col bg-slate-950">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              img.kixt.net
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-emerald-300 to-violet-300 bg-clip-text text-transparent">
                {t.home.heroTitle}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              {t.home.heroSubtitle}
            </p>
            <PrivacyBanner className="mt-8" />
            <h2 className="mt-12 text-lg font-semibold text-white">{t.home.toolsHeading}</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {CATEGORIES.map((categoryId) => {
                const Icon = CATEGORY_ICONS[categoryId];
                const copy = getCategoryCopy(lang, categoryId);
                return (
                  <li key={categoryId}>
                    <Link
                      href={href(`/${categoryId}`)}
                      className={cn(
                        "glass-card group flex h-full flex-col rounded-2xl border border-slate-800 p-6 transition",
                        "hover:border-emerald-500/35 hover:shadow-lg hover:shadow-emerald-950/15",
                      )}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-violet-500/25">
                        <Icon className="h-5 w-5 text-emerald-400" aria-hidden />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white">{copy.hubTitle}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{copy.hubLead}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-300 group-hover:text-emerald-300">
                        {t.home.openTool}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <PageSeoSection content={homeSeo} />
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}