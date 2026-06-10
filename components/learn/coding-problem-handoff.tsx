"use client";

import React, { useState } from "react";
import { Code2, ArrowRight, Lightbulb, Gauge, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { CodingProblemLearningContent, SkillPathItem } from "@/lib/types";
import { MarkdownContent, MarkdownInline } from "./markdown-content";

interface CodingProblemHandoffProps {
  problem: CodingProblemLearningContent;
  skillpath: SkillPathItem;
}

// Difficulty uses semantic tokens: easy=success, medium=review (attention),
// hard=error red.
const DIFFICULTY_CLS: Record<CodingProblemLearningContent["difficulty"], string> = {
  easy: "bg-success/12 text-success border-success/25",
  medium: "bg-review/12 text-review border-review/25",
  hard: "bg-red-500/12 text-red-500 border-red-500/25",
};

export function CodingProblemHandoff({ problem, skillpath }: CodingProblemHandoffProps) {
  const { activeRoadmapId } = useStore();
  const [revealedHints, setRevealedHints] = useState(0);

  const handleOpenInVSCode = () => {
    const roadmapId = skillpath.roadmap_id || activeRoadmapId;
    const skillpathId = skillpath.skillpath_id;
    if (!roadmapId || !skillpathId) return;
    const uri = `vscode://anticopilot.anti-copilot/open-task?roadmapId=${encodeURIComponent(
      roadmapId
    )}&taskId=${encodeURIComponent(skillpathId)}`;
    window.location.href = uri;
  };

  const hints = problem.hints ?? [];

  return (
    <div className="anim-fade-up">
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Chip tone="neutral" icon={Code2}>
            Coding
          </Chip>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] font-display",
              DIFFICULTY_CLS[problem.difficulty]
            )}
          >
            <Gauge className="w-[11px] h-[11px]" /> {problem.difficulty}
          </span>
        </div>
        <h1 className="text-[34px] leading-[1.25] font-bold tracking-tight text-ink font-display">
          <MarkdownInline className="[&_code]:text-[0.8em]">{problem.title}</MarkdownInline>
        </h1>
        {problem.description && (
          <p className="text-[17px] text-meta leading-relaxed mt-3">
            <MarkdownInline>{problem.description}</MarkdownInline>
          </p>
        )}
      </header>

      <section className="mb-7">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-meta mb-2 font-display">
          What you&apos;ll build
        </div>
        <MarkdownContent>{problem.prompt}</MarkdownContent>
      </section>

      <section className="rounded-2xl border border-active/25 bg-active/5 p-6 grid-paper relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-active text-white flex items-center justify-center shrink-0 shadow-glow">
            <Code2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-bold text-ink font-display mb-1">
              Solve this in VS Code
            </h3>
            <p className="text-sm text-meta">
              Starter code, a test harness, and graded acceptance criteria are
              waiting in the AntiCopilot extension panel.
            </p>
          </div>
          <Button
            onClick={handleOpenInVSCode}
            size="lg"
            className="bg-active hover:bg-active/90 text-white font-semibold font-display shadow-glow shrink-0 active:scale-95 transition-all"
          >
            Open in VS Code
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {hints.length > 0 && (
        <section className="mt-5 rounded-2xl border border-ai/25 bg-ai/4 overflow-hidden">
          <button
            onClick={() =>
              setRevealedHints((n) => (n >= hints.length ? 0 : n + 1))
            }
            className="w-full flex items-center justify-between px-5 py-3.5"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-ai/12 text-ai flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </span>
              <span className="text-sm font-bold text-ink font-display">
                {hints.length} AI hint{hints.length === 1 ? "" : "s"} available
              </span>
            </span>
            <span className="text-[12px] font-semibold text-ai inline-flex items-center gap-1">
              {revealedHints >= hints.length ? (
                <>
                  Hide <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Reveal one at a time <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </span>
          </button>
          {revealedHints > 0 && (
            <ol className="px-5 pb-4 space-y-2 anim-slide-down">
              {hints.slice(0, revealedHints).map((hint, i) => (
                <li key={i} className="flex gap-3 text-[14px] text-ink/90">
                  <span className="w-5 h-5 rounded-md bg-ai/12 text-ai text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">
                    <MarkdownInline>{hint}</MarkdownInline>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
