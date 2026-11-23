"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export type WorkflowStepState = "upcoming" | "current" | "done";

export function ToolWorkflowSteps({
  steps,
}: {
  steps: { label: string; state: WorkflowStepState }[];
}) {
  return (
    <ol className="flex min-w-0 max-w-full flex-wrap items-center gap-2" aria-label="Progress">
      {steps.map((step, index) => (
        <li key={step.label} className="flex min-w-0 max-w-full items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
              step.state === "done" &&
                "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
              step.state === "current" &&
                "border-violet-500/55 bg-violet-500/15 text-violet-200 ring-2 ring-violet-500/25",
              step.state === "upcoming" && "border-slate-700 bg-slate-900/80 text-slate-500",
            )}
          >
            {step.state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
          </span>
          <span
            className={cn(
              "truncate text-xs font-medium",
              step.state === "current" ? "text-white" : "text-slate-400",
              step.state === "done" && "text-emerald-300/90",
            )}
          >
            {step.label}
          </span>
          {index < steps.length - 1 ? (
            <span className="hidden h-px w-4 shrink-0 bg-slate-700 sm:block" aria-hidden />
          ) : null}
        </li>
      ))}
    </ol>
  );
}