const HEIC_PATTERN = /\.heic$/i;
const HEIF_PATTERN = /\.heif$/i;

function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    HEIC_PATTERN.test(file.name) ||
    HEIF_PATTERN.test(file.name)
  );
}

async function heicToBlob(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  if (Array.isArray(result)) return result[0] as Blob;
  return result as Blob;
}

export async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
  let blob: Blob = file;
  if (isHeic(file)) {
    blob = await heicToBlob(file);
  }
  return createImageBitmap(blob);
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const bitmap = await fileToImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = canvas.toDataURL("image/png");
  });
}