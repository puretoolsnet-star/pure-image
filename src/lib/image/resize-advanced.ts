import { canvasToBlob, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import { paintTransparencyGrid } from "@/lib/image/png-alpha";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";
import { RESIZE_PRESETS } from "@/lib/image/types";

export type ResizeFormatChoice = "auto" | "jpeg" | "png" | "webp";
export type ResizeFitMode = "fit" | "fill" | "stretch";
export type ResizeSizeMode = "px" | "percent";

export type ResizeAdvancedOptions = {
  sizeMode: ResizeSizeMode;
  width: number;
  height: number;
  percent: number;
  fitMode: ResizeFitMode;
  format: ResizeFormatChoice;
  quality: number;
  backdrop: string;
};

export type ResizePresetKey =
  | "original"
  | "half"
  | "quarter"
  | "fhd"
  | "fourk"
  | keyof typeof RESIZE_PRESETS;

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function resolveMime(file: File, choice: ResizeFormatChoice): OutputFormat {
  if (choice === "jpeg") return "image/jpeg";
  if (choice === "png") return "image/png";
  if (choice === "webp") return "image/webp";
  const t = file.type.toLowerCase();
  if (t === "image/png") return "image/png";
  if (t === "image/webp") return "image/webp";
  return "image/jpeg";
}

export function presetDimensions(key: ResizePresetKey): {
  sizeMode: ResizeSizeMode;
  width: number;
  height: number;
  percent: number;
} {
  if (key === "original") return { sizeMode: "percent", width: 0, height: 0, percent: 100 };
  if (key === "half") return { sizeMode: "percent", width: 0, height: 0, percent: 50 };
  if (key === "quarter") return { sizeMode: "percent", width: 0, height: 0, percent: 25 };
  if (key === "fhd") return { sizeMode: "px", width: 1920, height: 1080, percent: 100 };
  if (key === "fourk") return { sizeMode: "px", width: 3840, height: 2160, percent: 100 };
  const p = RESIZE_PRESETS[key as keyof typeof RESIZE_PRESETS];
  return { sizeMode: "px", width: p.width, height: p.height, percent: 100 };
}

function canvasSize(
  srcW: number,
  srcH: number,
  options: ResizeAdvancedOptions,
): { canvasW: number; canvasH: number } {
  if (options.sizeMode === "percent") {
    const f = Math.min(400, Math.max(1, options.percent)) / 100;
    return {
      canvasW: Math.max(1, Math.round(srcW * f)),
      canvasH: Math.max(1, Math.round(srcH * f)),
    };
  }
  return {
    canvasW: Math.max(1, Math.round(options.width)),
    canvasH: Math.max(1, Math.round(options.height)),
  };
}

function drawResize(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  srcW: number,
  srcH: number,
  canvasW: number,
  canvasH: number,
  fitMode: ResizeFitMode,
  backdrop: string,
  mime: OutputFormat,
): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const needsOpaque = mime === "image/jpeg";
  if (fitMode === "stretch") {
    if (needsOpaque) {
      ctx.fillStyle = backdrop || "#ffffff";
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      ctx.clearRect(0, 0, canvasW, canvasH);
    }
    ctx.drawImage(img, 0, 0, canvasW, canvasH);
    return;
  }

  const scaleFit = Math.min(canvasW / srcW, canvasH / srcH);
  const scaleFill = Math.max(canvasW / srcW, canvasH / srcH);
  const scale = fitMode === "fill" ? scaleFill : scaleFit;
  const drawW = Math.round(srcW * scale);
  const drawH = Math.round(srcH * scale);

  if (fitMode === "fit") {
    if (needsOpaque) {
      ctx.fillStyle = backdrop || "#ffffff";
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      paintTransparencyGrid(ctx, canvasW, canvasH);
    }
    const ox = Math.floor((canvasW - drawW) / 2);
    const oy = Math.floor((canvasH - drawH) / 2);
    ctx.drawImage(img, ox, oy, drawW, drawH);
    return;
  }

  // fill (cover)
  if (needsOpaque) {
    ctx.fillStyle = backdrop || "#ffffff";
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else {
    ctx.clearRect(0, 0, canvasW, canvasH);
  }
  const ox = (canvasW - drawW) / 2;
  const oy = (canvasH - drawH) / 2;
  ctx.drawImage(img, ox, oy, drawW, drawH);
}

export async function resizeImageAdvanced(
  file: File,
  options: ResizeAdvancedOptions,
): Promise<
  ProcessedImage & {
    inputMime: string;
    processingMs: number;
    beforePreviewUrl: string;
    originalWidth: number;
    originalHeight: number;
  }
> {
  const t0 = performance.now();
  const img = await loadImageFromFile(file);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const mime = resolveMime(file, options.format);
  const { canvasW, canvasH } = canvasSize(srcW, srcH, options);

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  drawResize(ctx, img, srcW, srcH, canvasW, canvasH, options.fitMode, options.backdrop, mime);

  const q = Math.min(1, Math.max(0.35, options.quality / 100));
  const blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : q);

  const tag =
    options.sizeMode === "percent"
      ? `resize-${options.percent}pct`
      : `resize-${canvasW}x${canvasH}-${options.fitMode}`;

  const beforePreviewUrl = URL.createObjectURL(file);

  return {
    id: uid(),
    name: outputFileName(file.name, mime, tag),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: canvasW,
    height: canvasH,
    outputMime: mime,
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || "application/octet-stream",
    beforePreviewUrl,
    originalWidth: srcW,
    originalHeight: srcH,
  };
}