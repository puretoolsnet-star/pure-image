import { canvasToBlob, outputFileName, scaleToMaxWidth } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import { svgToRaster } from "@/lib/image/effects";
import type { ProcessedImage } from "@/lib/image/types";

export type WebpMode = "auto" | "lossy" | "lossless";
export type WebpAlphaMode = "preserve" | "flatten";

export type WebpConvertOptions = {
  mode: WebpMode;
  quality: number;
  maxWidth: number;
  alphaMode: WebpAlphaMode;
  backdrop: string;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isSvg(file: File): boolean {
  return file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
}

function detectHasAlpha(file: File, alphaMode: WebpAlphaMode): boolean {
  if (alphaMode === "flatten") return false;
  return (
    file.type === "image/png" ||
    file.type === "image/webp" ||
    file.type === "image/gif" ||
    /\.png$/i.test(file.name)
  );
}

function resolveQuality(mode: WebpMode, quality: number, file: File): number {
  if (mode === "lossless") return 1;
  if (mode === "lossy") return Math.min(1, Math.max(0.1, quality / 100));
  if (file.type === "image/png" || file.type === "image/webp") return 0.86;
  if (file.type === "image/gif") return 0.78;
  return Math.min(1, Math.max(0.55, quality / 100));
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

export async function convertToWebpAdvanced(
  file: File,
  options: WebpConvertOptions,
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

  const q = resolveQuality(options.mode, options.quality, file);
  const blob = await canvasToBlob(canvas, "image/webp", q);

  const tag =
    options.mode === "lossless" ? "webp-lossless" : options.mode === "auto" ? "webp-smart" : `webp-q${Math.round(q * 100)}`;

  return {
    id: uid(),
    name: outputFileName(file.name, "image/webp", tag),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
    outputMime: "image/webp",
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || "application/octet-stream",
  };
}