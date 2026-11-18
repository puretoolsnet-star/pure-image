import { canvasToBlob, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type ScanEnhanceOptions = {
  contrast: number;
  brightness: number;
  documentMode: boolean;
  threshold: number;
};

function enhancePixels(
  data: Uint8ClampedArray,
  contrast: number,
  brightness: number,
  documentMode: boolean,
  threshold: number,
) {
  const c = contrast / 100;
  const b = (brightness - 100) * 2.55;
  const t = threshold;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let bl = data[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * bl;

    gray = (gray - 128) * c + 128 + b;
    gray = Math.min(255, Math.max(0, gray));

    if (documentMode) {
      const v = gray >= t ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    } else {
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    data[i + 3] = 255;
  }
}

export async function enhanceScanImage(
  file: File,
  options: ScanEnhanceOptions,
  mime: OutputFormat = "image/jpeg",
  quality = 0.92,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  enhancePixels(
    imageData.data,
    options.contrast,
    options.brightness,
    options.documentMode,
    options.threshold,
  );
  ctx.putImageData(imageData, 0, 0);
  const blob = await canvasToBlob(canvas, mime, quality);
  return {
    id: uid(),
    name: outputFileName(file.name, mime, options.documentMode ? "scan-doc" : "scan-enhanced"),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
  };
}