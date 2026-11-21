import { downloadBlob } from "@/lib/image/process";

export { buildPdfAlbum, type PdfAlbumOptions, type PdfPageInput } from "@/lib/image/pdf-album";

export function downloadPdf(blob: Blob, name: string) {
  downloadBlob(blob, name);
}