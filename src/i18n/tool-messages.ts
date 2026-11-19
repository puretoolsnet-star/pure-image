import type { Lang } from "@/i18n/locales";
import { CATEGORY_CATALOG, TOOL_CATALOG } from "@/i18n/tools/l10n-catalog";
import type { CategoryId } from "@/lib/tools/routes";
import { TOOL_ROUTE_IDS, type ToolRouteId } from "@/lib/tools/routes";

export type ToolPageCopy = {
  title: string;
  description: string;
  hint: string;
  cardTitle: string;
  cardDescription: string;
};

export type CategoryHubCopy = {
  title: string;
  description: string;
  hubTitle: string;
  hubLead: string;
};

export function getToolCopy(lang: Lang, routeId: ToolRouteId): ToolPageCopy {
  return TOOL_CATALOG[lang][routeId];
}

export function getCategoryCopy(lang: Lang, categoryId: CategoryId): CategoryHubCopy {
  return CATEGORY_CATALOG[lang][categoryId];
}

export function getAllToolCopies(lang: Lang): Record<ToolRouteId, ToolPageCopy> {
  return { ...TOOL_CATALOG[lang] };
}

export function getAllCategoryCopies(lang: Lang): Record<CategoryId, CategoryHubCopy> {
  return { ...CATEGORY_CATALOG[lang] };
}

export const TOOL_ROUTE_LIST = TOOL_ROUTE_IDS;