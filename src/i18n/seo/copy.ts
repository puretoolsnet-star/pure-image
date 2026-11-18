import type { Lang } from "@/i18n/locales";
import { getCategoryCopy, getToolCopy } from "@/i18n/tool-messages";
import type { PageId } from "@/i18n/types";
import { CATEGORIES, TOOL_ROUTE_IDS, type CategoryId, type ToolRouteId } from "@/lib/tools/routes";

export type SeoCopy = {
  title: string;
  description: string;
  keywords: string[];
};

const HOME: Record<Lang, SeoCopy> = {
  en: {
    title: "Pure Image — private image tools at img.kixt.net",
    description:
      "Compress, convert, edit, and scan photos in your browser. 14+ tools, 4 categories, 6 languages — no uploads.",
    keywords: ["image tools", "compress", "HEIC", "WebP", "resize", "private"],
  },
  uk: {
    title: "Pure Image — приватні інструменти зображень",
    description: "Стиснення, конвертація, редагування та PDF у браузері на img.kixt.net.",
    keywords: ["стиснути фото", "HEIC", "WebP", "приватно"],
  },
  de: {
    title: "Pure Image — private Bildtools",
    description: "Komprimieren, konvertieren, bearbeiten — lokal im Browser.",
    keywords: ["Bilder", "HEIC", "WebP", "privat"],
  },
  es: {
    title: "Pure Image — herramientas de imagen privadas",
    description: "Comprimir, convertir y editar fotos en el navegador.",
    keywords: ["comprimir", "HEIC", "WebP"],
  },
  pl: {
    title: "Pure Image — prywatne narzędzia do zdjęć",
    description: "Kompresja, konwersja i edycja w przeglądarce.",
    keywords: ["kompresja", "HEIC", "WebP"],
  },
  fr: {
    title: "Pure Image — outils d’image privés",
    description: "Compression, conversion et édition dans le navigateur.",
    keywords: ["compresser", "HEIC", "WebP"],
  },
};

export function getSeoCopy(page: PageId, lang: Lang): SeoCopy {
  if (page === "home") return HOME[lang];

  if ((CATEGORIES as readonly string[]).includes(page)) {
    const hub = getCategoryCopy(lang, page as CategoryId);
    return {
      title: hub.title,
      description: hub.description,
      keywords: [page, "browser", "local", "img.kixt.net"],
    };
  }

  if ((TOOL_ROUTE_IDS as readonly string[]).includes(page)) {
    const tool = getToolCopy(lang, page as ToolRouteId);
    return {
      title: `${tool.title} | Pure Image`,
      description: tool.description,
      keywords: tool.title.split(" ").slice(0, 6),
    };
  }

  return HOME.en;
}

export function pathForPage(page: PageId): string {
  if (page === "home") return "/";
  return `/${page}`;
}