declare module "piexifjs" {
  export const ImageIFD: Record<string, number>;
  export const ExifIFD: Record<string, number>;
  export const GPSIFD: Record<string, number>;
  export function dump(exifObj: Record<string, Record<number, unknown>>): string;
  export function insert(exifStr: string, dataUrl: string): string;
  export function degreesToDmsRational(degrees: number): [[number, number], [number, number], [number, number]];
  export function Rational(num: number, den: number): [number, number];
}