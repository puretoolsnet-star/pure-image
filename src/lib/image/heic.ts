const HEIC_PATTERN = /\.heic$/i;
const HEIF_PATTERN = /\.heif$/i;

export function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    HEIC_PATTERN.test(file.name) ||
    HEIF_PATTERN.test(file.name)
  );
}

export async function decodeHeicToJpegBlob(file: File, quality = 0.92): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality });
  if (Array.isArray(result)) return result[0] as Blob;
  return result as Blob;
}