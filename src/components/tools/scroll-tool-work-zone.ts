/** Scrolls a tool work section into view; mobile uses header-aware offset. */
export function scrollToolWorkZone(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return;

  const mobile = window.matchMedia("(max-width: 1023px)").matches;
  const headerOffset = mobile ? 68 : 96;
  const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(0, top), behavior: mobile ? "auto" : "smooth" });
}