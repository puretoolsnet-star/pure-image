export async function readExifOrientation(file: File): Promise<number> {
  try {
    const exifr = await import("exifr");
    const value = await exifr.orientation(file);
    if (typeof value === "number" && value >= 1 && value <= 8) return value;
  } catch {
    /* ignore */
  }
  return 1;
}

type Size = { width: number; height: number };

function orientedSize(width: number, height: number, orientation: number): Size {
  if (orientation >= 5 && orientation <= 8) return { width: height, height: width };
  return { width, height };
}

export function drawWithExifOrientation(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  orientation: number,
): HTMLCanvasElement {
  const { width, height } = orientedSize(srcW, srcH, orientation);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  switch (orientation) {
    case 2:
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5:
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      break;
    case 8:
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
    default:
      break;
  }

  const drawW = orientation >= 5 && orientation <= 8 ? srcH : srcW;
  const drawH = orientation >= 5 && orientation <= 8 ? srcW : srcH;
  ctx.drawImage(source, 0, 0, drawW, drawH);
  return canvas;
}