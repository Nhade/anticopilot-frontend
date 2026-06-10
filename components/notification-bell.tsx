"use client";

import React, { useEffect, useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { reviewDisplayInfo, reviewReason } from "@/lib/review-display";

/**
 * Header notification bell backed by live due reviews — the one real
 * "attention" signal the system has. Clicking a notification (or "View all")
 * lands on the Practice queue.
 */
export function NotificationBell() {
  const { dueReviews, fetchDueReviews, setActiveTab } = useStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchDueReviews();
  }, [fetchDueReviews]);

  const goToPractice = () => {
    setOpen(false);
    setActiveTab("practice");
  };

  const top = dueReviews.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            dueReviews.length > 0
              ? `Notifications: ${dueReviews.length} reviews due`
              : "Notifications"
          }
          className="relative text-slate-500/60 hover:text-slate-900 dark:hover:text-zinc-100 rounded-full"
        >
          <Bell className="w-5 h-5" />
          {dueReviews.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-review text-white text-[9px] font-bold rounded-full border border-white dark:border-zinc-950 flex items-center justify-center font-display pointer-events-none">
              {dueReviews.length > 9 ? "9+" : dueReviews.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-outline/35">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-meta font-display">
            Notifications
          </div>
        </div>

        {top.length === 0 ? (
          <div className="px-4 py-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-success/12 text-success flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-[18px] h-[18px]" />
            </div>
            <p className="text-sm text-meta">
              You&apos;re all caught up — nothing needs your attention.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline/25 max-h-80 overflow-y-auto">
            {top.map((concept) => {
              const info = reviewDisplayInfo(concept);
              return (
                <button
                  key={concept.concept_id}
                  onClick={goToPractice}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-low/60 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-review/12 text-review flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-[15px] h-[15px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate font-display">
                      {info.label}
                    </div>
                    <div className="text-xs text-meta mt-0.5">
                      <span className="font-bold uppercase tracking-[0.1em] text-[9px] text-review mr-1">
                        Decaying
                      </span>
                      {reviewReason(concept)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {dueReviews.length > 0 && (
          <button
            onClick={goToPractice}
            className="w-full px-4 py-2.5 border-t border-outline/35 text-xs font-semibold text-active hover:bg-surface-low/60 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            View all {dueReviews.length} in Practice <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
