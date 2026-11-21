import { LANGS } from "@/i18n/locales";
import type { Lang } from "@/i18n/locales";
import { pathForPage } from "@/i18n/seo/copy";
import { getMetadataCopy } from "@/i18n/seo/metadata-catalog";
import { getCategorySeoContent, getToolSeoContent, type PageSeoContent } from "@/i18n/seo/page-content";
import type { PageId } from "@/i18n/types";
import { localizedPath } from "@/lib/i18n/routing";
import {
  absoluteCanonicalUrl,
  DEFAULT_LANG,
  HREFLANG_MAP,
} from "@/lib/seo/site";
import { CATEGORIES, TOOL_ROUTE_IDS, type CategoryId, type ToolRouteId } from "@/lib/tools/routes";

export function buildSitemapLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of LANGS) {
    languages[HREFLANG_MAP[lang]] = absoluteCanonicalUrl(localizedPath(lang, path));
  }
  languages["x-default"] = absoluteCanonicalUrl(localizedPath(DEFAULT_LANG, path));
  return languages;
}

function pageIdFromString(page: string): PageId | null {
  if (page === "home") return "home";
  if ((CATEGORIES as readonly string[]).includes(page)) return page as CategoryId;
  if ((TOOL_ROUTE_IDS as readonly string[]).includes(page)) return page as ToolRouteId;
  return null;
}

function faqPage(content: PageSeoContent): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: content.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function webApplication(page: PageId, lang: Lang): Record<string, unknown> {
  const copy = getMetadataCopy(page, lang);
  const path = pathForPage(page);
  const url = absoluteCanonicalUrl(localizedPath(lang, path));
  return {
    "@type": "WebApplication",
  "@id": `${url}#app`,
    name: copy.title.split("|")[0]?.trim() ?? copy.title,
    description: copy.description,
    url,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Client-side image processing only.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    inLanguage: HREFLANG_MAP[lang],
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: "Pure Image", url: "https://img.kixt.net" },
  };
}

function breadcrumb(page: PageId, lang: Lang): Record<string, unknown> | null {
  if (page === "home") return null;
  const items: { name: string; path: string }[] = [{ name: "Pure Image", path: "/" }];
  const parts = page.split("/");
  if (parts.length === 1) {
    items.push({ name: parts[0], path: `/${parts[0]}` });
  } else {
    items.push({ name: parts[0], path: `/${parts[0]}` });
    items.push({ name: parts.join("/"), path: `/${page}` });
  }
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteCanonicalUrl(localizedPath(lang, item.path)),
    })),
  };
}

export function buildPageJsonLd(page: PageId, lang: Lang): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [webApplication(page, lang)];
  const crumb = breadcrumb(page, lang);
  if (crumb) graph.push(crumb);

  let content: PageSeoContent | null = null;
  if (page === "home") {
    content = null;
  } else if ((CATEGORIES as readonly string[]).includes(page)) {
    content = getCategorySeoContent(page as CategoryId, lang);
  } else if ((TOOL_ROUTE_IDS as readonly string[]).includes(page)) {
    content = getToolSeoContent(page as ToolRouteId, lang);
  }
  if (content && content.faqs.length > 0) graph.push(faqPage(content));

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function buildHomeJsonLd(lang: Lang): Record<string, unknown> {
  return buildPageJsonLd("home", lang);
}

export function buildCategoryJsonLd(categoryId: CategoryId, lang: Lang): Record<string, unknown> {
  return buildPageJsonLd(categoryId, lang);
}

export function buildToolJsonLd(routeId: ToolRouteId, lang: Lang): Record<string, unknown> {
  return buildPageJsonLd(routeId, lang);
}

export function parsePageIdForJsonLd(slug: string): PageId | null {
  return pageIdFromString(slug);
}