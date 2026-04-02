import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { mockRoadmaps } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function RoadmapSwitcher() {
  const { 
    activeRoadmapId, 
    setActiveRoadmapId, 
    isSwitcherOpen, 
    setSwitcherOpen, 
    setActiveTab 
  } = useStore();
  
  const activeRoadmap = mockRoadmaps.find(r => r.id === activeRoadmapId);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setSwitcherOpen(!isSwitcherOpen)}
        className="flex items-center gap-3 border-slate-200 dark:border-zinc-800 bg-white/50 hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900 rounded-xl px-4 py-6 shadow-sm"
      >
        <div className="flex flex-col items-start">
          <span className="text-[11px] text-slate-500 font-medium leading-none">Active roadmap</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-none mt-1.5 flex items-center gap-1.5">
            {activeRoadmap?.title || "Select Roadmap"}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </span>
        </div>
      </Button>

      {/* Switcher Dropdown */}
      {isSwitcherOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/20">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[11px] font-medium text-slate-500">Your roadmaps</span>
            </div>
            
            {/* Active List */}
            {mockRoadmaps.filter(r => r.id === activeRoadmapId).map(roadmap => (
              <div 
                key={roadmap.id}
                className="p-3 rounded-xl bg-[#0a6879]/5 border border-[#0a6879]/20 cursor-pointer hover:bg-[#0a6879]/10 transition-colors"
                onClick={() => setSwitcherOpen(false)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-[#005c6b] dark:text-[#98e3f5]">{roadmap.title}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#005c6b] text-white">Active</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-2">Milestone: {roadmap.milestone}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex-1 mr-3">
                    <Progress value={roadmap.progress} className="h-1 bg-[#0a6879]/10 dark:bg-[#0a6879]/20" />
                  </div>
                  <span className="text-[10px] text-slate-500/60 font-bold">{roadmap.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 space-y-1">
            {/* Other roadmaps */}
            {mockRoadmaps.filter(r => r.id !== activeRoadmapId).map(roadmap => (
              <div 
                key={roadmap.id}
                className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                onClick={() => setActiveRoadmapId(roadmap.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{roadmap.title}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">{roadmap.status}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 mb-1">Milestone: {roadmap.milestone}</p>
                {roadmap.stats.reviewsDue > 0 && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">{roadmap.stats.reviewsDue} concept needs review</div>
                )}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/20 grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-[#0a6879] dark:text-[#98e3f5] hover:bg-[#0a6879]/10 justify-start h-8">
              + Create New
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 justify-end h-8" onClick={() => setActiveTab("manage-roadmaps")}>
              Manage All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
