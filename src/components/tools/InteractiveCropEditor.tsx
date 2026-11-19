"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useI18n } from "@/i18n/context";
import type { NormalizedCrop } from "@/lib/image/effects";
import { cn } from "@/lib/cn";

type Aspect = "free" | "1:1" | "16:9" | "4:5";

function aspectRatio(a: Aspect): number | null {
  if (a === "1:1") return 1;
  if (a === "16:9") return 16 / 9;
  if (a === "4:5") return 4 / 5;
  return null;
}

export function InteractiveCropEditor({
  file,
  aspect,
  onApply,
  onLiveCrop,
  busy,
}: {
  file: File | null;
  aspect: Aspect;
  onApply: (crop: NormalizedCrop) => void;
  onLiveCrop?: (crop: NormalizedCrop) => void;
  busy: boolean;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<NormalizedCrop>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const dragRef = useRef<{ mode: "move" | "resize"; ox: number; oy: number; start: NormalizedCrop } | null>(
    null,
  );

  const paint = useCallback(() => {
    const c = canvasRef.current;
    const img = imgRef.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const x = crop.x * c.width;
    const y = crop.y * c.height;
    const w = crop.w * c.width;
    const h = crop.h * c.height;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.clearRect(x, y, w, h);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }, [crop]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const c = canvasRef.current;
      if (!c) return;
      const maxW = 560;
      const scale = Math.min(1, maxW / img.naturalWidth);
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      fitCropToAspect(aspect, setCrop);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, aspect]);

  useEffect(() => {
    paint();
  }, [paint, file, aspect]);

  useEffect(() => {
    if (!onLiveCrop) return;
    const timer = window.setTimeout(() => onLiveCrop(crop), 450);
    return () => window.clearTimeout(timer);
  }, [crop, onLiveCrop]);

  function pointerToNorm(clientX: number, clientY: number) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      nx: (clientX - rect.left) / rect.width,
      ny: (clientY - rect.top) / rect.height,
    };
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!file) return;
    const { nx, ny } = pointerToNorm(e.clientX, e.clientY);
    const inX = nx >= crop.x && nx <= crop.x + crop.w;
    const inY = ny >= crop.y && ny <= crop.y + crop.h;
    dragRef.current = {
      mode: inX && inY ? "move" : "resize",
      ox: nx,
      oy: ny,
      start: { ...crop },
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { nx, ny } = pointerToNorm(e.clientX, e.clientY);
    const dx = nx - drag.ox;
    const dy = ny - drag.oy;
    if (drag.mode === "move") {
      setCrop((prev) => ({
        ...prev,
        x: clamp(drag.start.x + dx, 0, 1 - prev.w),
        y: clamp(drag.start.y + dy, 0, 1 - prev.h),
      }));
    } else {
      setCrop(() => {
        const w = clamp(drag.start.w + dx, 0.1, 1 - drag.start.x);
        let h = clamp(drag.start.h + dy, 0.1, 1 - drag.start.y);
        const ar = aspectRatio(aspect);
        if (ar) h = w / ar;
        return { x: drag.start.x, y: drag.start.y, w, h: Math.min(h, 1 - drag.start.y) };
      });
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  if (!file) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">{t.toolUi.cropHint}</p>
      <canvas
        ref={canvasRef}
        className={cn(
          "mx-auto max-w-full touch-none rounded-xl border border-slate-700 bg-slate-900",
          busy && "pointer-events-none opacity-60",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => onApply(crop)}
        className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {t.toolUi.applyCrop}
      </button>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function fitCropToAspect(
  aspect: Aspect,
  setCrop: (value: NormalizedCrop | ((p: NormalizedCrop) => NormalizedCrop)) => void,
) {
  const ar = aspectRatio(aspect);
  if (!ar) return;
  let w = 0.8;
  let h = w / ar;
  if (h > 0.8) {
    h = 0.8;
    w = h * ar;
  }
  setCrop({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
}