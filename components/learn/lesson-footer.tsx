"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { LearningContentItem, SkillPathItem } from "@/lib/types";
import { MarkdownInline } from "./markdown-content";

interface LessonFooterProps {
  contents: LearningContentItem[];
  currentIdx: number;
  onSelect: (contentId: string) => void;
  /** Whether the current lesson is marked complete. */
  completed: boolean;
  skillpath: SkillPathItem;
  roadmapId: string;
}

export function LessonFooter({
  contents,
  currentIdx,
  onSelect,
  completed,
  skillpath,
  roadmapId,
}: LessonFooterProps) {
  const markLessonComplete = useStore((s) => s.markLessonComplete);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = currentIdx >= 0 ? contents[currentIdx] : null;
  const prev = currentIdx > 0 ? contents[currentIdx - 1] : null;
  const next =
    currentIdx >= 0 && currentIdx < contents.length - 1
      ? contents[currentIdx + 1]
      : null;

  // Hide entirely until content exists — completing a skillpath with no
  // generated content is nonsensical and the backend would happily store it.
  const buttonHidden = skillpath.status === "ready" || !current;

  const handleMarkComplete = async () => {
    if (completed || submitting || !current) return;
    setSubmitting(true);
    setError(null);
    try {
      // Marks this lesson; when it's the last one, the skillpath-complete API
      // fires inside the store action.
      await markLessonComplete(roadmapId, skillpath, current.content_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark complete");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-outline/45 bg-surface-lowest/85 backdrop-blur px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
      <Button
        variant="ghost"
        onClick={() => prev && onSelect(prev.content_id)}
        disabled={!prev}
        className="h-9 px-3 text-sm text-meta hover:text-ink"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline max-w-[140px] truncate">
          {prev ? <MarkdownInline>{prev.title}</MarkdownInline> : "Previous"}
        </span>
        <span className="sm:hidden">Prev</span>
      </Button>

      {!buttonHidden && (
        <div className="flex items-center gap-3">
          {error && (
            <span
              className="hidden sm:inline-flex items-center gap-1 text-xs text-red-500"
              title={error}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {error.length > 40 ? `${error.slice(0, 40)}…` : error}
            </span>
          )}
          <span className="hidden md:block text-[12px] text-meta font-medium tabular-nums">
            Lesson {currentIdx + 1} of {contents.length}
          </span>
          <Button
            variant="outline"
            onClick={handleMarkComplete}
            disabled={completed || submitting}
            className={cn(
              "h-9 px-4 text-sm font-semibold font-display transition-colors",
              completed
                ? "border-success/40 bg-success/10 text-success hover:bg-success/15 disabled:opacity-100"
                : "border-outline/60"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : completed ? (
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
        className="h-9 px-3 text-sm bg-active hover:bg-active/90 text-white font-display font-semibold"
      >
        <span className="hidden sm:inline max-w-[140px] truncate">
          {next ? <MarkdownInline>{next.title}</MarkdownInline> : "Next"}
        </span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </footer>
  );
}
