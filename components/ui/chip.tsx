"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Unified chip family (DESIGN.md §5): one shape for Status / Type / Reason
 * labels, with semantic tone carrying the meaning. Content-type chips should
 * use `neutral`; state (active, review, AI, success) carries the color.
 */
export type ChipTone = "active" | "review" | "ai" | "success" | "neutral";

const CHIP_TONE: Record<ChipTone, string> = {
  active: "bg-active/10 text-active border-active/20",
  review: "bg-review/12 text-review border-review/25",
  ai: "bg-ai/10 text-ai border-ai/20",
  success: "bg-success/12 text-success border-success/25",
  neutral: "bg-surface-low text-meta border-outline/40",
};

interface ChipProps {
  tone?: ChipTone;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}

export function Chip({ tone = "neutral", icon: Icon, className, children }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] font-display whitespace-nowrap",
        CHIP_TONE[tone],
        className
      )}
    >
      {Icon && <Icon className="w-[11px] h-[11px]" strokeWidth={2.4} />}
      {children}
    </span>
  );
}
