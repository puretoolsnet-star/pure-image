import type { Lang } from "@/i18n/locales";
import type { PageId } from "@/i18n/types";
import { CATEGORIES, TOOL_ROUTE_IDS, type CategoryId, type ToolRouteId } from "@/lib/tools/routes";

import type { SeoCopy } from "@/i18n/seo/copy";

const HOME: Record<Lang, SeoCopy> = {
  en: {
    title: "Pure Image — private browser image tools | img.kixt.net",
    description:
      "Compress, convert, resize, and export PDFs locally in your browser. Fourteen tools, four categories, six languages — files never leave your device.",
    keywords: ["image tools", "compress photos", "HEIC to JPG", "WebP converter", "private", "img.kixt.net"],
  },
  uk: {
    title: "Pure Image — приватні інструменти зображень | img.kixt.net",
    description:
      "Стиснення, конвертація, обрізка та PDF у браузері без завантаження на сервер. 14 інструментів, 6 мов — файли лишаються на вашому пристрої.",
    keywords: ["стиснути фото", "HEIC у JPG", "WebP", "конвертер", "приватно", "img.kixt.net"],
  },
  de: {
    title: "Pure Image — private Bildtools im Browser | img.kixt.net",
    description:
      "Komprimieren, konvertieren, zuschneiden und PDF lokal im Browser. 14 Tools, 6 Sprachen — ohne Upload und ohne Konto.",
    keywords: ["Bilder komprimieren", "HEIC JPG", "WebP", "lokal", "privat", "img.kixt.net"],
  },
  es: {
    title: "Pure Image — herramientas de imagen en el navegador | img.kixt.net",
    description:
      "Comprimir, convertir, recortar y exportar PDF sin subir archivos. 14 herramientas, 6 idiomas — procesamiento 100 % local.",
    keywords: ["comprimir imágenes", "HEIC a JPG", "WebP", "privado", "navegador", "img.kixt.net"],
  },
  pl: {
    title: "Pure Image — prywatne narzędzia do zdjęć w przeglądarce | img.kixt.net",
    description:
      "Kompresja, konwersja, kadrowanie i PDF bez wysyłania plików. 14 narzędzi, 6 języków — tylko przetwarzanie lokalne.",
    keywords: ["kompresja zdjęć", "HEIC JPG", "WebP", "prywatnie", "przeglądarka", "img.kixt.net"],
  },
  fr: {
    title: "Pure Image — outils d’image locaux dans le navigateur | img.kixt.net",
    description:
      "Compression, conversion, recadrage et PDF sans envoi serveur. 14 outils, 6 langues — vos fichiers restent sur l’appareil.",
    keywords: ["compresser images", "HEIC JPG", "WebP", "privé", "navigateur", "img.kixt.net"],
  },
};

const CATEGORY_META: Record<CategoryId, Record<Lang, SeoCopy>> = {
  compress: {
    en: {
      title: "Image compression tools — smart, KB target & batch | Pure Image",
      description:
        "Shrink JPG, PNG, and WebP in the browser with smart quality, exact KB caps, and ZIP batch export. No uploads to img.kixt.net servers.",
      keywords: ["compress image", "reduce photo size", "batch compress", "browser", "local"],
    },
    uk: {
      title: "Інструменти стиснення зображень — smart, КБ, пакет | Pure Image",
      description:
        "Зменшуйте JPG, PNG і WebP у браузері: розумна якість, точний ліміт КБ і ZIP-пакет. Без завантаження файлів на сервер.",
      keywords: ["стиснути фото", "зменшити КБ", "пакетне стиснення", "браузер", "локально"],
    },
    de: {
      title: "Bildkomprimierung — Smart, KB-Ziel & Stapel | Pure Image",
      description:
        "JPG, PNG und WebP im Browser verkleinern: Smart-Qualität, KB-Limit und ZIP-Stapel. Kein Upload auf Server.",
      keywords: ["Bild komprimieren", "KB Ziel", "Stapel", "Browser", "lokal"],
    },
    es: {
      title: "Compresión de imágenes — smart, KB y lotes | Pure Image",
      description:
        "Reduce JPG, PNG y WebP en el navegador con calidad adaptativa, límite de KB y ZIP por lotes. Sin subidas al servidor.",
      keywords: ["comprimir imagen", "tamaño KB", "lote", "navegador", "local"],
    },
    pl: {
      title: "Kompresja obrazów — smart, KB i wsadowo | Pure Image",
      description:
        "Pomniejsz JPG, PNG i WebP w przeglądarce: jakość smart, limit KB i eksport ZIP. Bez wysyłania na serwer.",
      keywords: ["kompresja zdjęć", "limit KB", "wsadowo", "przeglądarka", "lokalnie"],
    },
    fr: {
      title: "Compression d’images — smart, Ko cible & lot | Pure Image",
      description:
        "Réduisez JPG, PNG et WebP dans le navigateur : qualité smart, plafond Ko et ZIP par lot. Aucun envoi serveur.",
      keywords: ["compresser image", "taille Ko", "par lot", "navigateur", "local"],
    },
  },
  convert: {
    en: {
      title: "Image format converters — WebP, AVIF, HEIC, PNG, SVG | Pure Image",
      description:
        "Convert iPhone HEIC, PNG with alpha, and SVG vectors to JPG, WebP, or AVIF using Canvas and heic2any — entirely client-side.",
      keywords: ["HEIC to JPG", "WebP converter", "AVIF", "PNG JPG", "SVG rasterize"],
    },
    uk: {
      title: "Конвертери форматів — WebP, AVIF, HEIC, PNG, SVG | Pure Image",
      description:
        "HEIC з iPhone, PNG з прозорістю та SVG у JPG, WebP чи AVIF через Canvas і heic2any — лише у вашому браузері.",
      keywords: ["HEIC у JPG", "WebP", "AVIF", "PNG JPG", "SVG конвертер"],
    },
    de: {
      title: "Bildkonverter — WebP, AVIF, HEIC, PNG, SVG | Pure Image",
      description:
        "iPhone-HEIC, PNG mit Alpha und SVG nach JPG, WebP oder AVIF per Canvas und heic2any — vollständig lokal.",
      keywords: ["HEIC JPG", "WebP Konverter", "AVIF", "PNG JPG", "SVG"],
    },
    es: {
      title: "Conversores de formato — WebP, AVIF, HEIC, PNG, SVG | Pure Image",
      description:
        "Convierte HEIC de iPhone, PNG con transparencia y SVG a JPG, WebP o AVIF con Canvas y heic2any — solo en el cliente.",
      keywords: ["HEIC a JPG", "WebP", "AVIF", "PNG JPG", "SVG"],
    },
    pl: {
      title: "Konwertery formatów — WebP, AVIF, HEIC, PNG, SVG | Pure Image",
      description:
        "HEIC z iPhone, PNG z alfą i SVG do JPG, WebP lub AVIF przez Canvas i heic2any — wyłącznie lokalnie.",
      keywords: ["HEIC JPG", "WebP", "AVIF", "PNG JPG", "SVG"],
    },
    fr: {
      title: "Convertisseurs — WebP, AVIF, HEIC, PNG, SVG | Pure Image",
      description:
        "HEIC iPhone, PNG transparent et SVG vers JPG, WebP ou AVIF via Canvas et heic2any — entièrement côté client.",
      keywords: ["HEIC JPG", "WebP", "AVIF", "PNG JPG", "SVG"],
    },
  },
  edit: {
    en: {
      title: "Resize, crop, rotate & social presets | Pure Image",
      description:
        "Change dimensions, crop aspect ratios, rotate and flip, or export Instagram, YouTube, and LinkedIn pixel presets — all in-browser.",
      keywords: ["resize image", "crop aspect ratio", "social media size", "rotate photo", "local edit"],
    },
    uk: {
      title: "Розмір, обрізка, поворот і пресети соцмереж | Pure Image",
      description:
        "Зміна px/%, обрізка 1:1 чи 16:9, поворот і дзеркало, пресети Instagram та YouTube — обробка лише у браузері.",
      keywords: ["змінити розмір", "обрізка", "пресети Instagram", "поворот фото", "локально"],
    },
    de: {
      title: "Größe, Zuschnitt, Drehen & Social-Presets | Pure Image",
      description:
        "Pixel oder %, Crop mit Seitenverhältnis, Drehen und Spiegeln, Presets für Instagram und YouTube — nur im Browser.",
      keywords: ["Bild skalieren", "Zuschnitt", "Social Presets", "drehen", "lokal"],
    },
    es: {
      title: "Tamaño, recorte, giro y presets sociales | Pure Image",
      description:
        "Px o %, recorte por ratio, rotar y espejar, presets de Instagram y YouTube — edición solo en el navegador.",
      keywords: ["redimensionar", "recortar", "presets redes", "girar imagen", "local"],
    },
    pl: {
      title: "Rozmiar, kadrowanie, obrót i presety social | Pure Image",
      description:
        "Px lub %, kadrowanie proporcji, obrót i odbicie, presety Instagram i YouTube — wyłącznie w przeglądarce.",
      keywords: ["zmienić rozmiar", "kadrowanie", "presety social", "obrót", "lokalnie"],
    },
    fr: {
      title: "Taille, recadrage, rotation et presets sociaux | Pure Image",
      description:
        "Px ou %, crop par ratio, pivoter et miroir, presets Instagram et YouTube — édition uniquement dans le navigateur.",
      keywords: ["redimensionner", "recadrer", "presets réseaux", "rotation", "local"],
    },
  },
  doc: {
    en: {
      title: "Document scan enhancer & images-to-PDF | Pure Image",
      description:
        "Boost contrast on phone photos of paperwork and merge multiple images into a PDF with jsPDF — built and downloaded in memory, no server.",
      keywords: ["scan enhance", "document photo", "images to PDF", "jsPDF", "local PDF"],
    },
    uk: {
      title: "Покращення сканів і збірка PDF з фото | Pure Image",
      description:
        "Контраст для фото документів з телефона та PDF із кількох зображень через jsPDF — збірка в пам’яті, без сервера.",
      keywords: ["покращити скан", "документ фото", "фото в PDF", "jsPDF", "локально"],
    },
    de: {
      title: "Scan verbessern & Bilder als PDF | Pure Image",
      description:
        "Kontrast für Handy-Fotos von Dokumenten und Mehrbild-PDF mit jsPDF — im Speicher erzeugt, ohne Server.",
      keywords: ["Scan verbessern", "Dokument Foto", "Bilder PDF", "jsPDF", "lokal"],
    },
    es: {
      title: "Mejorar escaneos y crear PDF desde imágenes | Pure Image",
      description:
        "Más contraste en fotos de documentos y PDF multipágina con jsPDF — generado en memoria, sin servidor.",
      keywords: ["mejorar escaneo", "documento foto", "imágenes PDF", "jsPDF", "local"],
    },
    pl: {
      title: "Poprawa skanów i PDF ze zdjęć | Pure Image",
      description:
        "Kontrast dla zdjęć dokumentów i wielostronicowy PDF przez jsPDF — w pamięci, bez serwera.",
      keywords: ["poprawić skan", "dokument zdjęcie", "zdjęcia PDF", "jsPDF", "lokalnie"],
    },
    fr: {
      title: "Amélioration de scans & images en PDF | Pure Image",
      description:
        "Contraste pour photos de documents et PDF multipages avec jsPDF — construit en mémoire, sans serveur.",
      keywords: ["améliorer scan", "document photo", "images PDF", "jsPDF", "local"],
    },
  },
};

const TOOL_META: Record<ToolRouteId, Record<Lang, SeoCopy>> = {
  "compress/smart": {
    en: {
      title: "Smart image compressor — adaptive quality & split preview | Pure Image",
      description:
        "Analyze photo content, tune JPEG/WebP quality, cap max width, and compare before/after in a split view — Canvas re-encode stays on your device.",
      keywords: ["smart compress", "adaptive quality", "before after", "local JPEG", "no upload"],
    },
    uk: {
      title: "Розумне стиснення — адаптивна якість і спліт-прев’ю | Pure Image",
      description:
        "Аналіз типу фото, якість JPEG/WebP, обмеження ширини та порівняння до/після — перекодування Canvas лише на пристрої.",
      keywords: ["розумне стиснення", "якість", "до після", "локально", "без сервера"],
    },
    de: {
      title: "Smart-Komprimierung — adaptive Qualität & Split-Vorschau | Pure Image",
      description:
        "Inhalt erkennen, JPEG/WebP-Qualität wählen, Maximalbreite und Vorher/Nachher-Split — Canvas nur lokal.",
      keywords: ["smart komprimieren", "Qualität", "Vorher Nachher", "lokal", "ohne Upload"],
    },
    es: {
      title: "Compresión inteligente — calidad adaptativa y vista dividida | Pure Image",
      description:
        "Detecta el tipo de foto, ajusta calidad JPEG/WebP, ancho máximo y compara antes/después — Canvas solo en tu dispositivo.",
      keywords: ["compresión smart", "calidad", "antes después", "local", "sin subir"],
    },
    pl: {
      title: "Inteligentna kompresja — jakość adaptacyjna i podgląd split | Pure Image",
      description:
        "Analiza zdjęcia, jakość JPEG/WebP, limit szerokości i porównanie przed/po — Canvas tylko lokalnie.",
      keywords: ["smart kompresja", "jakość", "przed po", "lokalnie", "bez uploadu"],
    },
    fr: {
      title: "Compression smart — qualité adaptive & aperçu split | Pure Image",
      description:
        "Détecte le type d’image, règle qualité JPEG/WebP, largeur max et compare avant/après — Canvas uniquement local.",
      keywords: ["compression smart", "qualité", "avant après", "local", "sans envoi"],
    },
  },
  "compress/to-size": {
    en: {
      title: "Compress image to exact KB — binary search & presets | Pure Image",
      description:
        "Hit attachment or form size limits with binary-search encoding, strict or closest-KB modes, format pick, and live size metrics in the browser.",
      keywords: ["compress to KB", "file size limit", "binary search", "attachment size", "local"],
    },
    uk: {
      title: "Стиснути до точного розміру в КБ — бінарний пошук | Pure Image",
      description:
        "Дотримуйтесь ліміту вкладень: бінарний підбір якості, режими «не перевищувати» чи «найближче», вибір формату та метрики КБ у браузері.",
      keywords: ["стиснути до КБ", "ліміт файлу", "вкладення", "локально", "браузер"],
    },
    de: {
      title: "Bild auf exakte KB komprimieren — Binärsuche | Pure Image",
      description:
        "Anhangs- oder Formularlimits per Binärsuche treffen, strikt oder nächste KB, Formatwahl und Live-KB im Browser.",
      keywords: ["KB Ziel", "Dateigröße", "Anhang", "lokal", "Browser"],
    },
    es: {
      title: "Comprimir a KB exactos — búsqueda binaria | Pure Image",
      description:
        "Cumple límites de adjuntos con búsqueda binaria, modo estricto o más cercano, formato y métricas KB en vivo — solo navegador.",
      keywords: ["comprimir KB", "límite archivo", "adjunto", "local", "navegador"],
    },
    pl: {
      title: "Kompresja do dokładnego KB — wyszukiwanie binarne | Pure Image",
      description:
        "Limit załącznika: wyszukiwanie binarne jakości, tryb ścisły lub najbliższy KB, format i metryki na żywo w przeglądarce.",
      keywords: ["kompresja KB", "limit pliku", "załącznik", "lokalnie", "przeglądarka"],
    },
    fr: {
      title: "Compresser à un Ko précis — recherche binaire | Pure Image",
      description:
        "Respectez les plafonds de pièces jointes via recherche binaire, mode strict ou le plus proche, format et métriques Ko en direct.",
      keywords: ["compresser Ko", "taille fichier", "pièce jointe", "local", "navigateur"],
    },
  },
  "compress/batch": {
    en: {
      title: "Batch image compression — queue, stats & ZIP export | Pure Image",
      description:
        "Drop dozens of photos, process two at a time locally, inspect per-file savings, tune quality, and download everything as a ZIP from the browser.",
      keywords: ["batch compress", "bulk resize", "ZIP download", "queue", "local batch"],
    },
    uk: {
      title: "Пакетне стиснення — черга, статистика та ZIP | Pure Image",
      description:
        "Додайте десятки фото, обробка по 2 паралельно локально, економія по файлах, налаштування якості та ZIP без сервера.",
      keywords: ["пакетне стиснення", "багато фото", "ZIP", "черга", "локально"],
    },
    de: {
      title: "Stapel-Komprimierung — Warteschlange, Statistik & ZIP | Pure Image",
      description:
        "Viele Fotos ablegen, zwei parallel lokal verarbeiten, Ersparnis pro Datei, Qualität feinjustieren und ZIP aus dem Browser.",
      keywords: ["Stapel komprimieren", "Massenverarbeitung", "ZIP", "Warteschlange", "lokal"],
    },
    es: {
      title: "Compresión por lotes — cola, estadísticas y ZIP | Pure Image",
      description:
        "Decenas de fotos, dos a la vez en local, ahorro por archivo, ajuste de calidad y ZIP desde el navegador sin servidor.",
      keywords: ["compresión lote", "varias fotos", "ZIP", "cola", "local"],
    },
    pl: {
      title: "Kompresja wsadowa — kolejka, statystyki i ZIP | Pure Image",
      description:
        "Dziesiątki zdjęć, dwa równolegle lokalnie, oszczędność per plik, jakość i pobranie ZIP z przeglądarki.",
      keywords: ["kompresja wsadowa", "wiele zdjęć", "ZIP", "kolejka", "lokalnie"],
    },
    fr: {
      title: "Compression par lot — file d’attente, stats & ZIP | Pure Image",
      description:
        "Des dizaines de photos, deux à la fois en local, économie par fichier, réglage qualité et ZIP depuis le navigateur.",
      keywords: ["compression lot", "plusieurs images", "ZIP", "file", "local"],
    },
  },
  "convert/to-webp": {
    en: {
      title: "Convert images to WebP — lossy, lossless & alpha | Pure Image",
      description:
        "Encode JPG, PNG, GIF, SVG, HEIC, or AVIF to WebP with lossy, lossless, or auto modes, transparency preserved, compare slider, and batch ZIP.",
      keywords: ["to WebP", "PNG WebP", "lossless WebP", "alpha WebP", "browser convert"],
    },
    uk: {
      title: "Конвертація в WebP — lossy, lossless і alpha | Pure Image",
      description:
        "JPG, PNG, GIF, SVG, HEIC чи AVIF у WebP: режими з втратами, без втрат або авто, прозорість, порівняння та ZIP у браузері.",
      keywords: ["у WebP", "PNG WebP", "lossless", "прозорість", "локально"],
    },
    de: {
      title: "Bilder nach WebP — lossy, lossless & Alpha | Pure Image",
      description:
        "JPG, PNG, GIF, SVG, HEIC oder AVIF nach WebP mit Modi, Transparenz, Vergleichs-Slider und ZIP-Stapel — nur Canvas.",
      keywords: ["WebP Konverter", "PNG WebP", "lossless", "Alpha", "lokal"],
    },
    es: {
      title: "Convertir a WebP — con/sin pérdida y transparencia | Pure Image",
      description:
        "JPG, PNG, GIF, SVG, HEIC o AVIF a WebP con modos, alpha, comparador y ZIP por lotes — solo Canvas local.",
      keywords: ["a WebP", "PNG WebP", "sin pérdida", "transparencia", "local"],
    },
    pl: {
      title: "Konwersja do WebP — stratna, bezstratna i alfa | Pure Image",
      description:
        "JPG, PNG, GIF, SVG, HEIC lub AVIF do WebP z trybami, przezroczystością, porównaniem i ZIP — tylko Canvas.",
      keywords: ["do WebP", "PNG WebP", "bezstratny", "alfa", "lokalnie"],
    },
    fr: {
      title: "Convertir en WebP — avec/sans perte et alpha | Pure Image",
      description:
        "JPG, PNG, GIF, SVG, HEIC ou AVIF vers WebP avec modes, transparence, comparateur et ZIP — Canvas local uniquement.",
      keywords: ["vers WebP", "PNG WebP", "sans perte", "alpha", "local"],
    },
  },
  "convert/to-avif": {
    en: {
      title: "Convert images to AVIF — effort presets & alpha | Pure Image",
      description:
        "Export modern AVIF from JPG, PNG, WebP, GIF, SVG, or HEIC with auto/lossy/lossless modes, encoding speed, live metrics, and batch ZIP when supported.",
      keywords: ["AVIF converter", "modern format", "encoding speed", "alpha AVIF", "local"],
    },
    uk: {
      title: "Конвертація в AVIF — effort, режими та alpha | Pure Image",
      description:
        "Сучасний AVIF з JPG, PNG, WebP, GIF, SVG чи HEIC: авто, з втратами чи без, швидкість кодування, метрики та ZIP у підтримуваних браузерах.",
      keywords: ["AVIF конвертер", "сучасний формат", "швидкість", "прозорість", "локально"],
    },
    de: {
      title: "Bilder nach AVIF — Effort-Presets & Alpha | Pure Image",
      description:
        "AVIF aus JPG, PNG, WebP, GIF, SVG oder HEIC mit Modi, Kodiergeschwindigkeit, Metriken und ZIP wenn der Browser AVIF kann.",
      keywords: ["AVIF Konverter", "moderne Formate", "Effort", "Alpha", "lokal"],
    },
    es: {
      title: "Convertir a AVIF — presets de esfuerzo y alpha | Pure Image",
      description:
        "AVIF desde JPG, PNG, WebP, GIF, SVG o HEIC con modos, velocidad de codificación, métricas y ZIP si el navegador lo soporta.",
      keywords: ["convertir AVIF", "formato moderno", "esfuerzo", "transparencia", "local"],
    },
    pl: {
      title: "Konwersja do AVIF — effort i alfa | Pure Image",
      description:
        "AVIF z JPG, PNG, WebP, GIF, SVG lub HEIC z trybami, szybkością kodowania, metrykami i ZIP gdy przeglądarka wspiera AVIF.",
      keywords: ["AVIF", "nowy format", "effort", "alfa", "lokalnie"],
    },
    fr: {
      title: "Convertir en AVIF — effort et transparence | Pure Image",
      description:
        "AVIF depuis JPG, PNG, WebP, GIF, SVG ou HEIC avec modes, vitesse d’encodage, métriques et ZIP si le navigateur le permet.",
      keywords: ["AVIF", "format moderne", "effort", "alpha", "local"],
    },
  },
  "convert/heic-to-jpg": {
    en: {
      title: "HEIC to JPG converter for iPhone photos — EXIF aware | Pure Image",
      description:
        "Decode .heic/.heif with heic2any, fix orientation, optional EXIF embed, quality presets, batch queue, compare view, and ZIP — no iCloud upload.",
      keywords: ["HEIC to JPG", "iPhone photos", "heic2any", "EXIF orientation", "Windows HEIC"],
    },
    uk: {
      title: "HEIC у JPG для фото iPhone — з урахуванням EXIF | Pure Image",
      description:
        "Декодування .heic/.heif через heic2any, виправлення орієнтації, EXIF за бажанням, пресети, черга, порівняння та ZIP — без хмари.",
      keywords: ["HEIC JPG", "iPhone", "heic2any", "орієнтація EXIF", "Windows"],
    },
    de: {
      title: "HEIC in JPG — iPhone-Fotos mit EXIF | Pure Image",
      description:
        ".heic/.heif per heic2any, Orientierung korrigieren, optionales EXIF, Presets, Stapel, Vergleich und ZIP — ohne Cloud.",
      keywords: ["HEIC JPG", "iPhone", "heic2any", "EXIF", "Windows"],
    },
    es: {
      title: "HEIC a JPG — fotos iPhone con EXIF | Pure Image",
      description:
        "Decodifica .heic/.heif con heic2any, orientación, EXIF opcional, presets, cola, comparación y ZIP — sin subir a la nube.",
      keywords: ["HEIC JPG", "iPhone", "heic2any", "orientación EXIF", "Windows"],
    },
    pl: {
      title: "HEIC do JPG — zdjęcia iPhone i EXIF | Pure Image",
      description:
        "Dekoduj .heic/.heif przez heic2any, orientacja, opcjonalne EXIF, presety, kolejka, porównanie i ZIP — bez chmury.",
      keywords: ["HEIC JPG", "iPhone", "heic2any", "EXIF", "Windows"],
    },
    fr: {
      title: "HEIC en JPG — photos iPhone et EXIF | Pure Image",
      description:
        "Décode .heic/.heif via heic2any, orientation, EXIF optionnel, presets, file, comparaison et ZIP — sans cloud.",
      keywords: ["HEIC JPG", "iPhone", "heic2any", "orientation EXIF", "Windows"],
    },
  },
  "convert/png-jpg": {
    en: {
      title: "PNG to JPG — backdrop fill, target KB & batch | Pure Image",
      description:
        "Flatten transparency with a custom backdrop, set JPEG quality or KB cap, queue screenshots and logos, compare compression, and ZIP locally.",
      keywords: ["PNG to JPG", "remove transparency", "screenshot JPG", "backdrop color", "local"],
    },
    uk: {
      title: "PNG у JPG — заливка фону, цільовий КБ, пакет | Pure Image",
      description:
        "Заміна прозорості кольором фону, якість JPEG або ліміт КБ, черга для скріншотів і логотипів, порівняння та ZIP локально.",
      keywords: ["PNG JPG", "прозорість", "скріншот", "фон", "локально"],
    },
    de: {
      title: "PNG in JPG — Hintergrund, KB-Ziel & Stapel | Pure Image",
      description:
        "Transparenz mit Hintergrundfarbe füllen, JPEG-Qualität oder KB-Limit, Warteschlange für Screenshots, Vergleich und ZIP lokal.",
      keywords: ["PNG JPG", "Transparenz", "Screenshot", "Hintergrund", "lokal"],
    },
    es: {
      title: "PNG a JPG — fondo, KB objetivo y lote | Pure Image",
      description:
        "Rellena transparencia con color de fondo, calidad o KB, cola para capturas y logos, comparación y ZIP en local.",
      keywords: ["PNG JPG", "transparencia", "captura", "fondo", "local"],
    },
    pl: {
      title: "PNG do JPG — tło, KB i wsadowo | Pure Image",
      description:
        "Wypełnij alfę kolorem tła, jakość JPEG lub KB, kolejka screenshotów i logo, porównanie i ZIP lokalnie.",
      keywords: ["PNG JPG", "przezroczystość", "zrzut ekranu", "tło", "lokalnie"],
    },
    fr: {
      title: "PNG en JPG — fond, Ko cible et lot | Pure Image",
      description:
        "Comblez la transparence avec une couleur de fond, qualité ou Ko, file pour captures et icônes, comparaison et ZIP local.",
      keywords: ["PNG JPG", "transparence", "capture", "fond", "local"],
    },
  },
  "convert/svg-to-img": {
    en: {
      title: "SVG to PNG or JPG — 1×–8× scale & sanitize | Pure Image",
      description:
        "Rasterize vectors at pixel presets or up to 8× scale, optional viewBox trim, SVG sanitize, 8× zoom compare, and batch ZIP in the browser.",
      keywords: ["SVG to PNG", "SVG to JPG", "rasterize SVG", "high DPI", "local"],
    },
    uk: {
      title: "SVG у PNG або JPG — масштаб 1×–8× і санітизація | Pure Image",
      description:
        "Растеризація векторів за пресетами пікселів або до 8×, viewBox, санітизація SVG, zoom 8×, пакет і ZIP лише у браузері.",
      keywords: ["SVG PNG", "SVG JPG", "растеризація", "високий DPI", "локально"],
    },
    de: {
      title: "SVG nach PNG oder JPG — 1×–8× & Sanitize | Pure Image",
      description:
        "Vektoren mit Pixel-Presets oder bis 8× rasterisieren, viewBox, SVG bereinigen, 8× Zoom, Stapel und ZIP im Browser.",
      keywords: ["SVG PNG", "SVG JPG", "rasterisieren", "hohe Auflösung", "lokal"],
    },
    es: {
      title: "SVG a PNG o JPG — escala 1×–8× y saneado | Pure Image",
      description:
        "Rasteriza vectores con presets o hasta 8×, viewBox, sanitiza SVG, zoom 8×, lote y ZIP solo en el navegador.",
      keywords: ["SVG PNG", "SVG JPG", "rasterizar", "alta resolución", "local"],
    },
    pl: {
      title: "SVG do PNG lub JPG — skala 1×–8× i sanityzacja | Pure Image",
      description:
        "Rasteryzuj wektory z presetami lub do 8×, viewBox, sanityzacja SVG, zoom 8×, wsadowo i ZIP w przeglądarce.",
      keywords: ["SVG PNG", "SVG JPG", "rasteryzacja", "wysokie DPI", "lokalnie"],
    },
    fr: {
      title: "SVG en PNG ou JPG — échelle 1×–8× et assainissement | Pure Image",
      description:
        "Rastérisez les vecteurs avec presets ou jusqu’à 8×, viewBox, SVG assaini, zoom 8×, lot et ZIP dans le navigateur.",
      keywords: ["SVG PNG", "SVG JPG", "rastériser", "haute résolution", "local"],
    },
  },
  "edit/resize": {
    en: {
      title: "Resize images by pixels or percent — Fit, Fill, Stretch | Pure Image",
      description:
        "Set width/height in px or %, lock aspect, use Fit/Fill/Stretch, social and 4K presets, output format, batch compare, and ZIP without uploading.",
      keywords: ["resize image", "scale percent", "Fit Fill Stretch", "4K preset", "local resize"],
    },
    uk: {
      title: "Зміна розміру зображення — px, % і Fit/Fill/Stretch | Pure Image",
      description:
        "Ширина/висота в px або %, блокування пропорцій, Fit/Fill/Stretch, пресети соцмереж і 4K, формат, пакет і ZIP без сервера.",
      keywords: ["змінити розмір", "відсотки", "пропорції", "пресет 4K", "локально"],
    },
    de: {
      title: "Bildgröße ändern — Pixel, % und Fit/Fill/Stretch | Pure Image",
      description:
        "Breite/Höhe in px oder %, Seitenverhältnis, Fit/Fill/Stretch, Social- und 4K-Presets, Format, Stapel und ZIP ohne Upload.",
      keywords: ["Bild skalieren", "Prozent", "Seitenverhältnis", "4K", "lokal"],
    },
    es: {
      title: "Redimensionar imágenes — px, % y Fit/Fill/Stretch | Pure Image",
      description:
        "Ancho/alto en px o %, bloquear ratio, Fit/Fill/Stretch, presets sociales y 4K, formato, lote y ZIP sin subir.",
      keywords: ["redimensionar", "porcentaje", "proporción", "4K", "local"],
    },
    pl: {
      title: "Zmiana rozmiaru — px, % i Fit/Fill/Stretch | Pure Image",
      description:
        "Szerokość/wysokość w px lub %, proporcje, Fit/Fill/Stretch, presety social i 4K, format, wsadowo i ZIP bez uploadu.",
      keywords: ["zmienić rozmiar", "procent", "proporcje", "4K", "lokalnie"],
    },
    fr: {
      title: "Redimensionner — px, % et Fit/Fill/Stretch | Pure Image",
      description:
        "Largeur/hauteur en px ou %, ratio verrouillé, Fit/Fill/Stretch, presets sociaux et 4K, format, lot et ZIP sans envoi.",
      keywords: ["redimensionner", "pourcentage", "ratio", "4K", "local"],
    },
  },
  "edit/presets": {
    en: {
      title: "Social media image sizes — Instagram, YouTube, LinkedIn presets | Pure Image",
      description:
        "Pick exact pixels for Instagram, Facebook, X, YouTube, LinkedIn, TikTok, and Pinterest with pan/zoom crop, safe zones, Cover/Contain, and batch ZIP.",
      keywords: ["Instagram size", "YouTube banner", "social presets", "story dimensions", "local crop"],
    },
    uk: {
      title: "Розміри для соцмереж — пресети Instagram, YouTube, LinkedIn | Pure Image",
      description:
        "Точні px для Instagram, Facebook, X, YouTube, LinkedIn, TikTok і Pinterest: pan/zoom, safe-зони, Cover/Contain і ZIP у браузері.",
      keywords: ["розмір Instagram", "банер YouTube", "пресети", "сторіз", "локально"],
    },
    de: {
      title: "Social-Media-Bildgrößen — Instagram, YouTube, LinkedIn | Pure Image",
      description:
        "Exakte Pixel für Instagram, Facebook, X, YouTube, LinkedIn, TikTok und Pinterest mit Pan/Zoom, Safe Zones, Cover/Contain und ZIP.",
      keywords: ["Instagram Größe", "YouTube Banner", "Presets", "Story", "lokal"],
    },
    es: {
      title: "Tamaños para redes — presets Instagram, YouTube, LinkedIn | Pure Image",
      description:
        "Píxeles exactos para Instagram, Facebook, X, YouTube, LinkedIn, TikTok y Pinterest con pan/zoom, zonas seguras, Cover/Contain y ZIP.",
      keywords: ["tamaño Instagram", "banner YouTube", "presets", "historias", "local"],
    },
    pl: {
      title: "Rozmiary social media — presety Instagram, YouTube, LinkedIn | Pure Image",
      description:
        "Dokładne px dla Instagram, Facebook, X, YouTube, LinkedIn, TikTok i Pinterest: pan/zoom, strefy bezpieczne, Cover/Contain i ZIP.",
      keywords: ["rozmiar Instagram", "baner YouTube", "presety", "stories", "lokalnie"],
    },
    fr: {
      title: "Tailles réseaux sociaux — presets Instagram, YouTube, LinkedIn | Pure Image",
      description:
        "Pixels exacts pour Instagram, Facebook, X, YouTube, LinkedIn, TikTok et Pinterest avec pan/zoom, zones sûres, Cover/Contain et ZIP.",
      keywords: ["taille Instagram", "bannière YouTube", "presets", "story", "local"],
    },
  },
  "edit/crop": {
    en: {
      title: "Crop image by aspect ratio — 1:1, 16:9, 9:16 & custom | Pure Image",
      description:
        "Interactive handles, rule-of-thirds grid, presets from square to ultrawide, free and custom ratios, batch queue, compare, and ZIP on device.",
      keywords: ["crop 16:9", "square crop", "aspect ratio", "rule of thirds", "local crop"],
    },
    uk: {
      title: "Обрізка за пропорціями — 1:1, 16:9, 9:16 і свої | Pure Image",
      description:
        "Інтерактивні ручки, сітка третин, пресети від квадрата до ультраширокого, вільний і власний ratio, черга, порівняння та ZIP на пристрої.",
      keywords: ["обрізка 16:9", "квадрат", "пропорції", "третини", "локально"],
    },
    de: {
      title: "Zuschneiden nach Seitenverhältnis — 1:1, 16:9, 9:16 | Pure Image",
      description:
        "Interaktive Griffe, Drittelraster, Presets von Quadrat bis Ultrawide, frei und eigenes Ratio, Stapel, Vergleich und ZIP lokal.",
      keywords: ["Crop 16:9", "Quadrat", "Seitenverhältnis", "Drittel", "lokal"],
    },
    es: {
      title: "Recortar por proporción — 1:1, 16:9, 9:16 y personalizado | Pure Image",
      description:
        "Manijas interactivas, regla de tercios, presets cuadrado a ultrawide, libre y ratio custom, cola, comparación y ZIP local.",
      keywords: ["recorte 16:9", "cuadrado", "proporción", "tercios", "local"],
    },
    pl: {
      title: "Kadrowanie proporcji — 1:1, 16:9, 9:16 i własne | Pure Image",
      description:
        "Uchwyty, siatka trójpodziału, presety od kwadratu do ultrawide, wolne i własne ratio, kolejka, porównanie i ZIP lokalnie.",
      keywords: ["kadrowanie 16:9", "kwadrat", "proporcje", "trójpodział", "lokalnie"],
    },
    fr: {
      title: "Recadrage par ratio — 1:1, 16:9, 9:16 et perso | Pure Image",
      description:
        "Poignées interactives, grille des tiers, presets carré à ultrawide, libre et ratio perso, file, comparaison et ZIP local.",
      keywords: ["recadrage 16:9", "carré", "ratio", "tiers", "local"],
    },
  },
  "edit/rotate": {
    en: {
      title: "Rotate and flip images — ±90°, custom angle, mirror | Pure Image",
      description:
        "Rotate ±90° or any angle, horizontal/vertical flip, canvas fill modes for empty corners, EXIF-aware decode, batch compare, and ZIP locally.",
      keywords: ["rotate image", "flip mirror", "custom angle", "EXIF rotate", "local"],
    },
    uk: {
      title: "Поворот і дзеркало — ±90°, довільний кут | Pure Image",
      description:
        "Поворот ±90° або свій кут, flip по горизонталі/вертикалі, заливка canvas, декодування з EXIF, пакет, порівняння та ZIP локально.",
      keywords: ["повернути фото", "дзеркало", "кут", "EXIF", "локально"],
    },
    de: {
      title: "Drehen & spiegeln — ±90°, freier Winkel | Pure Image",
      description:
        "±90° oder beliebiger Winkel, horizontal/vertikal spiegeln, Canvas-Füllmodi, EXIF-Decode, Stapel, Vergleich und ZIP lokal.",
      keywords: ["Bild drehen", "spiegeln", "Winkel", "EXIF", "lokal"],
    },
    es: {
      title: "Girar y espejar — ±90°, ángulo libre | Pure Image",
      description:
        "Gira ±90° o ángulo custom, volteo H/V, modos de relleno canvas, decode EXIF, lote, comparación y ZIP local.",
      keywords: ["girar imagen", "espejo", "ángulo", "EXIF", "local"],
    },
    pl: {
      title: "Obrót i odbicie — ±90°, dowolny kąt | Pure Image",
      description:
        "Obrót ±90° lub własny kąt, odbicie H/V, wypełnienie canvas, decode EXIF, wsadowo, porównanie i ZIP lokalnie.",
      keywords: ["obrócić zdjęcie", "odbicie", "kąt", "EXIF", "lokalnie"],
    },
    fr: {
      title: "Rotation & miroir — ±90°, angle libre | Pure Image",
      description:
        "Tournez ±90° ou angle perso, miroir H/V, modes de fond canvas, decode EXIF, lot, comparaison et ZIP local.",
      keywords: ["pivoter image", "miroir", "angle", "EXIF", "local"],
    },
  },
  "doc/enhance-scan": {
    en: {
      title: "Enhance document scans — contrast, sharpen, denoise | Pure Image",
      description:
        "Flatten uneven lighting on phone photos of text, boost contrast and sharpness, reduce noise, presets for B&W and gray docs, batch compare, and ZIP.",
      keywords: ["scan enhance", "document photo", "contrast text", "denoise scan", "local"],
    },
    uk: {
      title: "Покращення сканів документів — контраст, різкість, шум | Pure Image",
      description:
        "Вирівнювання освітлення на фото тексту з телефона, контраст і різкість, зменшення шуму, пресети Ч/Б і сірого, пакет і ZIP.",
      keywords: ["покращити скан", "документ", "контраст тексту", "шум", "локально"],
    },
    de: {
      title: "Dokument-Scan verbessern — Kontrast, Schärfe, Rauschen | Pure Image",
      description:
        "Ungleichmäßiges Licht auf Handy-Textfotos glätten, Kontrast und Schärfe, Entrauschen, S/W- und Graustufen-Presets, Stapel und ZIP.",
      keywords: ["Scan verbessern", "Dokument", "Kontrast Text", "Rauschen", "lokal"],
    },
    es: {
      title: "Mejorar escaneos de documentos — contraste y nitidez | Pure Image",
      description:
        "Nivela luz en fotos de texto, más contraste y nitidez, reduce ruido, presets B/N y gris, lote y ZIP local.",
      keywords: ["mejorar escaneo", "documento", "contraste texto", "ruido", "local"],
    },
    pl: {
      title: "Poprawa skanów dokumentów — kontrast, ostrość, szum | Pure Image",
      description:
        "Wyrównaj światło na zdjęciach tekstu, kontrast i ostrość, redukcja szumu, presety BW i szarości, wsadowo i ZIP.",
      keywords: ["poprawić skan", "dokument", "kontrast tekstu", "szum", "lokalnie"],
    },
    fr: {
      title: "Améliorer scans de documents — contraste, netteté, bruit | Pure Image",
      description:
        "Aplatis l’éclairage sur photos de texte, contraste et netteté, réduction du bruit, presets N&B et gris, lot et ZIP.",
      keywords: ["améliorer scan", "document", "contraste texte", "bruit", "local"],
    },
  },
  "doc/images-to-pdf": {
    en: {
      title: "Images to PDF — reorder pages, margins, A4/Letter | Pure Image",
      description:
        "Build multi-page PDFs with jsPDF: drag to reorder, per-page rotation, paper size, margins, compression, live preview — exported entirely in-browser.",
      keywords: ["images to PDF", "photo album PDF", "jsPDF", "A4 PDF", "local PDF maker"],
    },
    uk: {
      title: "Зображення в PDF — порядок сторінок, поля, A4/Letter | Pure Image",
      description:
        "Багатосторінковий PDF через jsPDF: перетягування порядку, поворот сторінок, формат паперу, поля, стиснення, прев’ю — лише у браузері.",
      keywords: ["фото в PDF", "альбом PDF", "jsPDF", "A4", "локально"],
    },
    de: {
      title: "Bilder als PDF — Reihenfolge, Ränder, A4/Letter | Pure Image",
      description:
        "Mehrseitiges PDF mit jsPDF: Reihenfolge, Rotation, Papierformat, Ränder, Kompression, Vorschau — komplett im Browser.",
      keywords: ["Bilder PDF", "Fotoalbum PDF", "jsPDF", "A4", "lokal"],
    },
    es: {
      title: "Imágenes a PDF — orden, márgenes, A4/Letter | Pure Image",
      description:
        "PDF multipágina con jsPDF: reordenar, rotar páginas, tamaño, márgenes, compresión y vista previa — solo en el navegador.",
      keywords: ["imágenes PDF", "álbum PDF", "jsPDF", "A4", "local"],
    },
    pl: {
      title: "Zdjęcia do PDF — kolejność, marginesy, A4/Letter | Pure Image",
      description:
        "Wielostronicowy PDF przez jsPDF: kolejność, obrót stron, format, marginesy, kompresja, podgląd — tylko w przeglądarce.",
      keywords: ["zdjęcia PDF", "album PDF", "jsPDF", "A4", "lokalnie"],
    },
    fr: {
      title: "Images en PDF — ordre, marges, A4/Letter | Pure Image",
      description:
        "PDF multipages avec jsPDF : ordre, rotation, format, marges, compression, aperçu — entièrement dans le navigateur.",
      keywords: ["images PDF", "album PDF", "jsPDF", "A4", "local"],
    },
  },
};

export function getMetadataCopy(page: PageId, lang: Lang): SeoCopy {
  if (page === "home") return HOME[lang];
  if ((CATEGORIES as readonly string[]).includes(page)) {
    return CATEGORY_META[page as CategoryId][lang];
  }
  if ((TOOL_ROUTE_IDS as readonly string[]).includes(page)) {
    return TOOL_META[page as ToolRouteId][lang];
  }
  return HOME.en;
}