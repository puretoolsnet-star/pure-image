import { canvasToBlob, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import type { NormalizedCrop } from "@/lib/image/effects";
import { formatAspectLabel } from "@/lib/image/crop-aspect";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";

export type CropExportOptions = {
  crop: NormalizedCrop;
  format: ResizeFormatChoice;
  quality: number;
  maxWidth: number | null;
  maxHeight: number | null;
  slug: string;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function resolveMime(file: File, choice: ResizeFormatChoice): OutputFormat {
  if (choice === "jpeg") return "image/jpeg";
  if (choice === "png") return "image/png";
  if (choice === "webp") return "image/webp";
  const t = file.type.toLowerCase();
  if (t === "image/png") return "image/png";
  if (t === "image/webp") return "image/webp";
  return "image/jpeg";
}

function clampCrop(c: NormalizedCrop): NormalizedCrop {
  const x = Math.min(1, Math.max(0, c.x));
  const y = Math.min(1, Math.max(0, c.y));
  const w = Math.min(1 - x, Math.max(0.001, c.w));
  const h = Math.min(1 - y, Math.max(0.001, c.h));
  return { x, y, w, h };
}

function applyMaxSize(w: number, h: number, maxW: number | null, maxH: number | null): { w: number; h: number } {
  let ow = w;
  let oh = h;
  if (maxW && ow > maxW) {
    oh = Math.round((oh * maxW) / ow);
    ow = maxW;
  }
  if (maxH && oh > maxH) {
    ow = Math.round((ow * maxH) / oh);
    oh = maxH;
  }
  return { w: Math.max(1, ow), h: Math.max(1, oh) };
}

export async function exportCroppedImage(
  file: File,
  options: CropExportOptions,
): Promise<ProcessedImage & { cropAspectLabel?: string }> {
  const t0 = performance.now();
  const img = await loadImageFromFile(file);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const crop = clampCrop(options.crop);

  const sx = Math.round(crop.x * srcW);
  const sy = Math.round(crop.y * srcH);
  let cw = Math.min(srcW - sx, Math.round(crop.w * srcW));
  let ch = Math.min(srcH - sy, Math.round(crop.h * srcH));
  cw = Math.max(1, cw);
  ch = Math.max(1, ch);

  const sized = applyMaxSize(cw, ch, options.maxWidth, options.maxHeight);

  const canvas = document.createElement("canvas");
  canvas.width = sized.w;
  canvas.height = sized.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, cw, ch, 0, 0, sized.w, sized.h);

  const mime = resolveMime(file, options.format);
  const blob = await canvasToBlob(canvas, mime, options.quality);

  return {
    id: uid(),
    name: outputFileName(file.name, mime, `crop-${options.slug}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    beforePreviewUrl: URL.createObjectURL(file),
    width: sized.w,
    height: sized.h,
    outputMime: mime,
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || "application/octet-stream",
    originalWidth: srcW,
    originalHeight: srcH,
    cropAspectLabel: formatAspectLabel(sized.w, sized.h),
  };
}