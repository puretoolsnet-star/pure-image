import { canvasToBlob, outputFileName, scaleToMaxWidth } from "@/lib/image/canvas";
import { applyJpegExifPolicy } from "@/lib/image/embed-jpeg-exif";
import type { HeicExifMode } from "@/lib/image/convert-heic-jpg";
import { loadImageFromFile } from "@/lib/image/decode";
import { detectPngHasAlpha, isPngFile, paintTransparencyGrid } from "@/lib/image/png-alpha";
import type { ProcessedImage } from "@/lib/image/types";

export type PngJpgConvertOptions = {
  quality: number;
  maxWidth: number;
  backdrop: string;
  exifMode: HeicExifMode;
  targetKb: number | null;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

async function rasterizePngToCanvas(
  file: File,
  maxWidth: number,
  backdrop: string,
): Promise<{
  canvas: HTMLCanvasElement;
  hadAlpha: boolean;
  beforeCanvas: HTMLCanvasElement;
}> {
  const img = await loadImageFromFile(file);
  const hadAlpha = await detectPngHasAlpha(file);
  const { width, height } = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth);

  const beforeCanvas = document.createElement("canvas");
  beforeCanvas.width = width;
  beforeCanvas.height = height;
  const beforeCtx = beforeCanvas.getContext("2d");
  if (!beforeCtx) throw new Error("canvas");
  if (hadAlpha) paintTransparencyGrid(beforeCtx, width, height);
  else {
    beforeCtx.fillStyle = "#1a1d2e";
    beforeCtx.fillRect(0, 0, width, height);
  }
  beforeCtx.drawImage(img, 0, 0, width, height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = backdrop || "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, hadAlpha, beforeCanvas };
}

async function encodeJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return canvasToBlob(canvas, "image/jpeg", Math.min(1, Math.max(0.2, quality)));
}

async function encodeToTargetKb(
  canvas: HTMLCanvasElement,
  targetBytes: number,
  startQuality: number,
): Promise<{ blob: Blob; appliedQuality: number; withinLimit: boolean }> {
  let lo = 0.18;
  let hi = Math.min(1, Math.max(0.35, startQuality));
  let best = await encodeJpeg(canvas, hi);
  let bestQ = hi;

  if (best.size <= targetBytes) {
    return { blob: best, appliedQuality: bestQ, withinLimit: true };
  }

  for (let step = 0; step < 11; step++) {
    await yieldToMain();
    const mid = (lo + hi) / 2;
    const blob = await encodeJpeg(canvas, mid);
    if (blob.size <= targetBytes) {
      best = blob;
      bestQ = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return {
    blob: best,
    appliedQuality: bestQ,
    withinLimit: best.size <= targetBytes,
  };
}

export async function convertPngToJpgAdvanced(
  file: File,
  options: PngJpgConvertOptions,
): Promise<
  ProcessedImage & {
    inputMime: string;
    processingMs: number;
    beforePreviewUrl: string;
    hadAlpha: boolean;
  }
> {
  if (!isPngFile(file)) throw new Error("not-png");

  const t0 = performance.now();
  const { canvas, hadAlpha, beforeCanvas } = await rasterizePngToCanvas(
    file,
    options.maxWidth,
    options.backdrop,
  );

  const beforeBlob = await canvasToBlob(beforeCanvas, "image/png");
  const beforePreviewUrl = URL.createObjectURL(beforeBlob);

  const startQ = options.quality / 100;
  let blob: Blob;
  let appliedQuality = startQ;
  let withinLimit: boolean | undefined;
  let targetKb: number | undefined;
  let targetBytes: number | undefined;

  if (options.targetKb && options.targetKb > 0) {
    targetKb = options.targetKb;
    targetBytes = options.targetKb * 1024;
    const fit = await encodeToTargetKb(canvas, targetBytes, startQ);
    blob = fit.blob;
    appliedQuality = fit.appliedQuality;
    withinLimit = fit.withinLimit;
  } else {
    blob = await encodeJpeg(canvas, startQ);
  }

  blob = await applyJpegExifPolicy(blob, file, options.exifMode);

  const tag =
    options.targetKb && options.targetKb > 0
      ? `png-jpg-${options.targetKb}kb`
      : `png-jpg-q${Math.round(appliedQuality * 100)}`;

  return {
    id: uid(),
    name: outputFileName(file.name, "image/jpeg", tag),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    outputMime: "image/jpeg",
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || "image/png",
    beforePreviewUrl,
    hadAlpha,
    appliedQuality: Math.round(appliedQuality * 100),
    targetKb,
    targetBytes,
    withinLimit,
    toSizeWarning:
      targetBytes != null && withinLimit === false ? "cannotMeet" : null,
  };
}