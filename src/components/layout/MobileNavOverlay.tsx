"use client";

import { Globe, Home, ImageIcon, Sparkles, X } from "lucide-react";
import Link from "next/link";

import { useLocalizedPath } from "@/lib/i18n/use-localized-path";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/layer-stack";
import { LANG_LABELS, LANGS, type Dictionary, type Lang } from "@/i18n/locales";
import { CATEGORIES, type CategoryId } from "@/lib/tools/routes";
import { CATEGORY_ICONS } from "@/lib/tools/icons";

type MobileNavOverlayProps = {
  open: boolean;
  lang: Lang;
  t: Dictionary;
  onClose: () => void;
  onOpenEcosystem: () => void;
  onSelectLang: (lang: Lang) => void;
};

export function MobileNavOverlay({
  open,
  lang,
  t,
  onClose,
  onOpenEcosystem,
  onSelectLang,
}: MobileNavOverlayProps) {
  const href = useLocalizedPath();
  if (!open) return null;

  return (
    <div
      data-pureimage-overlay="mobile-nav"
      data-open="true"
      className="pointer-events-auto fixed inset-0 md:hidden"
      style={{ zIndex: Z.mobileNav }}
    >
      <button
        type="button"
        aria-label={t.nav.menuClose}
        className="absolute inset-0 touch-manipulation bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        id="pureimage-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menuAria}
        className="glass-card pointer-events-auto absolute inset-y-0 right-0 flex w-[min(100vw-3rem,20rem)] max-w-full flex-col border-l border-slate-800 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <ImageIcon className="h-4 w-4 text-emerald-400" aria-hidden />
            {t.brand.name}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.nav.menuClose}
            className="touch-manipulation rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto overscroll-contain p-3">
          <Link
            href={href("/")}
            onClick={onClose}
            className="glass-card flex w-full items-center gap-3 rounded-xl border border-slate-800 p-3 hover:border-emerald-500/30"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Home className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-white">{t.nav.home}</span>
              <span className="mt-0.5 block text-xs text-slate-400">{t.brand.tagline}</span>
            </span>
          </Link>
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {t.nav.tools}
          </p>
          <ul className="flex flex-col gap-1">
            {CATEGORIES.map((categoryId) => {
              const Icon = CATEGORY_ICONS[categoryId as CategoryId];
              const label =
                categoryId === "compress"
                  ? t.nav.compress
                  : categoryId === "convert"
                    ? t.nav.convert
                    : categoryId === "edit"
                      ? t.nav.edit
                      : t.nav.doc;
              return (
                <li key={categoryId}>
                  <Link
                    href={href(`/${categoryId}`)}
                    onClick={onClose}
                    className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-sm text-slate-300 hover:border-slate-700 hover:bg-slate-900/60"
                  >
                    <Icon className="h-4 w-4 text-violet-400" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={onOpenEcosystem}
            className="glass-card flex w-full items-center gap-3 rounded-xl border border-slate-800 p-3 text-left hover:border-violet-500/35"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-white">{t.ecosystem.menuLabel}</span>
              <span className="mt-0.5 block text-xs text-slate-400">{t.ecosystem.menuShort}</span>
            </span>
          </button>
          <div className="glass-card rounded-xl border border-slate-800 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {t.nav.selectLanguage}
            </div>
            <ul className="grid grid-cols-1 gap-1">
              {LANGS.map((item) => {
                const meta = LANG_LABELS[item];
                const selected = item === lang;
                return (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLang(item);
                        onClose();
                      }}
                      className={cn(
                        "flex w-full touch-manipulation items-center gap-2 rounded-lg px-2 py-2 text-left text-sm",
                        selected ? "bg-emerald-500/15 text-emerald-200" : "text-slate-300 hover:bg-white/5",
                      )}
                    >
                      <span aria-hidden>{meta.flag}</span>
                      <span className="min-w-0 truncate">{meta.native}</span>
                      <span className="ml-auto text-xs text-slate-500">{meta.code}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="mt-auto rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-300/90">
            {t.security.badge}
          </p>
        </div>
      </aside>
    </div>
  );
}