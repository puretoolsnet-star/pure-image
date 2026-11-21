import { notFound } from "next/navigation";

import { LANGS } from "@/i18n/locales";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLang, type Lang } from "@/i18n/locales";
import { buildToolRouteMetadata } from "@/lib/seo/metadata";
import { buildToolJsonLd } from "@/lib/seo/structured-data";
import { ToolPageLoader } from "@/components/tools/ToolPageLoader";
import { routeFromSegments, TOOLS_BY_CATEGORY } from "@/lib/tools/routes";

type PageProps = {
  params: Promise<{ lang: string; category: string; subtool: string }>;
};

export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
  Object.entries(TOOLS_BY_CATEGORY).flatMap(([category, tools]) =>
      tools.map((subtool) => ({ lang, category, subtool })),
    ),
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { lang: raw, category, subtool } = await params;
  if (!isLang(raw)) return {};
  const routeId = routeFromSegments(category, subtool);
  if (!routeId) return {};
  return buildToolRouteMetadata(routeId, raw);
}

export default async function SubtoolPage({ params }: PageProps) {
  const { lang: raw, category, subtool } = await params;
  const routeId = routeFromSegments(category, subtool);
  if (!routeId) notFound();
  const lang: Lang = isLang(raw) ? raw : "en";
  return (
    <>
      <JsonLd data={buildToolJsonLd(routeId, lang)} />
      <ToolPageLoader routeId={routeId} />
    </>
  );
}