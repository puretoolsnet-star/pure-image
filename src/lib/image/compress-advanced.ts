import { canvasToBlob, scaleToMaxWidth, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import type { ProcessedImage } from "@/lib/image/types";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function encodeJpeg(img: HTMLImageElement, w: number, h: number, quality: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvasToBlob(canvas, "image/jpeg", quality);
}

export async function compressWithQuality(
  file: File,
  qualityPercent: number,
  maxWidth = 1920,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const quality = Math.min(0.95, Math.max(0.1, qualityPercent / 100));
  const { width, height } = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth);
  const blob = await encodeJpeg(img, width, height, quality);
  return {
    id: uid(),
    name: outputFileName(file.name, "image/jpeg", `q${Math.round(qualityPercent)}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
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
  const targetBytes = Math.max(8, targetKb) * 1024;
  const img = await loadImageFromFile(file);
  let width = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth).width;
  let height = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth).height;

  let best = await encodeJpeg(img, width, height, 0.92);

  for (let shrink = 0; shrink < 8; shrink++) {
    let low = 0.15;
    let high = 0.95;
    for (let i = 0; i < 14; i++) {
      const mid = (low + high) / 2;
      const blob = await encodeJpeg(img, width, height, mid);
      if (blob.size > targetBytes) high = mid;
      else {
        low = mid;
        best = blob;
      }
    }
    if (best.size <= targetBytes) break;
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
    if (width < 320 || height < 320) break;
  }

  return {
    id: uid(),
    name: outputFileName(file.name, "image/jpeg", `${targetKb}kb`),
    originalSize: file.size,
    outputSize: best.size,
    blob: best,
    previewUrl: URL.createObjectURL(best),
    width,
    height,
  };
}