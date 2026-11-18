"use client";

import { Download, Play, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useI18n } from "@/i18n/context";
import {
  ADSTERRA_WATCH_MS,
  adsterraNative,
  loadAdsterraNative,
  triggerAdsterraReward,
} from "@/lib/ads/adsterra";
import { cn } from "@/lib/cn";

type Phase = "idle" | "watching" | "ready";

type MandatoryAdModalProps = {
  open: boolean;
  sessionKey: number;
  downloadLabel: string;
  onClose: () => void;
  onUnlocked: () => void | Promise<void>;
  watchMs?: number;
};

export function MandatoryAdModal({
  open,
  sessionKey,
  downloadLabel,
  onClose,
  onUnlocked,
  watchMs = ADSTERRA_WATCH_MS,
}: MandatoryAdModalProps) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    setPhase("idle");
    setProgress(0);
    loadAdsterraNative();
  }, [open, sessionKey]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (phase !== "watching") return;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(1, (now - started) / watchMs);
      setProgress(next);
      if (next >= 1) {
        setPhase("ready");
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [phase, sessionKey, watchMs]);

  if (!open) return null;

  const secondsLeft = Math.max(0, Math.ceil((1 - progress) * (watchMs / 1000)));

  const startWatch = () => {
    triggerAdsterraReward();
    setPhase("watching");
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-ad-title"
    >
      <div className="glass-card w-full max-w-md rounded-2xl border border-violet-500/25 p-5 shadow-2xl shadow-violet-950/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
              {t.rewardedAd.slotLabel}
            </p>
            <h2 id="reward-ad-title" className="mt-1 text-lg font-semibold text-white">
              {t.rewardedAd.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={phase === "watching"}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 disabled:opacity-40"
            aria-label={t.rewardedAd.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-400">{t.rewardedAd.message}</p>
        <div
          className="mt-4 min-h-[120px] rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-3"
          id={adsterraNative.containerId || undefined}
        >
          <p className="text-center text-xs text-slate-500">{t.rewardedAd.slotLabel}</p>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {phase === "ready" ? (
            <button
              type="button"
              onClick={() => void onUnlocked()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <Download className="h-4 w-4" />
              {downloadLabel || t.rewardedAd.download}
            </button>
          ) : (
            <button
              type="button"
              onClick={startWatch}
              disabled={phase === "watching"}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                phase === "watching"
                  ? "bg-violet-500/30 text-violet-200"
                  : "bg-violet-600 text-white hover:bg-violet-500",
              )}
            >
              <Play className="h-4 w-4" />
              {phase === "watching" ? t.rewardedAd.watching : t.rewardedAd.watch}
            </button>
          )}
          {phase === "watching" ? (
            <p className="text-center text-xs text-slate-500 sm:self-center">
              {t.rewardedAd.progress(secondsLeft)}
            </p>
          ) : null}
        </div>
        {phase === "watching" ? (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-violet-500 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}