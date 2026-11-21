"use client";

import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,.heic,.heif";

export function ImageDropzone({
  onFiles,
  compact = false,
  accept = ACCEPT,
  multiple = true,
}: {
  onFiles: (files: File[]) => void;
  compact?: boolean;
  accept?: string;
  multiple?: boolean;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      onFiles(Array.from(list));
      if (inputRef.current) inputRef.current.value = "";
    },
    [onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        "glass-card group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed text-center transition-all",
        compact ? "px-4 py-6" : "px-4 py-12 sm:px-6 sm:py-14",
        dragging
          ? "border-emerald-400/70 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
          : "border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/5",
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 ring-1 ring-white/10 transition-transform group-hover:scale-105",
          compact ? "h-10 w-10" : "h-14 w-14",
        )}
      >
        <Upload className={cn("text-emerald-400", compact ? "h-4 w-4" : "h-6 w-6")} aria-hidden />
      </div>
      <p className={cn("font-medium text-white", compact ? "text-sm" : "text-base sm:text-lg")}>
        {compact ? t.dropzone.addMore : t.dropzone.title}
      </p>
      {!compact ? (
        <p className="mt-2 max-w-md text-sm text-slate-400">{t.dropzone.hint}</p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}