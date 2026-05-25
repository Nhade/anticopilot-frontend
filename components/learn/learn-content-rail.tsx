"use client";

import React from "react";
import { ChevronLeft, BookOpen, Code2, HelpCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEstimatedTime } from "@/lib/format";
import type { LearningContentItem, SkillPathItem } from "@/lib/types";

interface LearnContentRailProps {
  skillpath: SkillPathItem;
  contents: LearningContentItem[];
  activeContentId: string;
  onSelect: (contentId: string) => void;
  onBackToRoadmap: () => void;
}

const TYPE_META: Record<LearningContentItem["content_type"], { Icon: LucideIcon; label: string; color: string }> = {
  article: { Icon: BookOpen, label: "Reading", color: "text-active" },
  coding_problem: { Icon: Code2, label: "Coding", color: "text-orange-500" },
  multiple_choice: { Icon: HelpCircle, label: "Quiz", color: "text-purple-500" },
};

export function LearnContentRail({
  skillpath,
  contents,
  activeContentId,
  onSelect,
  onBackToRoadmap,
}: LearnContentRailProps) {
  return (
    <aside className="hidden lg:flex flex-col border-r border-slate-200 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md h-full overflow-hidden">
      <div className="px-5 py-5 border-b border-slate-200/60 dark:border-zinc-800/60">
        <button
          onClick={onBackToRoadmap}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors mb-3"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to roadmap
        </button>
        <div className="text-[10px] font-bold uppercase tracking-wider text-active mb-1.5">
          Skill path
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug">
          {skillpath.title}
        </h2>
        {skillpath.estimated_hours > 0 && (
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1.5">
            Est. {formatEstimatedTime(skillpath.estimated_hours)}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-600 px-2 mb-2">
          Lessons
        </div>
        {contents.length === 0 ? (
          <div className="px-2 py-3 text-xs text-slate-500 dark:text-zinc-500">
            No learning content yet.
          </div>
        ) : (
          contents.map((content, idx) => {
            const meta = TYPE_META[content.content_type];
            const isActive = content.content_id === activeContentId;
            return (
              <button
                key={content.content_id}
                onClick={() => onSelect(content.content_id)}
                className={cn(
                  "w-full flex items-start gap-3 px-2.5 py-2.5 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-active/10 dark:bg-active/15"
                    : "hover:bg-slate-100/70 dark:hover:bg-zinc-800/40"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    isActive
                      ? "bg-white dark:bg-zinc-900 shadow-sm"
                      : "bg-slate-100 dark:bg-zinc-900/60"
                  )}
                >
                  <meta.Icon className={cn("w-3.5 h-3.5", meta.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-600">
                      {idx + 1}. {meta.label}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "text-[13px] font-medium leading-snug break-words",
                      isActive
                        ? "text-slate-900 dark:text-zinc-100"
                        : "text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    {content.title}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-active mt-3 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}

