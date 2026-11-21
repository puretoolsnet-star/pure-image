import type { HeicExifMode } from "@/lib/image/convert-heic-jpg";

type ExifrTags = Record<string, unknown>;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = head?.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const bin = atob(body ?? "");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function toAscii(val: unknown): string | undefined {
  if (val == null) return undefined;
  if (typeof val === "string") return val;
  if (val instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${val.getFullYear()}:${pad(val.getMonth() + 1)}:${pad(val.getDate())} ${pad(val.getHours())}:${pad(val.getMinutes())}:${pad(val.getSeconds())}`;
  }
  return String(val);
}

export async function applyJpegExifPolicy(
  jpegBlob: Blob,
  sourceFile: File,
  mode: HeicExifMode,
): Promise<Blob> {
  if (mode === "strip") return jpegBlob;

  let tags: ExifrTags | null = null;
  try {
    const exifr = await import("exifr");
    tags = await exifr.parse(sourceFile, {
      pick: [
        "DateTimeOriginal",
        "CreateDate",
        "Make",
        "Model",
        "Software",
        "GPSLatitude",
        "GPSLongitude",
        "GPSAltitude",
      ],
    });
  } catch {
    return jpegBlob;
  }
  if (!tags || !Object.keys(tags).length) return jpegBlob;

  try {
    const piexif = await import("piexifjs");
    const exifObj: Record<string, Record<number, unknown>> = {
      "0th": {},
      Exif: {},
      GPS: {},
    };

    const dt = toAscii(tags.DateTimeOriginal ?? tags.CreateDate);
    if (dt) {
      exifObj.Exif[piexif.ExifIFD.DateTimeOriginal] = dt;
      exifObj["0th"][piexif.ImageIFD.DateTime] = dt;
    }
    const make = toAscii(tags.Make);
    const model = toAscii(tags.Model);
    if (make) exifObj["0th"][piexif.ImageIFD.Make] = make;
    if (model) exifObj["0th"][piexif.ImageIFD.Model] = model;
    const software = toAscii(tags.Software);
    if (software) exifObj["0th"][piexif.ImageIFD.Software] = software;

    exifObj["0th"][piexif.ImageIFD.Orientation] = 1;

    if (tags.GPSLatitude != null && tags.GPSLongitude != null) {
      const lat = Number(tags.GPSLatitude);
      const lon = Number(tags.GPSLongitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? "N" : "S";
        exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = lon >= 0 ? "E" : "W";
        exifObj.GPS[piexif.GPSIFD.GPSLatitude] = piexif.degreesToDmsRational(Math.abs(lat));
        exifObj.GPS[piexif.GPSIFD.GPSLongitude] = piexif.degreesToDmsRational(Math.abs(lon));
        if (tags.GPSAltitude != null) {
          exifObj.GPS[piexif.GPSIFD.GPSAltitude] = piexif.Rational(Number(tags.GPSAltitude), 1);
        }
      }
    }

    const exifBytes = piexif.dump(exifObj);
    const dataUrl = await blobToDataUrl(jpegBlob);
    const inserted = piexif.insert(exifBytes, dataUrl);
    return dataUrlToBlob(inserted);
  } catch {
    return jpegBlob;
  }
}