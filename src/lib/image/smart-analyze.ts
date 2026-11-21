import { loadImageFromFile } from "@/lib/image/decode";
export type ImageContentKind = "photo" | "graphic" | "text" | "transparent";

export type SmartCompressMode = "auto" | "maxQuality" | "maxSavings" | "manual";

export type ImageAnalysis = {
  kind: ImageContentKind;
  width: number;
  height: number;
  megapixels: number;
  hasAlpha: boolean;
};

const SAMPLE = 128;

const QUALITY_BY_KIND: Record<ImageContentKind, { auto: number; maxQuality: number; maxSavings: number }> = {
  photo: { auto: 78, maxQuality: 90, maxSavings: 54 },
  graphic: { auto: 82, maxQuality: 92, maxSavings: 58 },
  text: { auto: 86, maxQuality: 94, maxSavings: 64 },
  transparent: { auto: 80, maxQuality: 88, maxSavings: 60 },
};

function classifyFromSamples(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  hasAlpha: boolean,
  transparentRatio: number,
): ImageContentKind {
  if (hasAlpha && transparentRatio > 0.04) return "transparent";

  let edgeSum = 0;
  let lumSum = 0;
  let lumSq = 0;
  let n = 0;

  const lumAt = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    const a = data[i + 3]! / 255;
    if (a < 0.05) return null;
    return (0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!) * a;
  };

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const c = lumAt(x, y);
      if (c === null) continue;
      const l = lumAt(x - 1, y);
      const r = lumAt(x + 1, y);
      const u = lumAt(x, y - 1);
      const d = lumAt(x, y + 1);
      if (l === null || r === null || u === null || d === null) continue;
      edgeSum += Math.abs(4 * c - l - r - u - d);
      lumSum += c;
      lumSq += c * c;
      n++;
    }
  }

  if (n < 16) return "photo";

  const edge = edgeSum / n;
  const mean = lumSum / n;
  const variance = lumSq / n - mean * mean;

  if (edge > 14 && variance < 900) return "text";
  if (edge > 9 && variance < 2400) return "graphic";
  return "photo";
}

export async function analyzeImageFile(file: File): Promise<ImageAnalysis> {
  const img = await loadImageFromFile(file);
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const scale = Math.min(1, SAMPLE / Math.max(nw, nh));
  const w = Math.max(1, Math.round(nw * scale));
  const h = Math.max(1, Math.round(nh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      kind: "photo",
      width: nw,
      height: nh,
      megapixels: Math.round((nw * nh) / 1e4) / 100,
      hasAlpha: file.type === "image/png" || file.type === "image/webp",
    };
  }
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  let transparentPixels = 0;
  let opaquePixels = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! < 250) transparentPixels++;
    else opaquePixels++;
  }
  const total = transparentPixels + opaquePixels || 1;
  const transparentRatio = transparentPixels / total;
  const hasAlpha = file.type === "image/png" || file.type === "image/webp" || transparentRatio > 0.01;

  const kind = classifyFromSamples(data, w, h, hasAlpha, transparentRatio);

  return {
    kind,
    width: nw,
    height: nh,
    megapixels: Math.round((nw * nh) / 1e4) / 100,
    hasAlpha,
  };
}

export function resolveQualityPercent(
  mode: SmartCompressMode,
  kind: ImageContentKind,
  manualQuality: number,
): number {
  if (mode === "manual") return manualQuality;
  const row = QUALITY_BY_KIND[kind];
  if (mode === "maxQuality") return row.maxQuality;
  if (mode === "maxSavings") return row.maxSavings;
  return row.auto;
}

export function resolveMaxWidth(
  mode: SmartCompressMode,
  analysis: ImageAnalysis,
  manualMaxWidth: number,
): number {
  const clamp = (n: number) => Math.min(4096, Math.max(320, Math.round(n)));
  switch (mode) {
    case "maxSavings":
      return clamp(Math.min(1600, analysis.width, manualMaxWidth));
    case "maxQuality":
      return clamp(Math.min(4096, analysis.width));
    case "manual":
      return clamp(manualMaxWidth);
    default:
      return clamp(Math.min(1920, analysis.width, manualMaxWidth));
  }
}