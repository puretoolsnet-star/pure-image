import { notFound } from "next/navigation";

import { CategoryHub } from "@/components/hub/CategoryHub";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLang, LANGS, type Lang } from "@/i18n/locales";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import { buildCategoryJsonLd } from "@/lib/seo/structured-data";
import { CATEGORIES, type CategoryId } from "@/lib/tools/routes";

type PageProps = {
  params: Promise<{ lang: string; category: string }>;
};

export function generateStaticParams() {
  return LANGS.flatMap((lang) => CATEGORIES.map((category) => ({ lang, category })));
}

export async function generateMetadata({ params }: PageProps) {
  const { lang: raw, category } = await params;
  if (!isLang(raw) || !(CATEGORIES as readonly string[]).includes(category)) return {};
  return buildCategoryMetadata(category as CategoryId, raw);
}

export default async function CategoryPage({ params }: PageProps) {
  const { lang: raw, category } = await params;
  if (!(CATEGORIES as readonly string[]).includes(category)) notFound();
  const categoryId = category as CategoryId;
  const lang: Lang = isLang(raw) ? raw : "en";
  return (
    <>
      <JsonLd data={buildCategoryJsonLd(categoryId, lang)} />
      <CategoryHub categoryId={categoryId} />
    </>
  );
}