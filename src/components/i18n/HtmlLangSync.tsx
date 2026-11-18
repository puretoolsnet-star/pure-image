"use client";

import { useI18n } from "@/i18n/context";

export function HtmlLangSync() {
  const { lang } = useI18n();
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang === "uk" ? "uk" : lang;
  }
  return null;
}