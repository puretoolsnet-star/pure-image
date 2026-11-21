import { decodeHeicToJpegBlob, isHeic } from "@/lib/image/heic";

export async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
  let blob: Blob = file;
  if (isHeic(file)) {
    blob = await decodeHeicToJpegBlob(file, 0.92);
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