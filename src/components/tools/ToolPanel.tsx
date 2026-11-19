"use client";

import type { ReactNode } from "react";

import { DownloadRewardHint } from "@/components/tools/DownloadRewardHint";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { LivePreviewGrid } from "@/components/tools/LivePreviewGrid";
import { useI18n } from "@/i18n/context";
import type { LivePreviewImage } from "@/lib/image/types";

export function ToolPanel({
  busy,
  items,
  onFiles,
  onDownload,
  onRemove,
  onZip,
  zipLabel,
  controls,
  showSavings = true,
}: {
  busy: boolean;
  items: LivePreviewImage[];
  onFiles: (files: File[]) => void;
  onDownload: (item: LivePreviewImage) => void;
  onRemove: (id: string) => void;
  onZip?: () => void;
  zipLabel: string;
  controls?: ReactNode;
  showSavings?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <ImageDropzone onFiles={onFiles} />
      {controls}
      <LivePreviewGrid
        items={items}
        busy={busy}
        onDownload={onDownload}
        onRemove={onRemove}
        originalLabel={t.labels.original}
        outputLabel={t.labels.output}
        savingsLabel={t.labels.savings}
        showSavings={showSavings}
      />
      {items.length ? <DownloadRewardHint /> : null}
      {items.length > 1 && onZip ? (
        <button
          type="button"
          onClick={onZip}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {zipLabel}
        </button>
      ) : null}
      {items.length ? <ImageDropzone onFiles={onFiles} compact /> : null}
    </div>
  );
}