"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, CheckCircle2, XCircle, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import type { MultipleChoiceLearningContent } from "@/lib/types";
import { MarkdownContent, MarkdownInline } from "./markdown-content";

interface QuizCardProps {
  quiz: MultipleChoiceLearningContent;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Reset state when the quiz changes
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [quiz.content_id]);

  const isCorrect = selected === quiz.correct_option_id;

  return (
    <div className="anim-fade-up">
      <header className="mb-6">
        <Chip tone="neutral" icon={HelpCircle} className="mb-4">
          Quiz
        </Chip>
        <h1 className="text-[34px] leading-[1.25] font-bold tracking-tight text-ink font-display mb-3">
          <MarkdownInline className="[&_code]:text-[0.8em]">{quiz.title}</MarkdownInline>
        </h1>
        {quiz.description && (
          <p className="text-[17px] text-meta leading-relaxed">
            <MarkdownInline>{quiz.description}</MarkdownInline>
          </p>
        )}
      </header>

      <div className="rounded-2xl border border-outline/50 bg-surface-lowest p-6 shadow-soft">
        {/* Questions can carry fenced code, so use the block renderer restyled
            to match the question typography. */}
        <MarkdownContent className="mb-5 prose-p:text-[16px] prose-p:font-semibold prose-p:text-ink prose-p:leading-relaxed prose-p:font-display prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0">
          {quiz.question}
        </MarkdownContent>
        <div className="space-y-2.5">
          {quiz.options.map((option) => {
            const showAsCorrect = revealed && option.option_id === quiz.correct_option_id;
            const showAsWrong = revealed && selected === option.option_id && !isCorrect;
            const isSelected = selected === option.option_id;
            return (
              <button
                key={option.option_id}
                type="button"
                onClick={() => !revealed && setSelected(option.option_id)}
                disabled={revealed}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border transition-all flex items-start gap-3 text-[14.5px]",
                  showAsCorrect
                    ? "border-success/55 bg-success/8 text-ink"
                    : showAsWrong
                    ? "border-red-500/55 bg-red-500/7 text-ink"
                    : isSelected
                    ? "border-active/55 bg-active/6 text-ink"
                    : "border-outline/45 hover:border-active/40 hover:bg-surface-low"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                    showAsCorrect
                      ? "bg-success/15 text-success"
                      : showAsWrong
                      ? "bg-red-500/15 text-red-500"
                      : isSelected
                      ? "bg-active/15 text-active"
                      : "bg-surface-low text-meta"
                  )}
                >
                  {option.option_id}
                </span>
                <span className="flex-1 pt-0.5">
                  <MarkdownInline>{option.text}</MarkdownInline>
                </span>
                {showAsCorrect && (
                  <CheckCircle2 className="w-[18px] h-[18px] text-success shrink-0 mt-0.5" />
                )}
                {showAsWrong && (
                  <XCircle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {!revealed ? (
          <Button
            onClick={() => setRevealed(true)}
            disabled={selected === null}
            className="w-full mt-5 bg-active hover:bg-active/90 text-white h-10 font-semibold font-display"
          >
            Check answer
          </Button>
        ) : (
          <div className="mt-5 anim-slide-down">
            <div
              className={cn(
                "rounded-xl border p-4 flex items-start gap-3",
                isCorrect
                  ? "bg-success/7 border-success/25"
                  : "bg-red-500/6 border-red-500/25"
              )}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-[18px] h-[18px] text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
              )}
              <div
                className={cn(
                  "font-bold font-display",
                  isCorrect ? "text-success" : "text-red-500"
                )}
              >
                {isCorrect ? "Correct!" : "Not quite."}
              </div>
            </div>
            {/* AI explanation = agent guidance → purple (DESIGN.md §4) */}
            <div className="mt-3 rounded-xl border border-ai/25 bg-ai/5 p-4 flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-ai/12 text-ai flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ai mb-1 font-display">
                  Explanation
                </div>
                <MarkdownContent className="prose-p:text-[14px] prose-p:text-ink/90 prose-p:leading-relaxed prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0">
                  {quiz.explanation}
                </MarkdownContent>
              </div>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setRevealed(false);
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-active hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
