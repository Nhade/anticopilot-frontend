import React from "react";
import { cn } from "@/lib/utils";

interface ContextCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  highlight?: string;
}

export function ContextCard({ icon, title, text, highlight }: ContextCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3 flex flex-col justify-center shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="text-slate-400 dark:text-zinc-500">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-neutral-meta uppercase tracking-wider">{title}</span>
      </div>
      <div className={cn("text-xs font-semibold text-slate-800 dark:text-zinc-200", highlight)}>
        {text}
      </div>
    </div>
  );
}
