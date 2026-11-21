import type { Lang } from "@/i18n/locales";
import { CATEGORY_SEO_BY_LANG } from "@/i18n/seo/faq-catalog";
import { buildToolPageSeo } from "@/i18n/seo/tool-page-seo";
import { getCategoryCopy } from "@/i18n/tool-messages";
import type { CategoryId, ToolRouteId } from "@/lib/tools/routes";

export type PageSeoContent = {
  benefitsTitle: string;
  benefitsLead: string;
  benefitPoints: string[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
};

export function getToolSeoContent(routeId: ToolRouteId, lang: Lang): PageSeoContent {
  return buildToolPageSeo(routeId, lang);
}

export function getCategorySeoContent(categoryId: CategoryId, lang: Lang): PageSeoContent {
  const base = CATEGORY_SEO_BY_LANG[lang][categoryId];
  const hub = getCategoryCopy(lang, categoryId);
  return {
    ...base,
    benefitsLead: `${hub.hubLead} ${base.benefitsLead}`,
  };
}