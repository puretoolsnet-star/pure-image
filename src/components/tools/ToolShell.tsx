"use client";

import { ArrowLeft, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AdBanner } from "@/components/ads/AdBanner";
import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageSeoSection } from "@/components/seo/PageSeoSection";
import { useI18n } from "@/i18n/context";
import { getCategoryCopy, getToolCopy } from "@/i18n/tool-messages";
import { getToolSeoContent } from "@/i18n/seo/page-content";
import type { CategoryId, ToolRouteId } from "@/lib/tools/routes";
import { categoryPath } from "@/lib/tools/routes";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";

export function ToolShell({
  routeId,
  categoryId,
  icon: Icon,
  children,
}: {
  routeId: ToolRouteId;
  categoryId: CategoryId;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const { lang } = useI18n();
  const href = useLocalizedPath();
  const copy = getToolCopy(lang, routeId);
  const category = getCategoryCopy(lang, categoryId);
  const seoContent = getToolSeoContent(routeId, lang);

  return (
    <div className="pureimage-page-shell relative flex min-h-dvh flex-col bg-slate-950 text-slate-100">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Link
          href={href(categoryPath(categoryId))}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {category.hubTitle}
        </Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="min-w-0 space-y-6">
            <PrivacyBanner />
            <header className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/35">
                <Icon className="h-6 w-6 text-emerald-400" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.title}</h1>
                <p className="mt-2 text-sm text-slate-400 sm:text-base">{copy.description}</p>
                <p className="mt-2 text-sm text-violet-300/80">{copy.hint}</p>
              </div>
            </header>
            <main className="pb-16">{children}</main>
            <PageSeoSection content={seoContent} />
          </div>
          <AdBanner className="sticky top-24" />
        </div>
        <div className="mt-8 hidden pb-10 md:block">
          <AdBanner />
        </div>
      </div>
    </div>
  );
}