import { differenceInCalendarDays } from "date-fns";
import type { ReviewConcept } from "./types";

/** Display fields derived from a review concept's metadata. */
export interface ReviewDisplayInfo {
  label: string;
  sourceLabel: string;
  subtitle: string | null;
  language?: string;
  misconception?: string;
}

export function reviewDisplayInfo(concept: ReviewConcept): ReviewDisplayInfo {
  const metadata = concept.concept_metadata || {};
  if (concept.source_type === "skill_path") {
    return {
      label: metadata.title || "Skill Path Review",
      sourceLabel: "Skill path",
      subtitle: metadata.description || null,
    };
  }
  return {
    label: metadata.concept_name || metadata.concept || "Programming Concept",
    sourceLabel: "Weakness",
    subtitle: metadata.misconception || null,
    language:
      metadata.language && metadata.language !== "unknown"
        ? metadata.language
        : undefined,
    misconception: metadata.misconception,
  };
}

/** Reason-chip copy (DESIGN.md §3 — explicit rationale for every queue item). */
export function reviewReason(concept: ReviewConcept): string {
  return concept.source_type === "struggle_signal"
    ? "Based on a recent bug pattern"
    : "Based on review decay";
}

/**
 * Compact interval label from fractional days, e.g. 0.0007 → "<1m",
 * 0.25 → "6h", 5 → "5d", 45 → "2mo".
 */
export function formatIntervalDays(days: number): string {
  const minutes = days * 24 * 60;
  if (minutes < 1) return "<1m";
  if (minutes < 90) return `${Math.round(minutes)}m`;
  if (days < 1) return `${Math.round(days * 24)}h`;
  if (days < 30) return `${Math.max(1, Math.round(days))}d`;
  if (days < 360) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

export type UpcomingGroup = "Tomorrow" | "This week" | "Later";
export const UPCOMING_GROUPS: UpcomingGroup[] = ["Tomorrow", "This week", "Later"];

export function upcomingGroup(due: Date, now: Date = new Date()): UpcomingGroup {
  const diff = differenceInCalendarDays(due, now);
  if (diff <= 1) return "Tomorrow";
  if (diff <= 7) return "This week";
  return "Later";
}
