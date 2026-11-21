function parseLength(val: string | null): number | null {
  if (!val) return null;
  const n = parseFloat(val.replace(/[^\d.+-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function readSvgBaseSize(svgMarkup: string): { width: number; height: number } {
  const doc = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
  const svg = doc.documentElement;
  let w = parseLength(svg.getAttribute("width"));
  let h = parseLength(svg.getAttribute("height"));

  const vb = svg.getAttribute("viewBox")?.trim().split(/[\s,]+/);
  const vbW = vb && vb.length >= 4 ? parseFloat(vb[2]!) : NaN;
  const vbH = vb && vb.length >= 4 ? parseFloat(vb[3]!) : NaN;

  if (!w && !h && Number.isFinite(vbW) && Number.isFinite(vbH) && vbW > 0 && vbH > 0) {
    return { width: vbW, height: vbH };
  }
  if (w && !h && Number.isFinite(vbH) && Number.isFinite(vbW) && vbW > 0) {
    h = (w * vbH) / vbW;
  } else if (h && !w && Number.isFinite(vbW) && Number.isFinite(vbH) && vbH > 0) {
    w = (h * vbW) / vbH;
  }
  if (w && h) return { width: w, height: h };
  if (Number.isFinite(vbW) && Number.isFinite(vbH) && vbW > 0 && vbH > 0) {
    return { width: vbW, height: vbH };
  }
  return { width: 512, height: 512 };
}

export function injectSvgRenderSize(svgMarkup: string, width: number, height: number): string {
  const doc = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
  const svg = doc.documentElement;
  svg.setAttribute("width", String(Math.round(width)));
  svg.setAttribute("height", String(Math.round(height)));
  if (!svg.getAttribute("viewBox")) {
    svg.setAttribute("viewBox", `0 0 ${Math.round(width)} ${Math.round(height)}`);
  }
  return new XMLSerializer().serializeToString(svg);
}