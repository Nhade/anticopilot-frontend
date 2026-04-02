import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Flame,
  AlertTriangle,
  Award,
  SlidersHorizontal,
  BrainCircuit,
  Send,
  Compass,
  Clock,
  ArrowRight,
  Code2,
  RefreshCcw,
  Map,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoadmapTaskItem } from "./roadmap-task-item";

interface ExpandableMilestoneProps {
  status: "active" | "completed" | "upcoming";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  why?: string;
  tasks: any[];
  sideQuest?: {
    title: string;
    type: string;
    description: string;
  };
  mastery?: "review" | "solid";
  masteryText?: string;
  eta?: string;
  onTaskClick?: (task: string) => void;
}

export function ExpandableMilestone({
  status,
  title,
  subtitle,
  icon,
  why,
  tasks: defaultTasks,
  sideQuest,
  mastery,
  masteryText,
  eta,
  onTaskClick
}: ExpandableMilestoneProps) {
  const [isOpen, setIsOpen] = useState(status === "active");
  const [isEditing, setIsEditing] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Local state to simulate updates
  const [tasks, setTasks] = useState(defaultTasks);
  const [currentTitle, setCurrentTitle] = useState(title);

  const isActive = status === "active";
  const isCompleted = status === "completed";

  const handleCustomizationRequest = (request: string) => {
    setIsEditing(false);
    setIsGenerating(true);
    setChatInput("");

    // Simulate AI regenerating the path
    setTimeout(() => {
      setIsGenerating(false);
      setTasks([
        { title: "FastAPI Fundamentals", subtitle: "Python-based high-performance APIs", status: "upcoming", icon: <Map size={14} /> },
        { title: "Pydantic Models", subtitle: "Data validation equivalent to Prisma", status: "upcoming", icon: <Target size={14} /> },
        { title: "Wiring React to FastAPI", subtitle: "CORS and fetch integration", status: "upcoming", icon: <Code2 size={14} /> }
      ]);
      setCurrentTitle("Database & FastAPI");
    }, 2000);
  };

  return (
    <div className="relative z-10 flex gap-4 sm:gap-6">
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm transition-all duration-300 cursor-pointer hover:scale-105",
          isGenerating && "animate-pulse shadow-xl shadow-active/40",
          isActive ? "bg-linear-to-br from-active to-active-foreground border-4 border-slate-50 dark:border-[#09090b] shadow-2xl shadow-active/40 ring-2 ring-active/20 ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#09090b]" :
            isCompleted ? "bg-success/15 dark:bg-success/10 border-4 border-slate-50 dark:border-[#09090b]" :
              "bg-slate-100 dark:bg-zinc-900 border-4 border-slate-50 dark:border-[#09090b]"
        )} onClick={() => setIsOpen(!isOpen)}>
          {isGenerating ? <RefreshCcw className="w-6 h-6 text-active animate-spin" /> : icon}
        </div>
      </div>

      <div className={cn("flex-1 transition-all duration-500", !isOpen && !isActive && "opacity-80 hover:opacity-100")}>
        <div className={cn(
          "rounded-2xl transition-all duration-500 relative overflow-hidden group/card cursor-pointer",
          isGenerating && "border-active shadow-xl shadow-active/10",
          isActive ? "bg-white dark:bg-zinc-900/80 border-2 border-active/30 dark:border-active/50 shadow-xl shadow-active/10 p-5" :
            isOpen ? "bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 p-5 shadow-sm" :
              "bg-transparent border border-transparent p-2 hover:bg-slate-100/50 dark:hover:bg-zinc-800/30"
        )} onClick={() => !isOpen && setIsOpen(true)}>

          {(isActive || isGenerating) && <div className={cn("absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-active/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-1000", isGenerating && "opacity-100 from-active/30")} />}

          <div className="relative z-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                {isActive && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-active/10 text-active text-[10px] font-bold uppercase tracking-wider mb-2 border border-active/20">
                    <Flame className="w-3 h-3 text-review" /> Current Milestone
                  </div>
                )}
                {!isActive && !isCompleted && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-neutral-meta text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-slate-200 dark:border-zinc-700/50">
                    Up Next
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className={cn("text-xl font-bold flex items-center gap-2 transition-all", isActive ? "text-slate-900 dark:text-white" : isCompleted ? "text-slate-700 dark:text-zinc-300 line-through decoration-slate-300 dark:decoration-zinc-700" : "text-slate-800 dark:text-zinc-300")}>
                    {currentTitle}
                  </h3>
                  {isOpen && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:hidden" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    </Button>
                  )}
                  {!isOpen && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:hidden">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  )}
                </div>

                {subtitle && !isOpen && (
                  <p className="text-sm text-neutral-meta mt-1">{subtitle}</p>
                )}
              </div>

              <div className="hidden sm:flex flex-col items-end text-right">
                {mastery && !isOpen && (
                  <div className={cn("text-xs font-semibold mt-1 flex items-center gap-1", mastery === "review" ? "text-review" : "text-success")}>
                    {mastery === "review" ? <AlertTriangle size={12} /> : <Award size={12} />}
                    {mastery === "review" ? "Needs Review" : "Solid"}
                  </div>
                )}
                {!isActive && (
                  <Button variant="ghost" size="sm" className="h-6 mt-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
                    {isOpen ? "Collapse" : "Expand"} {isOpen ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {isOpen && (
              <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-100 dark:border-zinc-800/80 pt-4 cursor-default" onClick={e => e.stopPropagation()}>

                {masteryText && (
                  <div className={cn("flex items-start gap-2 p-3 rounded-lg mb-4 text-xs font-medium border", mastery === "review" ? "bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50" : "bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50")}>
                    {mastery === "review" ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> : <Award className="w-4 h-4 shrink-0 mt-0.5" />}
                    <p>{masteryText}</p>
                  </div>
                )}

                {/* 60/40 Split: Task Column + Context Rail */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  {/* LEFT: Task Breakdown (60%) */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="space-y-2 relative">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <h4 className="text-[11px] font-bold text-neutral-meta uppercase tracking-wider">Breakdown</h4>
                        {!isCompleted && !isEditing && !isGenerating && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-active hover:bg-active/10 px-2" onClick={() => setIsEditing(true)}>
                            <SlidersHorizontal className="w-3 h-3 mr-1" /> Customize Path
                          </Button>
                        )}
                      </div>

                      <div className={cn("space-y-2 transition-all duration-500", isGenerating && "blur-[2px] opacity-60 scale-[0.99]")}>
                        {tasks?.map((task: any, i: number) => (
                          <RoadmapTaskItem
                            key={`${currentTitle}-${i}`}
                            icon={task.icon}
                            title={task.title}
                            subtitle={task.subtitle}
                            status={task.status}
                            type={task.type}
                            onTaskClick={onTaskClick}
                          />
                        ))}
                      </div>

                      {isEditing && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                          <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-inner">
                            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-zinc-400">
                              <BrainCircuit className="w-3.5 h-3.5 text-[#0a6879] dark:text-[#98e3f5]" />
                              Chat with AI to adjust this module
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#0a6879] focus:ring-2 focus:ring-[#0a6879]/40 transition-all"
                                placeholder='e.g., "Use FastAPI instead of Express"'
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && chatInput && handleCustomizationRequest(chatInput)}
                                autoFocus
                              />
                              <Button
                                size="icon"
                                className="absolute right-1 top-1 bottom-1 h-auto w-8 bg-transparent text-active hover:bg-active/10"
                                disabled={!chatInput}
                                onClick={() => handleCustomizationRequest(chatInput)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button variant="outline" size="sm" className="h-6 text-[10px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:text-[#0a6879]" onClick={() => handleCustomizationRequest("More practical exercises")}>More hands-on</Button>
                              <Button variant="outline" size="sm" className="h-6 text-[10px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:text-[#0a6879]" onClick={() => handleCustomizationRequest("Make it shorter")}>Fast-track</Button>
                            </div>
                            <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 text-xs text-slate-400 hover:text-slate-600" onClick={() => setIsEditing(false)}>Cancel</Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {sideQuest && !isGenerating && (
                      <div className="bg-ai/5 dark:bg-ai/10 border border-dashed border-ai/20 dark:border-ai/30 rounded-xl p-3 hover:border-ai/40 transition-all flex flex-col sm:flex-row gap-3 items-center">
                        <div className="w-8 h-8 rounded-lg bg-ai/10 dark:bg-ai/20 flex items-center justify-center shrink-0 border border-ai/20 dark:border-ai/40">
                          <Compass className="w-4 h-4 text-ai" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{sideQuest.title}</h4>
                            <span className="text-[9px] bg-ai/10 dark:bg-ai/20 text-ai px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">{sideQuest.type}</span>
                          </div>
                          <p className="text-neutral-meta text-xs leading-snug">{sideQuest.description}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-ai/5 dark:bg-ai/10 border border-ai/10 dark:border-ai/20 text-[10px] font-bold text-ai shadow-xs">
                            <Clock size={10} /> 20m
                          </div>
                          <Button size="sm" className="w-full sm:w-auto bg-ai hover:bg-ai/90 text-white text-xs h-7 px-4 shadow-sm shadow-ai/20 font-bold">Accept</Button>
                        </div>
                      </div>
                    )}

                    {isActive && !isGenerating && (
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-zinc-800/80 animate-in fade-in">
                        <Button size="sm" className="w-full sm:w-auto px-6 bg-active hover:bg-active/90 text-white shadow-md shadow-active/25 hover:shadow-active/40 transition-all sm:hover:scale-105 rounded-lg font-bold">
                          Start
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                        <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">approx. 45 mins at your pace</span>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Context Rail (40%) */}
                  <div className="lg:col-span-2 space-y-4 bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl p-4 border border-slate-100 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[11px] font-bold text-neutral-meta uppercase tracking-wider">Context</h4>
                    </div>

                    {why && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-active/10 p-1.5 rounded-lg">
                            <BrainCircuit className="w-4 h-4 text-active" />
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Why now?</h4>
                        </div>
                        <p className="text-xs text-neutral-meta leading-relaxed">
                          {why}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-meta">
                          <Code2 className="w-3.5 h-3.5" /> Project
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">Task Manager App</div>
                      </div>

                      {eta && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-meta">
                            <Clock size={14} /> ETA
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{eta}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
