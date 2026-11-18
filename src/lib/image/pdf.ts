import type { ProcessedImage } from "@/lib/image/types";
import { downloadBlob } from "@/lib/image/process";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type PdfBuildResult = {
  id: string;
  name: string;
  blob: Blob;
  pageCount: number;
};

export async function imagesToPdf(files: File[]): Promise<PdfBuildResult> {
  const { jsPDF } = await import("jspdf");
  if (!files.length) throw new Error("empty");
  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  let doc: InstanceType<typeof jsPDF> | null = null;
  for (let i = 0; i < files.length; i++) {
    const dataUrl = await readAsDataUrl(files[i]);
    const img = await bitmapSize(dataUrl);
    const orientation = img.w > img.h ? "landscape" : "portrait";
    if (!doc) {
      doc = new jsPDF({ orientation, unit: "px", format: [img.w, img.h] });
    } else {
      doc.addPage([img.w, img.h], orientation);
    }
    doc.addImage(dataUrl, detectFormat(files[i].type), 0, 0, img.w, img.h);
  }
  if (!doc) throw new Error("pdf");
  const blob = doc.output("blob");
  return {
    id: uid(),
    name: "pure-image-album.pdf",
    blob,
    pageCount: files.length,
  };
}

function detectFormat(mime: string): "JPEG" | "PNG" | "WEBP" {
  if (mime.includes("png")) return "PNG";
  if (mime.includes("webp")) return "WEBP";
  return "JPEG";
}

function bitmapSize(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function downloadPdf(blob: Blob, name: string) {
  downloadBlob(blob, name);
}