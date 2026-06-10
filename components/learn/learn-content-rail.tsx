"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Code2,
  HelpCircle,
  Check,
  BrainCircuit,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEstimatedTime } from "@/lib/format";
import type { LearningContentItem, SkillPathItem } from "@/lib/types";
import { MarkdownInline } from "./markdown-content";

interface LearnContentRailProps {
  skillpath: SkillPathItem;
  contents: LearningContentItem[];
  activeContentId: string;
  /** Lesson ids the user has completed (client-side per-lesson tracking). */
  completedIds: Set<string>;
  onSelect: (contentId: string) => void;
  onBackToRoadmap: () => void;
}

// Content TYPE is structural → neutral chips/labels. STATE (active, completed)
// carries the semantic color.
const TYPE_META: Record<
  LearningContentItem["content_type"],
  { Icon: LucideIcon; label: string }
> = {
  article: { Icon: BookOpen, label: "Reading" },
  coding_problem: { Icon: Code2, label: "Coding" },
  multiple_choice: { Icon: HelpCircle, label: "Quiz" },
};

export function LearnContentRail({
  skillpath,
  contents,
  activeContentId,
  completedIds,
  onSelect,
  onBackToRoadmap,
}: LearnContentRailProps) {
  const [whyOpen, setWhyOpen] = useState(true);
  const doneCount = contents.filter((c) => completedIds.has(c.content_id)).length;
  const pct = contents.length > 0 ? Math.round((doneCount / contents.length) * 100) : 0;
  const eta = formatEstimatedTime(skillpath.estimated_hours);

  return (
    <aside className="hidden md:flex flex-col border-r border-outline/45 bg-surface-low/50 h-full overflow-hidden w-[280px] shrink-0">
      <div className="px-5 pt-5 pb-4 border-b border-outline/40">
        <button
          onClick={onBackToRoadmap}
          className="flex items-center gap-1.5 text-xs font-medium text-meta hover:text-ink transition-colors mb-3"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to roadmap
        </button>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-active mb-1.5 font-display">
          Skill path
        </div>
        <h2 className="text-[17px] font-bold text-ink leading-snug font-display">
          <MarkdownInline>{skillpath.title}</MarkdownInline>
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-active/12">
            <div
              className="h-full rounded-full bg-active transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-meta tabular-nums">
            {doneCount}/{contents.length}
          </span>
        </div>
        {eta && (
          <div className="text-[11px] text-meta mt-1.5">Est. {eta}</div>
        )}
      </div>

      {/* why this path — mirrors Roadmap's "Why now?" context rail */}
      {skillpath.description && (
        <div className="px-4 pt-4">
          <button
            onClick={() => setWhyOpen((v) => !v)}
            className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-meta mb-2 font-display"
          >
            <span className="flex items-center gap-1.5">
              <BrainCircuit className="w-[13px] h-[13px] text-active" /> Why this path
            </span>
            {whyOpen ? (
              <ChevronUp className="w-[13px] h-[13px]" />
            ) : (
              <ChevronDown className="w-[13px] h-[13px]" />
            )}
          </button>
          {whyOpen && (
            <div className="rounded-xl bg-active/6 border border-active/20 p-3 mb-3 anim-slide-down">
              <p className="text-[12px] text-ink/85 leading-relaxed">
                <MarkdownInline>{skillpath.description}</MarkdownInline>
              </p>
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-meta/70 px-2 mb-2 font-display">
          Lessons
        </div>
        {contents.length === 0 ? (
          <div className="px-2 py-3 text-xs text-meta">No learning content yet.</div>
        ) : (
          <div className="space-y-1">
            {contents.map((content, idx) => {
              const meta = TYPE_META[content.content_type];
              const isActive = content.content_id === activeContentId;
              const done = completedIds.has(content.content_id);
              return (
                <button
                  key={content.content_id}
                  onClick={() => onSelect(content.content_id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors",
                    isActive ? "bg-active/10" : "hover:bg-surface-low"
                  )}
                >
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border",
                      done
                        ? "bg-success/12 border-success/30 text-success"
                        : isActive
                        ? "bg-active text-white border-active"
                        : "bg-surface-lowest border-outline/45 text-meta"
                    )}
                  >
                    {done ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
                    ) : (
                      <meta.Icon className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-meta/70 font-display mb-0.5">
                      {idx + 1}. {meta.label}
                    </span>
                    <span
                      className={cn(
                        "block text-[13px] font-medium leading-snug break-words",
                        isActive ? "text-ink" : "text-meta"
                      )}
                    >
                      <MarkdownInline>{content.title}</MarkdownInline>
                    </span>
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-active mt-2.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
