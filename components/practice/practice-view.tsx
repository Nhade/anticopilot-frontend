"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Play,
  Clock,
  Calendar,
  Target,
  Gauge,
  Flame,
  CheckCircle2,
  BrainCircuit,
  XCircle,
} from "lucide-react";
import { isPast, formatDistanceToNow } from "date-fns";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { StatPill } from "@/components/ui/stat-pill";
import { DueCard } from "./due-card";
import { ScheduledList } from "./scheduled-list";
import { Drill } from "./drill";
import { SessionDone } from "./session-done";
import type { ReviewConcept } from "@/lib/types";

type Mode =
  | { kind: "queue" }
  | { kind: "drill"; session: ReviewConcept[]; position: number }
  | { kind: "done"; reviewed: number };

export function PracticeView() {
  const {
    dueReviews,
    allReviews,
    fetchDueReviews,
    fetchAllReviews,
    reviewsLoading,
    reviewsError,
    user,
  } = useStore();
  const [mode, setMode] = useState<Mode>({ kind: "queue" });

  useEffect(() => {
    fetchDueReviews();
    fetchAllReviews();
  }, [fetchDueReviews, fetchAllReviews]);

  const upcoming = useMemo(
    () =>
      allReviews
        .filter((r) => !isPast(new Date(r.due)))
        .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()),
    [allReviews]
  );

  // Average retention over concepts that have actually been reviewed —
  // never-reviewed cards report 0 and would misrepresent the average.
  const avgRetention = useMemo(() => {
    const reviewed = allReviews.filter(
      (r) => r.reps > 0 && r.retrievability != null
    );
    if (reviewed.length === 0) return null;
    return (
      reviewed.reduce((sum, r) => sum + (r.retrievability as number), 0) /
      reviewed.length
    );
  }, [allReviews]);

  const refresh = () => {
    fetchDueReviews();
    fetchAllReviews();
  };

  // Start a drill session. When a specific card is chosen, it goes first and
  // the rest of the queue follows.
  const startSession = (concepts: ReviewConcept[], startAt = 0) => {
    if (concepts.length === 0) return;
    const session =
      startAt > 0
        ? [concepts[startAt], ...concepts.filter((_, i) => i !== startAt)]
        : concepts;
    setMode({ kind: "drill", session, position: 0 });
  };

  const handleGraded = () => {
    setMode((m) => {
      if (m.kind !== "drill") return m;
      const next = m.position + 1;
      if (next >= m.session.length) return { kind: "done", reviewed: m.session.length };
      return { ...m, position: next };
    });
  };

  const exitToQueue = () => {
    setMode({ kind: "queue" });
    refresh();
  };

  // ---- DRILL / DONE ----
  if (mode.kind === "drill") {
    const concept = mode.session[mode.position];
    return (
      <Drill
        concept={concept}
        position={mode.position}
        total={mode.session.length}
        onGraded={handleGraded}
        onExit={exitToQueue}
      />
    );
  }
  if (mode.kind === "done") {
    return (
      <SessionDone
        count={mode.reviewed}
        retention={avgRetention}
        onBack={exitToQueue}
      />
    );
  }

  // ---- QUEUE ----
  if (reviewsLoading && allReviews.length === 0 && dueReviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <div className="w-8 h-8 border-2 border-active border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-meta">Loading practice queue…</p>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <XCircle className="w-10 h-10 text-red-500/70" />
        <h2 className="text-lg font-bold text-ink font-display">
          Could not load reviews
        </h2>
        <p className="text-sm text-meta text-center max-w-sm">{reviewsError}</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Try again
        </Button>
      </div>
    );
  }

  if (allReviews.length === 0 && dueReviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 pt-20 anim-fade-up">
        <div className="w-20 h-20 bg-surface-low text-meta rounded-full flex items-center justify-center">
          <BrainCircuit className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-ink font-display">
          No concepts tracked yet
        </h2>
        <p className="text-meta text-center max-w-sm">
          Start coding in VS Code and AntiCopilot will automatically identify
          concepts you should practice.
        </p>
      </div>
    );
  }

  const caughtUp = dueReviews.length === 0;
  const nextUp = upcoming[0];

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      {/* header + memory health strip */}
      <div className="anim-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink font-display">
              Practice
            </h1>
            <p className="text-meta mt-1 max-w-xl">
              Spaced repetition over the concepts your coding friction surfaced.
              Review them right as they start to fade.
            </p>
          </div>
          {!caughtUp && (
            <Button
              size="lg"
              onClick={() => startSession(dueReviews)}
              className="bg-review hover:bg-review/90 text-white font-semibold font-display shadow-[0_8px_24px_-8px_rgba(188,92,14,.45)] shrink-0"
            >
              <Play className="w-4 h-4 mr-2" /> Start review session
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <StatPill
            icon={Target}
            label="Due now"
            value={`${dueReviews.length} concept${dueReviews.length === 1 ? "" : "s"}`}
            tone="review"
          />
          <StatPill
            icon={Calendar}
            label="Scheduled"
            value={`${upcoming.length} upcoming`}
            tone="active"
          />
          <StatPill
            icon={Gauge}
            label="Avg. retention"
            value={avgRetention != null ? `${Math.round(avgRetention * 100)}%` : "—"}
            tone="success"
          />
          <StatPill
            icon={Flame}
            label="Review streak"
            value={`${user.streak} days`}
            tone="review"
          />
        </div>
      </div>

      {/* due now / caught up */}
      {caughtUp ? (
        <div className="anim-fade-up rounded-2xl bg-success/6 border border-success/25 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/12 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-ink font-display">
              You&apos;re caught up on reviews
            </h2>
            <p className="text-sm text-meta">
              Nothing due right now. Keep coding — new struggles surface here for
              spaced review.
              {nextUp &&
                ` Next up ${formatDistanceToNow(new Date(nextUp.due), { addSuffix: true })}.`}
            </p>
          </div>
        </div>
      ) : (
        <section className="anim-fade-up" style={{ animationDelay: ".06s" }}>
          <SectionLabel icon={Clock} tone="review">
            Due now · {dueReviews.length}
          </SectionLabel>
          <div className="space-y-3">
            {dueReviews.map((concept, i) => (
              <DueCard
                key={concept.concept_id}
                concept={concept}
                onStart={() => startSession(dueReviews, i)}
              />
            ))}
          </div>
        </section>
      )}

      {/* scheduled ahead */}
      {upcoming.length > 0 && (
        <section className="anim-fade-up" style={{ animationDelay: ".12s" }}>
          <SectionLabel icon={Calendar} tone="neutral">
            Scheduled ahead
          </SectionLabel>
          <ScheduledList
            items={upcoming}
            onReviewEarly={(concept) => startSession([concept])}
          />
        </section>
      )}
    </div>
  );
}
