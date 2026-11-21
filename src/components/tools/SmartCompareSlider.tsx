"use client";

import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function SmartCompareSlider({
  beforeSrc,
  afterSrc,
  busy,
  maxZoom = 3,
  zoomStep = 0.25,
  beforeLabel,
  afterLabel,
}: {
  beforeSrc: string;
  afterSrc: string;
  busy?: boolean;
  maxZoom?: number;
  zoomStep?: number;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const updateSplit = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(98, Math.max(2, pct)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => updateSplit(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, updateSplit]);

  const onPanPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPanPointerMove = (e: React.PointerEvent) => {
    if (!panStart.current || zoom <= 1) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panStart.current.px + dx, y: panStart.current.py + dy });
  };

  const onPanPointerUp = (e: React.PointerEvent) => {
    panStart.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [beforeSrc, afterSrc]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{t.smartCompress.dragSlider}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.min(maxZoom, Math.round((z + zoomStep) * 100) / 100))
            }
            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-violet-500/40 hover:text-violet-200"
            aria-label={t.smartCompress.zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.max(1, Math.round((z - zoomStep) * 100) / 100))
            }
            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-violet-500/40 hover:text-violet-200"
            aria-label={t.smartCompress.zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:border-emerald-500/40 hover:text-emerald-200"
          >
            {t.smartCompress.zoomReset}
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 sm:aspect-video",
          zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-ew-resize",
        )}
        onPointerDown={(e) => {
          if (zoom > 1) {
            onPanPointerDown(e);
            return;
          }
          setDragging(true);
          updateSplit(e.clientX);
        }}
        onPointerMove={onPanPointerMove}
        onPointerUp={onPanPointerUp}
        onPointerLeave={onPanPointerUp}
      >
        {busy ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/50">
            <Loader2 className="h-9 w-9 animate-spin text-violet-300" aria-hidden />
          </div>
        ) : null}
        <div
          className="absolute inset-0 origin-center transition-transform duration-150"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beforeSrc} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={afterSrc} alt="" className="h-full w-full object-contain" draggable={false} />
          </div>
        </div>
        <CompareLabels
          split={split}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDragging(true);
            updateSplit(e.clientX);
          }}
          beforeLabel={beforeLabel ?? t.livePreview.before}
          afterLabel={afterLabel ?? t.livePreview.after}
        />
      </div>
    </div>
  );
}

function CompareLabels({
  split,
  onPointerDown,
  beforeLabel,
  afterLabel,
}: {
  split: number;
  onPointerDown: (e: React.PointerEvent) => void;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <>
      <SplitHandle split={split} onPointerDown={onPointerDown} />
      <span
        className="pointer-events-none absolute bottom-2 left-2 rounded bg-slate-950/75 px-1.5 py-0.5 text-[10px] text-slate-300"
        style={{ opacity: split > 30 ? 1 : 0.4 }}
      >
        {beforeLabel}
      </span>
      <span
        className="pointer-events-none absolute bottom-2 right-2 rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] text-emerald-300"
        style={{ opacity: split < 70 ? 1 : 0.4 }}
      >
        {afterLabel}
      </span>
    </>
  );
}

function SplitHandle({
  split,
  onPointerDown,
}: {
  split: number;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      className="absolute inset-y-0 z-10 w-0.5 bg-white/70 shadow-[0_0_12px_rgba(0,0,0,0.45)]"
      style={{ left: `${split}%` }}
    >
      <button
        type="button"
        onPointerDown={onPointerDown}
        className="absolute top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/90 shadow-lg shadow-black/40 touch-none"
        aria-hidden
      >
        <span className="flex gap-0.5">
          <span className="h-3 w-0.5 rounded-full bg-white/80" />
          <span className="h-3 w-0.5 rounded-full bg-white/80" />
        </span>
      </button>
    </div>
  );
}