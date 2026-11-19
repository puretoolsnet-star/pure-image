"use client";

import { useI18n } from "@/i18n/context";

export function DownloadRewardHint() {
  const { t } = useI18n();
  return <p className="text-center text-xs text-slate-500">{t.rewardedAd.downloadHint}</p>;
}