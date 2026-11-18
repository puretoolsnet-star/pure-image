import { canvasToBlob, scaleToMaxWidth } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";

/** Rough JPEG size estimate (bytes) for UI preview — one encode pass. */
export async function estimateJpegBytes(
  file: File,
  qualityPercent: number,
  maxWidth = 1920,
): Promise<number> {
  const img = await loadImageFromFile(file);
  const quality = Math.min(0.95, Math.max(0.1, qualityPercent / 100));
  const { width, height } = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file.size;
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, "image/jpeg", quality);
  return blob.size;
}

export function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}