import { loadImageFromFile } from "@/lib/image/decode";

export type PdfPageSize = "a4" | "letter" | "a5" | "fit";
export type PdfOrientation = "auto" | "portrait" | "landscape";
export type PdfMarginPreset = "none" | "small" | "medium" | "large";
export type PdfImageFit = "contain" | "fill";
export type PdfQualityPreset = "email" | "balanced" | "print";
export type PdfOutputMode = "single" | "per-page";

export type PdfPageInput = {
  file: File;
  rotationDeg: 0 | 90 | 180 | 270;
};

export type PdfAlbumOptions = {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  margin: PdfMarginPreset;
  pageBackground: string;
  imageFit: PdfImageFit;
  qualityPreset: PdfQualityPreset;
  outputMode: PdfOutputMode;
  fileName: string;
};

export type PdfAlbumResult = {
  id: string;
  files: { name: string; blob: Blob }[];
  pageCount: number;
  inputBytes: number;
  outputBytes: number;
  processingMs: number;
  pageSizeLabel: string;
};

const MM_PER_PX = 0.264583;

const SHEET_PORTRAIT_MM: Record<Exclude<PdfPageSize, "fit">, { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  letter: { w: 215.9, h: 279.4 },
  a5: { w: 148, h: 210 },
};

function marginMm(preset: PdfMarginPreset): number {
  if (preset === "none") return 0;
  if (preset === "small") return 5;
  if (preset === "medium") return 12;
  return 20;
}

function qualityParams(preset: PdfQualityPreset): { maxPx: number; q: number } {
  if (preset === "email") return { maxPx: 1400, q: 0.62 };
  if (preset === "print") return { maxPx: 4096, q: 0.94 };
  return { maxPx: 2400, q: 0.85 };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length !== 6) return [255, 255, 255];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function safePdfName(name: string): string {
  const base = name.trim().replace(/[<>:"/\\|?*]+/g, "-").replace(/\s+/g, "-");
  return base.endsWith(".pdf") ? base : `${base || "pure-image-album"}.pdf`;
}

function resolveOrientation(
  mode: PdfOrientation,
  imgW: number,
  imgH: number,
  pageSize: PdfPageSize,
): "portrait" | "landscape" {
  if (pageSize === "fit") return imgW >= imgH ? "landscape" : "portrait";
  if (mode === "portrait") return "portrait";
  if (mode === "landscape") return "landscape";
  return imgW > imgH ? "landscape" : "portrait";
}

function pageMm(
  pageSize: PdfPageSize,
  orient: "portrait" | "landscape",
  imgW: number,
  imgH: number,
): { w: number; h: number } {
  if (pageSize === "fit") {
    return { w: imgW * MM_PER_PX, h: imgH * MM_PER_PX };
  }
  const base = SHEET_PORTRAIT_MM[pageSize];
  if (orient === "landscape") return { w: base.h, h: base.w };
  return { w: base.w, h: base.h };
}

async function rasterizePage(
  file: File,
  rotationDeg: number,
  maxPx: number,
  quality: number,
): Promise<{ dataUrl: string; w: number; h: number; hasAlpha: boolean }> {
  const img = await loadImageFromFile(file);
  let srcW = img.naturalWidth;
  let srcH = img.naturalHeight;
  const swap = rotationDeg === 90 || rotationDeg === 270;
  const outW = swap ? srcH : srcW;
  const outH = swap ? srcW : srcH;
  const scale = Math.min(1, maxPx / Math.max(outW, outH));
  const cw = Math.max(1, Math.round(outW * scale));
  const ch = Math.max(1, Math.round(outH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cw, ch);
  ctx.translate(cw / 2, ch / 2);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  const drawW = Math.round(srcW * scale);
  const drawH = Math.round(srcH * scale);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  const mime = file.type.includes("png") ? "image/png" : "image/jpeg";
  const dataUrl =
    mime === "image/png"
      ? canvas.toDataURL("image/png")
      : canvas.toDataURL("image/jpeg", quality);

  return { dataUrl, w: cw, h: ch, hasAlpha: mime === "image/png" };
}

function placeImage(
  pageW: number,
  pageH: number,
  margin: number,
  imgWmm: number,
  imgHmm: number,
  fit: PdfImageFit,
): { x: number; y: number; w: number; h: number } {
  const innerW = Math.max(1, pageW - margin * 2);
  const innerH = Math.max(1, pageH - margin * 2);
  const scale =
    fit === "contain"
      ? Math.min(innerW / imgWmm, innerH / imgHmm)
      : Math.max(innerW / imgWmm, innerH / imgHmm);
  const w = imgWmm * scale;
  const h = imgHmm * scale;
  const x = margin + (innerW - w) / 2;
  const y = margin + (innerH - h) / 2;
  return { x, y, w, h };
}

function pageSizeLabel(pageSize: PdfPageSize): string {
  if (pageSize === "fit") return "fit";
  return pageSize.toUpperCase();
}

export async function buildPdfAlbum(
  pages: PdfPageInput[],
  options: PdfAlbumOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<PdfAlbumResult> {
  const t0 = performance.now();
  if (!pages.length) throw new Error("empty");
  const { jsPDF } = await import("jspdf");
  const { maxPx, q } = qualityParams(options.qualityPreset);
  const margin = marginMm(options.margin);
  const [br, bg, bb] = hexToRgb(options.pageBackground);
  const inputBytes = pages.reduce((s, p) => s + p.file.size, 0);

  const rasters = [];
  for (let i = 0; i < pages.length; i++) {
    rasters.push(await rasterizePage(pages[i].file, pages[i].rotationDeg, maxPx, q));
    onProgress?.(i + 1, pages.length);
  }

  const outfile = safePdfName(options.fileName);
  const baseName = outfile.replace(/\.pdf$/i, "");

  if (options.outputMode === "per-page") {
    const files: { name: string; blob: Blob }[] = [];
    for (let i = 0; i < rasters.length; i++) {
      const raster = rasters[i]!;
      const orient = resolveOrientation(
        options.orientation,
        raster.w,
        raster.h,
        options.pageSize,
      );
      const { w: pageW, h: pageH } = pageMm(options.pageSize, orient, raster.w, raster.h);
      const doc = new jsPDF({
        orientation: pageW > pageH ? "landscape" : "portrait",
        unit: "mm",
        format: [pageW, pageH],
      });
      doc.setFillColor(br, bg, bb);
      doc.rect(0, 0, pageW, pageH, "F");
      const imgWmm = raster.w * MM_PER_PX;
      const imgHmm = raster.h * MM_PER_PX;
      const box = placeImage(pageW, pageH, margin, imgWmm, imgHmm, options.imageFit);
      const fmt = raster.hasAlpha ? "PNG" : "JPEG";
      doc.addImage(raster.dataUrl, fmt, box.x, box.y, box.w, box.h, undefined, "FAST");
      files.push({ name: `${baseName}-p${i + 1}.pdf`, blob: doc.output("blob") });
    }
    const outputBytes = files.reduce((s, f) => s + f.blob.size, 0);
    return {
      id: `${Date.now()}`,
      files,
      pageCount: pages.length,
      inputBytes,
      outputBytes,
      processingMs: Math.round(performance.now() - t0),
      pageSizeLabel: pageSizeLabel(options.pageSize),
    };
  }

  let doc: InstanceType<typeof jsPDF> | null = null;
  for (let i = 0; i < rasters.length; i++) {
    const raster = rasters[i]!;
    const orient = resolveOrientation(options.orientation, raster.w, raster.h, options.pageSize);
    const { w: pageW, h: pageH } = pageMm(options.pageSize, orient, raster.w, raster.h);
    const pageOrient = pageW > pageH ? "landscape" : "portrait";
    if (!doc) {
      doc = new jsPDF({ orientation: pageOrient, unit: "mm", format: [pageW, pageH] });
    } else {
      doc.addPage([pageW, pageH], pageOrient);
    }
    doc.setFillColor(br, bg, bb);
    doc.rect(0, 0, pageW, pageH, "F");
    const imgWmm = raster.w * MM_PER_PX;
    const imgHmm = raster.h * MM_PER_PX;
    const box = placeImage(pageW, pageH, margin, imgWmm, imgHmm, options.imageFit);
    const fmt = raster.hasAlpha ? "PNG" : "JPEG";
    doc.addImage(raster.dataUrl, fmt, box.x, box.y, box.w, box.h, undefined, "FAST");
  }

  if (!doc) throw new Error("pdf");
  const blob = doc.output("blob");
  return {
    id: `${Date.now()}`,
    files: [{ name: outfile, blob }],
    pageCount: pages.length,
    inputBytes,
    outputBytes: blob.size,
    processingMs: Math.round(performance.now() - t0),
    pageSizeLabel: pageSizeLabel(options.pageSize),
  };
}