import React, { useEffect } from "react";
import {
  Activity,
  Target,
  BrainCircuit,
  Zap,
  Code2,
  Map as MapIcon,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  CircleDashed,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClockIcon } from "./icons";
import { MarkdownInline } from "@/components/learn/markdown-content";
import { useStore } from "@/lib/store";
import { formatEstimatedTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task, ReviewConcept, LearningContentItem } from "@/lib/types";

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const LESSON_ICON: Record<LearningContentItem["content_type"], LucideIcon> = {
  article: BookOpen,
  coding_problem: Code2,
  multiple_choice: HelpCircle,
};

// Pull a human-readable label + recall cue from a review concept's metadata.
// Mirrors practice-view's reviewDisplayInfo (the metadata shape differs by
// source_type).
function reviewBlockerInfo(concept: ReviewConcept): { label: string; detail: string | null } {
  const m = concept.concept_metadata || {};
  if (concept.source_type === "skill_path") {
    return { label: m.title || "Skill Path Review", detail: m.description || null };
  }
  return {
    label: m.concept_name || m.concept || "Programming Concept",
    detail: m.misconception ? `Targeting a previous mistake: ${m.misconception}` : null,
  };
}

export function DashboardView() {
  const {
    user,
    roadmaps,
    activeRoadmapId,
    getActiveRoadmap,
    dueReviews,
    fetchDueReviews,
    setActiveTab,
    completedContentIds,
    openLearningContent,
  } = useStore();

  // Pull live due reviews so the blocker reflects real FSRS state, not a mock.
  useEffect(() => {
    fetchDueReviews();
  }, [fetchDueReviews]);

  const topReview = dueReviews[0];
  const reviewInfo = topReview ? reviewBlockerInfo(topReview) : null;

  const activeRoadmap = getActiveRoadmap();
  const activeMilestone =
    activeRoadmap?.milestones?.find((m) => m.status === "active") ??
    activeRoadmap?.milestones?.find((m) => m.status !== "completed");
  const activeSkillpath =
    activeMilestone?.tasks?.find((t) => t.status === "active") ??
    activeMilestone?.tasks?.find((t) => t.status !== "completed");
  const skillpathEta = formatEstimatedTime(activeSkillpath?.estimated_hours);

  // Lessons of the active skillpath, with the same completion semantics as the
  // Learn view: skillpath completed ⇒ everything done, else the client-side set.
  const lessons = activeSkillpath?.learning_contents ?? [];
  const skillpathCompleted = activeSkillpath?.status === "completed";
  const isLessonDone = (c: LearningContentItem) =>
    skillpathCompleted || !!completedContentIds[c.content_id];
  const doneCount = lessons.filter(isLessonDone).length;
  const nextLesson = lessons.find((c) => !isLessonDone(c));
  const progressPct = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : null;
  const objectives = activeSkillpath?.learning_objectives ?? [];

  const handleOpenInVSCode = () => {
    const roadmap = roadmaps.find(r => r.id === activeRoadmapId);
    if (!roadmap) return;
    // After transformFullRoadmap, every milestone has `tasks` populated from
    // the backend's `skillpaths`. No need to fall back to the raw shape.
    let target: Task | undefined;
    for (const m of roadmap.milestones || []) {
      const candidates: Task[] = m.tasks ?? [];
      target = candidates.find(t => t.status === 'active')
        ?? candidates.find(t => t.status !== 'completed');
      if (target) break;
    }
    if (!target) return;
    const roadmapId = target.roadmap_id || roadmap.roadmap_id || activeRoadmapId;
    const skillpathId = target.skillpath_id || target.id;
    if (!skillpathId || !roadmapId) return;
    const uri = `vscode://anticopilot.anti-copilot/open-task?roadmapId=${encodeURIComponent(roadmapId)}&taskId=${encodeURIComponent(skillpathId)}`;
    window.location.href = uri;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Greeting */}
      <section className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {greetingForNow()}, {user.name}.
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 text-base max-w-2xl">
          {dueReviews.length > 0
            ? <>You have {dueReviews.length} concept{dueReviews.length > 1 ? "s" : ""} to review, then keep building on <MarkdownInline>{activeMilestone?.title ?? "your roadmap"}</MarkdownInline>.</>
            : <>You&apos;re all caught up on reviews — keep building on <MarkdownInline>{activeMilestone?.title ?? "your roadmap"}</MarkdownInline>.</>}
        </p>
      </section>

      {/* PRIMARY MODULE: Review Blocker (dominant CTA) — driven by live due reviews */}
      {topReview && reviewInfo ? (
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">
          <div className="relative overflow-hidden rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group transition-colors duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <div className="absolute inset-0 bg-linear-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="w-12 h-12 rounded-full bg-white dark:bg-amber-900/20 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-700/30 shadow-sm dark:shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Activity className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">Review blocker</span>
                {dueReviews.length > 1 && (
                  <span className="text-[10px] font-medium text-amber-600/80 dark:text-amber-400/80">+{dueReviews.length - 1} more due</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-1"><MarkdownInline>{reviewInfo.label}</MarkdownInline></h2>
              {reviewInfo.detail && (
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed"><MarkdownInline>{reviewInfo.detail}</MarkdownInline></p>
              )}
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-meta font-medium">
                <BrainCircuit className="w-3.5 h-3.5" />
                {topReview.reps > 0 ? `Reviewed ${topReview.reps}× · due now` : "First review · due now"}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 z-10">
              <Button
                onClick={() => setActiveTab("practice")}
                className="bg-review hover:bg-review/90 text-white border-0 shadow-lg shadow-review/20 transition-all group-hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-review focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#09090b]"
              >
                <Target className="w-4 h-4 mr-2" />
                Start review
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("practice")} className="border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-sm">
                View all
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">
          <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-green-900/20 flex items-center justify-center shrink-0 border border-green-200 dark:border-green-700/30">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">You&apos;re all caught up on reviews</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Nothing due right now. Keep coding — new struggles surface here for spaced review.</p>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SECONDARY MODULE: Up Next After Review */}
        <section className="lg:col-span-2 space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-500">Up next after review</h2>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors duration-200">
            {activeSkillpath ? (
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-zinc-500">
                        <Zap className="w-3 h-3" /> Active task · <MarkdownInline>{activeMilestone?.title ?? ""}</MarkdownInline>
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
                      <MarkdownInline>{activeSkillpath.title}</MarkdownInline>
                    </h3>
                    {activeSkillpath.description && (
                      <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md line-clamp-2">
                        <MarkdownInline>{activeSkillpath.description}</MarkdownInline>
                      </p>
                    )}
                  </div>
                  {progressPct != null && (
                    <div
                      className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center ml-4 shrink-0"
                      title={`${doneCount} of ${lessons.length} lessons completed`}
                    >
                      <span className="text-sm font-bold text-slate-600 dark:text-zinc-300">{progressPct}%</span>
                    </div>
                  )}
                </div>

                {lessons.length > 0 ? (
                  <div className="space-y-1.5 mb-4">
                    {lessons.map((lesson) => {
                      const done = isLessonDone(lesson);
                      const isNext = nextLesson?.content_id === lesson.content_id;
                      const Icon = LESSON_ICON[lesson.content_type];
                      return (
                        <button
                          key={lesson.content_id}
                          onClick={() => openLearningContent(lesson.content_id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                            isNext
                              ? "bg-white dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 shadow-xs dark:shadow-none"
                              : "hover:bg-slate-100 dark:hover:bg-zinc-900/80"
                          )}
                        >
                          {done ? (
                            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                          ) : isNext ? (
                            <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
                              <CircleDashed className="w-5 h-5 text-active animate-[spin_4s_linear_infinite]" />
                              <span className="absolute w-1.5 h-1.5 bg-active rounded-full" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-zinc-700 shrink-0" />
                          )}
                          <span
                            className={cn(
                              "flex-1 min-w-0 truncate text-sm",
                              done
                                ? "text-slate-400 dark:text-zinc-500 line-through"
                                : isNext
                                ? "text-slate-900 dark:text-zinc-100 font-medium"
                                : "text-slate-600 dark:text-zinc-300"
                            )}
                          >
                            <MarkdownInline>{lesson.title}</MarkdownInline>
                          </span>
                          <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ) : objectives.length > 0 ? (
                  <ul className="space-y-1.5 mb-4">
                    {objectives.slice(0, 4).map((objective, i) => (
                      <li key={i} className="flex items-center gap-3 p-3 rounded-xl text-sm text-slate-600 dark:text-zinc-300">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-zinc-700 shrink-0" />
                        <MarkdownInline>{objective}</MarkdownInline>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-zinc-500 mb-4 px-1">
                    No learning content generated yet — open the task from your roadmap to generate it.
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1.5 shrink-0">
                    <ClockIcon size={13} /> Est. {skillpathEta || "—"} remaining
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 h-8"
                      onClick={handleOpenInVSCode}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      Open in VS Code
                    </Button>
                    {nextLesson && (
                      <Button
                        size="sm"
                        className="bg-active hover:bg-active/90 text-white h-8"
                        onClick={() => openLearningContent(nextLesson.content_id)}
                      >
                        {doneCount > 0 ? "Resume" : "Start"}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-active/10 text-active flex items-center justify-center shrink-0">
                  <MapIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">No active task</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-500">Pick up where you left off from your roadmap.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("roadmap")} className="shrink-0">
                  Open roadmap
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* TERTIARY: Today at a Glance */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <h2 className="text-sm font-bold text-neutral-meta uppercase tracking-wider">Today at a glance</h2>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-active/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-active" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-meta font-bold uppercase tracking-wider">Streak</div>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">{user.streak} days</div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-active/10 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-active" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-meta font-bold uppercase tracking-wider">Today's pace</div>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">On track</div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-active/10 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-active" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-meta font-bold uppercase tracking-wider">Active milestone</div>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                <MarkdownInline>{activeMilestone?.title ?? "App Router Foundations"}</MarkdownInline>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
