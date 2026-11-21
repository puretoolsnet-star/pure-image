import type { MetadataRoute } from "next";

import { LANGS } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";
import { buildSitemapLanguageAlternates } from "@/lib/seo/structured-data";
import { INDEXABLE_PATHS } from "@/lib/seo/sitemap-routes";
import { absoluteCanonicalUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of INDEXABLE_PATHS) {
    for (const lang of LANGS) {
      const url = absoluteCanonicalUrl(localizedPath(lang, path));
      if (seen.has(url)) continue;
      seen.add(url);

      const segments = path === "/" ? [] : path.split("/").filter(Boolean);
      const isHome = path === "/";
      const isTool = segments.length >= 2;

      entries.push({
        url,
        lastModified,
        changeFrequency: isHome ? "weekly" : "monthly",
        priority: isHome ? 1 : isTool ? 0.85 : 0.92,
        alternates: { languages: buildSitemapLanguageAlternates(path) },
      });
    }
  }

  return entries;
}