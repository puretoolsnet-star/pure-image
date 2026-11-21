import { canvasToBlob, outputFileName, scaleToMaxWidth } from "@/lib/image/canvas";
import { encodeRaster } from "@/lib/image/compress-advanced";
import { loadImageFromFile } from "@/lib/image/decode";
import { pickOutputMime } from "@/lib/image/output-mime";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";

export type ToSizeFitMode = "strict" | "closest";
export type ToSizeStrategy = "balanced" | "preservePixels";
export type ToSizeFormatChoice = "auto" | "jpeg" | "webp" | "png";

export type ToSizeWarning = "tooAggressive" | "cannotMeet" | null;

export type ToSizeCompressOptions = {
  targetKb: number;
  maxWidth?: number;
  fitMode: ToSizeFitMode;
  strategy: ToSizeStrategy;
  format: ToSizeFormatChoice;
};

export type ToSizeCompressMeta = {
  targetKb: number;
  targetBytes: number;
  appliedQuality: number;
  withinLimit: boolean;
  deltaBytes: number;
  deltaPercent: number;
  toSizeWarning: ToSizeWarning;
  fitMode: ToSizeFitMode;
  strategy: ToSizeStrategy;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function resolveMime(fileType: string, format: ToSizeFormatChoice): OutputFormat {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (format === "png") return "image/png";
  return pickOutputMime(fileType);
}

function minQualityForMime(mime: OutputFormat): number {
  return mime === "image/png" ? 1 : 0.12;
}

async function encodeAt(
  img: HTMLImageElement,
  w: number,
  h: number,
  quality: number,
  mime: OutputFormat,
): Promise<Blob> {
  return encodeRaster(img, w, h, quality, mime);
}

type SearchResult = { blob: Blob; quality: number; width: number; height: number };

async function searchQuality(
  img: HTMLImageElement,
  width: number,
  height: number,
  targetBytes: number,
  mime: OutputFormat,
  fitMode: ToSizeFitMode,
): Promise<SearchResult> {
  const qMin = minQualityForMime(mime);
  const qMax = mime === "image/png" ? 1 : 0.98;

  if (mime === "image/png") {
    const blob = await encodeAt(img, width, height, 1, mime);
    return { blob, quality: 100, width, height };
  }

  let bestUnder: { blob: Blob; quality: number } | null = null;
  let bestClosest: { blob: Blob; quality: number; dist: number } | null = null;

  let low = qMin;
  let high = qMax;
  for (let i = 0; i < 16; i++) {
    const mid = (low + high) / 2;
    const blob = await encodeAt(img, width, height, mid, mime);
    const dist = Math.abs(blob.size - targetBytes);

    if (blob.size <= targetBytes) {
      bestUnder = { blob, quality: mid };
      low = mid;
    } else {
      high = mid;
    }

    if (fitMode === "closest") {
      if (!bestClosest || dist < bestClosest.dist) {
        bestClosest = { blob, quality: mid, dist };
      }
    }
  }

  if (fitMode === "strict" && bestUnder) {
    return {
      blob: bestUnder.blob,
      quality: Math.round(bestUnder.quality * 100),
      width,
      height,
    };
  }

  if (fitMode === "closest" && bestClosest) {
    return {
      blob: bestClosest.blob,
      quality: Math.round(bestClosest.quality * 100),
      width,
      height,
    };
  }

  const fallback = await encodeAt(img, width, height, qMin, mime);
  return { blob: fallback, quality: Math.round(qMin * 100), width, height };
}

function shrink(
  w: number,
  h: number,
  factor: number,
): { width: number; height: number } {
  return {
    width: Math.max(320, Math.round(w * factor)),
    height: Math.max(320, Math.round(h * factor)),
  };
}

export async function compressToTargetKbAdvanced(
  file: File,
  options: ToSizeCompressOptions,
): Promise<ProcessedImage & ToSizeCompressMeta> {
  const targetKb = Math.max(8, Math.round(options.targetKb));
  const targetBytes = targetKb * 1024;
  const maxWidth = options.maxWidth ?? 4096;
  const mime = resolveMime(file.type, options.format);
  const t0 = performance.now();

  const img = await loadImageFromFile(file);
  const natural = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth);
  let width = natural.width;
  let height = natural.height;

  let warning: ToSizeWarning = null;
  if (targetBytes < 12 * 1024 && img.naturalWidth * img.naturalHeight > 2_000_000) {
    warning = "tooAggressive";
  }

  const maxShrinkPasses = options.strategy === "preservePixels" ? 0 : 10;
  let result: SearchResult | null = null;

  for (let pass = 0; pass <= maxShrinkPasses; pass++) {
    const attempt = await searchQuality(img, width, height, targetBytes, mime, options.fitMode);
    result = attempt;

    const fits =
      options.fitMode === "strict"
        ? attempt.blob.size <= targetBytes
        : Math.abs(attempt.blob.size - targetBytes) / targetBytes < 0.08 ||
          attempt.blob.size <= targetBytes;

    if (fits) break;
    if (options.strategy === "preservePixels") {
      if (attempt.blob.size > targetBytes) warning = warning ?? "cannotMeet";
      break;
    }

    const next = shrink(width, height, 0.88);
    if (next.width === width && next.height === height) {
      warning = warning ?? "cannotMeet";
      break;
    }
    width = next.width;
    height = next.height;
  }

  const final = result ?? (await searchQuality(img, width, height, targetBytes, mime, options.fitMode));
  const withinLimit = final.blob.size <= targetBytes;
  const deltaBytes = final.blob.size - targetBytes;
  const deltaPercent =
    targetBytes > 0 ? Math.round((deltaBytes / targetBytes) * 1000) / 10 : 0;

  if (!withinLimit && options.fitMode === "strict") {
    warning = warning ?? "cannotMeet";
  }

  void t0;

  return {
    id: uid(),
    name: outputFileName(file.name, mime, `${targetKb}kb`),
    originalSize: file.size,
    outputSize: final.blob.size,
    blob: final.blob,
    previewUrl: URL.createObjectURL(final.blob),
    width: final.width,
    height: final.height,
    outputMime: mime,
    processingMs: Math.round(performance.now() - t0),
    targetKb,
    targetBytes,
    appliedQuality: final.quality,
    withinLimit,
    deltaBytes,
    deltaPercent,
    toSizeWarning: warning,
    fitMode: options.fitMode,
    strategy: options.strategy,
  };
}