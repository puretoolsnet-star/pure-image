"use client";

import { ImageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { EcosystemMenu } from "@/components/layout/EcosystemMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileHeaderMenu } from "@/components/layout/MobileHeaderMenu";
import { useI18n } from "@/i18n/context";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";
import { stripLangPrefix } from "@/lib/i18n/routing";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/layer-stack";

export function SiteHeader({ className }: { className?: string }) {
  const { t } = useI18n();
  const href = useLocalizedPath();
  const pathname = usePathname();
  const rest = stripLangPrefix(pathname);

  const navLinks = [
    { path: "/compress", label: t.nav.compress },
    { path: "/convert", label: t.nav.convert },
    { path: "/edit", label: t.nav.edit },
    { path: "/doc", label: t.nav.doc },
  ] as const;

  return (
    <header
      className={cn(
        "pureimage-site-header sticky top-0 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md",
        className,
      )}
      style={{ zIndex: Z.siteHeader }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href={href("/")}
          className="group flex min-w-0 items-center gap-2.5 text-white transition-opacity hover:opacity-90"
          aria-label={`${t.brand.name} — ${t.brand.tagline}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/25 to-violet-500/25 ring-1 ring-emerald-500/30 sm:h-10 sm:w-10">
            <ImageIcon className="h-5 w-5 text-emerald-400" aria-hidden />
          </span>
          <span className="min-w-0 truncate">
            <span className="block text-sm font-semibold tracking-tight sm:text-base">{t.brand.name}</span>
            <span className="hidden truncate text-[11px] text-slate-500 md:block">{t.brand.tagline}</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <span className="glass-card inline-flex max-w-[11rem] items-center gap-1 truncate rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 lg:hidden">
            <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            <span className="truncate">{t.security.badgeShort}</span>
          </span>
          <span className="glass-card hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 lg:inline-flex">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            <span className="truncate">{t.security.badge}</span>
          </span>
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t.nav.tools}>
            {navLinks.map((item) => {
              const active = rest === item.path || rest.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  href={href(item.path)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-emerald-500/15 font-medium text-emerald-300"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-violet-200",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <EcosystemMenu />
            <LanguageSwitcher />
          </div>
          <MobileHeaderMenu />
        </div>
      </div>
    </header>
  );
}