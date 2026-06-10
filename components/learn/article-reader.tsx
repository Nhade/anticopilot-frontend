"use client";

import React from "react";
import { BookOpen, ExternalLink, BrainCircuit } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import type { ArticleLearningContent } from "@/lib/types";
import { MarkdownContent, MarkdownInline } from "./markdown-content";

interface ArticleReaderProps {
  article: ArticleLearningContent;
}

export function ArticleReader({ article }: ArticleReaderProps) {
  return (
    <article className="anim-fade-up">
      <header className="mb-7">
        <div className="flex items-center gap-2 mb-4">
          <Chip tone="neutral" icon={BookOpen}>
            Reading
          </Chip>
        </div>
        {/* 1.25 leaves room for inline-code pills (0.875em box + padding) —
            1.1 made wrapped title lines clip/overlap them. */}
        <h1 className="text-[34px] leading-[1.25] font-bold tracking-tight text-ink font-display mb-3">
          <MarkdownInline className="[&_code]:text-[0.8em]">{article.title}</MarkdownInline>
        </h1>
        {article.description && (
          <p className="text-[17px] text-meta leading-relaxed">
            <MarkdownInline>{article.description}</MarkdownInline>
          </p>
        )}
      </header>

      {article.skill_intro && (
        <div className="mb-8 rounded-2xl bg-active/6 border border-active/20 p-5 flex gap-4">
          <div className="w-9 h-9 rounded-xl bg-active/12 text-active flex items-center justify-center shrink-0">
            <BrainCircuit className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-active mb-1 font-display">
              Why this matters for you
            </div>
            <p className="text-[14.5px] text-ink/90 leading-relaxed">
              <MarkdownInline>{article.skill_intro}</MarkdownInline>
            </p>
          </div>
        </div>
      )}

      <MarkdownContent>{article.reading_content}</MarkdownContent>

      {article.references && article.references.length > 0 && (
        <div className="mt-12 pt-6 border-t border-outline/40">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-meta mb-3 font-display">
            References
          </div>
          <ul className="space-y-2">
            {article.references.map((ref, idx) => (
              <li key={idx}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-active hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {ref.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
