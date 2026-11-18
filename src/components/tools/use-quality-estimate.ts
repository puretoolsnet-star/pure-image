"use client";

import { useEffect, useState } from "react";

import { estimateJpegBytes, formatKb } from "@/lib/image/estimate";

export function useQualityEstimate(sample: File | null, quality: number, maxWidth: number) {
  const [estimate, setEstimate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sample) {
      setEstimate(null);
      return;
    }
    let cancelled = false;
    setBusy(true);
    void estimateJpegBytes(sample, quality, maxWidth)
      .then((bytes) => {
        if (!cancelled) setEstimate(formatKb(bytes));
      })
      .catch(() => {
        if (!cancelled) setEstimate(null);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sample, quality, maxWidth]);

  return { estimate, estimating: busy };
}