import React from "react";

interface AdaptationItemProps {
  icon: React.ReactNode;
  time: string;
  text: string;
}

export function AdaptationItem({ icon, time, text }: AdaptationItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 shadow-xs">
        {icon}
      </div>
      <div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 mb-0.5">{time}</div>
        <p className="text-sm text-slate-800 dark:text-zinc-300 leading-snug">{text}</p>
      </div>
    </div>
  );
}
