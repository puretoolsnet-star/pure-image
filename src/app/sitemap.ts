import type { MetadataRoute } from "next";

import { LANGS } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";
import { buildSitemapLanguageAlternates } from "@/lib/seo/structured-data";
import { absoluteCanonicalUrl } from "@/lib/seo/site";
import { CATEGORIES, TOOL_ROUTE_IDS } from "@/lib/tools/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const paths = ["/", ...CATEGORIES.map((c) => `/${c}`), ...TOOL_ROUTE_IDS.map((id) => `/${id}`)];

  for (const path of paths) {
    for (const lang of LANGS) {
      entries.push({
        url: absoluteCanonicalUrl(localizedPath(lang, path)),
        lastModified,
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path.split("/").length > 2 ? 0.85 : 0.92,
        alternates: { languages: buildSitemapLanguageAlternates(path) },
      });
    }
  }

  return entries;
}