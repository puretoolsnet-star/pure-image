import {
  canvasToBlob,
  fitDimensions,
  outputFileName,
  scaleToMaxWidth,
} from "@/lib/image/canvas";
import { loadImageFromFile } from "@/lib/image/decode";
import type { OutputFormat, ProcessedImage, ResizePresetId } from "@/lib/image/types";
import { RESIZE_PRESETS } from "@/lib/image/types";

function id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function renderToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  mime: OutputFormat,
  quality: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, mime, quality);
  return { blob, width, height };
}

export async function compressFile(
  file: File,
  quality: number,
  maxWidth: number | undefined,
  mime: OutputFormat = "image/jpeg",
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const { width, height } = scaleToMaxWidth(img.naturalWidth, img.naturalHeight, maxWidth);
  const { blob, width: w, height: h } = await renderToBlob(img, width, height, mime, quality);
  return {
    id: id(),
    name: outputFileName(file.name, mime, "compressed"),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: w,
    height: h,
  };
}

export async function convertFile(
  file: File,
  mime: OutputFormat,
  quality = 0.92,
): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const { blob, width, height } = await renderToBlob(
    img,
    img.naturalWidth,
    img.naturalHeight,
    mime,
    quality,
  );
  return {
    id: id(),
    name: outputFileName(file.name, mime, "converted"),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
  };
}

export type ResizeOptions = {
  preset: ResizePresetId;
  width: number;
  height: number;
  keepAspect: boolean;
  mime?: OutputFormat;
  quality?: number;
};

export async function resizeFile(file: File, options: ResizeOptions): Promise<ProcessedImage> {
  const img = await loadImageFromFile(file);
  const mime = options.mime ?? "image/jpeg";
  const quality = options.quality ?? 0.9;

  let targetW = options.width;
  let targetH = options.height;
  if (options.preset !== "custom") {
    const preset = RESIZE_PRESETS[options.preset];
    targetW = preset.width;
    targetH = preset.height;
  }

  const { width, height } = fitDimensions(
    img.naturalWidth,
    img.naturalHeight,
    targetW,
    targetH,
    options.keepAspect,
  );

  const { blob, width: w, height: h } = await renderToBlob(img, width, height, mime, quality);
  return {
    id: id(),
    name: outputFileName(file.name, mime, "resized"),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: w,
    height: h,
  };
}

/** Low-level save — call only after `useRewardedDownload` unlocks. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadZip(items: ProcessedImage[], zipName = "pure-image-batch.zip") {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const item of items) {
    zip.file(item.name, item.blob);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, zipName);
}