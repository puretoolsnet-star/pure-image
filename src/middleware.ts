import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEFAULT_LANG, LANGS, isLang } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";
import { CATEGORIES, LEGACY_REDIRECTS } from "@/lib/tools/routes";

const LANG_PREFIX = new RegExp(`^/(${LANGS.join("|")})(/|$)`);

function needsLangRedirect(pathname: string): boolean {
  if (pathname === "/") return true;
  for (const category of CATEGORIES) {
    if (pathname === `/${category}` || pathname.startsWith(`/${category}/`)) return true;
  }
  for (const legacy of Object.keys(LEGACY_REDIRECTS)) {
    if (pathname === legacy || pathname.startsWith(`${legacy}/`)) return true;
  }
  if (pathname === "/resize" || pathname.startsWith("/resize/")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/ua" || pathname.startsWith("/ua/")) {
    const nextPath = pathname.replace(/^\/ua(?=\/|$)/, "/uk") || "/uk";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  const langMatch = pathname.match(LANG_PREFIX);
  const withoutLang = langMatch ? pathname.slice(langMatch[0].length - 1) || "/" : pathname;

  if (!langMatch && withoutLang in LEGACY_REDIRECTS) {
    return NextResponse.redirect(
      new URL(localizedPath(DEFAULT_LANG, LEGACY_REDIRECTS[withoutLang]), request.url),
      308,
    );
  }

  if (!langMatch && (withoutLang === "/resize" || withoutLang.startsWith("/resize/"))) {
    const target = withoutLang.replace(/^\/resize/, "/edit/resize");
    return NextResponse.redirect(new URL(localizedPath(DEFAULT_LANG, target), request.url), 308);
  }

  let response: NextResponse;

  if (needsLangRedirect(pathname) && !langMatch) {
    response = NextResponse.redirect(new URL(localizedPath(DEFAULT_LANG, pathname), request.url));
  } else {
    response = NextResponse.next();
  }

  const lang = langMatch?.[1] ?? DEFAULT_LANG;
  if (isLang(lang)) response.headers.set("x-pureimage-lang", lang);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};