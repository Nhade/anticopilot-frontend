"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { LearningContentItem, SkillPathItem } from "@/lib/types";

interface LessonFooterProps {
  contents: LearningContentItem[];
  currentIdx: number;
  onSelect: (contentId: string) => void;
  /**
   * The skillpath this lesson belongs to. Used to mark the skillpath as
   * completed when the user clicks the button (a v1 simplification — completion
   * is per-skillpath, not per-content). When per-content completion becomes
   * a real requirement, the button should target the content instead.
   */
  skillpath: SkillPathItem;
  roadmapId: string;
}

export function LessonFooter({
  contents,
  currentIdx,
  onSelect,
  skillpath,
  roadmapId,
}: LessonFooterProps) {
  const updateSkillpathStatus = useStore((s) => s.updateSkillpathStatus);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prev = currentIdx > 0 ? contents[currentIdx - 1] : null;
  const next =
    currentIdx >= 0 && currentIdx < contents.length - 1
      ? contents[currentIdx + 1]
      : null;

  const isCompleted = skillpath.status === "completed";
  // Hide entirely until content exists — completing a skillpath with no
  // generated content is nonsensical and the backend would happily store it.
  const buttonHidden = skillpath.status === "ready";

  const handleMarkComplete = async () => {
    if (isCompleted || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateSkillpathStatus(roadmapId, skillpath.skillpath_id, "completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark complete");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
      <Button
        variant="ghost"
        onClick={() => prev && onSelect(prev.content_id)}
        disabled={!prev}
        className="h-9 px-3 text-sm"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">{prev?.title ?? "Previous"}</span>
        <span className="sm:hidden">Prev</span>
      </Button>

      {!buttonHidden && (
        <div className="flex items-center gap-2">
          {error && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-red-500" title={error}>
              <AlertCircle className="w-3.5 h-3.5" />
              {error.length > 40 ? `${error.slice(0, 40)}…` : error}
            </span>
          )}
          <Button
            variant="outline"
            onClick={handleMarkComplete}
            disabled={isCompleted || submitting}
            className={cn(
              "h-9 px-4 text-sm font-semibold transition-colors",
              isCompleted
                ? "border-success/40 bg-success/10 text-success hover:bg-success/15"
                : "border-slate-300 dark:border-zinc-700"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Completed
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Mark complete
              </>
            )}
          </Button>
        </div>
      )}

      <Button
        onClick={() => next && onSelect(next.content_id)}
        disabled={!next}
        className="h-9 px-3 text-sm bg-active hover:bg-active/90 text-white"
      >
        <span className="hidden sm:inline">{next?.title ?? "Next"}</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </footer>
  );
}
