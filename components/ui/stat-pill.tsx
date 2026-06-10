"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChipTone } from "./chip";

const TONE: Record<ChipTone, { box: string; text: string }> = {
  active: { box: "bg-active/12", text: "text-active" },
  review: { box: "bg-review/12", text: "text-review" },
  ai: { box: "bg-ai/12", text: "text-ai" },
  success: { box: "bg-success/12", text: "text-success" },
  neutral: { box: "bg-surface-low", text: "text-meta" },
};

interface StatPillProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: ChipTone;
}

/** Small stat card: icon box + uppercase label + bold value. */
export function StatPill({ icon: Icon, label, value, tone = "active" }: StatPillProps) {
  const t = TONE[tone];
  return (
    <div className="bg-surface-lowest border border-outline/45 rounded-xl px-3.5 py-3 flex items-center gap-3 shadow-soft">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", t.box, t.text)}>
        <Icon className="w-[17px] h-[17px]" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-meta font-bold uppercase tracking-[0.12em]">{label}</div>
        <div className="text-sm font-bold text-ink truncate font-display">{value}</div>
      </div>
    </div>
  );
}
