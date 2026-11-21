"use client";

import type { ReactNode } from "react";

import { I18nProvider } from "@/i18n/context";
import type { Lang } from "@/i18n/locales";
import { KixtGtmRouteSync } from "@/components/analytics/KixtGtmRouteSync";
import { HtmlLangSync } from "@/components/i18n/HtmlLangSync";

export function LangShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <I18nProvider initialLang={lang}>
      <HtmlLangSync />
      <KixtGtmRouteSync />
      {children}
    </I18nProvider>
  );
}