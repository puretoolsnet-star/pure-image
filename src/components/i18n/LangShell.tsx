"use client";

import type { ReactNode } from "react";

import { I18nProvider } from "@/i18n/context";
import type { Lang } from "@/i18n/locales";
import { HtmlLangSync } from "@/components/i18n/HtmlLangSync";

export function LangShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <I18nProvider initialLang={lang}>
      <HtmlLangSync />
      {children}
    </I18nProvider>
  );
}