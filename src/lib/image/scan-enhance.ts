import { canvasToBlob, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";

export type ScanPresetId = "bw-text" | "gray-contrast" | "photo-scan" | "soft";

export type ScanEnhanceOptions = {
  preset: ScanPresetId;
  flatten: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  denoise: number;
  useThreshold: boolean;
  threshold: number;
  preserveColor: boolean;
  format: ResizeFormatChoice;
  quality: number;
  maxWidth: number | null;
  maxHeight: number | null;
  targetKb: number | null;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function presetScanOptions(id: ScanPresetId): Omit<ScanEnhanceOptions, "format" | "quality" | "maxWidth" | "maxHeight" | "targetKb"> {
  const base = {
    preset: id,
    flatten: 50,
    brightness: 105,
    contrast: 120,
    sharpness: 25,
    denoise: 20,
    useThreshold: false,
    threshold: 165,
    preserveColor: false,
  };
  if (id === "bw-text") {
    return {
      ...base,
      flatten: 70,
      brightness: 108,
      contrast: 150,
      sharpness: 45,
      denoise: 18,
      useThreshold: true,
      threshold: 168,
      preserveColor: false,
    };
  }
  if (id === "gray-contrast") {
    return {
      ...base,
      flatten: 45,
      contrast: 128,
      sharpness: 28,
      denoise: 22,
      useThreshold: false,
      preserveColor: false,
    };
  }
  if (id === "photo-scan") {
    return {
      ...base,
      flatten: 88,
      brightness: 112,
      contrast: 112,
      sharpness: 32,
      denoise: 40,
      useThreshold: false,
      preserveColor: true,
    };
  }
  return {
    ...base,
    flatten: 30,
    brightness: 100,
    contrast: 105,
    sharpness: 8,
    denoise: 50,
    useThreshold: false,
    preserveColor: true,
  };
}

function resolveMimeFixed(file: File, choice: ResizeFormatChoice, preset: ScanPresetId): OutputFormat {
  if (choice === "jpeg") return "image/jpeg";
  if (choice === "png") return "image/png";
  if (choice === "webp") return "image/webp";
  if (preset === "bw-text") return "image/png";
  const t = file.type.toLowerCase();
  if (t === "image/png") return "image/png";
  if (t === "image/webp") return "image/webp";
  return "image/jpeg";
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function boxBlurGray(gray: Float32Array, w: number, h: number, radius: number): Float32Array {
  const r = Math.max(1, Math.round(radius));
  const out = new Float32Array(gray.length);
  const tmp = new Float32Array(gray.length);
  const div = r * 2 + 1;

  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -r; x <= r; x++) {
      const cx = clamp(x, 0, w - 1);
      sum += gray[y * w + cx];
    }
    for (let x = 0; x < w; x++) {
      const x0 = clamp(x - r - 1, 0, w - 1);
      const x1 = clamp(x + r, 0, w - 1);
      if (x > 0) sum += gray[y * w + x1] - gray[y * w + x0];
      tmp[y * w + x] = sum / div;
    }
  }

  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) {
      const cy = clamp(y, 0, h - 1);
      sum += tmp[cy * w + x];
    }
    for (let y = 0; y < h; y++) {
      const y0 = clamp(y - r - 1, 0, h - 1);
      const y1 = clamp(y + r, 0, h - 1);
      if (y > 0) sum += tmp[y1 * w + x] - tmp[y0 * w + x];
      out[y * w + x] = sum / div;
    }
  }
  return out;
}

function applyEnhance(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  options: ScanEnhanceOptions,
) {
  const n = w * h;
  const gray = new Float32Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }

  const flatStr = options.flatten / 100;
  if (flatStr > 0.02) {
    const radius = Math.max(4, Math.min(w, h) / 14);
    const bg = boxBlurGray(gray, w, h, radius);
    for (let i = 0; i < n; i++) {
      const g = gray[i];
      const b = Math.max(12, bg[i]);
      const corrected = g / (b / 255) * 128;
      gray[i] = clamp(g + (corrected - g) * flatStr, 0, 255);
    }
  }

  const c = options.contrast / 100;
  const bOff = (options.brightness - 100) * 2.55;
  const t = options.threshold;

  for (let i = 0; i < n; i++) {
    let g = (gray[i] - 128) * c + 128 + bOff;
    gray[i] = clamp(g, 0, 255);
  }

  const den = options.denoise / 100;
  if (den > 0.03) {
    const blurred = boxBlurGray(gray, w, h, 1);
    for (let i = 0; i < n; i++) {
      const mix = den * 0.65;
      gray[i] = gray[i] * (1 - mix) + blurred[i] * mix;
    }
  }

  const sharp = options.sharpness / 100;
  if (sharp > 0.03) {
    const blurred = boxBlurGray(gray, w, h, 1);
    for (let i = 0; i < n; i++) {
      const detail = gray[i] - blurred[i];
      gray[i] = clamp(gray[i] + detail * sharp * 1.8, 0, 255);
    }
  }

  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const g = gray[i];
    if (options.useThreshold) {
      const v = g >= t ? 255 : 0;
      data[p] = data[p + 1] = data[p + 2] = v;
    } else if (!options.preserveColor) {
      data[p] = data[p + 1] = data[p + 2] = g;
    } else {
      const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2] || 1;
      const scale = g / lum;
      data[p] = clamp(data[p] * scale, 0, 255);
      data[p + 1] = clamp(data[p + 1] * scale, 0, 255);
      data[p + 2] = clamp(data[p + 2] * scale, 0, 255);
    }
    data[p + 3] = 255;
  }
}

function fitMax(w: number, h: number, maxW: number | null, maxH: number | null): { w: number; h: number } {
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

async function encodeTarget(
  canvas: HTMLCanvasElement,
  mime: OutputFormat,
  quality: number,
  targetKb: number | null,
): Promise<Blob> {
  const q = Math.min(1, Math.max(0.35, quality / 100));
  let blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : q);
  if (!targetKb || targetKb <= 0 || mime === "image/png") return blob;
  const targetBytes = targetKb * 1024;
  if (blob.size <= targetBytes) return blob;
  let lo = 0.2;
  let hi = q;
  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) / 2;
    const tryBlob = await canvasToBlob(canvas, mime, mid);
    if (tryBlob.size <= targetBytes) {
      blob = tryBlob;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return blob;
}

export async function exportScanEnhanced(
  file: File,
  options: ScanEnhanceOptions,
): Promise<ProcessedImage & { originalWidth?: number; originalHeight?: number; beforePreviewUrl?: string }> {
  const t0 = performance.now();
  const img = await loadImageFromFile(file);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const sized = fitMax(srcW, srcH, options.maxWidth, options.maxHeight);

  const canvas = document.createElement("canvas");
  canvas.width = sized.w;
  canvas.height = sized.h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, sized.w, sized.h);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyEnhance(imageData.data, canvas.width, canvas.height, options);
  ctx.putImageData(imageData, 0, 0);

  const mime = resolveMimeFixed(file, options.format, options.preset);
  const blob = await encodeTarget(canvas, mime, options.quality, options.targetKb);

  return {
    id: uid(),
    name: outputFileName(file.name, mime, `scan-${options.preset}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    beforePreviewUrl: URL.createObjectURL(file),
    width: canvas.width,
    height: canvas.height,
    outputMime: mime,
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || "application/octet-stream",
    originalWidth: srcW,
    originalHeight: srcH,
    presetTag: options.preset,
  };
}

/** @deprecated Use exportScanEnhanced */
export async function enhanceScanImage(
  file: File,
  options: {
    contrast: number;
    brightness: number;
    documentMode: boolean;
    threshold: number;
  },
  mime: OutputFormat = "image/jpeg",
  quality = 0.92,
): Promise<ProcessedImage> {
  const mapped: ScanEnhanceOptions = {
    preset: options.documentMode ? "bw-text" : "gray-contrast",
    flatten: 55,
    brightness: options.brightness,
    contrast: options.contrast,
    sharpness: 30,
    denoise: 20,
    useThreshold: options.documentMode,
    threshold: options.threshold,
    preserveColor: !options.documentMode,
    format: mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpeg",
    quality: Math.round(quality * 100),
    maxWidth: null,
    maxHeight: null,
    targetKb: null,
  };
  const r = await exportScanEnhanced(file, mapped);
  return r;
}