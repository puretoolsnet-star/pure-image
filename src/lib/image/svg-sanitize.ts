const SCRIPT_RE = /<script[\s\S]*?<\/script>/gi;
const FOREIGN_OBJECT_RE = /<foreignObject[\s\S]*?<\/foreignObject>/gi;
const ON_ATTR_RE = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_HREF_RE = /(xlink:href|href)\s*=\s*"(javascript:[^"]*)"/gi;

export function sanitizeSvgMarkup(raw: string): { svg: string; warnings: string[] } {
  const warnings: string[] = [];
  let text = raw.trim();
  if (!text.includes("<svg") && !text.includes("<SVG")) {
    throw new Error("not-svg");
  }

  if (SCRIPT_RE.test(text)) warnings.push("scripts-removed");
  text = text.replace(SCRIPT_RE, "");
  text = text.replace(FOREIGN_OBJECT_RE, "");
  text = text.replace(ON_ATTR_RE, "");
  text = text.replace(JS_HREF_RE, (_, attr: string) => `${attr}=""`);

  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("svg-parse");

  const root = doc.documentElement;
  if (root.tagName.toLowerCase() !== "svg") throw new Error("not-svg");

  root.querySelectorAll("script").forEach((n) => n.remove());
  root.querySelectorAll("foreignObject").forEach((n) => n.remove());
  root.querySelectorAll("[href]").forEach((el) => {
    const href = el.getAttribute("href") ?? "";
    if (/^https?:/i.test(href)) {
      el.removeAttribute("href");
      warnings.push("external-href-removed");
    }
  });
  root.querySelectorAll("[xlink\\:href]").forEach((el) => {
    const href = el.getAttributeNS("http://www.w3.org/1999/xlink", "href") ?? "";
    if (/^https?:/i.test(href)) {
      el.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
      warnings.push("external-href-removed");
    }
  });

  const serialized = new XMLSerializer().serializeToString(root);
  return { svg: serialized, warnings };
}

export function isSvgFile(file: File): boolean {
  const type = file.type.toLowerCase();
  return type === "image/svg+xml" || /\.svg$/i.test(file.name);
}