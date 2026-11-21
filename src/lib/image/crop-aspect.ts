import type { NormalizedCrop } from "@/lib/image/effects";

export type CropAspectPresetId =
  | "free"
  | "1x1"
  | "4x3"
  | "3x2"
  | "16x9"
  | "9x16"
  | "4x5"
  | "2x3"
  | "21x9"
  | "custom-ratio"
  | "custom-px";

export type CropAspectConfig =
  | { mode: "free" }
  | { mode: "ratio"; width: number; height: number }
  | { mode: "pixels"; width: number; height: number };

export const CROP_ASPECT_PRESETS: {
  id: Exclude<CropAspectPresetId, "custom-ratio" | "custom-px">;
  labelKey: string;
  ratio: [number, number] | null;
}[] = [
  { id: "free", labelKey: "free", ratio: null },
  { id: "1x1", labelKey: "r1x1", ratio: [1, 1] },
  { id: "4x3", labelKey: "r4x3", ratio: [4, 3] },
  { id: "3x2", labelKey: "r3x2", ratio: [3, 2] },
  { id: "16x9", labelKey: "r16x9", ratio: [16, 9] },
  { id: "9x16", labelKey: "r9x16", ratio: [9, 16] },
  { id: "4x5", labelKey: "r4x5", ratio: [4, 5] },
  { id: "2x3", labelKey: "r2x3", ratio: [2, 3] },
  { id: "21x9", labelKey: "r21x9", ratio: [21, 9] },
];

export function presetToConfig(id: CropAspectPresetId, customRatioW: number, customRatioH: number, customPxW: number, customPxH: number): CropAspectConfig {
  if (id === "free") return { mode: "free" };
  if (id === "custom-ratio") {
    return { mode: "ratio", width: Math.max(1, customRatioW), height: Math.max(1, customRatioH) };
  }
  if (id === "custom-px") {
    return { mode: "pixels", width: Math.max(16, customPxW), height: Math.max(16, customPxH) };
  }
  const p = CROP_ASPECT_PRESETS.find((x) => x.id === id);
  if (!p?.ratio) return { mode: "free" };
  return { mode: "ratio", width: p.ratio[0], height: p.ratio[1] };
}

export function aspectNumber(config: CropAspectConfig): number | null {
  if (config.mode === "free") return null;
  return config.width / config.height;
}

export function flipConfig(config: CropAspectConfig): CropAspectConfig {
  if (config.mode === "ratio") return { mode: "ratio", width: config.height, height: config.width };
  if (config.mode === "pixels") return { mode: "pixels", width: config.height, height: config.width };
  return config;
}

export function formatAspectLabel(w: number, h: number): string {
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return Math.max(1, x);
}

export function defaultCropForAspect(ar: number | null, imgAr: number): NormalizedCrop {
  if (!ar) return { x: 0.05, y: 0.05, w: 0.9, h: 0.9 };
  let w = 0.9;
  let h = w / ar;
  if (h > 0.9) {
    h = 0.9;
    w = h * ar;
  }
  if (w / h > imgAr) {
    w = h * imgAr;
  } else {
    h = w / ar;
  }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

/** Fit crop rect to aspect ratio keeping center when possible. */
export function constrainCrop(crop: NormalizedCrop, ar: number | null): NormalizedCrop {
  if (!ar) return clampCrop(crop);
  let { x, y, w, h } = crop;
  const current = w / h;
  if (Math.abs(current - ar) > 0.001) {
    if (current > ar) w = h * ar;
    else h = w / ar;
  }
  return clampCrop({ x, y, w, h });
}

export function clampCrop(c: NormalizedCrop): NormalizedCrop {
  let { x, y, w, h } = c;
  w = Math.min(1, Math.max(0.05, w));
  h = Math.min(1, Math.max(0.05, h));
  x = Math.min(1 - w, Math.max(0, x));
  y = Math.min(1 - h, Math.max(0, y));
  return { x, y, w, h };
}

/** Zoom >1 shrinks crop rect around center (tighter crop). */
export function applyCropZoom(crop: NormalizedCrop, zoom: number, ar: number | null): NormalizedCrop {
  const z = Math.min(3, Math.max(1, zoom));
  const cx = crop.x + crop.w / 2;
  const cy = crop.y + crop.h / 2;
  let w = crop.w / z;
  let h = crop.h / z;
  if (ar) {
    if (w / h > ar) w = h * ar;
    else h = w / ar;
  }
  return clampCrop({ x: cx - w / 2, y: cy - h / 2, w, h });
}

export function cropFromPixelTarget(
  srcW: number,
  srcH: number,
  pxW: number,
  pxH: number,
): NormalizedCrop {
  const nw = Math.min(1, pxW / srcW);
  const nh = Math.min(1, pxH / srcH);
  return clampCrop({ x: (1 - nw) / 2, y: (1 - nh) / 2, w: nw, h: nh });
}