import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UIHints } from "@/lib/api-client";

interface UIHintsInputProps {
  hints: UIHints;
  disabled?: boolean;
  onSubmit: (text: string) => void;
}

// Renders the agent's suggested answers for choice/confirm turns. These are
// hints, not constraints — the free-text composer below stays usable, so a
// user can always answer in their own words instead.
export function UIHintsInput({ hints, disabled, onSubmit }: UIHintsInputProps) {
  const [selected, setSelected] = useState<string[]>([]);

  if (hints.type === "text_input") return null;

  if (hints.type === "confirm") {
    const options = hints.options.length > 0 ? hints.options : ["Yes, sounds good", "Not yet"];
    return (
      <Shell>
        <div className="flex flex-wrap gap-2">
          {options.map((option, index) => (
            <Button
              key={option}
              disabled={disabled}
              onClick={() => onSubmit(option)}
              className={cn(
                "rounded-xl font-semibold",
                index === 0
                  ? "bg-active hover:bg-active/90 text-white shadow-sm shadow-active/20"
                  : "bg-transparent border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              )}
            >
              {option}
            </Button>
          ))}
        </div>
      </Shell>
    );
  }

  if (hints.type === "single_choice") {
    return (
      <Shell>
        <div className="flex flex-col gap-2">
          {hints.options.map((option) => (
            <button
              key={option}
              disabled={disabled}
              onClick={() => onSubmit(option)}
              className="text-left px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 text-sm text-slate-700 dark:text-zinc-300 hover:border-active/50 hover:bg-active/5 dark:hover:bg-active/10 transition-colors disabled:opacity-50"
            >
              {option}
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  // multi_choice — toggle chips plus an explicit confirm, joined as one
  // plain-text answer (the agent parses free text; see PR #13 contract).
  const toggle = (option: string) =>
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );

  return (
    <Shell>
      <div className="flex flex-wrap gap-2 mb-3">
        {hints.options.map((option) => {
          const isOn = selected.includes(option);
          return (
            <button
              key={option}
              disabled={disabled}
              onClick={() => toggle(option)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm transition-colors disabled:opacity-50",
                isOn
                  ? "border-active/60 bg-active/10 text-active font-semibold"
                  : "border-slate-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-300 hover:border-active/40"
              )}
            >
              {isOn && <Check className="w-3.5 h-3.5" />}
              {option}
            </button>
          );
        })}
      </div>
      <Button
        size="sm"
        disabled={disabled || selected.length === 0}
        onClick={() => onSubmit(selected.join(", "))}
        className="bg-active hover:bg-active/90 text-white rounded-xl font-semibold"
      >
        Confirm selection
      </Button>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pl-11 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {children}
      <p className="text-[11px] text-slate-400 dark:text-zinc-600 mt-2">
        Or type your own answer below.
      </p>
    </div>
  );
}
