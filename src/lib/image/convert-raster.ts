import { canvasToBlob, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** PNG/WebP with alpha → JPG on white background. */
export async function pngToJpeg(
  file: File,
  quality = 0.92,
  maxWidth?: number,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (maxWidth && w > maxWidth) {
    const r = maxWidth / w;
    w = maxWidth;
    h = Math.round(h * r);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await canvasToBlob(canvas, "image/jpeg", quality);
  return {
    id: uid(),
    name: outputFileName(file.name, "image/jpeg", "jpg"),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: w,
    height: h,
  };
}

export async function convertToFormat(
  file: File,
  mime: OutputFormat,
  quality = 0.92,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const blob = await canvasToBlob(canvas, mime, quality);
  return {
    id: uid(),
    name: outputFileName(file.name, mime, "converted"),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
  };
}