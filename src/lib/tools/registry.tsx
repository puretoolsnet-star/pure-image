"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";

import { ImagesToPdfTool } from "@/components/tools/ImagesToPdfTool";
import { SmartCompressTool } from "@/components/tools/SmartCompressTool";
import { ToSizeCompressTool } from "@/components/tools/ToSizeCompressTool";
import { BatchCompressTool } from "@/components/tools/BatchCompressTool";
import { WebPConvertTool } from "@/components/tools/WebPConvertTool";
import { AvifConvertTool } from "@/components/tools/AvifConvertTool";
import { HeicToJpgTool } from "@/components/tools/HeicToJpgTool";
import { PngToJpgTool } from "@/components/tools/PngToJpgTool";
import { SvgConvertTool } from "@/components/tools/SvgConvertTool";
import { ResizeTool } from "@/components/tools/ResizeTool";
import { SocialPresetsTool } from "@/components/tools/SocialPresetsTool";
import { CropTool } from "@/components/tools/CropTool";
import { RotateTool } from "@/components/tools/RotateTool";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import { ToolPanel } from "@/components/tools/ToolPanel";
import { ToolShell } from "@/components/tools/ToolShell";
import { useLiveTool } from "@/components/tools/use-live-tool";
import { CompressSliderPanel } from "@/components/tools/CompressSliderPanel";
import { compressWithQuality } from "@/lib/image/compress-advanced";
import { convertToFormat } from "@/lib/image/convert-raster";
import {
  svgToRaster,
} from "@/lib/image/effects";
import { ScanEnhanceTool } from "@/components/tools/ScanEnhanceTool";
import { type OutputFormat } from "@/lib/image/types";
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
    </>
  );
}

export const TOOL_REGISTRY: Record<ToolRouteId, ComponentType> = {
  "compress/smart": makeTool("compress/smart", SmartCompressTool),
  "compress/to-size": makeTool("compress/to-size", ToSizeCompressTool),
  "compress/batch": makeTool("compress/batch", BatchCompressTool),
  "convert/to-webp": makeTool("convert/to-webp", WebPConvertTool),
  "convert/to-avif": makeTool("convert/to-avif", AvifConvertTool),
  "convert/heic-to-jpg": makeTool("convert/heic-to-jpg", HeicToJpgTool),
  "convert/png-jpg": makeTool("convert/png-jpg", PngToJpgTool),
  "convert/svg-to-img": makeTool("convert/svg-to-img", SvgConvertTool),
  "edit/resize": makeTool("edit/resize", ResizeTool),
  "edit/presets": makeTool("edit/presets", SocialPresetsTool),
  "edit/crop": makeTool("edit/crop", CropTool),
  "edit/rotate": makeTool("edit/rotate", RotateTool),
  "doc/enhance-scan": makeTool("doc/enhance-scan", ScanEnhanceTool),
  "doc/images-to-pdf": makeTool("doc/images-to-pdf", ImagesToPdfTool),
};