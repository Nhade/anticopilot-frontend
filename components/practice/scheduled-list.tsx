"use client";

import React from "react";
import { ShieldAlert, BookOpen, CalendarClock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { StrengthBar } from "@/components/ui/strength-bar";
import { MarkdownInline } from "@/components/learn/markdown-content";
import {
  reviewDisplayInfo,
  upcomingGroup,
  UPCOMING_GROUPS,
} from "@/lib/review-display";
import type { ReviewConcept } from "@/lib/types";

interface ScheduledListProps {
  items: ReviewConcept[];
  onReviewEarly: (concept: ReviewConcept) => void;
}

/**
 * Upcoming reviews grouped into a Tomorrow / This week / Later timeline —
 * full-strength rows with memory bars instead of the old opacity-60 dimming.
 */
export function ScheduledList({ items, onReviewEarly }: ScheduledListProps) {
  const now = new Date();
  return (
    <div className="space-y-5">
      {UPCOMING_GROUPS.map((group) => {
        const rows = items.filter(
          (c) => upcomingGroup(new Date(c.due), now) === group
        );
        if (rows.length === 0) return null;
        return (
          <div key={group}>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-meta/80 mb-2 pl-1">
              {group}
            </div>
            <div className="bg-surface-lowest border border-outline/45 rounded-2xl divide-y divide-outline/30 overflow-hidden shadow-soft">
              {rows.map((concept) => {
                const info = reviewDisplayInfo(concept);
                const isWeakness = concept.source_type === "struggle_signal";
                return (
                  <div
                    key={concept.concept_id}
                    className="group flex items-center gap-4 px-4 py-3.5 hover:bg-surface-low/60 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        isWeakness
                          ? "bg-review/10 text-review"
                          : "bg-active/10 text-active"
                      )}
                    >
                      {isWeakness ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-ink truncate font-display">
                          <MarkdownInline>{info.label}</MarkdownInline>
                        </span>
                        {info.language && (
                          <span className="text-[9px] font-mono font-bold text-meta border border-outline/45 rounded px-1 py-0.5 shrink-0">
                            {info.language.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {concept.retrievability != null && concept.reps > 0 && (
                        <div className="flex items-center gap-2 mt-1.5 max-w-[220px]">
                          <StrengthBar
                            value={concept.retrievability}
                            className="flex-1"
                          />
                          <span className="text-[10px] text-meta tabular-nums">
                            {Math.round(concept.retrievability * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[12px] font-medium text-meta inline-flex items-center gap-1">
                        <CalendarClock className="w-[13px] h-[13px]" />
                        {formatDistanceToNow(new Date(concept.due), {
                          addSuffix: true,
                        })}
                      </div>
                      <button
                        onClick={() => onReviewEarly(concept)}
                        className="block ml-auto mt-1 text-[11px] font-semibold text-active opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      >
                        Review early →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
