"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { aspectNumber, clampCrop, constrainCrop, type CropAspectConfig } from "@/lib/image/crop-aspect";
import type { NormalizedCrop } from "@/lib/image/effects";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

type Handle =
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "e"
  | "w";

const HANDLE_R = 0.025;

export function AspectCropEditor({
  file,
  aspectConfig,
  crop,
  onCrop,
  zoom,
  onZoom,
  showGrid,
  disabled,
}: {
  file: File | null;
  aspectConfig: CropAspectConfig;
  crop: NormalizedCrop;
  onCrop: (c: NormalizedCrop) => void;
  zoom: number;
  onZoom: (z: number) => void;
  showGrid: boolean;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ mode: Handle; ox: number; oy: number; start: NormalizedCrop } | null>(
    null,
  );
  const [ready, setReady] = useState(false);

  const ar = aspectNumber(aspectConfig);

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

    ctx.fillStyle = "rgba(0,0,0,0.58)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, 0, 0, c.width, c.height);
    ctx.restore();

    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let i = 1; i < 3; i++) {
        const vx = x + (w * i) / 3;
        const hy = y + (h * i) / 3;
        ctx.beginPath();
        ctx.moveTo(vx, y);
        ctx.lineTo(vx, y + h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, hy);
        ctx.lineTo(x + w, hy);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    drawHandles(ctx, crop, c.width, c.height);
  }, [crop, showGrid]);

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
      const c = canvasRef.current;
      if (!c) return;
      const maxW = 580;
      const scale = Math.min(1, maxW / img.naturalWidth);
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      setReady(true);
    };
    img.src = url;
    return () => {
      URL.revokeObjectURL(url);
      setReady(false);
    };
  }, [file]);

  useEffect(() => {
    if (!ready) return;
    paint();
  }, [paint, ready]);

  function pointerToNorm(clientX: number, clientY: number) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      nx: (clientX - rect.left) / rect.width,
      ny: (clientY - rect.top) / rect.height,
    };
  }

  function hitHandle(nx: number, ny: number): Handle {
    const { x, y, w, h } = crop;
    const corners: { h: Handle; cx: number; cy: number }[] = [
      { h: "nw", cx: x, cy: y },
      { h: "ne", cx: x + w, cy: y },
      { h: "sw", cx: x, cy: y + h },
      { h: "se", cx: x + w, cy: y + h },
    ];
    for (const c of corners) {
      if (Math.hypot(nx - c.cx, ny - c.cy) < HANDLE_R) return c.h;
    }
    const edges: { h: Handle; test: boolean }[] = [
      { h: "n", test: Math.abs(ny - y) < HANDLE_R && nx > x && nx < x + w },
      { h: "s", test: Math.abs(ny - (y + h)) < HANDLE_R && nx > x && nx < x + w },
      { h: "w", test: Math.abs(nx - x) < HANDLE_R && ny > y && ny < y + h },
      { h: "e", test: Math.abs(nx - (x + w)) < HANDLE_R && ny > y && ny < y + h },
    ];
    for (const e of edges) {
      if (e.test) return e.h;
    }
    if (nx >= x && nx <= x + w && ny >= y && ny <= y + h) return "move";
    return "se";
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!file || disabled) return;
    e.preventDefault();
    const { nx, ny } = pointerToNorm(e.clientX, e.clientY);
    dragRef.current = {
      mode: hitHandle(nx, ny),
      ox: nx,
      oy: ny,
      start: { ...crop },
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.preventDefault();
    const { nx, ny } = pointerToNorm(e.clientX, e.clientY);
    const dx = nx - drag.ox;
    const dy = ny - drag.oy;

    if (drag.mode === "move") {
      onCrop(
        clampCrop({
          ...drag.start,
          x: drag.start.x + dx,
          y: drag.start.y + dy,
        }),
      );
      return;
    }

    const next = resizeByHandle(drag.start, drag.mode, dx, dy, ar);
    onCrop(ar ? constrainCrop(next, ar) : clampCrop(next));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  if (!file) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{t.cropTool.editorHint}</p>
      <canvas
        ref={canvasRef}
        className={cn(
          "mx-auto max-w-full touch-none rounded-xl border border-slate-700 bg-slate-900",
          disabled && "pointer-events-none opacity-60",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>{t.cropTool.zoom}</span>
        <input
          type="range"
          min={100}
          max={300}
          value={Math.round(zoom * 100)}
          disabled={disabled}
          onChange={(e) => onZoom(Number(e.target.value) / 100)}
          className="flex-1 accent-emerald-500"
        />
      </div>
    </div>
  );
}

function resizeByHandle(
  start: NormalizedCrop,
  handle: Handle,
  dx: number,
  dy: number,
  ar: number | null,
): NormalizedCrop {
  let { x, y, w, h } = start;
  if (handle === "se") {
    w = start.w + dx;
    h = start.h + dy;
  } else if (handle === "sw") {
    x = start.x + dx;
    w = start.w - dx;
    h = start.h + dy;
  } else if (handle === "ne") {
    y = start.y + dy;
    w = start.w + dx;
    h = start.h - dy;
  } else if (handle === "nw") {
    x = start.x + dx;
    y = start.y + dy;
    w = start.w - dx;
    h = start.h - dy;
  } else if (handle === "e") {
    w = start.w + dx;
  } else if (handle === "w") {
    x = start.x + dx;
    w = start.w - dx;
  } else if (handle === "s") {
    h = start.h + dy;
  } else if (handle === "n") {
    y = start.y + dy;
    h = start.h - dy;
  }

  w = Math.max(0.08, w);
  h = Math.max(0.08, h);

  if (ar) {
    if (handle === "e" || handle === "w" || handle === "ne" || handle === "nw" || handle === "se" || handle === "sw") {
      h = w / ar;
    } else {
      w = h * ar;
    }
  }

  return clampCrop({ x, y, w, h });
}

function drawHandles(
  ctx: CanvasRenderingContext2D,
  crop: NormalizedCrop,
  cw: number,
  ch: number,
) {
  const pts = [
    [crop.x, crop.y],
    [crop.x + crop.w, crop.y],
    [crop.x, crop.y + crop.h],
    [crop.x + crop.w, crop.y + crop.h],
  ];
  ctx.fillStyle = "#34d399";
  for (const [px, py] of pts) {
    const r = 5;
    ctx.fillRect(px * cw - r, py * ch - r, r * 2, r * 2);
  }
}