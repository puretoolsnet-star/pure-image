"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useI18n } from "@/i18n/context";
import { kixtPageContext, pushKixtDataLayer } from "@/lib/analytics/kixt-gtm";
import { stripLangPrefix } from "@/lib/i18n/routing";

/** Keeps GTM dataLayer in sync with locale routes (/en, /uk, …). */
export function KixtGtmRouteSync() {
  const pathname = usePathname() ?? "/";
  const { lang } = useI18n();

  useEffect(() => {
    const pageRoute = stripLangPrefix(pathname);
    pushKixtDataLayer(kixtPageContext(lang, pathname, pageRoute));
  }, [lang, pathname]);

  return null;
}