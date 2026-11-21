export function isPngFile(file: File): boolean {
  const type = file.type.toLowerCase();
  return type === "image/png" || /\.png$/i.test(file.name);
}

export async function detectPngHasAlpha(file: File): Promise<boolean> {
  if (!isPngFile(file)) return false;
  try {
    const bitmap = await createImageBitmap(file);
    const sampleW = Math.min(bitmap.width, 160);
    const sampleH = Math.min(bitmap.height, 160);
    const canvas = document.createElement("canvas");
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      bitmap.close();
      return false;
    }
    ctx.drawImage(bitmap, 0, 0, sampleW, sampleH);
    bitmap.close();
    const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
    for (let i = 3; i < data.length; i += 12) {
      if (data[i]! < 250) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function paintTransparencyGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cell = 14,
): void {
  const light = "#2d3148";
  const dark = "#1a1d2e";
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const isLight = ((x / cell) | 0) % 2 === ((y / cell) | 0) % 2;
      ctx.fillStyle = isLight ? light : dark;
      ctx.fillRect(x, y, cell, cell);
    }
  }
}