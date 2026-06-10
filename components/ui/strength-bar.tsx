"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StrengthBarProps {
  /** Memory strength / retrievability in 0..1 */
  value: number;
  className?: string;
}

/**
 * Memory-strength bar: a tertiary track that fills with a semantic tone —
 * orange (review) when decayed, teal while consolidating, green when solid.
 * Thresholds mirror the FSRS framing: below ~desired-retention territory is
 * "due-soon" orange; comfortably above it is "solid" green.
 */
export function StrengthBar({ value, className }: StrengthBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const pct = Math.round(clamped * 100);
  const fill =
    clamped < 0.45 ? "bg-review" : clamped < 0.7 ? "bg-active" : "bg-success";
  return (
    <div
      className={cn("h-1.5 rounded-full overflow-hidden bg-active/12", className)}
      title={`Memory strength ${pct}%`}
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Memory strength"
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
