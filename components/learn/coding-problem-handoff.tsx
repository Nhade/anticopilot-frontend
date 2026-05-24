"use client";

import React from "react";
import { Code2, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { CodingProblemLearningContent, SkillPathItem } from "@/lib/types";
import { MarkdownContent } from "./markdown-content";

interface CodingProblemHandoffProps {
  problem: CodingProblemLearningContent;
  skillpath: SkillPathItem;
}

function difficultyChip(difficulty: "easy" | "medium" | "hard"): string {
  switch (difficulty) {
    case "easy":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "hard":
      return "bg-red-500/10 text-red-500 border-red-500/20";
  }
}

export function CodingProblemHandoff({ problem, skillpath }: CodingProblemHandoffProps) {
  const { activeRoadmapId } = useStore();

  const handleOpenInVSCode = () => {
    const roadmapId = skillpath.roadmap_id || activeRoadmapId;
    const skillpathId = skillpath.skillpath_id;
    if (!roadmapId || !skillpathId) return;
    const uri = `vscode://anticopilot.anti-copilot/open-task?roadmapId=${encodeURIComponent(
      roadmapId
    )}&taskId=${encodeURIComponent(skillpathId)}`;
    window.location.href = uri;
  };

  return (
    <div>
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
            <Code2 className="w-3 h-3" />
            Coding Problem
          </div>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
              difficultyChip(problem.difficulty)
            )}
          >
            {problem.difficulty}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
          {problem.title}
        </h1>
        {problem.description && (
          <p className="text-base text-slate-500 dark:text-zinc-400 leading-relaxed mt-3">
            {problem.description}
          </p>
        )}
      </header>

      <section className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500/70 mb-2">
          What you'll build
        </div>
        <MarkdownContent>{problem.prompt}</MarkdownContent>
      </section>

      <section className="rounded-2xl bg-linear-to-br from-active/5 to-orange-500/5 dark:from-active/10 dark:to-orange-500/10 border border-active/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-active/15 flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6 text-active" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-1">
              Solve this in VS Code
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Starter code, hints, and expected output live in the AntiCopilot
              extension panel. Hit the button to open them.
            </p>
          </div>
          <Button
            onClick={handleOpenInVSCode}
            className="bg-active hover:bg-active/90 text-white rounded-xl shadow-lg shadow-active/20 h-11 px-5 font-bold transition-all active:scale-95 shrink-0"
          >
            Open in VS Code
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {problem.hints && problem.hints.length > 0 && (
        <section className="mt-6 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-purple-500" />
            <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {problem.hints.length} hint{problem.hints.length === 1 ? "" : "s"} available
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Hints reveal one at a time inside the VS Code panel — click "Open in
            VS Code" above to access them as you work.
          </p>
        </section>
      )}
    </div>
  );
}
