"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChipTone } from "./chip";

const TONE_TEXT: Record<ChipTone, string> = {
  active: "text-active",
  review: "text-review",
  ai: "text-ai",
  success: "text-success",
  neutral: "text-meta",
};

interface SectionLabelProps {
  icon?: LucideIcon;
  tone?: ChipTone;
  right?: React.ReactNode;
  children: React.ReactNode;
}

/** Uppercase section heading with optional icon and right-side action. */
export function SectionLabel({ icon: Icon, tone = "neutral", right, children }: SectionLabelProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3
        className={cn(
          "text-[11px] font-bold uppercase tracking-[0.14em] flex items-center gap-2 font-display",
          TONE_TEXT[tone]
        )}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
      </h3>
      {right}
    </div>
  );
}
