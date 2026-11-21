import { canvasToBlob, outputFileName } from "@/lib/image/canvas";
import { paintTransparencyGrid } from "@/lib/image/png-alpha";
import { injectSvgRenderSize, readSvgBaseSize } from "@/lib/image/svg-dimensions";
import { isSvgFile, sanitizeSvgMarkup } from "@/lib/image/svg-sanitize";
import type { ProcessedImage } from "@/lib/image/types";

export type SvgOutputFormat = "image/png" | "image/jpeg";
export type SvgSizeMode = "scale" | "pixels";
export type SvgPngBackground = "transparent" | "solid";

export type SvgConvertOptions = {
  format: SvgOutputFormat;
  sizeMode: SvgSizeMode;
  scaleMultiplier: number;
  outputWidth: number;
  outputHeight: number;
  lockAspect: boolean;
  pngBackground: SvgPngBackground;
  backdrop: string;
  quality: number;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function resolveOutputSize(
  base: { width: number; height: number },
  options: SvgConvertOptions,
): { width: number; height: number } {
  if (options.sizeMode === "scale") {
    const m = Math.min(16, Math.max(1, options.scaleMultiplier));
    return {
      width: Math.max(1, Math.round(base.width * m)),
      height: Math.max(1, Math.round(base.height * m)),
    };
  }

  let w = Math.max(1, Math.round(options.outputWidth));
  let h = Math.max(1, Math.round(options.outputHeight));
  if (options.lockAspect) {
    const aspect = base.width / base.height;
    h = Math.max(1, Math.round(w / aspect));
  }
  return { width: w, height: h };
}

async function loadSanitizedSvgImage(svgMarkup: string, w: number, h: number): Promise<HTMLImageElement> {
  const sized = injectSvgRenderSize(svgMarkup, w, h);
  const blob = new Blob([sized], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("svg-render"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function convertSvgAdvanced(
  file: File,
  options: SvgConvertOptions,
): Promise<
  ProcessedImage & {
    inputMime: string;
    processingMs: number;
    beforePreviewUrl: string;
    outputFormatLabel: SvgOutputFormat;
    sanitizeWarnings: string[];
  }
> {
  if (!isSvgFile(file)) throw new Error("not-svg");

  const t0 = performance.now();
  const raw = await file.text();
  const { svg, warnings } = sanitizeSvgMarkup(raw);
  const base = readSvgBaseSize(svg);
  const { width, height } = resolveOutputSize(base, options);

  const img = await loadSanitizedSvgImage(svg, width, height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const transparentPng =
    options.format === "image/png" && options.pngBackground === "transparent";

  if (transparentPng) {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = options.backdrop || "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  const beforeCanvas = document.createElement("canvas");
  beforeCanvas.width = width;
  beforeCanvas.height = height;
  const bctx = beforeCanvas.getContext("2d")!;
  paintTransparencyGrid(bctx, width, height);
  bctx.drawImage(img, 0, 0, width, height);
  const beforePreviewUrl = URL.createObjectURL(
    await canvasToBlob(beforeCanvas, "image/png"),
  );

  const q = Math.min(1, Math.max(0.35, options.quality / 100));
  const mime = options.format;
  const blob = await canvasToBlob(canvas, mime, mime === "image/jpeg" ? q : undefined);

  const tag =
    options.sizeMode === "scale"
      ? `svg-${options.scaleMultiplier}x`
      : `svg-${width}x${height}`;

  return {
    id: uid(),
    name: outputFileName(file.name, mime, tag),
    originalSize: file.size,
    outputSize: blob.size,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
    outputMime: mime,
    processingMs: Math.round(performance.now() - t0),
    inputMime: "image/svg+xml",
    beforePreviewUrl,
    outputFormatLabel: options.format,
    sanitizeWarnings: warnings,
  };
}