export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "x"
  | "youtube"
  | "linkedin"
  | "tiktok"
  | "pinterest"
  | "all";

export type SocialFormatKind =
  | "square"
  | "portrait"
  | "story"
  | "landscape"
  | "banner"
  | "avatar";

export type SocialSafeZone = "story" | "avatar-circle" | "none";

export type SocialPresetDef = {
  id: string;
  platform: Exclude<SocialPlatform, "all">;
  kind: SocialFormatKind;
  width: number;
  height: number;
  safeZone: SocialSafeZone;
  labelKey: string;
};

export const SOCIAL_PRESET_CATALOG: SocialPresetDef[] = [
  {
    id: "instagram-square",
    platform: "instagram",
    kind: "square",
    width: 1080,
    height: 1080,
    safeZone: "none",
    labelKey: "instagramSquare",
  },
  {
    id: "instagram-portrait",
    platform: "instagram",
    kind: "portrait",
    width: 1080,
    height: 1350,
    safeZone: "none",
    labelKey: "instagramPortrait",
  },
  {
    id: "instagram-story",
    platform: "instagram",
    kind: "story",
    width: 1080,
    height: 1920,
    safeZone: "story",
    labelKey: "instagramStory",
  },
  {
    id: "facebook-cover",
    platform: "facebook",
    kind: "banner",
    width: 820,
    height: 312,
    safeZone: "none",
    labelKey: "facebookCover",
  },
  {
    id: "facebook-post",
    platform: "facebook",
    kind: "landscape",
    width: 1200,
    height: 630,
    safeZone: "none",
    labelKey: "facebookPost",
  },
  {
    id: "x-post",
    platform: "x",
    kind: "landscape",
    width: 1200,
    height: 675,
    safeZone: "none",
    labelKey: "xPost",
  },
  {
    id: "x-header",
    platform: "x",
    kind: "banner",
    width: 1500,
    height: 500,
    safeZone: "none",
    labelKey: "xHeader",
  },
  {
    id: "youtube-thumb",
    platform: "youtube",
    kind: "landscape",
    width: 1280,
    height: 720,
    safeZone: "none",
    labelKey: "youtubeThumb",
  },
  {
    id: "youtube-banner",
    platform: "youtube",
    kind: "banner",
    width: 2560,
    height: 1440,
    safeZone: "none",
    labelKey: "youtubeBanner",
  },
  {
    id: "linkedin-banner",
    platform: "linkedin",
    kind: "banner",
    width: 1584,
    height: 396,
    safeZone: "none",
    labelKey: "linkedinBanner",
  },
  {
    id: "linkedin-post",
    platform: "linkedin",
    kind: "landscape",
    width: 1200,
    height: 627,
    safeZone: "none",
    labelKey: "linkedinPost",
  },
  {
    id: "tiktok-video",
    platform: "tiktok",
    kind: "story",
    width: 1080,
    height: 1920,
    safeZone: "story",
    labelKey: "tiktokVideo",
  },
  {
    id: "pinterest-pin",
    platform: "pinterest",
    kind: "portrait",
    width: 1000,
    height: 1500,
    safeZone: "none",
    labelKey: "pinterestPin",
  },
  {
    id: "avatar",
    platform: "instagram",
    kind: "avatar",
    width: 512,
    height: 512,
    safeZone: "avatar-circle",
    labelKey: "avatar",
  },
];

export function findSocialPreset(id: string): SocialPresetDef | undefined {
  return SOCIAL_PRESET_CATALOG.find((p) => p.id === id);
}