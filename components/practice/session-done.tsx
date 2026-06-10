"use client";

import React from "react";
import { Award, ArrowLeft, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/ui/stat-pill";

interface SessionDoneProps {
  count: number;
  /** Average retention across tracked concepts (0..1), if computable. */
  retention: number | null;
  onBack: () => void;
}

export function SessionDone({ count, retention, onBack }: SessionDoneProps) {
  return (
    <div className="max-w-xl mx-auto pt-10 text-center anim-pop">
      <div className="w-20 h-20 rounded-full bg-success/12 text-success flex items-center justify-center mx-auto mb-5">
        <Award className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-ink font-display">
        Review session complete
      </h2>
      <p className="text-meta mt-2 max-w-sm mx-auto">
        You reinforced {count} concept{count === 1 ? "" : "s"}. Each is
        rescheduled at the interval you picked — we&apos;ll resurface them right
        before they decay.
      </p>
      <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
        <StatPill icon={CheckCircle2} label="Reviewed" value={`${count} today`} tone="success" />
        {retention != null && (
          <StatPill
            icon={TrendingUp}
            label="Avg. retention"
            value={`${Math.round(retention * 100)}%`}
            tone="active"
          />
        )}
      </div>
      <Button
        onClick={onBack}
        className="mt-7 bg-active hover:bg-active/90 text-white font-semibold font-display"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to queue
      </Button>
    </div>
  );
}
