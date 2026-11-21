"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SocialPan } from "@/lib/image/social-preset-export";
import type { SocialPresetDef, SocialSafeZone } from "@/lib/image/social-presets";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function SocialCropViewport({
  file,
  preset,
  pan,
  onPan,
  fillMode,
  disabled,
}: {
  file: File | null;
  preset: SocialPresetDef | null;
  pan: SocialPan;
  onPan: (p: SocialPan) => void;
  fillMode: "cover" | "contain";
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; start: SocialPan } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!file) {
      imgRef.current = null;
      setReady(false);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.src = url;
    return () => {
      URL.revokeObjectURL(url);
      setReady(false);
    };
  }, [file]);

  const paint = useCallback(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    const canvas = wrap?.querySelector("canvas");
    if (!wrap || !img || !canvas || !(canvas instanceof HTMLCanvasElement) || !preset) return;

    const maxW = Math.min(560, wrap.clientWidth || 560);
    const aspect = preset.width / preset.height;
    const cw = maxW;
    const ch = Math.round(cw / aspect);
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const baseScale =
      fillMode === "cover" ? Math.max(cw / srcW, ch / srcH) : Math.min(cw / srcW, ch / srcH);
    const scale = baseScale * pan.zoom;
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const ox = cw / 2 - pan.focusX * srcW * scale;
    const oy = ch / 2 - pan.focusY * srcH * scale;

    ctx.fillStyle = "#0f1118";
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, ox, oy, drawW, drawH);

    drawSafeZone(ctx, cw, ch, preset.safeZone);
  }, [fillMode, pan, preset]);

  useEffect(() => {
    if (!ready) return;
    paint();
  }, [paint, ready]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      start: { ...pan },
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const img = imgRef.current;
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!drag || !img || !canvas || !(canvas instanceof HTMLCanvasElement)) return;
    const dx = (e.clientX - drag.sx) / canvas.width;
    const dy = (e.clientY - drag.sy) / canvas.height;
    onPan({
      ...drag.start,
      focusX: Math.min(1, Math.max(0, drag.start.focusX - dx / drag.start.zoom)),
      focusY: Math.min(1, Math.max(0, drag.start.focusY - dy / drag.start.zoom)),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (disabled) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    onPan({ ...pan, zoom: Math.min(3, Math.max(1, pan.zoom + delta)) });
  };

  if (!file || !preset) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">{t.socialPresets.cropHint}</p>
      <div
        ref={wrapRef}
        className={cn(
          "relative mx-auto max-w-full touch-none",
          disabled && "pointer-events-none opacity-60",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <canvas className="w-full rounded-xl border border-slate-700 bg-slate-900" />
        <span className="absolute right-2 top-2 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-300">
          {preset.width}×{preset.height}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>{t.socialPresets.zoom}</span>
        <input
          type="range"
          min={100}
          max={300}
          value={Math.round(pan.zoom * 100)}
          disabled={disabled}
          onChange={(e) => onPan({ ...pan, zoom: Number(e.target.value) / 100 })}
          className="flex-1 accent-violet-500"
        />
      </div>
    </div>
  );
}

function drawSafeZone(ctx: CanvasRenderingContext2D, w: number, h: number, zone: SocialSafeZone) {
  if (zone === "none") return;
  ctx.save();
  ctx.strokeStyle = "rgba(236, 72, 153, 0.75)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  if (zone === "avatar-circle") {
    const r = Math.min(w, h) * 0.42;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (zone === "story") {
    const marginX = w * 0.06;
    const marginTop = h * 0.12;
    const marginBottom = h * 0.16;
    ctx.strokeRect(marginX, marginTop, w - marginX * 2, h - marginTop - marginBottom);
  }
  ctx.restore();
}