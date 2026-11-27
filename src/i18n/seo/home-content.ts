import type { Lang } from "@/i18n/locales";
import type { PageSeoContent } from "@/i18n/seo/page-content";

export const HOME_SEO_BY_LANG: Record<Lang, PageSeoContent> = {
  en: {
    benefitsTitle: "Who uses Pure Image and why",
    benefitsLead:
      "Fourteen client-side tools on img.kixt.net — compress, convert, edit, and build PDFs without uploading originals to a server.",
    benefitPoints: [
      "Smart, KB-target, and batch compression",
      "HEIC, WebP, AVIF, PNG, and SVG conversion",
      "Resize, crop, social presets, scan enhance, and images-to-PDF",
      "Six languages: English, Ukrainian, German, Spanish, Polish, French",
    ],
    faqTitle: "Pure Image — FAQ",
    faqs: [
      {
        question: "Are my photos uploaded to kixt.net?",
        answer: "No. Processing uses Canvas, heic2any, and jsPDF in your browser tab only.",
      },
      {
        question: "Do I need an account?",
        answer: "No sign-up — open a tool, choose files, and download results locally.",
      },
      {
        question: "Which browsers work best?",
        answer: "Recent Chrome, Edge, Firefox, and Safari; AVIF export depends on browser support.",
      },
    ],
  },
  uk: {
    benefitsTitle: "Для кого Pure Image",
    benefitsLead:
      "14 інструментів на img.kixt.net: стиснення, конвертація, редагування та PDF без відправки оригіналів на сервер.",
    benefitPoints: [
      "Розумне, за КБ і пакетне стиснення",
      "HEIC, WebP, AVIF, PNG, SVG",
      "Розмір, обрізка, пресети соцмереж, скани та PDF",
      "6 мов інтерфейсу",
    ],
    faqTitle: "Pure Image — FAQ",
    faqs: [
      {
        question: "Чи завантажуються фото на kixt.net?",
        answer: "Ні — лише Canvas, heic2any і jsPDF у вашому браузері.",
      },
      {
        question: "Чи потрібна реєстрація?",
        answer: "Ні — відкрийте інструмент, оберіть файли й завантажте результат локально.",
      },
      {
        question: "Які браузери підходять?",
        answer: "Актуальні Chrome, Edge, Firefox і Safari; AVIF залежить від підтримки браузера.",
      },
    ],
  },
  de: {
    benefitsTitle: "Für wen Pure Image gedacht ist",
    benefitsLead:
      "14 Tools auf img.kixt.net — komprimieren, konvertieren, bearbeiten und PDF ohne Server-Upload.",
    benefitPoints: [
      "Smart-, KB- und Stapel-Komprimierung",
      "HEIC, WebP, AVIF, PNG, SVG",
      "Größe, Crop, Social-Presets, Scan und PDF",
      "Sechs Sprachen",
    ],
    faqTitle: "Pure Image — FAQ",
    faqs: [
      {
        question: "Werden Fotos zu kixt.net hochgeladen?",
        answer: "Nein — nur Canvas, heic2any und jsPDF lokal im Browser.",
      },
      {
        question: "Brauche ich ein Konto?",
        answer: "Nein — Tool öffnen, Dateien wählen, lokal speichern.",
      },
      {
        question: "Welche Browser?",
        answer: "Aktuelle Chrome, Edge, Firefox und Safari; AVIF je nach Browser.",
      },
    ],
  },
  es: {
    benefitsTitle: "Para quién es Pure Image",
    benefitsLead:
      "14 herramientas en img.kixt.net: comprimir, convertir, editar y PDF sin subir archivos al servidor.",
    benefitPoints: [
      "Compresión smart, por KB y por lotes",
      "HEIC, WebP, AVIF, PNG, SVG",
      "Tamaño, recorte, presets sociales, escaneos y PDF",
      "Seis idiomas",
    ],
    faqTitle: "Pure Image — FAQ",
    faqs: [
      {
        question: "¿Se suben fotos a kixt.net?",
        answer: "No — solo Canvas, heic2any y jsPDF en tu navegador.",
      },
      {
        question: "¿Hace falta cuenta?",
        answer: "No — abre la herramienta, elige archivos y descarga en local.",
      },
      {
        question: "¿Qué navegadores?",
        answer: "Chrome, Edge, Firefox y Safari recientes; AVIF según soporte.",
      },
    ],
  },
  pl: {
    benefitsTitle: "Dla kogo jest Pure Image",
    benefitsLead:
      "14 narzędzi na img.kixt.net — kompresja, konwersja, edycja i PDF bez wysyłania plików na serwer.",
    benefitPoints: [
      "Kompresja smart, do KB i wsadowa",
      "HEIC, WebP, AVIF, PNG, SVG",
      "Rozmiar, kadrowanie, presety social, skany i PDF",
      "Sześć języków",
    ],
    faqTitle: "Pure Image — FAQ",
    faqs: [
      {
        question: "Czy zdjęcia trafiają na kixt.net?",
        answer: "Nie — tylko Canvas, heic2any i jsPDF w przeglądarce.",
      },
      {
        question: "Czy trzeba się rejestrować?",
        answer: "Nie — otwórz narzędzie, wybierz pliki i pobierz lokalnie.",
      },
      {
        question: "Jakie przeglądarki?",
        answer: "Aktualne Chrome, Edge, Firefox i Safari; AVIF zależy od przeglądarki.",
      },
    ],
  },
  fr: {
    benefitsTitle: "À qui s’adresse Pure Image",
    benefitsLead:
      "14 outils sur img.kixt.net — compression, conversion, édition et PDF sans envoi serveur.",
    benefitPoints: [
      "Compression smart, Ko cible et par lot",
      "HEIC, WebP, AVIF, PNG, SVG",
      "Taille, recadrage, presets sociaux, scans et PDF",
      "Six langues",
    ],
    faqTitle: "Pure Image — FAQ",
    faqs: [
      {
        question: "Les photos sont-elles envoyées à kixt.net ?",
        answer: "Non — Canvas, heic2any et jsPDF uniquement dans le navigateur.",
      },
      {
        question: "Faut-il un compte ?",
        answer: "Non — ouvrez un outil, choisissez des fichiers et téléchargez en local.",
      },
      {
        question: "Quels navigateurs ?",
        answer: "Chrome, Edge, Firefox et Safari récents ; AVIF selon le navigateur.",
      },
    ],
  },
};

export function getHomeSeoContent(lang: Lang): PageSeoContent {
  return HOME_SEO_BY_LANG[lang];
}