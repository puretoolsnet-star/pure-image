import type { EcosystemProjectId } from "@/lib/ecosystem";

import type { CategoryId } from "@/lib/tools/routes";
import type { ToolRouteId } from "@/lib/tools/routes";

export type CategoryNavId = CategoryId;

export type Dictionary = {
  brand: { name: string; tagline: string };
  nav: {
    selectLanguage: string;
    menuAria: string;
    menuClose: string;
    home: string;
    tools: string;
    compress: string;
    convert: string;
    edit: string;
    doc: string;
  };
  ecosystem: {
    menuLabel: string;
    menuShort: string;
    menuAria: string;
    menuHint: string;
    activeHere: string;
    current: string;
    comingSoon: string;
    close: string;
    items: Record<EcosystemProjectId, { name: string; tagline: string }>;
  };
  security: {
    badge: string;
    badgeShort: string;
    title: string;
    body: string;
    points: [string, string, string];
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    toolsHeading: string;
    openTool: string;
  };
  toolAd: { sponsored: string };
  rewardedAd: {
    title: string;
    message: string;
    watch: string;
    watching: string;
    download: string;
    progress: (seconds: number) => string;
    close: string;
    slotLabel: string;
  };
  dropzone: {
    title: string;
    hint: string;
    addMore: string;
  };
  labels: {
    original: string;
    output: string;
    savings: string;
  };
  common: {
    backHome: string;
    remove: string;
    processing: string;
    errorLoad: string;
    downloadZip: string;
    downloadOne: string;
  };
  toolUi: {
    quality: string;
    maxWidth: string;
    targetKb: string;
    originalSize: string;
    estimated: string;
    dropForEstimate: string;
    cropHint: string;
    applyCrop: string;
    documentMode: string;
    threshold: string;
    convertQuality: string;
  };
};

export type PageId = "home" | CategoryId | ToolRouteId;