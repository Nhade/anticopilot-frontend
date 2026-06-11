"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: "w-6 h-6",
  md: "w-9 h-9",
  lg: "w-11 h-11",
} as const;

interface LoadingProps {
  /** A single message, or several that crossfade on a loop while loading. */
  messages?: string | string[];
  /** Lay the spinner and text out in a row instead of a centered column. */
  inline?: boolean;
  size?: keyof typeof SIZES;
  /** Tailwind text-* class driving the spinner colour. */
  tone?: string;
  className?: string;
}

/**
 * App-wide loading indicator: a spinning comet ring with a breathing core
 * (see `.ac-spinner` in globals.css), paired with optional loading text that
 * crossfades between a few messages so longer waits feel alive.
 */
export function Loading({
  messages,
  inline = false,
  size = "md",
  tone = "text-active",
  className,
}: LoadingProps) {
  const list = Array.isArray(messages) ? messages : messages ? [messages] : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 2200);
    return () => clearInterval(id);
  }, [list.length]);

  const current = list[Math.min(index, Math.max(list.length - 1, 0))];

  return (
    <div
      className={cn(
        inline ? "flex items-center gap-3" : "flex flex-col items-center justify-center gap-4",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={current ?? "Loading"}
    >
      <span className={cn("ac-spinner", SIZES[size], tone)} aria-hidden />
      {current && (
        // Re-mounting on each message replays the fade for a soft crossfade.
        <p key={index} className="anim-fade-in text-sm text-meta">
          {current}
        </p>
      )}
    </div>
  );
}
