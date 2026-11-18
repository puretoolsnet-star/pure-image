export const CATEGORIES = ["compress", "convert", "edit", "doc"] as const;
export type CategoryId = (typeof CATEGORIES)[number];

export const TOOLS_BY_CATEGORY = {
  compress: ["smart", "to-size", "batch"] as const,
  convert: ["to-webp", "to-avif", "heic-to-jpg", "png-jpg", "svg-to-img"] as const,
  edit: ["resize", "presets", "crop", "rotate"] as const,
  doc: ["enhance-scan", "images-to-pdf"] as const,
} as const;

export type CompressToolId = (typeof TOOLS_BY_CATEGORY.compress)[number];
export type ConvertToolId = (typeof TOOLS_BY_CATEGORY.convert)[number];
export type EditToolId = (typeof TOOLS_BY_CATEGORY.edit)[number];
export type DocToolId = (typeof TOOLS_BY_CATEGORY.doc)[number];

export type SubtoolId<C extends CategoryId = CategoryId> = (typeof TOOLS_BY_CATEGORY)[C][number];

export type ToolRouteId =
  | `compress/${CompressToolId}`
  | `convert/${ConvertToolId}`
  | `edit/${EditToolId}`
  | `doc/${DocToolId}`;

export const TOOL_ROUTE_IDS = CATEGORIES.flatMap((category) =>
  TOOLS_BY_CATEGORY[category].map((sub) => `${category}/${sub}` as ToolRouteId),
);

export const CATEGORY_HUB_PATHS = CATEGORIES.map((c) => `/${c}` as const);

export const LEGACY_REDIRECTS: Record<string, string> = {
  "/resize": "/edit/resize",
};

export function toolPath(routeId: ToolRouteId): string {
  return `/${routeId}`;
}

export function categoryPath(category: CategoryId): string {
  return `/${category}`;
}

export function parseToolRoute(routeId: string): ToolRouteId | null {
  if ((TOOL_ROUTE_IDS as string[]).includes(routeId)) return routeId as ToolRouteId;
  return null;
}

export function routeFromSegments(category: string, subtool: string): ToolRouteId | null {
  if (!(CATEGORIES as readonly string[]).includes(category)) return null;
  const list = TOOLS_BY_CATEGORY[category as CategoryId];
  if (!(list as readonly string[]).includes(subtool)) return null;
  return parseToolRoute(`${category}/${subtool}`);
}