import type { ImageContentKind } from "@/lib/image/smart-analyze";

export type OutputFormat = "image/jpeg" | "image/webp" | "image/png" | "image/avif";

export type ProcessedImage = {
  id: string;
  name: string;
  originalSize: number;
  outputSize: number;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  outputMime?: OutputFormat;
  processingMs?: number;
  contentKind?: ImageContentKind;
  estimatedSize?: number;
  targetKb?: number;
  targetBytes?: number;
  appliedQuality?: number;
  withinLimit?: boolean;
  deltaBytes?: number;
  deltaPercent?: number;
  toSizeWarning?: "tooAggressive" | "cannotMeet" | null;
  fitMode?: "strict" | "closest";
  strategy?: "balanced" | "preservePixels";
  inputMime?: string;
  hadAlpha?: boolean;
  beforePreviewUrl?: string;
  sanitizeWarnings?: string[];
  originalWidth?: number;
  originalHeight?: number;
  presetTag?: string;
  upscaleWarning?: boolean;
  cropAspectLabel?: string;
  transformAngle?: number;
  transformFlipH?: boolean;
  transformFlipV?: boolean;
};

/** Processed output plus original file preview URL for live before/after. */
export type LivePreviewImage = ProcessedImage & {
  sourcePreviewUrl: string;
};

export type ResizePresetId =
  | "instagram"
  | "facebook"
  | "twitter"
  | "youtube"
  | "linkedin"
  | "avatar"
  | "custom";

export const RESIZE_PRESETS: Record<
  Exclude<ResizePresetId, "custom">,
  { width: number; height: number }
> = {
  instagram: { width: 1080, height: 1080 },
  facebook: { width: 820, height: 312 },
  twitter: { width: 1200, height: 675 },
  youtube: { width: 1280, height: 720 },
  linkedin: { width: 1584, height: 396 },
  avatar: { width: 512, height: 512 },
};