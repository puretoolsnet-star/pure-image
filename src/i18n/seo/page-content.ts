import type { Lang } from "@/i18n/locales";
import { getToolCopy } from "@/i18n/tool-messages";
import type { CategoryId, ToolRouteId } from "@/lib/tools/routes";

export type PageSeoContent = {
  benefitsTitle: string;
  benefitsLead: string;
  benefitPoints: string[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
};

const FAQ_EN: Record<CategoryId, PageSeoContent> = {
  compress: {
    benefitsTitle: "Why compress locally?",
    benefitsLead: "Smaller images speed up sites and email — without sending files to a cloud.",
    benefitPoints: ["Smart, sized, and batch modes", "JPEG quality under your control", "ZIP export with rewarded ad"],
    faqTitle: "Compression FAQ",
    faqs: [
      { question: "Are photos uploaded?", answer: "No — Canvas runs only in your browser." },
      { question: "What is smart compress?", answer: "It lowers quality until the file is smaller than the original." },
      { question: "Why a video before ZIP?", answer: "Bulk ZIP helps keep img.kixt.net free." },
    ],
  },
  convert: {
    benefitsTitle: "Format conversion in-browser",
    benefitsLead: "WebP, AVIF, HEIC, PNG, and SVG — export formats your workflow needs.",
    benefitPoints: ["HEIC via heic2any", "AVIF when the browser supports encoding", "No server-side storage"],
    faqTitle: "Converter FAQ",
    faqs: [
      { question: "HEIC on Windows?", answer: "Yes — decoded locally, then exported." },
      { question: "AVIF support?", answer: "Depends on your browser; WebP is a safe fallback." },
      { question: "SVG output?", answer: "SVG is rasterized to PNG/JPG/WebP on canvas." },
    ],
  },
  edit: {
    benefitsTitle: "Resize, crop, and rotate",
    benefitsLead: "Social presets and precise pixels for posts, avatars, and banners.",
    benefitPoints: ["Instagram & YouTube presets", "Center crop by aspect ratio", "Rotate and mirror"],
    faqTitle: "Edit FAQ",
    faqs: [
      { question: "Does crop remove edges?", answer: "Center crop keeps the middle of the photo." },
      { question: "Upscaling?", answer: "Possible, but downscaling looks best." },
      { question: "Privacy?", answer: "Edits never leave your device." },
    ],
  },
  doc: {
    benefitsTitle: "Scans and PDF albums",
    benefitsLead: "Boost contrast on document photos and merge images into one PDF.",
    benefitPoints: ["Contrast and brightness sliders", "Multi-page PDF export", "jsPDF runs client-side"],
    faqTitle: "Document FAQ",
    faqs: [
      { question: "Is OCR included?", answer: "This suite enhances visuals; text OCR may come later." },
      { question: "PDF page size?", answer: "Each page matches the image dimensions." },
      { question: "Upload?", answer: "PDF is built in-memory and downloaded locally." },
    ],
  },
};

const FAQ_UK: Record<CategoryId, PageSeoContent> = {
  compress: {
    ...FAQ_EN.compress,
    benefitsTitle: "Навіщо стискати локально?",
    benefitsLead: "Менші файли — без хмари.",
    benefitPoints: ["Розумне, за КБ, пакетно", "Контроль якості", "ZIP після реклами"],
    faqTitle: "FAQ стиснення",
    faqs: [
      { question: "Чи завантажуються фото?", answer: "Ні — лише Canvas у браузері." },
      { question: "Що таке smart?", answer: "Знижує якість, поки файл не стане меншим." },
      { question: "Навіщо відео перед ZIP?", answer: "Щоб сервіс залишався безкоштовним." },
    ],
  },
  convert: { ...FAQ_EN.convert, benefitsTitle: "Конвертація у браузері", faqTitle: "FAQ конвертації" },
  edit: { ...FAQ_EN.edit, benefitsTitle: "Розмір, обрізка, поворот", faqTitle: "FAQ редагування" },
  doc: { ...FAQ_EN.doc, benefitsTitle: "Скани та PDF", faqTitle: "FAQ документів" },
};

const BY_LANG: Record<Lang, Record<CategoryId, PageSeoContent>> = {
  en: FAQ_EN,
  uk: FAQ_UK,
  de: FAQ_EN,
  es: FAQ_EN,
  pl: FAQ_EN,
  fr: FAQ_EN,
};

export function getToolSeoContent(routeId: ToolRouteId, lang: Lang): PageSeoContent {
  const category = routeId.split("/")[0] as CategoryId;
  const base = BY_LANG[lang][category];
  const tool = getToolCopy(lang, routeId);
  return {
    ...base,
    benefitsLead: `${tool.hint} ${base.benefitsLead}`,
  };
}