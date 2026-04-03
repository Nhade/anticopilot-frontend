import React from "react";
import {
  Zap,
  Target,
  BrainCircuit,
  Code2,
  CheckCircle2,
  MessageSquare,
  Wand2,
  Sparkles,
  Play,
  Map,
  Clock,
  LucideIcon
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/task-item";
import { useStore } from "@/lib/store";

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Target,
  BrainCircuit,
  Code2,
  CheckCircle2,
  MessageSquare,
  Wand2,
  Sparkles,
  Play,
  Map,
  Clock
};

export function TaskDetailSheet() {
  const { selectedTaskId, setSelectedTaskId, roadmaps, activeRoadmapId } = useStore();

  // Find the task in store data
  let task = null;
  for (const roadmap of roadmaps) {
    for (const milestone of roadmap.milestones || []) {
      task = milestone.tasks.find(t => t.title === selectedTaskId || t.id === selectedTaskId);
      if (task) break;
    }
    if (task) break;
  }

  const handleOpenInVSCode = () => {
    if (!selectedTaskId || !activeRoadmapId) return;
    const uri = `vscode://anticopilot.anti-copilot/open-task?roadmapId=${activeRoadmapId}&taskId=${selectedTaskId}`;
    window.location.href = uri;
  };

  const IconComp = task?.icon ? iconMap[task.icon] || Target : Target;

  return (
    <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
        <SheetHeader className="mb-2">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-active/10 text-active text-[10px] font-bold uppercase tracking-wider border border-active/20 shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              Active Task
            </span>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80">
              <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">{task?.title}</SheetTitle>
              <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-300 shadow-sm">
                EST. 45M
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 dark:border-indigo-500/30 text-[11px] font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Suggested because: recent auth work + stuck signal in AuthModal.tsx
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-8 mt-2 pb-24 px-4 overflow-y-auto h-full">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2">
              <Target className="w-4 h-4 text-active" /> Objective
            </h4>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {task?.subtitle || "Implement specific logic according to roadmap requirements."}
            </p>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2">
              <BrainCircuit className="w-4 h-4 text-active" /> Why it matters
            </h4>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              This task is a critical step in mastering the current milestone. It unblocks further progress and solidifies core concepts discovered through your recent coding activity.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
            <div className="text-xs font-bold text-slate-500/60 uppercase tracking-wider mb-2">Linked Project Context</div>
            <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-zinc-100 font-medium">
              <Code2 className="w-4 h-4 text-slate-400" /> Task Manager App
            </div>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4">
              <CheckCircle2 className="w-4 h-4 text-active" /> Acceptance Criteria
            </h4>
            <div className="space-y-3">
              {task?.learning_objectives && task.learning_objectives.length > 0 ? (
                task.learning_objectives.map((objective: string, idx: number) => (
                  <TaskItem
                    key={idx}
                    completed={task.status === "completed"}
                    text={objective}
                    active={task.status === "active" && idx === 0}
                  />
                ))
              ) : (
                <>
                  <TaskItem completed={true} text="Component structure matches design tokens" />
                  <TaskItem completed={false} text="State updates correctly handle async boundaries" active />
                  <TaskItem completed={false} text="Edge cases for missing data are covered" />
                </>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80">
            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500/60 uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Agent Actions
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="justify-start h-auto py-2.5 px-3 border-slate-200 dark:border-zinc-800 hover:bg-active/5 hover:text-active hover:border-active/30 group transition-all bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 group-hover:bg-active/10 flex items-center justify-center transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500/60 group-hover:text-active" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Explain this task</div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-2.5 px-3 border-slate-200 dark:border-zinc-800 hover:bg-active/5 hover:text-active hover:border-active/30 group transition-all bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 group-hover:bg-active/10 flex items-center justify-center transition-colors">
                    <Wand2 className="w-3.5 h-3.5 text-slate-500/60 group-hover:text-active" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Generate starter implementation</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
          <Button
            className="w-full bg-active hover:bg-active/90 text-white rounded-xl shadow-xl shadow-active/20 transition-all active:scale-95 flex items-center justify-center gap-2 h-12 text-base font-bold"
            onClick={handleOpenInVSCode}
          >
            <Code2 className="w-5 h-5" />
            Open in VS Code
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
