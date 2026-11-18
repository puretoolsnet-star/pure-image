import type { OutputFormat } from "@/lib/image/types";

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: OutputFormat,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("blob"));
        else resolve(blob);
      },
      mime,
      mime === "image/png" ? undefined : quality,
    );
  });
}

export function fitDimensions(
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  keepAspect: boolean,
): { width: number; height: number } {
  if (!keepAspect) return { width: targetW, height: targetH };
  const ratio = sourceW / sourceH;
  const boxRatio = targetW / targetH;
  if (ratio > boxRatio) {
    return { width: targetW, height: Math.round(targetW / ratio) };
  }
  return { width: Math.round(targetH * ratio), height: targetH };
}

export function scaleToMaxWidth(
  sourceW: number,
  sourceH: number,
  maxWidth: number | undefined,
): { width: number; height: number } {
  if (!maxWidth || maxWidth <= 0 || sourceW <= maxWidth) {
    return { width: sourceW, height: sourceH };
  }
  const ratio = maxWidth / sourceW;
  return { width: maxWidth, height: Math.round(sourceH * ratio) };
}

export function extensionForMime(mime: OutputFormat): string {
  if (mime === "image/webp") return "webp";
  if (mime === "image/png") return "png";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

export function outputFileName(original: string, mime: OutputFormat, suffix?: string): string {
  const base = original.replace(/\.[^.]+$/, "");
  const ext = extensionForMime(mime);
  const tag = suffix ? `-${suffix}` : "";
  return `${base}${tag}.${ext}`;
}