"use client";

import { ChevronDown, ChevronUp, RotateCw, Trash2 } from "lucide-react";

import type { PdfPageState } from "@/components/tools/use-images-to-pdf";
import { useI18n } from "@/i18n/context";
import { formatBytes } from "@/lib/image/estimate";
import { cn } from "@/lib/cn";

export function PdfPageList({
  pages,
  focusId,
  onFocus,
  onRemove,
  onMoveUp,
  onMoveDown,
  onRotate,
  onDragStart,
  onDropOn,
  disabled,
}: {
  pages: PdfPageState[];
  focusId: string | null;
  onFocus: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRotate: (id: string) => void;
  onDragStart: (index: number) => void;
  onDropOn: (index: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  if (!pages.length) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((page, index) => (
        <li
          key={page.id}
          draggable={!disabled}
          onDragStart={() => onDragStart(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDropOn(index)}
          className={cn(
            "glass-card overflow-hidden rounded-xl border",
            focusId === page.id ? "border-violet-500/50" : "border-slate-800",
          )}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => onFocus(page.id)}
            className="block w-full text-left"
          >
            <div className="relative aspect-[3/4] bg-slate-900/90">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.previewUrl}
                alt=""
                className="h-full w-full object-contain"
                style={{ transform: `rotate(${page.rotationDeg}deg)` }}
              />
              <span className="absolute left-2 top-2 rounded bg-slate-950/85 px-1.5 py-0.5 text-[10px] text-violet-200">
                {t.pdfAlbumTool.pageNumber(index + 1)}
              </span>
              {page.rotationDeg ? (
                <span className="absolute right-2 top-2 rounded bg-slate-950/85 px-1.5 py-0.5 text-[10px] text-emerald-300">
                  {page.rotationDeg}°
                </span>
              ) : null}
            </div>
          </button>
          <PageRowActions
            name={page.file.name}
            size={formatBytes(page.file.size)}
            disabled={disabled}
            onRotate={() => onRotate(page.id)}
            onUp={() => onMoveUp(page.id)}
            onDown={() => onMoveDown(page.id)}
            onRemove={() => onRemove(page.id)}
            t={t}
          />
        </li>
      ))}
    </ul>
  );
}

function PageRowActions({
  name,
  size,
  onRotate,
  onUp,
  onDown,
  onRemove,
  disabled,
  t,
}: {
  name: string;
  size: string;
  onRotate: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  disabled?: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="space-y-2 p-2">
      <p className="truncate text-[11px] text-slate-400" title={name}>
        {name}
      </p>
      <p className="text-[10px] text-slate-500">{size}</p>
      <div className="flex gap-1">
        <IconBtn disabled={disabled} onClick={onRotate} title={t.pdfAlbumTool.rotatePage} icon={<RotateCw className="h-3.5 w-3.5" />} />
        <IconBtn disabled={disabled} onClick={onUp} title={t.pdfAlbumTool.moveUp} icon={<ChevronUp className="h-3.5 w-3.5" />} />
        <IconBtn disabled={disabled} onClick={onDown} title={t.pdfAlbumTool.moveDown} icon={<ChevronDown className="h-3.5 w-3.5" />} />
        <IconBtn disabled={disabled} onClick={onRemove} title={t.common.remove} icon={<Trash2 className="h-3.5 w-3.5" />} />
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  icon,
  title,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className="rounded-lg border border-slate-700 px-2 py-1 text-slate-400 hover:border-violet-500/40 disabled:opacity-40"
    >
      {icon}
    </button>
  );
}