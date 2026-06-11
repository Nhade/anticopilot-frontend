"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Check,
  Gauge,
  History,
  Lightbulb,
  RefreshCcw,
  CalendarClock,
  Sparkles,
  BrainCircuit,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Chip } from "@/components/ui/chip";
import { StrengthBar } from "@/components/ui/strength-bar";
import { MarkdownContent } from "@/components/learn/markdown-content";
import {
  formatIntervalDays,
  reviewDisplayInfo,
  reviewReason,
} from "@/lib/review-display";
import type { GeneratedTask, ReviewConcept } from "@/lib/types";

type Grade = 1 | 2 | 3 | 4;
type IntervalField = "again" | "hard" | "good" | "easy";

interface GradeDef {
  grade: Grade;
  key: string;
  label: string;
  sub: string;
  field: IntervalField;
  cls: { base: string; accent: string; badge: string };
}

const GRADES: GradeDef[] = [
  {
    grade: 1, key: "1", label: "Again", sub: "Forgot it", field: "again",
    cls: {
      base: "border-red-500/35 hover:border-red-500/70 hover:bg-red-500/6",
      accent: "text-red-500",
      badge: "bg-red-500/12 text-red-500",
    },
  },
  {
    grade: 2, key: "2", label: "Hard", sub: "Struggled", field: "hard",
    cls: {
      base: "border-review/35 hover:border-review/70 hover:bg-review/6",
      accent: "text-review",
      badge: "bg-review/12 text-review",
    },
  },
  {
    grade: 3, key: "3", label: "Good", sub: "Recalled it", field: "good",
    cls: {
      base: "border-success/35 hover:border-success/70 hover:bg-success/6",
      accent: "text-success",
      badge: "bg-success/12 text-success",
    },
  },
  {
    grade: 4, key: "4", label: "Easy", sub: "Instant", field: "easy",
    cls: {
      base: "border-active/35 hover:border-active/70 hover:bg-active/6",
      accent: "text-active",
      badge: "bg-active/12 text-active",
    },
  },
];

type Phase = "generating" | "error" | "prompt" | "solution" | "graded";

interface DrillProps {
  concept: ReviewConcept;
  position: number;
  total: number;
  onGraded: () => void;
  onExit: () => void;
}

/**
 * Focused review drill: concept context → generated prompt → reveal solution
 * (Space/Enter) → FSRS self-grade with projected intervals (1–4).
 */
export function Drill({ concept, position, total, onGraded, onExit }: DrillProps) {
  const { generateReviewTask, submitReviewGrade } = useStore();
  const [phase, setPhase] = useState<Phase>("generating");
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<GradeDef | null>(null);
  const solutionRef = useRef<HTMLDivElement>(null);

  const info = reviewDisplayInfo(concept);
  const tone = concept.source_type === "struggle_signal" ? "review" : "active";
  const intervals = concept.interval_previews;

  const generate = useCallback(async () => {
    setPhase("generating");
    setTask(null);
    setChosen(null);
    setError(null);
    try {
      const generated = await generateReviewTask(concept.concept_id);
      setTask(generated);
      setPhase("prompt");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate a drill");
      setPhase("error");
    }
  }, [concept.concept_id, generateReviewTask]);

  useEffect(() => {
    generate();
  }, [generate]);

  const reveal = useCallback(() => setPhase("solution"), []);

  // On reveal, bring the solution and grading buttons into view — they often
  // sit below the fold after a long prompt.
  useEffect(() => {
    if (phase !== "solution") return;
    const el = solutionRef.current;
    if (!el) return;

    // Scroll the nearest *user-scrollable* ancestor, not scrollIntoView():
    // the drill card is `overflow-hidden`, so scrollIntoView would scroll that
    // clip instead of the main content area and the page wouldn't move.
    const align = () => {
      const node = solutionRef.current;
      if (!node) return;
      let scroller = node.parentElement;
      while (scroller) {
        const oy = getComputedStyle(scroller).overflowY;
        if ((oy === "auto" || oy === "scroll") && scroller.scrollHeight > scroller.clientHeight) break;
        scroller = scroller.parentElement;
      }
      if (!scroller) return;
      const top =
        node.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        24; // small breathing room above the solution
      scroller.scrollTo({ top, behavior: "smooth" });
    };

    align();
    // Markdown code blocks highlight asynchronously (PrismAsyncLight) and grow
    // after first paint, so the first scroll can land short — re-align while
    // the solution settles, then stop.
    let debounce: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(align, 60);
    });
    observer.observe(el);
    const stop = setTimeout(() => observer.disconnect(), 1800);
    return () => {
      clearTimeout(debounce);
      clearTimeout(stop);
      observer.disconnect();
    };
  }, [phase]);

  const grade = useCallback(
    (def: GradeDef) => {
      setChosen(def);
      setPhase("graded");
      // Fire-and-forget: the store removes the concept from dueReviews and
      // logs failures; the session advances either way.
      submitReviewGrade(concept.concept_id, def.grade);
      const timer = setTimeout(onGraded, 1150);
      return () => clearTimeout(timer);
    },
    [concept.concept_id, submitReviewGrade, onGraded]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === "prompt" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        reveal();
      } else if (phase === "solution" && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        grade(GRADES[Number(e.key) - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, reveal, grade]);

  return (
    <div className="max-w-3xl mx-auto anim-fade-up">
      {/* drill header: back + session progress */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-meta hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Queue
        </button>
        <div className="flex items-center gap-2">
          {/* Per-card dots only for sessions short enough to fit the header */}
          {total <= 10 &&
            Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i < position
                    ? "w-6 bg-success"
                    : i === position
                    ? "w-8 bg-active"
                    : "w-6 bg-outline/40"
                )}
              />
            ))}
          <span className="ml-1.5 text-[12px] font-semibold text-meta tabular-nums">
            {position + 1} / {total}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-lowest border border-outline/50 shadow-card overflow-hidden">
        {/* concept context strip */}
        <div className="px-7 pt-6 pb-5 border-b border-outline/35 bg-surface-low/40">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Chip tone={tone} icon={BrainCircuit}>
              Concept practice
            </Chip>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-review/8 border border-review/20 px-2.5 py-0.5 text-[11px] font-medium text-review">
              <Sparkles className="w-3 h-3" /> {reviewReason(concept)}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-ink font-display tracking-tight">
            {info.label}
          </h2>
          <div className="flex items-center gap-4 mt-3 text-[12px] text-meta flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <History className="w-[13px] h-[13px]" /> {concept.reps} prior review
              {concept.reps === 1 ? "" : "s"}
            </span>
            {concept.retrievability != null && concept.reps > 0 && (
              <span className="inline-flex items-center gap-2">
                Memory <StrengthBar value={concept.retrievability} className="w-20" />
                {Math.round(concept.retrievability * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* generating */}
        {phase === "generating" && (
          <div className="px-7 py-14 anim-fade-in">
            <Loading
              messages={[
                "Generating a fresh drill…",
                "Crafting a question…",
                "Tailoring it to this concept…",
              ]}
            />
          </div>
        )}

        {/* generation failed */}
        {phase === "error" && (
          <div className="px-7 py-12 flex flex-col items-center gap-3 text-center anim-fade-in">
            <XCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm font-semibold text-ink">Couldn&apos;t generate the drill</p>
            {error && <p className="text-xs text-meta max-w-sm">{error}</p>}
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={onExit}>
                Back to queue
              </Button>
              <Button
                size="sm"
                onClick={generate}
                className="bg-active hover:bg-active/90 text-white"
              >
                <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          </div>
        )}

        {/* prompt + solution */}
        {task && (phase === "prompt" || phase === "solution" || phase === "graded") && (
          <div className="px-7 py-6 anim-rise-in">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-meta mb-3">
              Prompt
            </div>
            <MarkdownContent>{task.content}</MarkdownContent>

            {phase === "prompt" && (
              <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3 anim-fade-in">
                <span className="text-[12px] text-meta inline-flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Answer it in your head, then check.
                </span>
                <Button
                  onClick={reveal}
                  className="bg-active hover:bg-active/90 text-white font-semibold font-display shadow-glow"
                >
                  Reveal solution
                  <kbd className="ml-2 text-[10px] font-mono bg-white/20 rounded px-1.5 py-0.5">
                    Space
                  </kbd>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            )}

            {phase !== "prompt" && (
              <div ref={solutionRef} className="mt-7 anim-slide-down">
                <div className="rounded-xl border border-success/30 bg-success/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-2.5 border-b border-success/20 bg-success/8">
                    <CheckCircle2 className="w-[15px] h-[15px] text-success" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-success">
                      Solution
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <MarkdownContent>{task.solution}</MarkdownContent>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FSRS grading */}
        {phase === "solution" && (
          <div className="px-7 pb-7 pt-1 anim-fade-up">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gauge className="w-[15px] h-[15px] text-meta" />
              <h3 className="text-sm font-semibold text-ink text-center font-display">
                How well did you recall it?
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GRADES.map((def) => (
                <button
                  key={def.grade}
                  onClick={() => grade(def)}
                  className={cn(
                    "relative rounded-xl border bg-surface-lowest p-3.5 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-active",
                    def.cls.base
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-2.5 right-2.5 w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center font-mono",
                      def.cls.badge
                    )}
                  >
                    {def.key}
                  </span>
                  <div className={cn("text-[15px] font-bold font-display", def.cls.accent)}>
                    {def.label}
                  </div>
                  <div className="text-[11px] text-meta mb-2.5">{def.sub}</div>
                  {intervals && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-meta">
                      <CalendarClock className="w-3 h-3" /> next in{" "}
                      <span className={def.cls.accent}>
                        {formatIntervalDays(intervals[def.field])}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-meta mt-3 inline-flex items-center gap-1.5 w-full justify-center">
              <RefreshCcw className="w-3 h-3" /> Your grade updates the spaced-repetition
              schedule · press 1–4
            </p>
          </div>
        )}

        {/* graded confirmation */}
        {phase === "graded" && chosen && (
          <div className="px-7 pb-8 pt-2 anim-pop text-center">
            <div
              className={cn(
                "w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3",
                chosen.cls.badge
              )}
            >
              <Check className={cn("w-[26px] h-[26px]", chosen.cls.accent)} strokeWidth={2.6} />
            </div>
            <div className="text-lg font-bold text-ink font-display">
              Marked “{chosen.label}”
            </div>
            <div className="text-sm text-meta mt-0.5">
              {intervals ? (
                <>
                  Scheduled for review again in{" "}
                  <span className={cn("font-semibold", chosen.cls.accent)}>
                    {formatIntervalDays(intervals[chosen.field])}
                  </span>
                </>
              ) : (
                "Spaced-repetition schedule updated"
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
