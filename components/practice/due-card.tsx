"use client";

import React from "react";
import { Clock, Play, Sparkles, BrainCircuit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { StrengthBar } from "@/components/ui/strength-bar";
import { MarkdownInline } from "@/components/learn/markdown-content";
import { reviewDisplayInfo, reviewReason } from "@/lib/review-display";
import type { ReviewConcept } from "@/lib/types";

interface DueCardProps {
  concept: ReviewConcept;
  onStart: () => void;
}

/** A due review in the queue — orange (review/decay) semantics throughout. */
export function DueCard({ concept, onStart }: DueCardProps) {
  const info = reviewDisplayInfo(concept);
  const tone = concept.source_type === "struggle_signal" ? "review" : "active";
  const lastSeen = concept.updated_at
    ? `seen ${formatDistanceToNow(new Date(concept.updated_at), { addSuffix: true })}`
    : "new concept";

  return (
    <div className="group bg-surface-lowest border border-review/25 rounded-2xl p-5 shadow-soft hover:shadow-card hover:border-review/40 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Chip tone={tone}>{info.sourceLabel}</Chip>
            {info.language && (
              <span className="text-[10px] font-mono font-bold text-meta border border-outline/45 rounded px-1.5 py-0.5">
                {info.language.toUpperCase()}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-meta font-medium">
              <Clock className="w-3 h-3" /> Due now
            </span>
          </div>
          <h3 className="text-lg font-bold text-ink font-display group-hover:text-active transition-colors">
            <MarkdownInline>{info.label}</MarkdownInline>
          </h3>
          {info.subtitle && (
            <p className="text-sm text-meta mt-1 leading-relaxed max-w-xl line-clamp-2">
              <MarkdownInline>{info.subtitle}</MarkdownInline>
            </p>
          )}
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-review/8 border border-review/20 px-2.5 py-1 text-[11px] font-medium text-review">
            <Sparkles className="w-3 h-3" /> {reviewReason(concept)}
          </div>
        </div>
        <div className="shrink-0 text-right w-32 hidden sm:block">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-meta mb-1.5">
            Memory
          </div>
          {concept.retrievability != null && concept.reps > 0 ? (
            <>
              <StrengthBar value={concept.retrievability} />
              <div className="text-[11px] text-meta mt-1.5">
                {concept.reps} review{concept.reps === 1 ? "" : "s"} · {lastSeen}
              </div>
            </>
          ) : (
            <div className="text-[11px] text-meta mt-1">First review</div>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-outline/35 flex items-center justify-between gap-3">
        <span className="text-[11px] text-meta inline-flex items-center gap-1.5">
          <BrainCircuit className="w-[13px] h-[13px]" /> A fresh drill is generated for this concept
        </span>
        <Button
          size="sm"
          onClick={onStart}
          className="bg-review hover:bg-review/90 text-white font-semibold font-display shrink-0 shadow-[0_8px_24px_-8px_rgba(188,92,14,.45)]"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Start review
        </Button>
      </div>
    </div>
  );
}
