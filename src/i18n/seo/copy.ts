import type { Lang } from "@/i18n/locales";
import { getMetadataCopy } from "@/i18n/seo/metadata-catalog";
import type { PageId } from "@/i18n/types";

export type SeoCopy = {
  title: string;
  description: string;
  keywords: string[];
};

export function getSeoCopy(page: PageId, lang: Lang): SeoCopy {
  return getMetadataCopy(page, lang);
}

export function pathForPage(page: PageId): string {
  if (page === "home") return "/";
  return `/${page}`;
}