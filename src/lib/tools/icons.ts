import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Brain,
  Crop,
  FileImage,
  FileStack,
  FlipHorizontal,
  Gauge,
  ImageDown,
  Layers,
  Maximize2,
  RefreshCw,
  ScanLine,
  Scaling,
  Sparkles,
  Wand2,
} from "lucide-react";

import type { CategoryId } from "@/lib/tools/routes";
import type { ToolRouteId } from "@/lib/tools/routes";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  compress: ImageDown,
  convert: RefreshCw,
  edit: Scaling,
  doc: FileStack,
};

export const TOOL_ICONS: Record<ToolRouteId, LucideIcon> = {
  "compress/smart": Brain,
  "compress/to-size": Gauge,
  "compress/batch": Layers,
  "convert/to-webp": Sparkles,
  "convert/to-avif": Wand2,
  "convert/heic-to-jpg": FileImage,
  "convert/png-jpg": ImageDown,
  "convert/svg-to-img": Maximize2,
  "edit/resize": Scaling,
  "edit/presets": Archive,
  "edit/crop": Crop,
  "edit/rotate": FlipHorizontal,
  "doc/enhance-scan": ScanLine,
  "doc/images-to-pdf": FileStack,
};