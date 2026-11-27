import { LANGS } from "@/i18n/locales";
import type { Lang } from "@/i18n/locales";
import { pathForPage } from "@/i18n/seo/copy";
import { getMetadataCopy } from "@/i18n/seo/metadata-catalog";
import {
  getCategorySeoContent,
  getHomeSeoContent,
  getToolSeoContent,
  type PageSeoContent,
} from "@/i18n/seo/page-content";
import type { PageId } from "@/i18n/types";
import { getCategoryCopy, getToolCopy } from "@/i18n/tool-messages";
import { localizedPath } from "@/lib/i18n/routing";
import {
  absoluteCanonicalUrl,
  CANONICAL_SITE_ORIGIN,
  DEFAULT_LANG,
  HREFLANG_MAP,
} from "@/lib/seo/site";
import {
  CATEGORIES,
  TOOL_ROUTE_IDS,
  TOOLS_BY_CATEGORY,
  toolPath,
  type CategoryId,
  type ToolRouteId,
} from "@/lib/tools/routes";

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

function webSite(lang: Lang): Record<string, unknown> {
  const url = absoluteCanonicalUrl(localizedPath(lang, "/"));
  return {
    "@type": "WebSite",
    "@id": `${CANONICAL_SITE_ORIGIN}/#website`,
    name: "Pure Image",
    url: CANONICAL_SITE_ORIGIN,
    description: getMetadataCopy("home", lang).description,
    inLanguage: HREFLANG_MAP[lang],
    publisher: {
      "@type": "Organization",
      name: "kixt.net",
      url: "https://kixt.net",
    },
    potentialAction: {
      "@type": "ReadAction",
      target: url,
    },
  };
}

function softwareApplication(page: PageId, lang: Lang): Record<string, unknown> {
  const copy = getMetadataCopy(page, lang);
  const path = pathForPage(page);
  const url = absoluteCanonicalUrl(localizedPath(lang, path));
  return {
    "@type": "SoftwareApplication",
    "@id": `${url}#app`,
    name: copy.title.split("|")[0]?.trim() ?? copy.title,
    description: copy.description,
    url,
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "ImageEditor",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Client-side image processing only.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    inLanguage: HREFLANG_MAP[lang],
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: "Pure Image", url: CANONICAL_SITE_ORIGIN },
  };
}

function breadcrumb(page: PageId, lang: Lang): Record<string, unknown> | null {
  if (page === "home") return null;

  const items: { name: string; path: string }[] = [{ name: "Pure Image", path: "/" }];

  if ((CATEGORIES as readonly string[]).includes(page)) {
    const categoryId = page as CategoryId;
    items.push({
      name: getCategoryCopy(lang, categoryId).hubTitle,
      path: `/${categoryId}`,
    });
  } else if ((TOOL_ROUTE_IDS as readonly string[]).includes(page)) {
    const routeId = page as ToolRouteId;
    const [categoryId] = routeId.split("/") as [CategoryId, string];
    items.push({
      name: getCategoryCopy(lang, categoryId).hubTitle,
      path: `/${categoryId}`,
    });
    items.push({
      name: getToolCopy(lang, routeId).title,
      path: `/${routeId}`,
    });
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

function categoryToolItemList(categoryId: CategoryId, lang: Lang): Record<string, unknown> {
  const tools = TOOLS_BY_CATEGORY[categoryId];
  return {
    "@type": "ItemList",
    name: getCategoryCopy(lang, categoryId).hubTitle,
    numberOfItems: tools.length,
    itemListElement: tools.map((sub, index) => {
      const routeId = `${categoryId}/${sub}` as ToolRouteId;
      const path = toolPath(routeId);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: getToolCopy(lang, routeId).cardTitle,
        url: absoluteCanonicalUrl(localizedPath(lang, path)),
      };
    }),
  };
}

function homeCategoryItemList(lang: Lang): Record<string, unknown> {
  return {
    "@type": "ItemList",
    name: "Pure Image tool categories",
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((categoryId, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: getCategoryCopy(lang, categoryId).hubTitle,
      url: absoluteCanonicalUrl(localizedPath(lang, `/${categoryId}`)),
    })),
  };
}

export function buildPageJsonLd(page: PageId, lang: Lang): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [];

  if (page === "home") {
    graph.push(webSite(lang));
    graph.push(homeCategoryItemList(lang));
  }

  graph.push(softwareApplication(page, lang));

  const crumb = breadcrumb(page, lang);
  if (crumb) graph.push(crumb);

  if ((CATEGORIES as readonly string[]).includes(page)) {
    graph.push(categoryToolItemList(page as CategoryId, lang));
  }

  let content: PageSeoContent | null = null;
  if (page === "home") {
    content = getHomeSeoContent(lang);
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