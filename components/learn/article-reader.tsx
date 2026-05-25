"use client";

import React from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import type { ArticleLearningContent } from "@/lib/types";
import { MarkdownContent } from "./markdown-content";

interface ArticleReaderProps {
  article: ArticleLearningContent;
}

export function ArticleReader({ article }: ArticleReaderProps) {
  return (
    <article>
      <header className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-active/10 text-active text-[10px] font-bold uppercase tracking-wider border border-active/20 mb-4">
          <BookOpen className="w-3 h-3" />
          Reading
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-3 leading-tight">
          {article.title}
        </h1>
        {article.description && (
          <p className="text-base text-slate-500 dark:text-zinc-400 leading-relaxed">
            {article.description}
          </p>
        )}
      </header>

      {article.skill_intro && (
        <div className="mb-8 p-5 rounded-xl bg-active/5 border border-active/15">
          <p className="text-[15px] text-slate-700 dark:text-zinc-300 leading-relaxed">
            {article.skill_intro}
          </p>
        </div>
      )}

      <MarkdownContent>{article.reading_content}</MarkdownContent>

      {article.references && article.references.length > 0 && (
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-zinc-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500/70 mb-3">
            References
          </div>
          <ul className="space-y-2">
            {article.references.map((ref, idx) => (
              <li key={idx}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-active hover:underline"
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
