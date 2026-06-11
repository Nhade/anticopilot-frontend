import React, { useEffect } from "react";
import {
  Target,
  Clock,
  Zap,
  ShieldAlert,
  Wand2,
  RefreshCcw,
  AlertTriangle,
  Lightbulb,
  GitPullRequest,
  ArrowRight,
  Map,
  Code2,
  Play,
  Flame,
  Award,
  CheckCircle2,
  MessagesSquare,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ContextCard } from "./context-card";
import { ExpandableMilestone } from "./expandable-milestone";
import { MarkdownInline } from "@/components/learn/markdown-content";
import { useStore } from "@/lib/store";
import { reviewDisplayInfo, reviewReason } from "@/lib/review-display";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Target,
  Clock,
  Zap,
  ShieldAlert,
  Wand2,
  RefreshCcw,
  AlertTriangle,
  Lightbulb,
  GitPullRequest,
  ArrowRight,
  Map,
  Code2,
  Play,
  Flame,
  Award
};

// Milestone node icon color must read against the node circle background,
// which varies by status (teal gradient / pale green / pale slate).
function milestoneIconClass(status: string): string {
  if (status === "active") return "w-6 h-6 text-white";
  if (status === "completed") return "w-6 h-6 text-success";
  return "w-6 h-6 text-slate-400 dark:text-zinc-500";
}

export function RoadmapView() {
  const { getActiveRoadmap, setSelectedTaskId, setActiveTab, roadmapsLoading, roadmapsError, dueReviews, fetchDueReviews, startDiscovery } = useStore();
  const activeRoadmap = getActiveRoadmap();

  // The review queue reflects live FSRS state, same source as Practice.
  useEffect(() => {
    fetchDueReviews();
  }, [fetchDueReviews]);

  if (roadmapsLoading && !activeRoadmap?.milestones?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading
          messages={["Loading your roadmap…", "Gathering milestones…", "Charting your path…"]}
        />
      </div>
    );
  }

  if (roadmapsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3 max-w-sm">
          <AlertTriangle className="w-8 h-8 text-review mx-auto" />
          <p className="text-sm text-slate-500 dark:text-zinc-400">Could not load roadmap. The backend may be offline.</p>
          <p className="text-xs text-slate-400 dark:text-zinc-500">{roadmapsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* Context Bar — live values only */}
      {(() => {
        const milestones = activeRoadmap?.milestones ?? [];
        const completedCount = milestones.filter((m) => m.status === "completed").length;
        const activeMilestone =
          milestones.find((m) => m.status === "active") ??
          milestones.find((m) => m.status !== "completed");
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ContextCard icon={<Target size={14} />} title="Goal" text={activeRoadmap?.title || "—"} />
            <ContextCard icon={<Flame size={14} />} title="Active Milestone" text={activeMilestone?.title || "—"} highlight="text-active" />
            <ContextCard icon={<Map size={14} />} title="Milestones" text={milestones.length > 0 ? `${completedCount} of ${milestones.length} done` : "—"} />
            <ContextCard
              icon={<ShieldAlert size={14} />}
              title="Reviews Due"
              text={`${dueReviews.length} concept${dueReviews.length === 1 ? "" : "s"}`}
              highlight={dueReviews.length > 0 ? "text-review" : undefined}
            />
          </div>
        );
      })()}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Your Adaptive Path</h2>
          <p className="text-slate-600 dark:text-zinc-400 text-sm max-w-2xl">
            <MarkdownInline>
              {activeRoadmap?.description || "Adapted from your goal and the struggle signals your coding surfaces."}
            </MarkdownInline>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            startDiscovery(
              `Recalculate my "${activeRoadmap?.title ?? "current"}" roadmap based on my recent struggle signals and progress.`
            )
          }
          title="Start a guided session with the discovery agent. It reads your accumulated struggle signals and skill-mastery memory, and generates a fresh roadmap version."
          className="border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-active"
        >
          <Wand2 className="w-4 h-4 mr-2 text-active" />
          Recalculate based on signals
          <MessagesSquare className="w-3.5 h-3.5 ml-2 text-ai/70" />
        </Button>
      </div>

      <div className="relative pt-4 space-y-12">

        {/* Review Queue — live FSRS due reviews; hidden when caught up */}
        {dueReviews.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-neutral-meta uppercase tracking-wider mb-4 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-review" /> Review Queue
            </h3>
            <div className="bg-white dark:bg-zinc-900/80 border border-review/25 rounded-2xl p-5 shadow-sm">
              {dueReviews.slice(0, 2).map((concept, idx, shown) => {
                const info = reviewDisplayInfo(concept);
                return (
                  <div key={concept.concept_id} className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                    idx < shown.length - 1 && "mb-4 pb-4 border-b border-review/15"
                  )}>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-review/12 text-review">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-zinc-200 truncate"><MarkdownInline>{info.label}</MarkdownInline></h4>
                        <p className="text-xs text-neutral-meta mt-0.5 font-medium">
                          <span className="font-bold uppercase tracking-wider text-[10px] mr-1 text-review">Decaying</span>
                          {reviewReason(concept)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 font-bold px-4 bg-review hover:bg-review/90 text-white"
                      onClick={() => setActiveTab("practice")}
                    >
                      Start review
                    </Button>
                  </div>
                );
              })}
              {dueReviews.length > 2 && (
                <button
                  onClick={() => setActiveTab("practice")}
                  className="mt-4 pt-3 border-t border-review/15 w-full text-xs font-semibold text-review hover:underline inline-flex items-center justify-center gap-1.5"
                >
                  View all {dueReviews.length} due reviews in Practice <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Milestones Sections */}
        {(() => {
          const milestones = activeRoadmap?.milestones || [];
          const completedMilestones = milestones.filter(m => m.status === 'completed');
          const nowMilestones = milestones.filter(m => m.status === 'active');
          const nextMilestones = milestones.filter(m => m.status !== 'active' && m.status !== 'completed');

          return (
            <>
              {completedMilestones.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </h3>
                  <div className="relative">
                    <div className="absolute left-[31px] top-6 bottom-0 w-[2px] z-0 bg-success/25" />
                    <div className="space-y-8 relative z-10">
                      {completedMilestones.map((milestone) => (
                        <ExpandableMilestone
                          key={milestone.id}
                          {...milestone}
                          id={milestone.id || ""}
                          icon={React.createElement(iconMap[milestone.icon] || Award, { className: milestoneIconClass("completed") })}
                          tasks={milestone.tasks.map(t => ({
                            ...t,
                            icon: React.createElement(iconMap[t.icon || ""] || Play, { size: 14 })
                          }))}
                          onTaskClick={setSelectedTaskId}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {nowMilestones.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-review">
                    <Flame className="w-4 h-4" /> Now
                  </h3>
                  <div className="relative">
                    <div className="absolute left-[31px] top-6 bottom-0 w-[2px] z-0 bg-active/20" />
                    <div className="space-y-8 relative z-10">
                      {nowMilestones.map((milestone) => (
                        <ExpandableMilestone
                          key={milestone.id}
                          {...milestone}
                          id={milestone.id || ""}
                          icon={React.createElement(iconMap[milestone.icon] || Map, { className: milestoneIconClass("active") })}
                          tasks={milestone.tasks.map(t => ({
                            ...t,
                            icon: React.createElement(iconMap[t.icon || ""] || Play, { size: 14 })
                          }))}
                          onTaskClick={setSelectedTaskId}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {nextMilestones.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-neutral-meta">
                    <Map className="w-4 h-4 opacity-60" /> Next
                  </h3>
                  <div className="relative">
                    <div className="absolute left-[31px] top-6 bottom-0 w-[2px] z-0 bg-slate-200 dark:bg-zinc-800" />
                    <div className="space-y-8 relative z-10">
                      {nextMilestones.map((milestone) => (
                        <ExpandableMilestone
                          key={milestone.id}
                          {...milestone}
                          id={milestone.id || ""}
                          icon={React.createElement(iconMap[milestone.icon] || Map, { className: milestoneIconClass(milestone.status) })}
                          tasks={milestone.tasks.map(t => ({
                            ...t,
                            icon: React.createElement(iconMap[t.icon || ""] || Play, { size: 14 })
                          }))}
                          onTaskClick={setSelectedTaskId}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}

      </div>
    </div>
  );
}
