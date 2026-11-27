import type { Metadata } from "next";

import type { Lang } from "@/i18n/locales";
import { LANGS } from "@/i18n/locales";
import type { PageId } from "@/i18n/types";
import type { CategoryId, ToolRouteId } from "@/lib/tools/routes";
import { getSeoCopy, pathForPage } from "@/i18n/seo/copy";
import { localizedPath } from "@/lib/i18n/routing";
import {
  absoluteCanonicalUrl,
  CANONICAL_SITE_ORIGIN,
  DEFAULT_LANG,
  HREFLANG_MAP,
  OPEN_GRAPH_LOCALE,
} from "@/lib/seo/site";

function languageAlternates(page: PageId): Record<string, string> {
  const path = pathForPage(page);
  const languages: Record<string, string> = {};
  for (const lang of LANGS) {
    languages[HREFLANG_MAP[lang]] = absoluteCanonicalUrl(localizedPath(lang, path));
  }
  languages["x-default"] = absoluteCanonicalUrl(localizedPath(DEFAULT_LANG, path));
  return languages;
}

export function buildPageMetadata(page: PageId, lang: Lang): Metadata {
  const copy = getSeoCopy(page, lang);
  const path = pathForPage(page);
  const canonical = absoluteCanonicalUrl(localizedPath(lang, path));

  return {
    title: { absolute: copy.title },
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical,
      languages: languageAlternates(page),
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: copy.title,
      description: copy.description,
      siteName: "Pure Image",
      locale: OPEN_GRAPH_LOCALE[lang],
      alternateLocale: LANGS.filter((item) => item !== lang).map((item) => OPEN_GRAPH_LOCALE[item]),
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
    robots: { index: true, follow: true },
  };
}

export function buildToolRouteMetadata(routeId: ToolRouteId, lang: Lang): Metadata {
  return buildPageMetadata(routeId, lang);
}

export function buildCategoryMetadata(categoryId: CategoryId, lang: Lang): Metadata {
  return buildPageMetadata(categoryId, lang);
}

export function siteMetadataBase(): Metadata {
  return {
    metadataBase: new URL(CANONICAL_SITE_ORIGIN),
    applicationName: "Pure Image",
    title: {
      default: "Pure Image",
      template: "%s | Pure Image",
    },
    formatDetection: { email: false, address: false, telephone: false },
  };
}