import React, { useEffect, useState } from "react";
import {
  Target,
  Code2,
  MoreHorizontal,
  Settings,
  AlertTriangle,
  Compass,
  ChevronRight,
  Sparkles,
  MessagesSquare,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";

const iconMap: Record<string, LucideIcon> = {
  Target,
  Code2,
  Settings,
  AlertTriangle,
  Compass,
};

export function ManageRoadmapsView() {
  const [activeFilter, setActiveFilter] = useState("Active");
  const { setActiveRoadmapId, activeRoadmapId, roadmaps, startDiscovery } = useStore();

  // Progress bars and milestone labels need each roadmap's details, which the
  // list endpoint doesn't include — load the missing ones once on mount.
  useEffect(() => {
    const { roadmaps: current, fetchRoadmap } = useStore.getState();
    current
      .filter((r) => !r.milestones || r.milestones.length === 0)
      .forEach((r) => fetchRoadmap(r.id));
  }, []);

  const filteredRoadmaps = roadmaps.filter(r => r.status === activeFilter);
  const counts = {
    Active: roadmaps.filter(r => r.status === "Active").length,
    Paused: roadmaps.filter(r => r.status === "Paused").length,
    Completed: roadmaps.filter(r => r.status === "Completed").length,
    Archived: roadmaps.filter(r => r.status === "Archived").length
  };

  const getFilterClass = (filter: string) => {
    return activeFilter === filter
      ? "pb-3 border-b-2 border-active text-sm font-bold text-slate-900 dark:text-zinc-100 shrink-0 transition-colors"
      : "pb-3 border-b-2 border-transparent text-sm font-medium text-slate-500/60 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 shrink-0 transition-colors";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Roadmaps</h1>
          <p className="text-slate-600 dark:text-zinc-400">Manage your learning paths and active goals.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => startDiscovery()}
            className="bg-active hover:opacity-90 text-white shadow-md shadow-active/20 transition-transform sm:hover:scale-105 rounded-xl px-5 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Create Roadmap
          </Button>
        </div>
      </div>

      {/* Filters/Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800/80 mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {["Active", "Paused", "Completed", "Archived"].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={getFilterClass(filter)}
          >
            {filter} ({counts[filter as keyof typeof counts]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoadmaps.map((roadmap) => {
          const Icon = iconMap[roadmap.icon] || Target;
          const isActive = roadmap.id === activeRoadmapId;
          
          return (
            <div key={roadmap.id} className={cn("rounded-3xl p-6 relative overflow-hidden group transition-all", roadmap.bgTheme, roadmap.borderTheme, isActive && "ring-2 ring-active/40")}>
              {roadmap.status === "Active" && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-active/20 to-transparent rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-70" />
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", roadmap.iconBg, roadmap.iconColor)}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", roadmap.status === "Active" ? "bg-active text-white shadow-sm" : "bg-slate-100 dark:bg-zinc-800 text-slate-500/60")}>
                    {roadmap.themeStatus}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onSelect={() =>
                          startDiscovery(
                            `I want to adjust the settings for my "${roadmap.title}" roadmap — its weekly pace, time commitment, difficulty, or learning style.`
                          )
                        }
                      >
                        <Settings className="w-4 h-4 mr-2" /> Edit settings
                        <MessagesSquare className="w-3.5 h-3.5 ml-auto text-ai/70" />
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Target className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          startDiscovery(
                            `Create a new roadmap based on my existing "${roadmap.title}" roadmap, with a few changes I'll describe.`
                          )
                        }
                      >
                        <Code2 className="w-4 h-4 mr-2" /> Duplicate
                        <MessagesSquare className="w-3.5 h-3.5 ml-auto text-ai/70" />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Compass className="w-4 h-4 mr-2" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/40">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-1">{roadmap.title}</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-3 line-clamp-2">{roadmap.description}</p>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-zinc-500 mb-6">
                {roadmap.status === "Active" && roadmap.stats.reviewsDue > 0 ? (
                  <span className="text-active/80">{roadmap.stats.reviewsDue} Reviews Due</span>
                ) : (
                  <span>Last active: {roadmap.stats.lastActive}</span>
                )}
                <span>⸱</span>
                <span>Pace: {roadmap.stats.pace}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Current Milestone</span>
                    <span className={cn("font-bold text-sm", roadmap.status === "Active" ? "text-active" : "text-slate-600 dark:text-zinc-400")}>
                      {roadmap.milestone}
                    </span>
                  </div>
                  <Progress
                    value={roadmap.progress}
                    className={cn("h-1.5 bg-slate-100 dark:bg-zinc-800", roadmap.status !== "Active" && "[&>div]:bg-slate-300 dark:[&>div]:bg-zinc-600")}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                  {roadmap.status === "Active" ? (
                    <>
                      {roadmap.linkedProject ? (
                        <span className="font-medium text-slate-400">Linked: <span className="underline decoration-slate-200 dark:decoration-zinc-700 underline-offset-2">{roadmap.linkedProject}</span></span>
                      ) : (
                        <span className="font-medium text-slate-400">{roadmap.progress}% complete</span>
                      )}
                      <span 
                        className="text-active cursor-pointer hover:underline font-bold flex items-center text-xs"
                        onClick={() => setActiveRoadmapId(roadmap.id)}
                      >
                        {isActive ? "Viewing" : "Switch to"} <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] uppercase font-bold text-slate-500/60 hover:text-slate-600 dark:hover:text-zinc-300">Archive</Button>
                      <Button variant="ghost" size="sm" className="h-6 px-3 text-[10px] uppercase font-bold text-active hover:bg-active/10 rounded-full">Resume</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
