import { canvasToBlob, outputFileName } from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import { paintTransparencyGrid } from "@/lib/image/png-alpha";
import type { ResizeFormatChoice } from "@/lib/image/resize-advanced";
import type { OutputFormat, ProcessedImage } from "@/lib/image/types";

export type RotateCanvasMode = "expand" | "fit-size";
export type RotateBackdropMode = "transparent" | "color" | "blur";

export type RotateFlipOptions = {
  angleDeg: number;
  flipH: boolean;
  flipV: boolean;
  canvasMode: RotateCanvasMode;
  backdropMode: RotateBackdropMode;
  backdrop: string;
  format: ResizeFormatChoice;
  quality: number;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeAngle(deg: number): number {
  let a = ((deg % 360) + 360) % 360;
  if (a > 180) a -= 360;
  return Math.round(a * 10) / 10;
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

function bbox(srcW: number, srcH: number, deg: number): { w: number; h: number } {
  const rad = (Math.abs(deg) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    w: Math.ceil(srcW * cos + srcH * sin),
    h: Math.ceil(srcW * sin + srcH * cos),
  };
}

async function fillBackdrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  mime: OutputFormat,
  mode: RotateBackdropMode,
  color: string,
): Promise<void> {
  const opaque = mime === "image/jpeg" || mode === "color";
  if (mode === "blur") {
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * 1.1;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.save();
    ctx.filter = "blur(22px) brightness(0.82)";
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    ctx.restore();
    return;
  }
  if (opaque) {
    ctx.fillStyle = color || "#0f1118";
    ctx.fillRect(0, 0, cw, ch);
    return;
  }
  if (mode === "transparent") {
    ctx.clearRect(0, 0, cw, ch);
    paintTransparencyGrid(ctx, cw, ch);
    return;
  }
  ctx.fillStyle = color || "#0f1118";
  ctx.fillRect(0, 0, cw, ch);
}

function drawTransform(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  angleDeg: number,
  flipH: boolean,
  flipV: boolean,
  cw: number,
  ch: number,
) {
  ctx.save();
  ctx.translate(cw / 2, ch / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
}

function slugFor(angle: number, flipH: boolean, flipV: boolean): string {
  const parts = [`${Math.round(angle)}deg`];
  if (flipH) parts.push("fh");
  if (flipV) parts.push("fv");
  return parts.join("-");
}

export async function exportRotateFlip(
  file: File,
  options: RotateFlipOptions,
): Promise<
  ProcessedImage & {
    transformAngle?: number;
    transformFlipH?: boolean;
    transformFlipV?: boolean;
    originalWidth?: number;
    originalHeight?: number;
    beforePreviewUrl?: string;
  }
> {
  const t0 = performance.now();
  const img = await loadImageFromFile(file);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const angle = normalizeAngle(options.angleDeg);
  const mime = resolveMime(file, options.format);

  let cw: number;
  let ch: number;
  if (options.canvasMode === "fit-size") {
    cw = srcW;
    ch = srcH;
  } else {
    const box = bbox(srcW, srcH, angle);
    cw = box.w;
    ch = box.h;
  }

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const backdropMode =
    mime === "image/jpeg" ? "color" : options.backdropMode;

  await fillBackdrop(ctx, img, cw, ch, mime, backdropMode, options.backdrop);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  drawTransform(ctx, img, angle, options.flipH, options.flipV, cw, ch);

  const q = Math.min(1, Math.max(0.35, options.quality / 100));
  const blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : q);

  return {
    id: uid(),
    name: outputFileName(file.name, mime, `rotate-${slugFor(angle, options.flipH, options.flipV)}`),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    beforePreviewUrl: URL.createObjectURL(file),
    width: cw,
    height: ch,
    outputMime: mime,
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || "application/octet-stream",
    originalWidth: srcW,
    originalHeight: srcH,
    transformAngle: angle,
    transformFlipH: options.flipH,
    transformFlipV: options.flipV,
  };
}