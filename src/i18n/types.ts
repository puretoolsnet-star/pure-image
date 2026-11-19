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
    supportLead: string;
    messageSingle: string;
    messageZip: string;
    messagePdf: string;
    watch: string;
    watching: string;
    download: string;
    progress: (seconds: number) => string;
    close: string;
    slotLabel: string;
    downloadHint: string;
    unlocking: string;
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
    downloadPdf: string;
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
    width: string;
    height: string;
    keepAspect: string;
    contrast: string;
    brightness: string;
    avifUnsupported: string;
    formatPng: string;
    formatJpeg: string;
    formatWebp: string;
    cropFree: string;
    crop11: string;
    crop169: string;
    crop45: string;
    rotate90: string;
    rotate180: string;
    mirrorH: string;
    mirrorV: string;
    pdfMinImages: string;
    pdfPageCount: (count: number, totalSize: string) => string;
    presetInstagram: string;
    presetFacebook: string;
    presetTwitter: string;
    presetYoutube: string;
    presetLinkedin: string;
    presetAvatar: string;
  };
  livePreview: {
    before: string;
    after: string;
    beforeAfter: string;
    compare: string;
    updating: string;
    liveHint: string;
    selectFile: string;
  };
  smartCompress: {
    acceptHint: string;
    qualityHint: string;
    presetHigh: string;
    presetBalanced: string;
    presetWeb: string;
    presetSmall: string;
    estimated: string;
    actual: string;
    reduction: string;
  };
};

export type PageId = "home" | CategoryId | ToolRouteId;