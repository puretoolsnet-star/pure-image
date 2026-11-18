import type { MetadataRoute } from "next";

import { absoluteCanonicalUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteCanonicalUrl("/sitemap.xml"),
    host: "https://img.kixt.net",
  };
}