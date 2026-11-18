import type { Metadata } from "next";

import { HomePage } from "@/components/home/HomePage";
import { isLang } from "@/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : "en";
  return buildPageMetadata("home", lang);
}

export default async function Page() {
  return <HomePage />;
}