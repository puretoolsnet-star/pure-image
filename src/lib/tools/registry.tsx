"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";

import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { ToolPanel } from "@/components/tools/ToolPanel";
import { ToolShell } from "@/components/tools/ToolShell";
import { useImageBatch } from "@/components/tools/use-image-batch";
import { CompressSliderPanel } from "@/components/tools/CompressSliderPanel";
import { InteractiveCropEditor } from "@/components/tools/InteractiveCropEditor";
import {
  smartCompressFile,
  compressToTargetKb,
  compressWithQuality,
} from "@/lib/image/compress-advanced";
import { convertToFormat, pngToJpeg } from "@/lib/image/convert-raster";
import { resizeFile } from "@/lib/image/process";
import {
  cropImageNormalized,
  mirrorImage,
  rotateImage,
  svgToRaster,
  supportsAvif,
  type NormalizedCrop,
} from "@/lib/image/effects";
import { enhanceScanImage } from "@/lib/image/scan-enhance";
import { imagesToPdf, downloadPdf } from "@/lib/image/pdf";
import { RESIZE_PRESETS, type OutputFormat, type ResizePresetId } from "@/lib/image/types";
import { TOOL_ICONS } from "@/lib/tools/icons";
import type { ToolRouteId } from "@/lib/tools/routes";
import { useMandatoryAd } from "@/lib/use-mandatory-ad";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

function routeCategory(routeId: ToolRouteId) {
  return routeId.split("/")[0] as "compress" | "convert" | "edit" | "doc";
}

function makeTool(routeId: ToolRouteId, inner: ComponentType) {
  const Wrapped = inner;
  return function Tool() {
    const Icon = TOOL_ICONS[routeId];
    return (
      <ToolShell routeId={routeId} categoryId={routeCategory(routeId)} icon={Icon}>
        <Wrapped />
      </ToolShell>
    );
  };
}

function SmartCompressInner() {
  const batch = useImageBatch();
  const [quality, setQuality] = useState(82);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [sample, setSample] = useState<File | null>(null);
  const onFiles = useCallback(
    (files: File[]) => {
      if (files[0]) setSample(files[0]);
      void batch.run(files, (f) => smartCompressFile(f, quality, maxWidth));
    },
    [batch, quality, maxWidth],
  );
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        controls={
          <CompressSliderPanel
            sample={sample}
            quality={quality}
            maxWidth={maxWidth}
            onQuality={setQuality}
            onMaxWidth={setMaxWidth}
          />
        }
      />
      {batch.modal}
    </>
  );
}

function ToSizeInner() {
  const batch = useImageBatch();
  const [kb, setKb] = useState(200);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [sample, setSample] = useState<File | null>(null);
  const onFiles = useCallback(
    (files: File[]) => {
      if (files[0]) setSample(files[0]);
      void batch.run(files, (f) => compressToTargetKb(f, kb, maxWidth));
    },
    [batch, kb, maxWidth],
  );
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        controls={
          <CompressSliderPanel
            sample={sample}
            quality={85}
            maxWidth={maxWidth}
            onQuality={() => {}}
            onMaxWidth={setMaxWidth}
            targetKb={kb}
            onTargetKb={setKb}
            showTarget
            showQuality={false}
          />
        }
      />
      {batch.modal}
    </>
  );
}

function BatchCompressInner() {
  const batch = useImageBatch();
  const [quality, setQuality] = useState(82);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [sample, setSample] = useState<File | null>(null);
  const onFiles = useCallback(
    (files: File[]) => {
      if (files[0]) setSample(files[0]);
      void batch.run(files, (f) => compressWithQuality(f, quality, maxWidth));
    },
    [batch, quality, maxWidth],
  );
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        controls={
          <CompressSliderPanel
            sample={sample}
            quality={quality}
            maxWidth={maxWidth}
            onQuality={setQuality}
            onMaxWidth={setMaxWidth}
          />
        }
      />
      {batch.modal}
    </>
  );
}

function ConvertQualitySlider({
  quality,
  onQuality,
}: {
  quality: number;
  onQuality: (q: number) => void;
}) {
  const { t } = useI18n();
  return (
    <label className="glass-card block rounded-2xl p-4 text-sm text-slate-200">
      {t.toolUi.convertQuality}: {quality}%
      <input
        type="range"
        min={50}
        max={95}
        value={quality}
        onChange={(e) => onQuality(Number(e.target.value))}
        className="mt-2 w-full accent-violet-500"
      />
    </label>
  );
}

function ConvertInner({ mime }: { mime: OutputFormat }) {
  const batch = useImageBatch();
  const [quality, setQuality] = useState(88);
  const q = quality / 100;
  const onFiles = useCallback(
    (files: File[]) => void batch.run(files, (f) => convertToFormat(f, mime, q)),
    [batch, mime, q],
  );
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        controls={<ConvertQualitySlider quality={quality} onQuality={setQuality} />}
      />
      {batch.modal}
    </>
  );
}

function PngJpgInner() {
  const batch = useImageBatch();
  const [quality, setQuality] = useState(88);
  const onFiles = useCallback(
    (files: File[]) => void batch.run(files, (f) => pngToJpeg(f, quality / 100)),
    [batch, quality],
  );
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        controls={<ConvertQualitySlider quality={quality} onQuality={setQuality} />}
      />
      {batch.modal}
    </>
  );
}

function AvifInner() {
  const batch = useImageBatch();
  const [quality, setQuality] = useState(80);
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    void supportsAvif().then(setOk);
  }, []);
  const onFiles = useCallback(
    (files: File[]) =>
      void batch.run(files, (f) => convertToFormat(f, "image/avif", quality / 100)),
    [batch, quality],
  );
  return (
    <>
      {ok === false ? (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          AVIF encoding is not supported in this browser. Try WebP instead.
        </p>
      ) : null}
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        controls={ok ? <ConvertQualitySlider quality={quality} onQuality={setQuality} /> : null}
      />
      {batch.modal}
    </>
  );
}

function SvgInner() {
  const batch = useImageBatch();
  const [mime, setMime] = useState<OutputFormat>("image/png");
  const onFiles = useCallback(
    (files: File[]) => void batch.run(files, (f) => svgToRaster(f, mime)),
    [batch, mime],
  );
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        controls={
          <div className="flex flex-wrap gap-2">
            {(["image/png", "image/jpeg", "image/webp"] as OutputFormat[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMime(m)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  mime === m ? "bg-emerald-500 text-slate-950" : "border border-slate-700 text-slate-300",
                )}
              >
                {m.replace("image/", "").toUpperCase()}
              </button>
            ))}
          </div>
        }
      />
      {batch.modal}
    </>
  );
}

function ResizeInner() {
  const batch = useImageBatch();
  const [w, setW] = useState(1280);
  const [h, setH] = useState(720);
  const [keep, setKeep] = useState(true);
  const onFiles = useCallback(
    (files: File[]) =>
      void batch.run(files, (f) =>
        resizeFile(f, { preset: "custom", width: w, height: h, keepAspect: keep }),
      ),
    [batch, w, h, keep],
  );
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        showSavings={false}
        controls={
          <div className="glass-card grid gap-3 rounded-2xl p-4 sm:grid-cols-2">
            <label className="text-sm text-slate-200">
              Width
              <input
                type="number"
                value={w}
                onChange={(e) => setW(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-slate-200">
              Height
              <input
                type="number"
                value={h}
                onChange={(e) => setH(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>
            <label className="col-span-full flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              Keep aspect ratio
            </label>
          </div>
        }
      />
      {batch.modal}
    </>
  );
}

function PresetsInner() {
  const batch = useImageBatch();
  const [preset, setPreset] = useState<ResizePresetId>("instagram");
  const dim = RESIZE_PRESETS[preset as keyof typeof RESIZE_PRESETS];
  const onFiles = useCallback(
    (files: File[]) =>
      void batch.run(files, (f) =>
        resizeFile(f, {
          preset,
          width: dim.width,
          height: dim.height,
          keepAspect: true,
        }),
      ),
    [batch, preset, dim.height, dim.width],
  );
  const keys = Object.keys(RESIZE_PRESETS) as (keyof typeof RESIZE_PRESETS)[];
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        showSavings={false}
        controls={
          <div className="flex flex-wrap gap-2">
            {keys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreset(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs capitalize",
                  preset === key ? "bg-violet-600 text-white" : "border border-slate-700 text-slate-300",
                )}
              >
                {key}
              </button>
            ))}
          </div>
        }
      />
      {batch.modal}
    </>
  );
}

function CropInner() {
  const batch = useImageBatch();
  const [aspect, setAspect] = useState<"free" | "1:1" | "16:9" | "4:5">("1:1");
  const [queue, setQueue] = useState<File[]>([]);
  const preview = queue[0] ?? null;
  const onFiles = (files: File[]) => setQueue((prev) => [...prev, ...files]);
  const apply = (crop: NormalizedCrop) => {
    if (!queue.length) return;
    void batch.run(queue, (f) => cropImageNormalized(f, crop));
  };
  return (
    <div className="space-y-6">
      <ImageDropzone onFiles={onFiles} />
      <div className="flex flex-wrap gap-2">
        {(["free", "1:1", "16:9", "4:5"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setAspect(m)}
            className={cn(
              "rounded-full px-3 py-1 text-sm",
              aspect === m ? "bg-emerald-500 text-slate-950" : "border border-slate-700 text-slate-300",
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <InteractiveCropEditor file={preview} aspect={aspect} onApply={apply} busy={batch.busy} />
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        showSavings={false}
      />
      {batch.modal}
    </div>
  );
}

function RotateInner() {
  const batch = useImageBatch();
  const [queue, setQueue] = useState<File[]>([]);
  const onFiles = (files: File[]) => setQueue(files);
  const apply = async (action: "r90" | "r180" | "flipH" | "flipV") => {
    if (!queue.length) return;
    await batch.run(queue, async (f) => {
      if (action === "r90") return rotateImage(f, 90);
      if (action === "r180") return rotateImage(f, 180);
      if (action === "flipH") return mirrorImage(f, "horizontal");
      return mirrorImage(f, "vertical");
    });
  };
  return (
    <div className="space-y-4">
      <ImageDropzone onFiles={onFiles} />
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["r90", "90°"],
            ["r180", "180°"],
            ["flipH", "Mirror H"],
            ["flipV", "Mirror V"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            disabled={!queue.length || batch.busy}
            onClick={() => void apply(key)}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"
          >
            {label}
          </button>
        ))}
      </div>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        showSavings={false}
      />
      {batch.modal}
    </div>
  );
}

function EnhanceScanInner() {
  const { t } = useI18n();
  const batch = useImageBatch();
  const [contrast, setContrast] = useState(130);
  const [brightness, setBrightness] = useState(108);
  const [documentMode, setDocumentMode] = useState(true);
  const [threshold, setThreshold] = useState(165);
  const onFiles = useCallback(
    (files: File[]) =>
      void batch.run(files, (f) =>
        enhanceScanImage(f, { contrast, brightness, documentMode, threshold }),
      ),
    [batch, contrast, brightness, documentMode, threshold],
  );
  return (
    <>
      <ToolPanel
        busy={batch.busy}
        items={batch.items}
        onFiles={onFiles}
        onDownload={batch.downloadOne}
        onRemove={batch.remove}
        onZip={() => batch.downloadZip()}
        zipLabel={batch.zipLabel}
        controls={
          <div className="glass-card space-y-3 rounded-2xl p-4 text-sm text-slate-200">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={documentMode}
                onChange={(e) => setDocumentMode(e.target.checked)}
                className="accent-emerald-500"
              />
              {t.toolUi.documentMode}
            </label>
            <label>
              Contrast ({contrast}%)
              <input
                type="range"
                min={80}
                max={200}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </label>
            <label>
              Brightness ({brightness}%)
              <input
                type="range"
                min={80}
                max={140}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </label>
            {documentMode ? (
              <label>
                {t.toolUi.threshold} ({threshold})
                <input
                  type="range"
                  min={100}
                  max={220}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </label>
            ) : null}
          </div>
        }
      />
      {batch.modal}
    </>
  );
}

function ImagesToPdfInner() {
  const { requestDownload, modal } = useMandatoryAd();
  const [busy, setBusy] = useState(false);
  const onFiles = async (files: File[]) => {
    if (files.length < 2) return;
    setBusy(true);
    try {
      const pdf = await imagesToPdf(files);
      requestDownload(() => downloadPdf(pdf.blob, pdf.name), "Download PDF");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <ImageDropzone onFiles={(f) => void onFiles(f)} />
      {busy ? <p className="text-sm text-violet-300">Building PDF…</p> : null}
      <p className="text-xs text-slate-500">Select at least 2 images. Rewarded video unlocks download.</p>
      {modal}
    </>
  );
}

export const TOOL_REGISTRY: Record<ToolRouteId, ComponentType> = {
  "compress/smart": makeTool("compress/smart", SmartCompressInner),
  "compress/to-size": makeTool("compress/to-size", ToSizeInner),
  "compress/batch": makeTool("compress/batch", BatchCompressInner),
  "convert/to-webp": makeTool("convert/to-webp", () => <ConvertInner mime="image/webp" />),
  "convert/to-avif": makeTool("convert/to-avif", AvifInner),
  "convert/heic-to-jpg": makeTool("convert/heic-to-jpg", () => <ConvertInner mime="image/jpeg" />),
  "convert/png-jpg": makeTool("convert/png-jpg", PngJpgInner),
  "convert/svg-to-img": makeTool("convert/svg-to-img", SvgInner),
  "edit/resize": makeTool("edit/resize", ResizeInner),
  "edit/presets": makeTool("edit/presets", PresetsInner),
  "edit/crop": makeTool("edit/crop", CropInner),
  "edit/rotate": makeTool("edit/rotate", RotateInner),
  "doc/enhance-scan": makeTool("doc/enhance-scan", EnhanceScanInner),
  "doc/images-to-pdf": makeTool("doc/images-to-pdf", ImagesToPdfInner),
};