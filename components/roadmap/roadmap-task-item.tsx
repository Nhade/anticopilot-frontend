import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RoadmapTaskItemProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: "active" | "upcoming" | "completed" | "review";
  type?: "learn" | "practice" | "apply" | "optional";
  onTaskClick?: (id: string) => void;
}

export function RoadmapTaskItem({
  id,
  icon,
  title,
  subtitle,
  status,
  type,
  onTaskClick
}: RoadmapTaskItemProps) {
  const isActive = status === "active";
  const isCompleted = status === "completed";
  const isReview = status === "review";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg transition-all border",
        (isActive || isCompleted || isReview) && "cursor-pointer hover:scale-[1.01] hover:shadow-sm",
        isActive
          ? "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-xs"
          : isCompleted ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/30"
            : isReview ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/30"
              : "bg-slate-50/50 dark:bg-zinc-900/50 border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800/80"
      )}
      onClick={onTaskClick ? () => onTaskClick(id) : undefined}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2",
        isActive
          ? "bg-active/10 border-active text-active"
          : isCompleted ? "bg-success/10 border-success/30 text-success"
            : isReview ? "bg-review/10 border-review/50 text-review"
              : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500"
      )}>
        {isActive ? (
          <div className="relative flex items-center justify-center">
            {icon}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-active rounded-full border-2 border-white dark:border-zinc-800 animate-pulse" />
          </div>
        ) : icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h5 className={cn("text-sm font-semibold",
            isActive ? "text-slate-900 dark:text-zinc-100"
              : isCompleted ? "text-slate-700 dark:text-zinc-300 line-through decoration-slate-300 dark:decoration-zinc-700"
                : isReview ? "text-amber-800 dark:text-amber-200"
                  : "text-slate-600 dark:text-zinc-400"
          )}>{title}</h5>
          {type && (
            <span className={cn(
              "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border",
              type === "learn" ? "bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30" :
                type === "practice" ? "bg-violet-100/50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/30" :
                  type === "apply" ? "bg-success/15 text-success border-success/20" :
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            )}>
              {type}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-500">{subtitle}</p>
      </div>
      {isActive && (
        <Button variant="ghost" size="sm" className="hidden sm:flex text-active hover:bg-active/10 h-7 text-[10px] font-bold uppercase px-2 pointer-events-none">
          Active task
        </Button>
      )}
      {isReview && (
        <span className="text-[10px] font-bold uppercase bg-review/15 text-review px-2 py-0.5 rounded-full border border-review/20">
          Review
        </span>
      )}
    </div>
  );
}
