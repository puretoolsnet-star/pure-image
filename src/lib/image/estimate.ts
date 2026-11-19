import { canvasToBlob, scaleToMaxWidth } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import { pickOutputMime } from "@/lib/image/output-mime";

/** Rough output size estimate (bytes) — one canvas encode pass. */
export async function estimateOutputBytes(
  file: File,
  qualityPercent: number,
  maxWidth = 1920,
): Promise<number> {
  const img = await loadImageFromFile(file);
  const quality = Math.min(1, Math.max(0.1, qualityPercent / 100));
  const mime = pickOutputMime(file.type);
  const { width, height } = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file.size;
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, mime, quality);
  return blob.size;
}

/** @deprecated Use estimateOutputBytes — kept for existing sliders. */
export async function estimateJpegBytes(
  file: File,
  qualityPercent: number,
  maxWidth = 1920,
): Promise<number> {
  return estimateOutputBytes(file, qualityPercent, maxWidth);
}

export function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}