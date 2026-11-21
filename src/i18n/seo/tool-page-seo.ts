import type { Lang } from "@/i18n/locales";
import type { PageSeoContent } from "@/i18n/seo/page-content";
import { getToolCopy } from "@/i18n/tool-messages";
import type { ToolRouteId } from "@/lib/tools/routes";

type ToolFaqBundle = Pick<PageSeoContent, "benefitsTitle" | "benefitPoints" | "faqTitle" | "faqs">;

const LOCAL_BROWSER: Record<Lang, string> = {
  en: "Processing stays in your browser tab — nothing is uploaded to img.kixt.net.",
  uk: "Обробка лише у вкладці браузера — нічого не завантажується на img.kixt.net.",
  de: "Die Verarbeitung bleibt im Browser — kein Upload zu img.kixt.net.",
  es: "El procesamiento queda en el navegador — sin subida a img.kixt.net.",
  pl: "Przetwarzanie w przeglądarce — bez wysyłania na img.kixt.net.",
  fr: "Le traitement reste dans le navigateur — aucun envoi vers img.kixt.net.",
};

const EN: Record<ToolRouteId, ToolFaqBundle> = {
  "compress/smart": {
    benefitsTitle: "Smart compression without cloud re-encoding",
    benefitPoints: ["Adaptive quality per photo type", "Split before/after slider", "Optional max width for pages"],
    faqTitle: "Smart compress — common questions",
    faqs: [
      { question: "Is my file sent to a server for smart analysis?", answer: "No. Metrics and re-encoding use Canvas locally." },
      { question: "Can I compare quality before download?", answer: "Yes — the split preview shows original vs compressed pixels in-browser." },
      { question: "When should I use smart vs batch?", answer: "Smart is best for one-offs; open Batch compress for dozens of files and ZIP export." },
    ],
  },
  "compress/to-size": {
    benefitsTitle: "Hit exact KB limits for forms and email",
    benefitPoints: ["Binary-search to your KB cap", "Strict or closest-size modes", "Live KB readout while tuning"],
    faqTitle: "Compress to KB — FAQ",
    faqs: [
      { question: "How does binary search work here?", answer: "The tool adjusts quality locally until the encoded file meets your KB target or closest match." },
      { question: "Will it overshoot my attachment limit?", answer: "Use strict mode to stay at or under the cap; closest mode picks the nearest size under the limit." },
      { question: "Does KB targeting upload my image?", answer: "Never — encoding loops run entirely client-side." },
    ],
  },
  "compress/batch": {
    benefitsTitle: "Batch shrink many photos with one ZIP",
    benefitPoints: ["Queue dozens of images", "Two parallel local workers", "Per-file savings and ZIP download"],
    faqTitle: "Batch compression FAQ",
    faqs: [
      { question: "How many files can I queue?", answer: "Add as many as your device memory allows; processing stays local with progress per file." },
      { question: "Is ZIP created on a server?", answer: "No — the archive is assembled in memory and downloaded from your browser." },
      { question: "Can I tune quality per photo?", answer: "Yes — adjust settings and re-run individual items before exporting the ZIP." },
    ],
  },
  "convert/to-webp": {
    benefitsTitle: "Modern WebP export with alpha preserved",
    benefitPoints: ["Lossy, lossless, or auto WebP", "Transparency on PNG/SVG sources", "Compare slider and batch ZIP"],
    faqTitle: "WebP converter FAQ",
    faqs: [
      { question: "Will transparent PNG stay transparent?", answer: "Yes — alpha is carried into WebP when the source has transparency." },
      { question: "Can I convert HEIC to WebP?", answer: "HEIC is decoded locally first, then encoded to WebP on Canvas." },
      { question: "Is WebP encoding done online?", answer: "Encoding happens only in your browser via Canvas." },
    ],
  },
  "convert/to-avif": {
    benefitsTitle: "Next-gen AVIF when your browser supports it",
    benefitPoints: ["Auto, lossy, or lossless AVIF", "Encoding speed / effort controls", "Fallback messaging if AVIF unavailable"],
    faqTitle: "AVIF converter FAQ",
    faqs: [
      { question: "Why might AVIF export fail?", answer: "Some browsers lack AVIF encoding — try WebP or update the browser; decoding still stays local." },
      { question: "Does AVIF keep alpha?", answer: "Yes for supported sources — transparency is passed through during local encode." },
      { question: "Are HEIC iPhone shots supported?", answer: "They are decoded with heic2any locally before AVIF export." },
    ],
  },
  "convert/heic-to-jpg": {
    benefitsTitle: "Open iPhone HEIC on any desktop",
    benefitPoints: ["heic2any decode in-browser", "EXIF orientation fix", "Optional metadata embed & batch"],
    faqTitle: "HEIC to JPG FAQ",
    faqs: [
      { question: "Do I need Apple software installed?", answer: "No — heic2any decodes HEIC/HEIF inside the browser." },
      { question: "Will photos appear rotated wrong?", answer: "EXIF orientation is applied before JPG export so pixels display upright." },
      { question: "Is iCloud involved?", answer: "Files never leave your device — no cloud upload or account." },
    ],
  },
  "convert/png-jpg": {
    benefitsTitle: "Flatten PNG transparency for smaller JPGs",
    benefitPoints: ["Custom backdrop behind alpha", "Quality or KB targeting", "Batch for screenshots and icons"],
    faqTitle: "PNG to JPG FAQ",
    faqs: [
      { question: "What happens to transparent areas?", answer: "You pick a backdrop color that replaces alpha before JPEG export." },
      { question: "Can I keep lossless PNG instead?", answer: "This tool targets JPG — use WebP or AVIF converters for modern lossless options." },
      { question: "Are logos uploaded for conversion?", answer: "No — Canvas draws pixels locally and triggers a download." },
    ],
  },
  "convert/svg-to-img": {
    benefitsTitle: "Rasterize SVG at crisp high DPI",
    benefitPoints: ["1×–8× scale and pixel presets", "Optional viewBox trim & sanitize", "8× zoom compare before export"],
    faqTitle: "SVG to PNG/JPG FAQ",
    faqs: [
      { question: "Why scale SVG before export?", answer: "Higher scale yields sharper raster output for print and retina screens." },
      { question: "Is external SVG fetching used?", answer: "SVG is read from your file locally; sanitization runs before drawing to Canvas." },
      { question: "PNG or JPG for icons?", answer: "Choose PNG to keep transparency; JPG with backdrop for smallest weight." },
    ],
  },
  "edit/resize": {
    benefitsTitle: "Resize by pixels, percent, or social presets",
    benefitPoints: ["Fit, Fill, or Stretch modes", "Aspect lock and 4K presets", "Batch compare with ZIP"],
    faqTitle: "Resize image FAQ",
    faqs: [
      { question: "Is upscaling recommended?", answer: "Downscaling looks best; upscaling interpolates locally but cannot add real detail." },
      { question: "What does Fit vs Fill do?", answer: "Fit letterboxes inside the box; Fill crops to cover — both computed on Canvas." },
      { question: "Does resize upload to img.kixt.net?", answer: "No — dimensions are applied in your browser and downloaded." },
    ],
  },
  "edit/presets": {
    benefitsTitle: "Exact pixels for Instagram, YouTube, LinkedIn",
    benefitPoints: ["Platform-specific width/height catalog", "Pan/zoom with safe zones", "Cover or Contain crop modes"],
    faqTitle: "Social presets FAQ",
    faqs: [
      { question: "Are sizes official network specs?", answer: "Presets follow commonly published dimensions; always verify current platform guidelines." },
      { question: "Can I batch export multiple presets?", answer: "Queue files and export ZIP — each render is generated locally." },
      { question: "Do presets send images to social APIs?", answer: "No API calls — you download files and upload manually where you want." },
    ],
  },
  "edit/crop": {
    benefitsTitle: "Crop to ratio with a live thirds grid",
    benefitPoints: ["Presets from 1:1 to ultrawide", "Freeform and custom ratios", "Batch queue with compare"],
    faqTitle: "Aspect crop FAQ",
    faqs: [
      { question: "Can I crop 9:16 for stories?", answer: "Yes — pick the 9:16 preset and drag the frame before export." },
      { question: "Is crop destructive on the original file?", answer: "Your source file stays untouched; a new image is downloaded." },
      { question: "Where is crop calculated?", answer: "Coordinates are applied on Canvas entirely client-side." },
    ],
  },
  "edit/rotate": {
    benefitsTitle: "Fix orientation with rotate and mirror",
    benefitPoints: ["±90° or custom angle", "Horizontal and vertical flip", "Canvas fill for empty corners"],
    faqTitle: "Rotate & flip FAQ",
    faqs: [
      { question: "Does rotate respect EXIF?", answer: "Images are decoded with orientation applied so WYSIWYG matches export." },
      { question: "What are canvas fill modes?", answer: "They choose backdrop color when rotation leaves empty corners." },
      { question: "Can I mirror a batch?", answer: "Yes — queue files, flip or rotate, and ZIP locally." },
    ],
  },
  "doc/enhance-scan": {
    benefitsTitle: "Make phone photos of paperwork readable",
    benefitPoints: ["Flatten uneven lighting", "Contrast, sharpness, denoise sliders", "Presets for B&W and gray text"],
    faqTitle: "Scan enhance FAQ",
    faqs: [
      { question: "Is this OCR text recognition?", answer: "No OCR — it improves pixels so you or another app can read text more easily." },
      { question: "Will it fix heavy blur?", answer: "Sharpening helps mild blur; very blurry shots cannot be fully recovered locally." },
      { question: "Where are filters applied?", answer: "Adjustments run on Canvas in your browser — no server pipeline." },
    ],
  },
  "doc/images-to-pdf": {
    benefitsTitle: "Build PDF albums without a desktop suite",
    benefitPoints: ["Drag to reorder pages", "A4, Letter, or fit-to-image", "jsPDF generated in memory"],
    faqTitle: "Images to PDF FAQ",
    faqs: [
      { question: "Is jsPDF running on a server?", answer: "jsPDF executes in the browser tab; the PDF bytes are downloaded locally." },
      { question: "Can I mix portrait and landscape?", answer: "Each page keeps its image dimensions; paper size settings control layout." },
      { question: "Are my scans stored online?", answer: "No accounts or storage — closing the tab clears in-memory data." },
    ],
  },
};

const UK: Record<ToolRouteId, ToolFaqBundle> = {
  "compress/smart": {
    benefitsTitle: "Розумне стиснення без хмарного перекодування",
    benefitPoints: ["Адаптивна якість під тип фото", "Спліт-прев’ю до/після", "Необов’язкова макс. ширина для сайту"],
    faqTitle: "Розумне стиснення — питання",
    faqs: [
      { question: "Чи файл відправляють на сервер для аналізу?", answer: "Ні. Метрики й перекодування — лише Canvas локально." },
      { question: "Чи можна порівняти якість перед завантаженням?", answer: "Так — спліт показує оригінал і стиснене зображення у браузері." },
      { question: "Коли обрати smart замість пакетного?", answer: "Smart — для окремих файлів; пакетне стиснення — для десятків фото та ZIP." },
    ],
  },
  "compress/to-size": {
    benefitsTitle: "Точний розмір у КБ для форм і пошти",
    benefitPoints: ["Бінарний підбір до ліміту КБ", "Режими «не перевищувати» або «найближче»", "Метрики КБ наживо"],
    faqTitle: "Стиснення до КБ — FAQ",
    faqs: [
      { question: "Як працює бінарний пошук?", answer: "Якість змінюється локально, доки файл не досягне цілі або найближчого розміру." },
      { question: "Чи перевищить ліміт вкладення?", answer: "У строгому режимі — ні; у «найближче» — максимально близько під ліміт." },
      { question: "Чи завантажують зображення для підбору КБ?", answer: "Ніколи — цикли кодування лише на клієнті." },
    ],
  },
  "compress/batch": {
    benefitsTitle: "Пакетно зменшити багато фото одним ZIP",
    benefitPoints: ["Черга з десятків зображень", "Два паралельні локальні потоки", "Економія по файлах і ZIP"],
    faqTitle: "Пакетне стиснення — FAQ",
    faqs: [
      { question: "Скільки файлів у черзі?", answer: "Скільки дозволяє пам’ять пристрою; прогрес показується для кожного файлу." },
      { question: "Чи ZIP створюють на сервері?", answer: "Ні — архів збирається в пам’яті та завантажується з браузера." },
      { question: "Чи можна налаштувати якість окремо?", answer: "Так — змінюйте параметри й перезапускайте окремі елементи перед ZIP." },
    ],
  },
  "convert/to-webp": {
    benefitsTitle: "Сучасний WebP із збереженням alpha",
    benefitPoints: ["Lossy, lossless або авто WebP", "Прозорість з PNG/SVG", "Порівняння та пакетний ZIP"],
    faqTitle: "Конвертер WebP — FAQ",
    faqs: [
      { question: "Чи залишиться прозорість PNG?", answer: "Так — alpha переноситься в WebP, якщо була у джерела." },
      { question: "Чи можна HEIC у WebP?", answer: "HEIC спочатку декодується локально, потім кодується в WebP на Canvas." },
      { question: "Чи кодують WebP онлайн?", answer: "Лише у вашому браузері через Canvas." },
    ],
  },
  "convert/to-avif": {
    benefitsTitle: "AVIF нового покоління, якщо браузер підтримує",
    benefitPoints: ["Авто, з втратами або без", "Керування швидкістю кодування", "Підказка, якщо AVIF недоступний"],
    faqTitle: "Конвертер AVIF — FAQ",
    faqs: [
      { question: "Чому AVIF може не експортуватися?", answer: "Деякі браузери не кодують AVIF — спробуйте WebP; декодування лишається локальним." },
      { question: "Чи зберігається alpha в AVIF?", answer: "Так для підтримуваних джерел — прозорість передається при локальному кодуванні." },
      { question: "Чи підтримуються HEIC з iPhone?", answer: "Так — heic2any декодує локально перед експортом AVIF." },
    ],
  },
  "convert/heic-to-jpg": {
    benefitsTitle: "Відкрити HEIC iPhone на будь-якому ПК",
    benefitPoints: ["heic2any у браузері", "Виправлення орієнтації EXIF", "Метадані та пакет за бажанням"],
    faqTitle: "HEIC у JPG — FAQ",
    faqs: [
      { question: "Чи потрібне ПЗ Apple?", answer: "Ні — heic2any декодує HEIC/HEIF у вкладці браузера." },
      { question: "Чи фото будуть перекручені?", answer: "Орієнтація EXIF застосовується перед експортом JPG." },
      { question: "Чи задіяний iCloud?", answer: "Файли не покидають пристрій — без хмари й обліковки." },
    ],
  },
  "convert/png-jpg": {
    benefitsTitle: "Прибрати прозорість PNG для меншого JPG",
    benefitPoints: ["Власний фон під alpha", "Якість або цільовий КБ", "Пакет для скріншотів і іконок"],
    faqTitle: "PNG у JPG — FAQ",
    faqs: [
      { question: "Що з прозорими ділянками?", answer: "Ви обираєте колір фону, який замінює alpha перед JPEG." },
      { question: "Чи залишити lossless PNG?", answer: "Цей інструмент для JPG — для сучасних форматів дивіться WebP/AVIF." },
      { question: "Чи завантажують логотипи на сервер?", answer: "Ні — Canvas малює локально й запускає завантаження." },
    ],
  },
  "convert/svg-to-img": {
    benefitsTitle: "Растеризація SVG у чіткому високому DPI",
    benefitPoints: ["Масштаб 1×–8× і пресети px", "viewBox і санітизація", "Zoom 8× перед експортом"],
    faqTitle: "SVG у PNG/JPG — FAQ",
    faqs: [
      { question: "Навіщо масштабувати SVG?", answer: "Більший масштаб дає чіткіший растр для друку та Retina." },
      { question: "Чи підвантажують SVG з інтернету?", answer: "SVG читається з вашого файлу; санітизація перед Canvas." },
      { question: "PNG чи JPG для іконок?", answer: "PNG — прозорість; JPG з фоном — менший розмір." },
    ],
  },
  "edit/resize": {
    benefitsTitle: "Розмір у px, відсотках або соцпресетах",
    benefitPoints: ["Fit, Fill або Stretch", "Блокування пропорцій і 4K", "Пакет із порівнянням і ZIP"],
    faqTitle: "Зміна розміру — FAQ",
    faqs: [
      { question: "Чи варто збільшувати?", answer: "Краще зменшувати; збільшення інтерполює локально без нових деталей." },
      { question: "Fit чи Fill?", answer: "Fit вписує з полями; Fill обрізає під заповнення — на Canvas." },
      { question: "Чи завантажують на img.kixt.net?", answer: "Ні — розміри застосовуються у браузері та завантажуються." },
    ],
  },
  "edit/presets": {
    benefitsTitle: "Точні пікселі для Instagram, YouTube, LinkedIn",
    benefitPoints: ["Каталог розмірів платформ", "Pan/zoom і safe-зони", "Cover або Contain"],
    faqTitle: "Пресети соцмереж — FAQ",
    faqs: [
      { question: "Чи це офіційні розміри мереж?", answer: "Пресети за поширеними специфікаціями; перевіряйте актуальні правила платформ." },
      { question: "Чи можна пакетно експортувати?", answer: "Так — черга й ZIP; кожен рендер локально." },
      { question: "Чи є виклики API соцмереж?", answer: "Ні — ви самі завантажуєте файли куди потрібно." },
    ],
  },
  "edit/crop": {
    benefitsTitle: "Обрізка за ratio з сіткою третин",
    benefitPoints: ["Від 1:1 до ультраширокого", "Вільно й свій ratio", "Пакетна черга"],
    faqTitle: "Обрізка — FAQ",
    faqs: [
      { question: "Чи є 9:16 для stories?", answer: "Так — оберіть 9:16 і налаштуйте рамку перед експортом." },
      { question: "Чи змінюється оригінал?", answer: "Ні — завантажується новий файл." },
      { question: "Де рахується обрізка?", answer: "Координати на Canvas лише на клієнті." },
    ],
  },
  "edit/rotate": {
    benefitsTitle: "Виправити орієнтацію поворотом і дзеркалом",
    benefitPoints: ["±90° або свій кут", "Flip по горизонталі/вертикалі", "Заливка canvas для кутів"],
    faqTitle: "Поворот і flip — FAQ",
    faqs: [
      { question: "Чи враховується EXIF?", answer: "Декодування з орієнтацією, щоб прев’ю збігалося з експортом." },
      { question: "Що таке режими заливки?", answer: "Колір фону для порожніх кутів після повороту." },
      { question: "Чи можна пакетно дзеркалити?", answer: "Так — черга, flip/rotate, ZIP локально." },
    ],
  },
  "doc/enhance-scan": {
    benefitsTitle: "Зробити фото документів читабельними",
    benefitPoints: ["Вирівняти нерівне світло", "Контраст, різкість, шум", "Пресети Ч/Б і сірого"],
    faqTitle: "Покращення скану — FAQ",
    faqs: [
      { question: "Це OCR розпізнавання тексту?", answer: "Ні — лише покращення пікселів для легшого читання." },
      { question: "Чи вилікує сильне розмиття?", answer: "Легке — так; дуже розмите фото не відновити повністю локально." },
      { question: "Де застосовуються фільтри?", answer: "На Canvas у браузері — без серверного конвеєра." },
    ],
  },
  "doc/images-to-pdf": {
    benefitsTitle: "PDF-альбом без настільного пакета",
    benefitPoints: ["Перетягування порядку сторінок", "A4, Letter або по зображенню", "jsPDF у пам’яті"],
    faqTitle: "Зображення в PDF — FAQ",
    faqs: [
      { question: "Чи jsPDF на сервері?", answer: "jsPDF у вкладці; байти PDF завантажуються локально." },
      { question: "Чи можна змішати портрет і альбом?", answer: "Кожна сторінка зберігає розміри зображення; формат паперу керує макетом." },
      { question: "Чи зберігають скани онлайн?", answer: "Ні обліковок — закриття вкладки очищує пам’ять." },
    ],
  },
};

type LangBundle = Record<ToolRouteId, ToolFaqBundle>;

function localizeEnBundle(bundle: ToolFaqBundle, headings: { title: string; points: string[]; faq: string }): ToolFaqBundle {
  return {
    benefitsTitle: headings.title,
    benefitPoints: headings.points,
    faqTitle: headings.faq,
    faqs: bundle.faqs,
  };
}

const DE: LangBundle = Object.fromEntries(
  (Object.entries(EN) as [ToolRouteId, ToolFaqBundle][]).map(([id, base]) => {
    const titles: Record<ToolRouteId, { title: string; points: string[]; faq: string }> = {
      "compress/smart": {
        title: "Smart-Komprimierung ohne Cloud",
        points: ["Adaptive Qualität je Fototyp", "Split-Vorschau vorher/nachher", "Optionale Maximalbreite fürs Web"],
        faq: "Smart-Komprimierung — Fragen",
      },
      "compress/to-size": {
        title: "Exakte KB für Formulare und Mail",
        points: ["Binärsuche zum KB-Limit", "Strikt oder nächste Größe", "Live-KB beim Einstellen"],
        faq: "Komprimierung bis KB — FAQ",
      },
      "compress/batch": {
        title: "Viele Fotos per ZIP verkleinern",
        points: ["Warteschlange für Dutzende Bilder", "Zwei parallele lokale Worker", "Ersparnis pro Datei und ZIP"],
        faq: "Stapel-Komprimierung — FAQ",
      },
      "convert/to-webp": {
        title: "WebP-Export mit Alpha",
        points: ["Lossy, lossless oder Auto", "Transparenz von PNG/SVG", "Vergleich und ZIP-Stapel"],
        faq: "WebP-Konverter — FAQ",
      },
      "convert/to-avif": {
        title: "AVIF wenn der Browser es kann",
        points: ["Auto, lossy oder lossless", "Kodiergeschwindigkeit steuern", "Hinweis bei fehlendem AVIF"],
        faq: "AVIF-Konverter — FAQ",
      },
      "convert/heic-to-jpg": {
        title: "iPhone-HEIC auf jedem PC",
        points: ["heic2any im Browser", "EXIF-Orientierung", "Metadaten und Stapel optional"],
        faq: "HEIC nach JPG — FAQ",
      },
      "convert/png-jpg": {
        title: "PNG-Transparenz für JPG füllen",
        points: ["Eigener Hintergrund", "Qualität oder KB-Ziel", "Stapel für Screenshots"],
        faq: "PNG nach JPG — FAQ",
      },
      "convert/svg-to-img": {
        title: "SVG scharf rasterisieren",
        points: ["Skala 1×–8×", "viewBox und Sanitize", "8× Zoom vor Export"],
        faq: "SVG nach PNG/JPG — FAQ",
      },
      "edit/resize": {
        title: "Größe in px, % oder Social-Presets",
        points: ["Fit, Fill oder Stretch", "Seitenverhältnis und 4K", "Stapel mit Vergleich"],
        faq: "Größe ändern — FAQ",
      },
      "edit/presets": {
        title: "Exakte Pixel für Social Networks",
        points: ["Plattform-Katalog", "Pan/Zoom und Safe Zones", "Cover oder Contain"],
        faq: "Social-Presets — FAQ",
      },
      "edit/crop": {
        title: "Zuschnitt mit Drittelraster",
        points: ["Von 1:1 bis Ultrawide", "Frei und eigenes Ratio", "Stapelwarteschlange"],
        faq: "Zuschnitt — FAQ",
      },
      "edit/rotate": {
        title: "Orientierung drehen und spiegeln",
        points: ["±90° oder freier Winkel", "Horizontal/vertikal spiegeln", "Canvas-Füllung für Ecken"],
        faq: "Drehen & Spiegeln — FAQ",
      },
      "doc/enhance-scan": {
        title: "Dokument-Fotos lesbar machen",
        points: ["Licht ausgleichen", "Kontrast, Schärfe, Rauschen", "S/W- und Graustufen-Presets"],
        faq: "Scan verbessern — FAQ",
      },
      "doc/images-to-pdf": {
        title: "PDF-Alben ohne Desktop-Suite",
        points: ["Seiten neu anordnen", "A4, Letter oder Bildgröße", "jsPDF im Speicher"],
        faq: "Bilder als PDF — FAQ",
      },
    };
    const h = titles[id];
    const localized = localizeEnBundle(base, h);
    localized.faqs = base.faqs.map((item, i) => ({
      question:
        i === 0
          ? {
              "compress/smart": "Wird meine Datei für die Analyse hochgeladen?",
              "compress/to-size": "Wie funktioniert die Binärsuche?",
              "compress/batch": "Wie viele Dateien kann ich einreihen?",
              "convert/to-webp": "Bleibt PNG-Transparenz erhalten?",
              "convert/to-avif": "Warum kann AVIF-Export fehlschlagen?",
              "convert/heic-to-jpg": "Brauche ich Apple-Software?",
              "convert/png-jpg": "Was passiert mit transparenten Flächen?",
              "convert/svg-to-img": "Warum SVG vor dem Export skalieren?",
              "edit/resize": "Ist Hochskalieren sinnvoll?",
              "edit/presets": "Sind das offizielle Netzwerk-Maße?",
              "edit/crop": "Kann ich 9:16 für Stories zuschneiden?",
              "edit/rotate": "Berücksichtigt Drehen EXIF?",
              "doc/enhance-scan": "Ist das OCR?",
              "doc/images-to-pdf": "Läuft jsPDF auf einem Server?",
            }[id] ?? item.question
          : i === 1
            ? {
                "compress/smart": "Kann ich die Qualität vor dem Download vergleichen?",
                "compress/to-size": "Überschreitet es mein Anhangslimit?",
                "compress/batch": "Wird ZIP auf dem Server erzeugt?",
                "convert/to-webp": "Kann ich HEIC nach WebP konvertieren?",
                "convert/to-avif": "Behält AVIF Alpha?",
                "convert/heic-to-jpg": "Erscheinen Fotos falsch gedreht?",
                "convert/png-jpg": "Kann ich lossless PNG behalten?",
                "convert/svg-to-img": "Werden externe SVGs geladen?",
                "edit/resize": "Was macht Fit vs Fill?",
                "edit/presets": "Kann ich mehrere Presets im Stapel exportieren?",
                "edit/crop": "Ist der Zuschnitt destruktiv für die Originaldatei?",
                "edit/rotate": "Was sind Canvas-Füllmodi?",
                "doc/enhance-scan": "Hilft es bei starkem Unschärfe?",
                "doc/images-to-pdf": "Kann ich Hoch- und Querformat mischen?",
              }[id] ?? item.question
            : {
                "compress/smart": "Wann Smart statt Stapel?",
                "compress/to-size": "Lädt KB-Ziel mein Bild hoch?",
                "compress/batch": "Kann ich pro Foto die Qualität tunen?",
                "convert/to-webp": "Erfolgt WebP-Encoding online?",
                "convert/to-avif": "Werden iPhone-HEICs unterstützt?",
                "convert/heic-to-jpg": "Ist iCloud beteiligt?",
                "convert/png-jpg": "Werden Logos zum Konvertieren hochgeladen?",
                "convert/svg-to-img": "PNG oder JPG für Icons?",
                "edit/resize": "Lädt Resize zu img.kixt.net hoch?",
                "edit/presets": "Senden Presets an Social APIs?",
                "edit/crop": "Wo wird der Zuschnitt berechnet?",
                "edit/rotate": "Kann ich einen Stapel spiegeln?",
                "doc/enhance-scan": "Wo werden Filter angewendet?",
                "doc/images-to-pdf": "Werden Scans online gespeichert?",
              }[id] ?? item.question,
      answer:
        i === 2
          ? "Nein — die gesamte Verarbeitung bleibt im Browser auf img.kixt.net."
          : i === 0
            ? "Nein — Metriken und Kodierung laufen nur lokal im Browser."
            : item.answer,
    }));
    return [id, localized];
  }),
) as LangBundle;

const ES_TITLES: Record<ToolRouteId, string> = {
  "compress/smart": "Compresión smart sin subir a la nube",
  "compress/to-size": "KB exactos para formularios y correo",
  "compress/batch": "Muchas fotos en un solo ZIP",
  "convert/to-webp": "Exportar WebP con transparencia",
  "convert/to-avif": "AVIF next-gen en el navegador",
  "convert/heic-to-jpg": "HEIC de iPhone en cualquier escritorio",
  "convert/png-jpg": "PNG con fondo para JPG más liviano",
  "convert/svg-to-img": "Rasterizar SVG en alta DPI",
  "edit/resize": "Tamaño en px, % o presets sociales",
  "edit/presets": "Píxeles exactos para redes sociales",
  "edit/crop": "Recorte por ratio con regla de tercios",
  "edit/rotate": "Rotar y espejar orientación",
  "doc/enhance-scan": "Mejorar fotos de documentos",
  "doc/images-to-pdf": "Álbum PDF sin suite de escritorio",
};

const ES: LangBundle = Object.fromEntries(
  (Object.entries(EN) as [ToolRouteId, ToolFaqBundle][]).map(([id, base]) => [
    id,
    {
      benefitsTitle: ES_TITLES[id] ?? base.benefitsTitle,
      benefitPoints: base.benefitPoints,
      faqTitle: `${base.faqTitle.replace("FAQ", "preguntas")}`,
      faqs: base.faqs.map((item, i) => ({
        question: item.question,
        answer:
          i === 2
            ? "No — todo el procesamiento permanece en el navegador en img.kixt.net."
            : i === 0
              ? "No — el análisis y la codificación son solo locales en el navegador."
              : item.answer,
      })),
    },
  ]),
) as LangBundle;

const PL: LangBundle = Object.fromEntries(
  (Object.entries(EN) as [ToolRouteId, ToolFaqBundle][]).map(([id, base]) => [
    id,
    {
      benefitsTitle: ({
        "compress/smart": "Kompresja smart bez chmury",
        "compress/to-size": "Dokładny rozmiar KB dla formularzy",
        "compress/batch": "Wiele zdjęć w jednym ZIP",
        "convert/to-webp": "Eksport WebP z alfą",
        "convert/to-avif": "AVIF gdy przeglądarka wspiera",
        "convert/heic-to-jpg": "HEIC z iPhone na każdym PC",
        "convert/png-jpg": "PNG z tłem pod JPG",
        "convert/svg-to-img": "Raster SVG w wysokim DPI",
        "edit/resize": "Rozmiar px, % lub presety social",
        "edit/presets": "Dokładne px dla social media",
        "edit/crop": "Kadrowanie z siatką trójpodziału",
        "edit/rotate": "Obrót i odbicie orientacji",
        "doc/enhance-scan": "Czytelniejsze zdjęcia dokumentów",
        "doc/images-to-pdf": "Album PDF bez pakietu biurowego",
      } as Record<ToolRouteId, string>)[id],
      benefitPoints: EN[id].benefitPoints,
      faqTitle: `${({ "compress/smart": "Kompresja smart", "doc/images-to-pdf": "Zdjęcia do PDF" } as Partial<Record<ToolRouteId, string>>)[id] ?? "Narzędzie"} — FAQ`,
      faqs: base.faqs.map((item, i) => ({
        question: item.question,
        answer:
          i === 2
            ? "Nie — całe przetwarzanie pozostaje w przeglądarce na img.kixt.net."
            : i === 0
              ? "Nie — analiza i kodowanie działają tylko lokalnie w przeglądarce."
              : item.answer,
      })),
    },
  ]),
) as LangBundle;

const FR: LangBundle = Object.fromEntries(
  (Object.entries(EN) as [ToolRouteId, ToolFaqBundle][]).map(([id, base]) => [
    id,
    {
      benefitsTitle: ({
        "compress/smart": "Compression smart sans cloud",
        "compress/to-size": "Ko exacts pour formulaires et mail",
        "compress/batch": "Beaucoup de photos en un ZIP",
        "convert/to-webp": "Export WebP avec transparence",
        "convert/to-avif": "AVIF nouvelle génération",
        "convert/heic-to-jpg": "HEIC iPhone sur tout PC",
        "convert/png-jpg": "PNG aplati vers JPG",
        "convert/svg-to-img": "Rastériser le SVG en haute DPI",
        "edit/resize": "Taille en px, % ou presets sociaux",
        "edit/presets": "Pixels exacts pour les réseaux",
        "edit/crop": "Recadrage par ratio avec tiers",
        "edit/rotate": "Rotation et miroir",
        "doc/enhance-scan": "Photos de documents plus lisibles",
        "doc/images-to-pdf": "Album PDF sans suite bureautique",
      } as Record<ToolRouteId, string>)[id],
      benefitPoints: EN[id].benefitPoints,
      faqTitle: "FAQ",
      faqs: base.faqs.map((item, i) => ({
        question: item.question,
        answer:
          i === 2
            ? "Non — tout le traitement reste dans le navigateur sur img.kixt.net."
            : i === 0
              ? "Non — analyse et encodage restent locaux dans le navigateur."
              : item.answer,
      })),
    },
  ]),
) as LangBundle;

const BUNDLES: Record<Lang, LangBundle> = { en: EN, uk: UK, de: DE, es: ES, pl: PL, fr: FR };

export function buildToolPageSeo(routeId: ToolRouteId, lang: Lang): PageSeoContent {
  const tool = getToolCopy(lang, routeId);
  const bundle = BUNDLES[lang][routeId];
  return {
    benefitsTitle: bundle.benefitsTitle,
    benefitsLead: `${tool.description} ${LOCAL_BROWSER[lang]}`,
    benefitPoints: bundle.benefitPoints,
    faqTitle: bundle.faqTitle,
    faqs: bundle.faqs,
  };
}