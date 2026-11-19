import type { Lang } from "@/i18n/locales";
import { FAQ_BY_LANG } from "@/i18n/seo/faq-catalog";
import { getToolCopy } from "@/i18n/tool-messages";
import type { CategoryId, ToolRouteId } from "@/lib/tools/routes";

export type PageSeoContent = {
  benefitsTitle: string;
  benefitsLead: string;
  benefitPoints: string[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
};

export function getToolSeoContent(routeId: ToolRouteId, lang: Lang): PageSeoContent {
  const category = routeId.split("/")[0] as CategoryId;
  const base = FAQ_BY_LANG[lang][category];
  const tool = getToolCopy(lang, routeId);
  return {
    ...base,
    benefitsLead: `${tool.hint} ${base.benefitsLead}`,
  };
}