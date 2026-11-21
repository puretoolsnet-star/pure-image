import type { Lang } from "@/i18n/locales";
import type { PageSeoContent } from "@/i18n/seo/page-content";
import type { CategoryId } from "@/lib/tools/routes";

export const FAQ_BY_LANG: Record<Lang, Record<CategoryId, PageSeoContent>> = {
  en: {
    compress: {
      benefitsTitle: "Why compress locally?",
      benefitsLead: "Smaller images speed up sites and email — without sending files to a cloud.",
      benefitPoints: [
        "Smart, sized, and batch modes",
        "Quality under your control",
        "Instant local downloads",
      ],
      faqTitle: "Compression FAQ",
      faqs: [
        { question: "Are photos uploaded?", answer: "No — processing uses Canvas only in your browser." },
        { question: "How do downloads work?", answer: "Tap download — files save directly from your browser with no upload or account." },
        { question: "What is smart compress?", answer: "You set quality and max width; output is re-encoded locally." },
      ],
    },
    convert: {
      benefitsTitle: "Format conversion in-browser",
      benefitsLead: "WebP, AVIF, HEIC, PNG, and SVG — export formats your workflow needs.",
      benefitPoints: ["HEIC via heic2any", "AVIF when supported", "No server storage"],
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
      benefitPoints: ["Instagram & YouTube presets", "Interactive crop", "Rotate and mirror"],
      faqTitle: "Edit FAQ",
      faqs: [
        { question: "Does crop remove edges?", answer: "You control the crop frame before export." },
        { question: "Upscaling?", answer: "Possible, but downscaling looks best." },
        { question: "Privacy?", answer: "Edits never leave your device." },
      ],
    },
    doc: {
      benefitsTitle: "Scans and PDF albums",
      benefitsLead: "Boost contrast on document photos and merge images into one PDF.",
      benefitPoints: ["Contrast sliders", "Multi-page PDF", "jsPDF client-side"],
      faqTitle: "Document FAQ",
      faqs: [
        { question: "Is OCR included?", answer: "Visual enhancement only — no cloud OCR." },
        { question: "PDF page size?", answer: "Each page matches the image dimensions." },
        { question: "Upload?", answer: "PDF is built in-memory and downloaded locally." },
      ],
    },
  },
  uk: {
    compress: {
      benefitsTitle: "Навіщо стискати локально?",
      benefitsLead: "Менші файли — без хмари та серверів.",
      benefitPoints: ["Розумне, за КБ, пакетно", "Контроль якості", "Миттєве локальне завантаження"],
      faqTitle: "FAQ стиснення",
      faqs: [
        { question: "Чи завантажуються фото?", answer: "Ні — лише Canvas у браузері." },
        { question: "Як працює завантаження?", answer: "Натисніть «Завантажити» — файл або ZIP зберігається з браузера без сервера й обліковки." },
        { question: "Що таке smart?", answer: "Ви задаєте якість і ширину; перекодування локально." },
      ],
    },
    convert: {
      benefitsTitle: "Конвертація у браузері",
      benefitsLead: "WebP, AVIF, HEIC, PNG, SVG.",
      benefitPoints: ["HEIC через heic2any", "AVIF за можливості", "Без зберігання на сервері"],
      faqTitle: "FAQ конвертації",
      faqs: [
        { question: "HEIC на Windows?", answer: "Так — декодування локально." },
        { question: "AVIF?", answer: "Залежить від браузера; WebP — запасний варіант." },
        { question: "SVG?", answer: "Растеризація на canvas у PNG/JPG/WebP." },
      ],
    },
    edit: {
      benefitsTitle: "Розмір, обрізка, поворот",
      benefitsLead: "Пресети соцмереж і точні пікселі.",
      benefitPoints: ["Пресети Instagram/YouTube", "Інтерактивна обрізка", "Поворот і дзеркало"],
      faqTitle: "FAQ редагування",
      faqs: [
        { question: "Обрізка?", answer: "Ви керуєте рамкою перед експортом." },
        { question: "Збільшення?", answer: "Можливо, але зменшення виглядає краще." },
        { question: "Приватність?", answer: "Файли не покидають пристрій." },
      ],
    },
    doc: {
      benefitsTitle: "Скани та PDF",
      benefitsLead: "Контраст і PDF з кількох фото.",
      benefitPoints: ["Повзунки контрасту", "Багатосторінковий PDF", "jsPDF у браузері"],
      faqTitle: "FAQ документів",
      faqs: [
        { question: "Чи є OCR?", answer: "Лише покращення зображення — без хмарного OCR." },
        { question: "Розмір сторінки PDF?", answer: "Відповідає розміру зображення." },
        { question: "Завантаження на сервер?", answer: "PDF збирається в пам’яті локально." },
      ],
    },
  },
  de: {
    compress: {
      benefitsTitle: "Warum lokal komprimieren?",
      benefitsLead: "Kleinere Dateien — ohne Cloud.",
      benefitPoints: ["Smart, KB-Ziel, Stapel", "Qualitätskontrolle", "Sofortiger lokaler Download"],
      faqTitle: "Komprimierung FAQ",
      faqs: [
        { question: "Werden Fotos hochgeladen?", answer: "Nein — nur Canvas im Browser." },
        { question: "Downloads?", answer: "Direkt im Browser — ohne Upload und ohne Konto." },
        { question: "Smart-Modus?", answer: "Qualität und Breite wählen; lokal neu kodieren." },
      ],
    },
    convert: {
      benefitsTitle: "Konvertierung im Browser",
      benefitsLead: "WebP, AVIF, HEIC, PNG, SVG.",
      benefitPoints: ["HEIC via heic2any", "AVIF wenn möglich", "Kein Server-Speicher"],
      faqTitle: "Konverter FAQ",
      faqs: [
        { question: "HEIC unter Windows?", answer: "Ja — lokal dekodieren." },
        { question: "AVIF?", answer: "Browserabhängig; WebP als Fallback." },
        { question: "SVG?", answer: "Rasterisierung auf Canvas." },
      ],
    },
    edit: {
      benefitsTitle: "Größe, Zuschnitt, Drehen",
      benefitsLead: "Social-Presets und exakte Pixel.",
      benefitPoints: ["Instagram & YouTube", "Interaktiver Crop", "Drehen & spiegeln"],
      faqTitle: "Bearbeiten FAQ",
      faqs: [
        { question: "Zuschnitt?", answer: "Sie steuern den Rahmen vor dem Export." },
        { question: "Vergrößern?", answer: "Möglich, Verkleinern wirkt schärfer." },
        { question: "Privatsphäre?", answer: "Dateien verlassen das Gerät nicht." },
      ],
    },
    doc: {
      benefitsTitle: "Scans & PDF",
      benefitsLead: "Kontrast und PDF aus Bildern.",
      benefitPoints: ["Kontrast-Regler", "Mehrseitiges PDF", "jsPDF lokal"],
      faqTitle: "Dokumente FAQ",
      faqs: [
        { question: "OCR?", answer: "Nur Bildverbesserung — kein Cloud-OCR." },
        { question: "PDF-Seitengröße?", answer: "Entspricht dem Bild." },
        { question: "Upload?", answer: "PDF wird lokal im Speicher erzeugt." },
      ],
    },
  },
  es: {
    compress: {
      benefitsTitle: "¿Por qué comprimir localmente?",
      benefitsLead: "Archivos más pequeños sin la nube.",
      benefitPoints: ["Smart, por KB, lote", "Control de calidad", "Descarga local al instante"],
      faqTitle: "FAQ compresión",
      faqs: [
        { question: "¿Se suben las fotos?", answer: "No — solo Canvas en el navegador." },
        { question: "¿Descargas?", answer: "Descarga directa en el navegador, sin subidas ni cuenta." },
        { question: "¿Modo smart?", answer: "Eliges calidad y ancho; recodificación local." },
      ],
    },
    convert: {
      benefitsTitle: "Conversión en el navegador",
      benefitsLead: "WebP, AVIF, HEIC, PNG, SVG.",
      benefitPoints: ["HEIC con heic2any", "AVIF si hay soporte", "Sin almacenamiento en servidor"],
      faqTitle: "FAQ conversión",
      faqs: [
        { question: "¿HEIC en Windows?", answer: "Sí — decodificación local." },
        { question: "¿AVIF?", answer: "Depende del navegador; WebP como respaldo." },
        { question: "¿SVG?", answer: "Rasterizado en canvas." },
      ],
    },
    edit: {
      benefitsTitle: "Tamaño, recorte y giro",
      benefitsLead: "Presets sociales y píxeles exactos.",
      benefitPoints: ["Presets Instagram/YouTube", "Recorte interactivo", "Girar y espejar"],
      faqTitle: "FAQ edición",
      faqs: [
        { question: "¿Recorte?", answer: "Controlas el marco antes de exportar." },
        { question: "¿Ampliar?", answer: "Posible, pero reducir se ve mejor." },
        { question: "¿Privacidad?", answer: "Los archivos no salen del dispositivo." },
      ],
    },
    doc: {
      benefitsTitle: "Escaneos y PDF",
      benefitsLead: "Contraste y PDF desde imágenes.",
      benefitPoints: ["Sliders de contraste", "PDF multipágina", "jsPDF local"],
      faqTitle: "FAQ documentos",
      faqs: [
        { question: "¿OCR?", answer: "Solo mejora visual — sin OCR en la nube." },
        { question: "¿Tamaño de página?", answer: "Coincide con la imagen." },
        { question: "¿Subida?", answer: "PDF en memoria, descarga local." },
      ],
    },
  },
  pl: {
    compress: {
      benefitsTitle: "Dlaczego kompresja lokalna?",
      benefitsLead: "Mniejsze pliki — bez chmury.",
      benefitPoints: ["Smart, do KB, wsadowo", "Kontrola jakości", "Natychmiastowe lokalne pobieranie"],
      faqTitle: "FAQ kompresji",
      faqs: [
        { question: "Czy zdjęcia są wysyłane?", answer: "Nie — tylko Canvas w przeglądarce." },
        { question: "Pobieranie?", answer: "Bezpośrednio z przeglądarki — bez wysyłania plików i konta." },
        { question: "Tryb smart?", answer: "Ustawiasz jakość i szerokość; lokalne przekodowanie." },
      ],
    },
    convert: {
      benefitsTitle: "Konwersja w przeglądarce",
      benefitsLead: "WebP, AVIF, HEIC, PNG, SVG.",
      benefitPoints: ["HEIC przez heic2any", "AVIF gdy możliwe", "Brak serwera"],
      faqTitle: "FAQ konwersji",
      faqs: [
        { question: "HEIC na Windows?", answer: "Tak — lokalnie." },
        { question: "AVIF?", answer: "Zależy od przeglądarki; WebP zapasowo." },
        { question: "SVG?", answer: "Rasteryzacja na canvas." },
      ],
    },
    edit: {
      benefitsTitle: "Rozmiar, kadrowanie, obrót",
      benefitsLead: "Presety social i dokładne piksele.",
      benefitPoints: ["Instagram i YouTube", "Interaktywny crop", "Obrót i odbicie"],
      faqTitle: "FAQ edycji",
      faqs: [
        { question: "Kadrowanie?", answer: "Ty ustawiasz ramkę przed eksportem." },
        { question: "Powiększanie?", answer: "Możliwe, ale pomniejszenie wygląda lepiej." },
        { question: "Prywatność?", answer: "Pliki nie opuszczają urządzenia." },
      ],
    },
    doc: {
      benefitsTitle: "Skany i PDF",
      benefitsLead: "Kontrast i PDF ze zdjęć.",
      benefitPoints: ["Suwaki kontrastu", "Wielostronicowy PDF", "jsPDF lokalnie"],
      faqTitle: "FAQ dokumentów",
      faqs: [
        { question: "OCR?", answer: "Tylko poprawa obrazu — bez chmury." },
        { question: "Rozmiar strony PDF?", answer: "Jak wymiary obrazu." },
        { question: "Upload?", answer: "PDF w pamięci, pobranie lokalne." },
      ],
    },
  },
  fr: {
    compress: {
      benefitsTitle: "Pourquoi compresser localement ?",
      benefitsLead: "Fichiers plus légers — sans cloud.",
      benefitPoints: ["Smart, vers Ko, par lot", "Qualité maîtrisée", "Téléchargement local instantané"],
      faqTitle: "FAQ compression",
      faqs: [
        { question: "Les photos sont-elles envoyées ?", answer: "Non — Canvas uniquement dans le navigateur." },
        { question: "Téléchargements ?", answer: "Fichier ou ZIP enregistré dans le navigateur — sans envoi ni compte." },
        { question: "Mode smart ?", answer: "Vous choisissez qualité et largeur ; encodage local." },
      ],
    },
    convert: {
      benefitsTitle: "Conversion dans le navigateur",
      benefitsLead: "WebP, AVIF, HEIC, PNG, SVG.",
      benefitPoints: ["HEIC via heic2any", "AVIF si supporté", "Pas de stockage serveur"],
      faqTitle: "FAQ conversion",
      faqs: [
        { question: "HEIC sur Windows ?", answer: "Oui — décodage local." },
        { question: "AVIF ?", answer: "Selon le navigateur ; WebP en secours." },
        { question: "SVG ?", answer: "Rastérisation sur canvas." },
      ],
    },
    edit: {
      benefitsTitle: "Taille, recadrage, rotation",
      benefitsLead: "Presets sociaux et pixels précis.",
      benefitPoints: ["Instagram & YouTube", "Crop interactif", "Pivoter et miroir"],
      faqTitle: "FAQ édition",
      faqs: [
        { question: "Recadrage ?", answer: "Vous contrôlez le cadre avant l’export." },
        { question: "Agrandir ?", answer: "Possible, mais réduire est plus net." },
        { question: "Confidentialité ?", answer: "Les fichiers restent sur l’appareil." },
      ],
    },
    doc: {
      benefitsTitle: "Scans et PDF",
      benefitsLead: "Contraste et PDF multi-images.",
      benefitPoints: ["Curseurs de contraste", "PDF multipage", "jsPDF local"],
      faqTitle: "FAQ documents",
      faqs: [
        { question: "OCR ?", answer: "Amélioration visuelle seulement — pas d’OCR cloud." },
        { question: "Taille de page PDF ?", answer: "Correspond à l’image." },
        { question: "Envoi serveur ?", answer: "PDF en mémoire, téléchargement local." },
      ],
    },
  },
};