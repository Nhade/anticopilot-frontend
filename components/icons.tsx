import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function ClockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function RoadmapNode({ status, title, desc }: { status: "completed" | "active" | "upcoming"; title: string; desc: string }) {
  const isCompleted = status === "completed";
  const isActive = status === "active";

  return (
    <div className={cn("flex gap-4 group", !isCompleted && !isActive && "opacity-60")}>
      <div className="relative z-10 mt-1 shrink-0">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 transition-colors",
          isCompleted ? "bg-[#36685c] border-[#36685c] text-white" :
            isActive ? "bg-white dark:bg-zinc-950 border-[#0a6879] dark:border-[#98e3f5] text-[#0a6879] dark:text-[#98e3f5]" :
              "bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500"
        )}>
          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : isActive ? <div className="w-2 h-2 rounded-full bg-[#0a6879] dark:bg-[#98e3f5] animate-pulse" /> : null}
        </div>
      </div>
      <div>
        <h4 className={cn("text-sm font-semibold mb-1 transition-colors", isActive ? "text-[#005c6b] dark:text-[#98e3f5]" : isCompleted ? "text-slate-800 dark:text-zinc-300" : "text-slate-500 dark:text-zinc-500")}>
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-zinc-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
