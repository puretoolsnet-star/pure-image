import { canvasToBlob, scaleToMaxWidth, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import { pickOutputMime } from "@/lib/image/output-mime";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function encodeRaster(
  img: HTMLImageElement,
  w: number,
  h: number,
  quality: number,
  mime: OutputFormat,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);
  return canvasToBlob(canvas, mime, quality);
}

async function encodeJpeg(img: HTMLImageElement, w: number, h: number, quality: number): Promise<Blob> {
  return encodeRaster(img, w, h, quality, "image/jpeg");
}

export type CompressFormatChoice = "auto" | "jpeg" | "webp";

function resolveCompressMime(fileType: string, format: CompressFormatChoice): OutputFormat {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return pickOutputMime(fileType);
}

export async function compressWithQuality(
  file: File,
  qualityPercent: number,
  maxWidth = 1920,
  format: CompressFormatChoice = "auto",
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const quality = Math.min(1, Math.max(0.1, qualityPercent / 100));
  const mime = resolveCompressMime(file.type, format);
  const { width, height } = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth);
  const blob = await encodeRaster(img, width, height, quality, mime);
  return {
    id: uid(),
    name: outputFileName(file.name, mime, `q${Math.round(qualityPercent)}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
    outputMime: mime,
  };
}

/** Lowers quality until smaller than original when possible. */
export async function smartCompressFile(
  file: File,
  qualityPercent = 85,
  maxWidth = 1920,
): Promise<ProcessedImage> {
  let q = qualityPercent;
  let result = await compressWithQuality(file, q, maxWidth);
  let guard = 0;
  while (result.outputSize >= file.size * 0.98 && q > 40 && guard < 12) {
    q -= 5;
    result = await compressWithQuality(file, q, maxWidth);
    guard++;
  }
  return {
    ...result,
    name: outputFileName(file.name, "image/jpeg", "smart"),
  };
}

export async function compressToTargetKb(
  file: File,
  targetKb: number,
  maxWidth = 1920,
): Promise<ProcessedImage> {
  const { compressToTargetKbAdvanced } = await import("@/lib/image/compress-to-kb");
  return compressToTargetKbAdvanced(file, {
    targetKb,
    maxWidth,
    fitMode: "strict",
    strategy: "balanced",
    format: "auto",
  });
}