"use client";

const modal = null;
const requestDownload = (fn: () => unknown, _meta?: unknown) => { void fn(); };

import { useCallback, useEffect, useState, type ComponentType } from "react";

import { PdfLivePreview } from "@/components/tools/PdfLivePreview";
import { SmartCompressTool } from "@/components/tools/SmartCompressTool";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { ToolPanel } from "@/components/tools/ToolPanel";
import { ToolShell } from "@/components/tools/ToolShell";
import { useLiveTool } from "@/components/tools/use-live-tool";
import { CompressSliderPanel } from "@/components/tools/CompressSliderPanel";
import { InteractiveCropEditor } from "@/components/tools/InteractiveCropEditor";
import { compressToTargetKb, compressWithQuality } from "@/lib/image/compress-advanced";
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

function ToSizeInner() {
  const [kb, setKb] = useState(200);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [sample, setSample] = useState<File | null>(null);
  const worker = useCallback(
    (f: File) => compressToTargetKb(f, kb, maxWidth),
    [kb, maxWidth],
  );
  const batch = useLiveTool(worker);
  const onFiles = useCallback(
    (files: File[]) => {
      if (files[0]) setSample(files[0]);
      batch.onFiles(files);
    },
    [batch],
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
  const [quality, setQuality] = useState(82);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [sample, setSample] = useState<File | null>(null);
  const worker = useCallback(
    (f: File) => compressWithQuality(f, quality, maxWidth),
    [quality, maxWidth],
  );
  const batch = useLiveTool(worker);
  const onFiles = useCallback(
    (files: File[]) => {
      if (files[0]) setSample(files[0]);
      batch.onFiles(files);
    },
    [batch],
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
  const [quality, setQuality] = useState(88);
  const q = quality / 100;
  const worker = useCallback((f: File) => convertToFormat(f, mime, q), [mime, q]);
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);
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
  const [quality, setQuality] = useState(88);
  const worker = useCallback((f: File) => pngToJpeg(f, quality / 100), [quality]);
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);
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
  const { t } = useI18n();
  const [quality, setQuality] = useState(80);
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    void supportsAvif().then(setOk);
  }, []);
  const worker = useCallback(
    (f: File) => convertToFormat(f, "image/avif", quality / 100),
    [quality],
  );
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);
  return (
    <>
      {ok === false ? (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          {t.toolUi.avifUnsupported}
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
  const { t } = useI18n();
  const [mime, setMime] = useState<OutputFormat>("image/png");
  const formatLabel = (m: OutputFormat) => {
    if (m === "image/png") return t.toolUi.formatPng;
    if (m === "image/jpeg") return t.toolUi.formatJpeg;
    return t.toolUi.formatWebp;
  };
  const worker = useCallback((f: File) => svgToRaster(f, mime), [mime]);
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);
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
                {formatLabel(m)}
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
  const { t } = useI18n();
  const [w, setW] = useState(1280);
  const [h, setH] = useState(720);
  const [keep, setKeep] = useState(true);
  const worker = useCallback(
    (f: File) =>
      resizeFile(f, { preset: "custom", width: w, height: h, keepAspect: keep }),
    [w, h, keep],
  );
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);
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
              {t.toolUi.width}
              <input
                type="number"
                value={w}
                onChange={(e) => setW(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-slate-200">
              {t.toolUi.height}
              <input
                type="number"
                value={h}
                onChange={(e) => setH(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>
            <label className="col-span-full flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              {t.toolUi.keepAspect}
            </label>
          </div>
        }
      />
      {batch.modal}
    </>
  );
}

function socialPresetLabel(
  t: ReturnType<typeof useI18n>["t"],
  key: keyof typeof RESIZE_PRESETS,
): string {
  const labels: Record<keyof typeof RESIZE_PRESETS, string> = {
    instagram: t.toolUi.presetInstagram,
    facebook: t.toolUi.presetFacebook,
    twitter: t.toolUi.presetTwitter,
    youtube: t.toolUi.presetYoutube,
    linkedin: t.toolUi.presetLinkedin,
    avatar: t.toolUi.presetAvatar,
  };
  return labels[key];
}

function PresetsInner() {
  const { t } = useI18n();
  const [preset, setPreset] = useState<ResizePresetId>("instagram");
  const dim = RESIZE_PRESETS[preset as keyof typeof RESIZE_PRESETS];
  const worker = useCallback(
    (f: File) =>
      resizeFile(f, {
        preset,
        width: dim.width,
        height: dim.height,
        keepAspect: true,
      }),
    [preset, dim.height, dim.width],
  );
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);
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
                {socialPresetLabel(t, key)}
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
  const { t } = useI18n();
  const [aspect, setAspect] = useState<"free" | "1:1" | "16:9" | "4:5">("1:1");
  const [crop, setCrop] = useState<NormalizedCrop>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const aspectLabel = (m: (typeof aspect)) => {
    if (m === "free") return t.toolUi.cropFree;
    if (m === "1:1") return t.toolUi.crop11;
    if (m === "16:9") return t.toolUi.crop169;
    return t.toolUi.crop45;
  };
  const worker = useCallback((f: File) => cropImageNormalized(f, crop), [crop]);
  const batch = useLiveTool(worker);
  const onFiles = useCallback(
    (files: File[]) => {
      if (files.length) setPreviewFile(files[files.length - 1]!);
      batch.onFiles(files);
    },
    [batch],
  );
  return (
    <div className="space-y-6">
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
            {aspectLabel(m)}
          </button>
        ))}
      </div>
      <InteractiveCropEditor
        file={previewFile}
        aspect={aspect}
        onApply={setCrop}
        onLiveCrop={setCrop}
        busy={batch.busy}
      />
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

type RotateAction = "r90" | "r180" | "flipH" | "flipV";

function RotateInner() {
  const { t } = useI18n();
  const [action, setAction] = useState<RotateAction>("r90");
  const worker = useCallback(
    async (f: File) => {
      if (action === "r90") return rotateImage(f, 90);
      if (action === "r180") return rotateImage(f, 180);
      if (action === "flipH") return mirrorImage(f, "horizontal");
      return mirrorImage(f, "vertical");
    },
    [action],
  );
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);
  const actions: { key: RotateAction; label: string }[] = [
    { key: "r90", label: t.toolUi.rotate90 },
    { key: "r180", label: t.toolUi.rotate180 },
    { key: "flipH", label: t.toolUi.mirrorH },
    { key: "flipV", label: t.toolUi.mirrorV },
  ];
  return (
    <div className="space-y-4">
      <RotateActionBar
        actions={actions}
        selected={action}
        onSelect={setAction}
        disabled={!batch.sourceCount}
      />
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

function RotateActionBar({
  actions,
  selected,
  onSelect,
  disabled,
}: {
  actions: { key: RotateAction; label: string }[];
  selected: RotateAction;
  onSelect: (a: RotateAction) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(key)}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm disabled:opacity-40",
            selected === key
              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
              : "border-slate-700 bg-slate-800/80 text-slate-200",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function EnhanceScanInner() {
  const { t } = useI18n();
  const [contrast, setContrast] = useState(130);
  const [brightness, setBrightness] = useState(108);
  const [documentMode, setDocumentMode] = useState(true);
  const [threshold, setThreshold] = useState(165);
  const worker = useCallback(
    (f: File) => enhanceScanImage(f, { contrast, brightness, documentMode, threshold }),
    [contrast, brightness, documentMode, threshold],
  );
  const batch = useLiveTool(worker);
  const onFiles = useCallback((files: File[]) => batch.onFiles(files), [batch]);
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
              {t.toolUi.contrast} ({contrast}%)
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
              {t.toolUi.brightness} ({brightness}%)
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
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const onFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming]);
  }, []);
  const buildPdf = useCallback(async () => {
    if (files.length < 2) return;
    setBusy(true);
    try {
      const pdf = await imagesToPdf(files);
      requestDownload(() => downloadPdf(pdf.blob, pdf.name), {
        downloadLabel: t.common.downloadPdf,
        kind: "pdf",
      });
    } finally {
      setBusy(false);
    }
  }, [files, requestDownload, t.common.downloadPdf]);
  return (
    <>
      <ImageDropzone onFiles={onFiles} />
      <PdfLivePreview files={files} />
      {busy ? <p className="text-sm text-violet-300">{t.livePreview.updating}</p> : null}
      <p className="text-xs text-slate-500">{t.toolUi.pdfMinImages}</p>
      {files.length >= 2 ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void buildPdf()}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t.common.downloadPdf}
        </button>
      ) : null}
      <p className="text-xs text-slate-500">{t.rewardedAd.downloadHint}</p>
      {modal}
    </>
  );
}

export const TOOL_REGISTRY: Record<ToolRouteId, ComponentType> = {
  "compress/smart": makeTool("compress/smart", SmartCompressTool),
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