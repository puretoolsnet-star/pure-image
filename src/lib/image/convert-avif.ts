import { canvasToBlob, outputFileName, scaleToMaxWidth } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import { svgToRaster } from "@/lib/image/effects";
import type { ProcessedImage } from "@/lib/image/types";

export type AvifMode = "auto" | "lossy" | "lossless";
export type AvifAlphaMode = "preserve" | "flatten";
export type AvifEffort = "fast" | "balanced" | "deep";

export type AvifConvertOptions = {
  mode: AvifMode;
  quality: number;
  maxWidth: number;
  alphaMode: AvifAlphaMode;
  backdrop: string;
  effort: AvifEffort;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isSvg(file: File): boolean {
  return file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
}

function detectHasAlpha(file: File, alphaMode: AvifAlphaMode): boolean {
  if (alphaMode === "flatten") return false;
  return (
    file.type === "image/png" ||
    file.type === "image/webp" ||
    file.type === "image/gif" ||
    file.type === "image/avif" ||
    /\.png$/i.test(file.name)
  );
}

function resolveQuality(mode: AvifMode, quality: number, file: File, effort: AvifEffort): number {
  let q: number;
  if (mode === "lossless") q = 1;
  else if (mode === "lossy") q = quality / 100;
  else if (file.type === "image/png" || file.type === "image/webp") q = 0.8;
  else q = Math.min(0.88, Math.max(0.5, quality / 100));

  if (effort === "fast") q = Math.max(0.35, q - 0.06);
  return Math.min(1, Math.max(0.15, q));
}

async function loadRaster(file: File): Promise<HTMLImageElement> {
  if (isSvg(file)) {
    const raster = await svgToRaster(file, "image/png");
    const url = URL.createObjectURL(raster.blob);
    const img = new Image();
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("svg"));
        img.src = url;
      });
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return loadImageFromFile(file);
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

async function encodeAvif(canvas: HTMLCanvasElement, baseQ: number, effort: AvifEffort): Promise<Blob> {
  const first = await canvasToBlob(canvas, "image/avif", baseQ);
  if (effort !== "deep") return first;

  let best = first;
  const steps = [0.94, 0.88, 0.82];
  for (const factor of steps) {
    const q = Math.max(0.2, baseQ * factor);
    await yieldToMain();
    try {
      const blob = await canvasToBlob(canvas, "image/avif", q);
      if (blob.size < best.size) best = blob;
    } catch {
      break;
    }
  }
  return best;
}

export async function convertToAvifAdvanced(
  file: File,
  options: AvifConvertOptions,
): Promise<ProcessedImage & { inputMime: string; processingMs: number }> {
  const t0 = performance.now();
  const img = await loadRaster(file);
  const { width, height } = scaleToMaxWidth(
    img.naturalWidth,
    img.naturalHeight,
    options.maxWidth,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const preserveAlpha = detectHasAlpha(file, options.alphaMode);
  if (!preserveAlpha) {
    ctx.fillStyle = options.backdrop || "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);

  const q = resolveQuality(options.mode, options.quality, file, options.effort);
  const blob = await encodeAvif(canvas, q, options.effort);

  const tag =
    options.mode === "lossless"
      ? "avif-lossless"
      : options.mode === "auto"
        ? "avif-smart"
        : `avif-q${Math.round(q * 100)}`;

  return {
    id: uid(),
    name: outputFileName(file.name, "image/avif", tag),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
    outputMime: "image/avif",
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || "application/octet-stream",
  };
}