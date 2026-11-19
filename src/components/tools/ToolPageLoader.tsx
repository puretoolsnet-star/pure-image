"use client";

import { notFound } from "next/navigation";

import { TOOL_REGISTRY } from "@/lib/tools/registry";
import type { ToolRouteId } from "@/lib/tools/routes";

export function ToolPageLoader({ routeId }: { routeId: ToolRouteId }) {
  const Tool = TOOL_REGISTRY[routeId];
  if (!Tool) notFound();
  return <Tool />;
}