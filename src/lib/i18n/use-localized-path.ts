"use client";

import { useCallback } from "react";

import type { Lang } from "@/i18n/locales";
import { useI18n } from "@/i18n/context";
import { localizedPath } from "@/lib/i18n/routing";

export function useLocalizedPath(langOverride?: Lang) {
  const { lang } = useI18n();
  const active = langOverride ?? lang;
  return useCallback((path: string) => localizedPath(active, path), [active]);
}