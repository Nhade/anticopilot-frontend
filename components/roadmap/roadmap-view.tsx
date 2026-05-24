import React from "react";
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
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextCard } from "./context-card";
import { AdaptationItem } from "./adaptation-item";
import { ExpandableMilestone } from "./expandable-milestone";
import { useStore } from "@/lib/store";
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
  Flame
};

export function RoadmapView() {
  const { getActiveRoadmap, setSelectedTaskId, roadmapsLoading, roadmapsError, notifications, pathUpdates } = useStore();
  const activeRoadmap = getActiveRoadmap();

  if (roadmapsLoading && !activeRoadmap?.milestones?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-active border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-zinc-400">Loading roadmap...</p>
        </div>
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

      {/* Context Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ContextCard icon={<Target size={14} />} title="Goal" text={activeRoadmap?.title || ""} />
        <ContextCard icon={<Clock size={14} />} title="Time Available" text="2 hours today" highlight="text-active" />
        <ContextCard icon={<Zap size={14} />} title="Active Project" text={activeRoadmap?.linkedProject || ""} />
        <ContextCard icon={<ShieldAlert size={14} />} title="Recent Focus" text="useEffect hooks" highlight="text-review" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Your Adaptive Path</h2>
          <p className="text-slate-600 dark:text-zinc-400 text-sm max-w-2xl">
            Tailored for your goal. We've adjusted today's path to tackle your struggles with prop-drilling within the context of your {activeRoadmap?.linkedProject} project.
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-active">
          <Wand2 className="w-4 h-4 mr-2 text-active" />
          Recalculate based on signals
        </Button>
      </div>

      <div className="relative pt-4 space-y-12">

        {/* Review Queue */}
        <div>
          <h3 className="text-sm font-bold text-neutral-meta uppercase tracking-wider mb-4 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-review" /> Review Queue
          </h3>
          <div className="relative">
            <div className="space-y-4 relative z-10">
              <div className="bg-white dark:bg-zinc-900/80 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl p-5 shadow-sm">
                {notifications.map((note, idx) => (
                  <div key={note.id} className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                    idx === 0 && "mb-4 pb-4 border-b border-amber-100 dark:border-amber-900/30"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        note.type === "review" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500" : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      )}>
                        {note.type === "review" ? <AlertTriangle size={16} /> : <Lightbulb size={16} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-zinc-200">{note.title}</h4>
                        <p className="text-xs text-neutral-meta mt-0.5 font-medium">
                          <span className={cn(
                            "font-bold uppercase tracking-wider text-[10px] mr-1",
                            note.type === "review" ? "text-review" : "text-ai"
                          )}>
                            {note.type === "review" ? "Decaying" : "Suggested"}
                          </span>
                          {note.rationale}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={note.type === "review" ? "default" : "outline"}
                      className={cn("shrink-0 font-bold px-4", note.type === "review" ? "bg-review hover:bg-review/90 text-white" : "text-neutral-meta hover:text-slate-700 dark:hover:text-zinc-300")}
                      onClick={() => setSelectedTaskId(note.title)}
                    >
                      {note.type === "review" ? "Start review" : "Review concept"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Path Updates */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-neutral-meta uppercase tracking-wider flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-active" /> Path updates
            </h3>
            <Button variant="link" className="text-neutral-meta hover:text-active p-0 h-auto text-xs">View All <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="space-y-5">
              {pathUpdates.map(update => {
                const Icon = iconMap[update.type === "refresh" ? "RefreshCcw" : update.type === "skip" ? "GitPullRequest" : "Map"] || Map;
                return (
                  <AdaptationItem
                    key={update.id}
                    icon={<Icon className={cn("w-4 h-4", update.type === "refresh" ? "text-active" : update.type === "skip" ? "text-review" : "text-active")} />}
                    time={update.time}
                    text={update.text}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestones Sections */}
        {(() => {
          const nowMilestones = activeRoadmap?.milestones?.filter(m => m.status === 'active') || [];
          const nextMilestones = activeRoadmap?.milestones?.filter(m => m.status !== 'active') || [];
          
          return (
            <>
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
                          icon={React.createElement(iconMap[milestone.icon] || Map, { className: "w-6 h-6 text-white" })}
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
                          icon={React.createElement(iconMap[milestone.icon] || Map, { className: "w-6 h-6 text-white" })}
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
