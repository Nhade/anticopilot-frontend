import React from "react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon, label, active, compact, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      title={compact ? label : undefined}
      aria-label={label}
      className={cn(
        "w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 group relative",
        compact ? "justify-center py-2.5" : "gap-3 px-3 py-2.5",
        active
          ? "text-slate-900 bg-slate-200/50 dark:text-zinc-100 dark:bg-zinc-800/50"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/30"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0a6879] rounded-r-full" />
      )}
      <span className={cn("transition-colors", active ? "text-[#0a6879] dark:text-[#98e3f5]" : "group-hover:text-slate-700 dark:group-hover:text-zinc-300")}>
        {icon}
      </span>
      {!compact && label}
    </button>
  );
}
