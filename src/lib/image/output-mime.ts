import type { OutputFormat } from "@/lib/image/types";

/** Chooses canvas output mime for smart compress (browser-local). */
export function pickOutputMime(fileType: string): OutputFormat {
  if (fileType === "image/webp") return "image/webp";
  if (fileType === "image/png") return "image/webp";
  return "image/jpeg";
}