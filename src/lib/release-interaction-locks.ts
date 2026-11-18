const PORTAL_ROOT_ID = "pureimage-portal-root";

export function getPortalRoot(): HTMLElement {
  const existing = document.getElementById(PORTAL_ROOT_ID);
  if (existing) return existing;

  const created = document.createElement("div");
  created.id = PORTAL_ROOT_ID;
  created.setAttribute("aria-hidden", "true");
  created.className = "pointer-events-none fixed inset-0 z-[100] [&>*]:pointer-events-auto";
  document.body.appendChild(created);
  return created;
}