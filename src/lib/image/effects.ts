import { canvasToBlob } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";
import { outputFileName, extensionForMime } from "@/lib/image/canvas";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function rotateImage(
  file: File,
  degrees: 90 | 180 | 270,
  mime: OutputFormat = "image/jpeg",
  quality = 0.92,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const swap = degrees === 90 || degrees === 270;
  const w = swap ? img.naturalHeight : img.naturalWidth;
  const h = swap ? img.naturalWidth : img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(w / 2, h / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  const blob = await canvasToBlob(canvas, mime, quality);
  return {
    id: uid(),
    name: outputFileName(file.name, mime, `rot-${degrees}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: w,
    height: h,
  };
}

export async function mirrorImage(
  file: File,
  axis: "horizontal" | "vertical",
  mime: OutputFormat = "image/jpeg",
  quality = 0.92,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.save();
  if (axis === "horizontal") {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(img, 0, 0);
  ctx.restore();
  const blob = await canvasToBlob(canvas, mime, quality);
  return {
    id: uid(),
    name: outputFileName(file.name, mime, `flip-${axis === "horizontal" ? "h" : "v"}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
  };
}

export type CropMode = "1:1" | "16:9" | "4:5" | "free";

export async function cropImage(
  file: File,
  mode: CropMode,
  mime: OutputFormat = "image/jpeg",
  quality = 0.92,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  let cw = img.naturalWidth;
  let ch = img.naturalHeight;
  if (mode !== "free") {
    const [rw, rh] =
      mode === "1:1" ? [1, 1] : mode === "16:9" ? [16, 9] : [4, 5];
    const targetRatio = rw / rh;
    const srcRatio = cw / ch;
    if (srcRatio > targetRatio) {
      cw = Math.round(ch * targetRatio);
    } else {
      ch = Math.round(cw / targetRatio);
    }
  }
  const sx = Math.floor((img.naturalWidth - cw) / 2);
  const sy = Math.floor((img.naturalHeight - ch) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch);
  const blob = await canvasToBlob(canvas, mime, quality);
  return {
    id: uid(),
    name: outputFileName(file.name, mime, `crop-${mode.replace(":", "x")}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: cw,
    height: ch,
  };
}

export type NormalizedCrop = { x: number; y: number; w: number; h: number };

export async function cropImageNormalized(
  file: File,
  crop: NormalizedCrop,
  mime: OutputFormat = "image/jpeg",
  quality = 0.92,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const sx = Math.max(0, Math.round(crop.x * img.naturalWidth));
  const sy = Math.max(0, Math.round(crop.y * img.naturalHeight));
  const cw = Math.min(img.naturalWidth - sx, Math.round(crop.w * img.naturalWidth));
  const ch = Math.min(img.naturalHeight - sy, Math.round(crop.h * img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, cw);
  canvas.height = Math.max(1, ch);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch);
  const blob = await canvasToBlob(canvas, mime, quality);
  return {
    id: uid(),
    name: outputFileName(file.name, mime, "crop"),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: cw,
    height: ch,
  };
}

export async function loadSvgAsImage(file: File): Promise<HTMLImageElement> {
  const text = await file.text();
  const blob = new Blob([text], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function svgToRaster(
  file: File,
  mime: OutputFormat,
  scale = 2,
  quality = 0.92,
): Promise<ProcessedImage> {
  const img = await loadSvgAsImage(file);
  const w = Math.max(1, Math.round(img.naturalWidth * scale)) || 1024;
  const h = Math.max(1, Math.round(img.naturalHeight * scale)) || 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await canvasToBlob(canvas, mime, quality);
  const ext = extensionForMime(mime);
  return {
    id: uid(),
    name: file.name.replace(/\.svg$/i, `.${ext}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: w,
    height: h,
  };
}

export async function supportsAvif(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 1, 1);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/avif", 0.8),
  );
  return blob !== null && blob.size > 0;
}