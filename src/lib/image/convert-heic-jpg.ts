import { canvasToBlob, outputFileName, scaleToMaxWidth } from "@/lib/image/canvas";
import { drawWithExifOrientation, readExifOrientation } from "@/lib/image/exif-orientation";
import { applyJpegExifPolicy } from "@/lib/image/embed-jpeg-exif";
import { decodeHeicToJpegBlob, isHeic } from "@/lib/image/heic";
import type { ProcessedImage } from "@/lib/image/types";

export type HeicExifMode = "strip" | "preserve";

export type HeicJpgConvertOptions = {
  quality: number;
  maxWidth: number;
  backdrop: string;
  exifMode: HeicExifMode;
};

export type HeicInputKind = "heic" | "raster" | "unsupported";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function classifyHeicInput(file: File): HeicInputKind {
  if (isHeic(file)) return "heic";
  const type = file.type.toLowerCase();
  if (
    type === "image/jpeg" ||
    type === "image/png" ||
    type === "image/webp" ||
    type === "image/gif" ||
    type === "image/bmp" ||
    /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)
  ) {
    return "raster";
  }
  return "unsupported";
}

async function loadSourceBitmap(file: File): Promise<{ bitmap: ImageBitmap; kind: HeicInputKind }> {
  const kind = classifyHeicInput(file);
  if (kind === "unsupported") throw new Error("unsupported-format");

  let blob: Blob = file;
  if (kind === "heic") {
    blob = await decodeHeicToJpegBlob(file, 0.98);
  }

  const bitmap = await createImageBitmap(blob);
  return { bitmap, kind };
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

export async function convertHeicToJpgAdvanced(
  file: File,
  options: HeicJpgConvertOptions,
): Promise<
  ProcessedImage & {
    inputMime: string;
    processingMs: number;
    beforePreviewUrl: string;
    inputKind: HeicInputKind;
  }
> {
  const t0 = performance.now();
  const orientation = await readExifOrientation(file);
  const { bitmap, kind } = await loadSourceBitmap(file);
  await yieldToMain();

  const oriented = drawWithExifOrientation(
    bitmap,
    bitmap.width,
    bitmap.height,
    orientation,
  );
  bitmap.close();

  const scaled = scaleToMaxWidth(oriented.width, oriented.height, options.maxWidth);
  const canvas = document.createElement("canvas");
  canvas.width = scaled.width;
  canvas.height = scaled.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.fillStyle = options.backdrop || "#ffffff";
  ctx.fillRect(0, 0, scaled.width, scaled.height);
  ctx.drawImage(oriented, 0, 0, scaled.width, scaled.height);

  const q = Math.min(1, Math.max(0.35, options.quality / 100));
  const beforeBlob = await canvasToBlob(canvas, "image/jpeg", Math.min(0.95, q + 0.08));
  const beforePreviewUrl = URL.createObjectURL(beforeBlob);

  let blob = await canvasToBlob(canvas, "image/jpeg", q);
  blob = await applyJpegExifPolicy(blob, file, options.exifMode);

  const tag =
    kind === "heic"
      ? `heic-jpg-q${Math.round(q * 100)}`
      : `reencode-jpg-q${Math.round(q * 100)}`;

  return {
    id: uid(),
    name: outputFileName(
      file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"),
      "image/jpeg",
      tag,
    ),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width: scaled.width,
    height: scaled.height,
    outputMime: "image/jpeg",
    processingMs: Math.round(performance.now() - t0),
    inputMime: file.type || (kind === "heic" ? "image/heic" : "application/octet-stream"),
    beforePreviewUrl,
    inputKind: kind,
  };
}

export async function heicThumbnailUrl(file: File, maxSide = 256): Promise<string> {
  try {
    const orientation = await readExifOrientation(file);
    const { bitmap } = await loadSourceBitmap(file);
    const oriented = drawWithExifOrientation(
      bitmap,
      bitmap.width,
      bitmap.height,
      orientation,
    );
    bitmap.close();
    const scale = Math.min(1, maxSide / Math.max(oriented.width, oriented.height));
    const w = Math.max(1, Math.round(oriented.width * scale));
    const h = Math.max(1, Math.round(oriented.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return URL.createObjectURL(file);
    ctx.drawImage(oriented, 0, 0, w, h);
    const thumb = await canvasToBlob(canvas, "image/jpeg", 0.72);
    return URL.createObjectURL(thumb);
  } catch {
    return URL.createObjectURL(file);
  }
}