import type { Lang } from "@/i18n/locales";
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

const EN_TOOLS: Record<ToolRouteId, ToolPageCopy> = {
  "compress/smart": {
    title: "Smart image compression",
    description: "Automatically balance quality and file size in your browser.",
    hint: "Best starting point for photos and web uploads.",
    cardTitle: "Smart compress",
    cardDescription: "Adaptive JPEG quality without cloud upload.",
  },
  "compress/to-size": {
    title: "Compress to exact KB size",
    description: "Hit a target file size (KB) with binary-search encoding.",
    hint: "Useful for form limits and attachment caps.",
    cardTitle: "To size (KB)",
    cardDescription: "Dial in megabyte or kilobyte targets.",
  },
  "compress/batch": {
    title: "Batch image compression",
    description: "Compress many files and download a ZIP after a short ad.",
    hint: "Drag a folder of images — all local.",
    cardTitle: "Batch compress",
    cardDescription: "Multi-file workflow with ZIP export.",
  },
  "convert/to-webp": {
    title: "Convert images to WebP",
    description: "Modern WebP output with Canvas — smaller for the web.",
    hint: "Great for sites and apps that support WebP.",
    cardTitle: "To WebP",
    cardDescription: "JPEG/PNG → WebP locally.",
  },
  "convert/to-avif": {
    title: "Convert images to AVIF",
    description: "AVIF export when your browser supports it.",
    hint: "Falls back with a hint if AVIF encoding is unavailable.",
    cardTitle: "To AVIF",
    cardDescription: "Next-gen format in-browser.",
  },
  "convert/heic-to-jpg": {
    title: "HEIC to JPG (iPhone photos)",
    description: "Decode HEIC with heic2any, export JPG on-device.",
    hint: "No iCloud or desktop app required.",
    cardTitle: "HEIC → JPG",
    cardDescription: "iPhone photos on Windows & Android.",
  },
  "convert/png-jpg": {
    title: "PNG to JPG converter",
    description: "Shrink PNG screenshots and graphics to JPEG.",
    hint: "Transparency becomes flat background.",
    cardTitle: "PNG → JPG",
    cardDescription: "Smaller sharing size.",
  },
  "convert/svg-to-img": {
    title: "SVG to PNG or JPG",
    description: "Rasterize vector SVG to bitmap for social previews.",
    hint: "White backdrop for transparent SVG.",
    cardTitle: "SVG → image",
    cardDescription: "Export SVG as raster.",
  },
  "edit/resize": {
    title: "Resize by width & height",
    description: "Set exact pixel dimensions with optional aspect lock.",
    hint: "Downscaling gives the sharpest results.",
    cardTitle: "Resize",
    cardDescription: "Custom width and height.",
  },
  "edit/presets": {
    title: "Social media size presets",
    description: "Instagram, YouTube, LinkedIn, X, Facebook presets.",
    hint: "One click to platform-ready pixels.",
    cardTitle: "Social presets",
    cardDescription: "Ready-made aspect ratios.",
  },
  "edit/crop": {
    title: "Crop to aspect ratio",
    description: "Center crop to 1:1, 16:9, 4:5 and more.",
    hint: "Quick crops for posts and thumbnails.",
    cardTitle: "Crop",
    cardDescription: "Proportional center crop.",
  },
  "edit/rotate": {
    title: "Rotate and mirror",
    description: "Fix orientation, flip horizontal or vertical.",
    hint: "90° steps plus mirror — all client-side.",
    cardTitle: "Rotate / mirror",
    cardDescription: "Orientation fixes.",
  },
  "doc/enhance-scan": {
    title: "Enhance document scans",
    description: "Boost contrast and brightness for phone photos of papers.",
    hint: "Makes receipts and notes easier to read.",
    cardTitle: "Enhance scan",
    cardDescription: "Contrast for documents.",
  },
  "doc/images-to-pdf": {
    title: "Images to PDF album",
    description: "Stitch multiple photos into one PDF locally (jsPDF).",
    hint: "One page per image, original resolution.",
    cardTitle: "Images → PDF",
    cardDescription: "Multi-photo PDF export.",
  },
};

const EN_CATEGORIES: Record<CategoryId, CategoryHubCopy> = {
  compress: {
    title: "Compression tools — Pure Image",
    description: "Smart, sized, and batch compression without uploads.",
    hubTitle: "Compression",
    hubLead: "Smaller files for email, CMS, and mobile — 100% in your browser.",
  },
  convert: {
    title: "Converters — WebP, AVIF, HEIC, PNG, SVG",
    description: "Format conversion for modern web and iPhone HEIC.",
    hubTitle: "Converters",
    hubLead: "Swap formats locally with Canvas and heic2any.",
  },
  edit: {
    title: "Resize, crop & rotate — Pure Image",
    description: "Social presets, custom pixels, crop, and flip.",
    hubTitle: "Resize & edit",
    hubLead: "Prepare images for Instagram, avatars, and print.",
  },
  doc: {
    title: "Documents & scans — Pure Image",
    description: "Scan enhancement and multi-image PDF export.",
    hubTitle: "Documents & scans",
    hubLead: "Paper photos and PDF albums without a server.",
  },
};

/** Localized copies — non-EN langs mirror structure with translated hub titles. */
const UK_TOOLS: Record<ToolRouteId, ToolPageCopy> = {
  ...EN_TOOLS,
  "compress/smart": {
    ...EN_TOOLS["compress/smart"],
    title: "Розумне стиснення",
    description: "Автоматичний баланс якості та розміру у браузері.",
    hint: "Стартова точка для фото та вебу.",
    cardTitle: "Розумне",
    cardDescription: "Адаптивна якість JPEG локально.",
  },
  "compress/to-size": {
    ...EN_TOOLS["compress/to-size"],
    title: "Стиснути до розміру в КБ",
    description: "Цільовий розмір файлу підбором якості.",
    hint: "Для лімітів форм і вкладень.",
    cardTitle: "До КБ",
    cardDescription: "Точний цільовий розмір.",
  },
  "compress/batch": {
    ...EN_TOOLS["compress/batch"],
    title: "Пакетне стиснення",
    description: "Багато файлів і ZIP після короткої реклами.",
    hint: "Усі файли лише на пристрої.",
    cardTitle: "Пакетно",
    cardDescription: "ZIP для кількох фото.",
  },
  "convert/heic-to-jpg": {
    ...EN_TOOLS["convert/heic-to-jpg"],
    title: "HEIC у JPG (iPhone)",
    description: "HEIC локально у JPG через heic2any.",
    hint: "Без Apple-додатків.",
    cardTitle: "HEIC → JPG",
    cardDescription: "Фото iPhone на Windows.",
  },
  "edit/presets": {
    ...EN_TOOLS["edit/presets"],
    title: "Пресети соцмереж",
    description: "Instagram, YouTube, LinkedIn, X, Facebook.",
    hint: "Готові пікселі під платформи.",
    cardTitle: "Пресети",
    cardDescription: "Формати соцмереж.",
  },
  "doc/images-to-pdf": {
    ...EN_TOOLS["doc/images-to-pdf"],
    title: "Фото в PDF",
    description: "Кілька зображень в один PDF локально.",
    hint: "Сторінка на зображення.",
    cardTitle: "Фото → PDF",
    cardDescription: "Альбом PDF.",
  },
};

const UK_CATEGORIES: Record<CategoryId, CategoryHubCopy> = {
  compress: {
    title: "Стиснення — Pure Image",
    description: "Розумне, за розміром і пакетне стиснення.",
    hubTitle: "Стиснення",
    hubLead: "Менші файли без завантаження на сервер.",
  },
  convert: {
    title: "Конвертація — WebP, AVIF, HEIC",
    description: "Зміна форматів для вебу та iPhone.",
    hubTitle: "Конвертація",
    hubLead: "Canvas та heic2any локально.",
  },
  edit: {
    title: "Розмір, обрізка, поворот",
    description: "Пресети, пікселі, crop та дзеркало.",
    hubTitle: "Редагування",
    hubLead: "Instagram, аватарки, друк.",
  },
  doc: {
    title: "Документи та скани",
    description: "Контраст сканів і PDF з фото.",
    hubTitle: "Документи",
    hubLead: "Без серверів.",
  },
};

const L10N: Record<
  Lang,
  { tools: Record<ToolRouteId, ToolPageCopy>; categories: Record<CategoryId, CategoryHubCopy> }
> = {
  en: { tools: EN_TOOLS, categories: EN_CATEGORIES },
  uk: { tools: UK_TOOLS, categories: UK_CATEGORIES },
  de: {
    tools: EN_TOOLS,
    categories: {
      compress: { ...EN_CATEGORIES.compress, hubTitle: "Komprimierung" },
      convert: { ...EN_CATEGORIES.convert, hubTitle: "Konverter" },
      edit: { ...EN_CATEGORIES.edit, hubTitle: "Bearbeiten" },
      doc: { ...EN_CATEGORIES.doc, hubTitle: "Dokumente" },
    },
  },
  es: { tools: EN_TOOLS, categories: EN_CATEGORIES },
  pl: { tools: EN_TOOLS, categories: EN_CATEGORIES },
  fr: { tools: EN_TOOLS, categories: EN_CATEGORIES },
};

export function getToolCopy(lang: Lang, routeId: ToolRouteId): ToolPageCopy {
  return L10N[lang].tools[routeId] ?? EN_TOOLS[routeId];
}

export function getCategoryCopy(lang: Lang, categoryId: CategoryId): CategoryHubCopy {
  return L10N[lang].categories[categoryId];
}

export function getAllToolCopies(lang: Lang): Record<ToolRouteId, ToolPageCopy> {
  const base = { ...EN_TOOLS };
  return Object.fromEntries(
    TOOL_ROUTE_IDS.map((id) => [id, getToolCopy(lang, id)]),
  ) as Record<ToolRouteId, ToolPageCopy>;
}

export function getAllCategoryCopies(lang: Lang): Record<CategoryId, CategoryHubCopy> {
  return L10N[lang].categories;
}