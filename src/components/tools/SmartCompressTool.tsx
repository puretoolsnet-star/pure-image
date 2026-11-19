"use client";

import { useCallback, useState } from "react";

import { DownloadRewardHint } from "@/components/tools/DownloadRewardHint";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { LivePreviewGrid } from "@/components/tools/LivePreviewGrid";
import { SmartCompressControls } from "@/components/tools/SmartCompressControls";
import { useLiveTool } from "@/components/tools/use-live-tool";
import { useI18n } from "@/i18n/context";
import { compressWithQuality } from "@/lib/image/compress-advanced";

const SMART_ACCEPT = "image/jpeg,image/png,image/webp";

export function SmartCompressTool() {
  const { t } = useI18n();
  const [quality, setQuality] = useState(78);
  const [maxWidth, setMaxWidth] = useState(1920);
  const worker = useCallback(
    (f: File) => compressWithQuality(f, quality, maxWidth),
    [quality, maxWidth],
  );
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">{t.smartCompress.acceptHint}</p>
      <ImageDropzone onFiles={onFiles} accept={SMART_ACCEPT} />
      <SmartCompressControls
        quality={quality}
        maxWidth={maxWidth}
        onQuality={setQuality}
        onMaxWidth={setMaxWidth}
      />
      <LivePreviewGrid
        items={batch.items}
        busy={batch.busy}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        originalLabel={t.labels.original}
        outputLabel={t.smartCompress.actual}
        savingsLabel={t.smartCompress.reduction}
      />
      {batch.items.length ? <DownloadRewardHint /> : null}
      {batch.items.length > 1 ? (
        <button
          type="button"
          onClick={batch.downloadZip}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {batch.zipLabel}
        </button>
      ) : null}
      {batch.items.length ? (
        <ImageDropzone onFiles={onFiles} accept={SMART_ACCEPT} compact />
      ) : null}
      {batch.modal}
    </div>
  );
}