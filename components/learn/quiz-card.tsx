"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MultipleChoiceLearningContent } from "@/lib/types";

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
    <div>
      <header className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20 mb-4">
          <HelpCircle className="w-3 h-3" />
          Quiz
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-3 leading-tight">
          {quiz.title}
        </h1>
        {quiz.description && (
          <p className="text-base text-slate-500 dark:text-zinc-400 leading-relaxed">
            {quiz.description}
          </p>
        )}
      </header>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6">
        <p className="text-[15px] font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed mb-5">
          {quiz.question}
        </p>
        <div className="space-y-2.5">
          {quiz.options.map((option) => {
            const showAsCorrect = revealed && option.option_id === quiz.correct_option_id;
            const showAsWrong = revealed && selected === option.option_id && !isCorrect;
            return (
              <button
                key={option.option_id}
                type="button"
                onClick={() => !revealed && setSelected(option.option_id)}
                disabled={revealed}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border transition-all flex items-start gap-3 text-[14px]",
                  showAsCorrect
                    ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                    : showAsWrong
                    ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
                    : selected === option.option_id
                    ? "border-active/50 bg-active/5 text-active"
                    : "border-slate-200 dark:border-zinc-700 hover:border-active/40 hover:bg-slate-50 dark:hover:bg-zinc-900"
                )}
              >
                <span className="font-mono text-xs font-bold mt-1 w-5 shrink-0">{option.option_id}.</span>
                <span className="flex-1">{option.text}</span>
                {showAsCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
                {showAsWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>

        {!revealed && (
          <Button
            onClick={() => setRevealed(true)}
            disabled={selected === null}
            className="w-full mt-5 bg-active hover:bg-active/90 text-white h-10 font-semibold"
          >
            Check Answer
          </Button>
        )}

        {revealed && (
          <div
            className={cn(
              "mt-5 p-4 rounded-xl border text-sm",
              isCorrect
                ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300"
                : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
            )}
          >
            <div className="font-bold mb-1.5">
              {isCorrect ? "Correct!" : "Not quite."}
            </div>
            <p className="leading-relaxed">{quiz.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
