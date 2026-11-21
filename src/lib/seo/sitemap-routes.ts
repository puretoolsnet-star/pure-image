import { LANGS } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";
import { absoluteCanonicalUrl } from "@/lib/seo/site";
import { CATEGORIES, TOOL_ROUTE_IDS } from "@/lib/tools/routes";

/**
 * Locale-neutral paths that exist under /[lang]/… (home, category hubs, tools).
 * 1 + 4 categories + 14 tools = 19 paths × 6 langs = 114 sitemap URLs.
 */
export const INDEXABLE_PATHS = [
  "/",
  ...CATEGORIES.map((c) => `/${c}`),
  ...TOOL_ROUTE_IDS.map((id) => `/${id}`),
] as const;

export type IndexablePath = (typeof INDEXABLE_PATHS)[number];

export function localizedIndexableUrls(): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const path of INDEXABLE_PATHS) {
    for (const lang of LANGS) {
      const url = absoluteCanonicalUrl(localizedPath(lang, path));
      if (seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}