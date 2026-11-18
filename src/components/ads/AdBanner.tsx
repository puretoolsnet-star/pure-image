"use client";

import { useEffect, useRef } from "react";

import { useI18n } from "@/i18n/context";
import { adsterraSidebarBanner, mountAdsterraSidebarBanner } from "@/lib/ads/adsterra";
import { cn } from "@/lib/cn";

const { width: BANNER_WIDTH, height: BANNER_HEIGHT } = adsterraSidebarBanner;

export function AdBanner({ className }: { className?: string }) {
  const { t } = useI18n();
  const frameRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const syncScale = () => {
      const scale = Math.min(1, frame.clientWidth / BANNER_WIDTH);
      frame.style.setProperty("--ad-banner-scale", String(scale));
    };
    syncScale();
    const observer = new ResizeObserver(syncScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    return mountAdsterraSidebarBanner(slot);
  }, []);

  return (
    <aside
      aria-label={t.toolAd.sponsored}
      data-ad-slot="tool-sidebar"
      className={cn("hidden w-full min-w-0 shrink-0 md:block", className)}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {t.toolAd.sponsored}
      </p>
      <div className="glass-card overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
        <div
          ref={frameRef}
          className="mx-auto w-full max-w-[300px]"
          style={
            {
              "--ad-banner-scale": 1,
              height: `calc(${BANNER_HEIGHT}px * var(--ad-banner-scale))`,
            } as React.CSSProperties
          }
        >
          <div
            ref={slotRef}
            data-ad-banner-host
            className="mx-auto origin-top"
            style={{
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              transform: "scale(var(--ad-banner-scale))",
            }}
          />
        </div>
      </div>
    </aside>
  );
}