import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed } from "lucide-react";

interface TaskItemProps {
  completed: boolean;
  text: string;
  active?: boolean;
}

export function TaskItem({ completed, text, active }: TaskItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all",
      active ? "bg-white dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 scale-[1.01] shadow-xs dark:shadow-none" : "hover:bg-slate-100 dark:hover:bg-zinc-900/80"
    )}>
      {completed ? (
        <CheckCircle2 className="w-5 h-5 text-[#36685c] shrink-0" />
      ) : active ? (
        <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
          <CircleDashed className="w-5 h-5 text-[#0a6879] dark:text-[#98e3f5] animate-[spin_4s_linear_infinite]" />
          <span className="absolute w-1.5 h-1.5 bg-[#0a6879] dark:bg-[#98e3f5] rounded-full" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-zinc-700 shrink-0" />
      )}
      <span className={cn("text-sm transition-colors", completed ? "text-slate-400 dark:text-zinc-500 line-through" : active ? "text-slate-900 dark:text-[#98e3f5] font-medium" : "text-slate-600 dark:text-zinc-300")}>
        {text}
      </span>
    </div>
  );
}
