import { canvasToBlob, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import { findSocialPreset } from "@/lib/image/social-presets";
import type { ProcessedImage, OutputFormat } from "@/lib/image/types";

export type SocialFillMode = "cover" | "contain";
export type SocialContainBackdrop = "color" | "blur";

export type SocialPan = {
  focusX: number;
  focusY: number;
  zoom: number;
};

export type SocialExportOptions = {
  presetId: string;
  customWidth?: number;
  customHeight?: number;
  fillMode: SocialFillMode;
  containBackdrop: SocialContainBackdrop;
  backdrop: string;
  format: ResizeFormatChoice;
  quality: number;
  targetKb: number | null;
  pan: SocialPan;
};

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

function targetSize(options: SocialExportOptions): { w: number; h: number; tag: string } {
  const def = findSocialPreset(options.presetId);
  if (options.presetId === "custom" && options.customWidth && options.customHeight) {
    return {
      w: Math.max(1, options.customWidth),
      h: Math.max(1, options.customHeight),
      tag: `${options.customWidth}x${options.customHeight}`,
    };
  }
  if (!def) return { w: 1080, h: 1080, tag: "1080x1080" };
  return { w: def.width, h: def.height, tag: `${def.width}x${def.height}` };
}

function needsUpscaleWarning(
  srcW: number,
  srcH: number,
  canvasW: number,
  canvasH: number,
  fillMode: SocialFillMode,
  zoom: number,
): boolean {
  const base =
    fillMode === "cover"
      ? Math.max(canvasW / srcW, canvasH / srcH)
      : Math.min(canvasW / srcW, canvasH / srcH);
  return base * zoom > 1.08;
}

async function drawBlurredBackdrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
): Promise<void> {
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const ox = (cw - dw) / 2;
  const oy = (ch - dh) / 2;
  ctx.save();
  ctx.filter = "blur(18px) brightness(0.85)";
  ctx.drawImage(img, ox, oy, dw, dh);
  ctx.restore();
}

async function encodeTarget(
  canvas: HTMLCanvasElement,
  mime: OutputFormat,
  quality: number,
  targetKb: number | null,
): Promise<Blob> {
  const q = Math.min(1, Math.max(0.35, quality / 100));
  let blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : q);
  if (!targetKb || targetKb <= 0) return blob;
  const targetBytes = targetKb * 1024;
  if (blob.size <= targetBytes) return blob;
  let lo = 0.2;
  let hi = q;
  for (let i = 0; i < 10 && mime !== "image/png"; i++) {
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

export async function exportSocialPreset(
  file: File,
  options: SocialExportOptions,
): Promise<
  ProcessedImage & {
    inputMime: string;
    processingMs: number;
    beforePreviewUrl: string;
    presetTag: string;
    upscaleWarning: boolean;
  }
> {
  const t0 = performance.now();
  const img = await loadImageFromFile(file);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const { w: canvasW, h: canvasH, tag } = targetSize(options);
  const mime = resolveMime(file, options.format);
  const pan = {
    focusX: Math.min(1, Math.max(0, options.pan.focusX)),
    focusY: Math.min(1, Math.max(0, options.pan.focusY)),
    zoom: Math.min(3, Math.max(1, options.pan.zoom)),
  };

  const upscaleWarning = needsUpscaleWarning(
    srcW,
    srcH,
    canvasW,
    canvasH,
    options.fillMode,
    pan.zoom,
  );

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const baseScale =
    options.fillMode === "cover"
      ? Math.max(canvasW / srcW, canvasH / srcH)
      : Math.min(canvasW / srcW, canvasH / srcH);
  const scale = baseScale * pan.zoom;
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const focusPx = pan.focusX * srcW;
  const focusPy = pan.focusY * srcH;
  const ox = canvasW / 2 - focusPx * scale;
  const oy = canvasH / 2 - focusPy * scale;

  if (options.fillMode === "contain" && options.containBackdrop === "blur") {
    await drawBlurredBackdrop(ctx, img, canvasW, canvasH);
  } else if (options.fillMode === "contain" || mime === "image/jpeg") {
    ctx.fillStyle = options.backdrop || "#0f1118";
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else {
    ctx.clearRect(0, 0, canvasW, canvasH);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, ox, oy, drawW, drawH);

  const blob = await encodeTarget(canvas, mime, options.quality, options.targetKb);
  const presetSlug = options.presetId === "custom" ? tag : options.presetId;

  return {
    id: uid(),
    name: outputFileName(file.name, mime, `social-${presetSlug}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: canvasW,
    height: canvasH,
    outputMime: mime,
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || "application/octet-stream",
    beforePreviewUrl: URL.createObjectURL(file),
    originalWidth: srcW,
    originalHeight: srcH,
    presetTag: presetSlug,
    upscaleWarning,
    toSizeWarning: upscaleWarning ? "tooAggressive" : null,
  };
}