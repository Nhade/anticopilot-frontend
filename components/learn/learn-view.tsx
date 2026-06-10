"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Map as MapIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { LearnContentRail } from "./learn-content-rail";
import { ArticleReader } from "./article-reader";
import { ArticleToc } from "./article-toc";
import { CodingProblemHandoff } from "./coding-problem-handoff";
import { QuizCard } from "./quiz-card";
import { LessonFooter } from "./lesson-footer";

export function LearnView() {
  const {
    activeContentId,
    setActiveContentId,
    findLearningContent,
    setActiveTab,
    roadmaps,
    completedContentIds,
  } = useStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressRaf = useRef(0);

  // `findLearningContent` reads `get().roadmaps` internally, so we include
  // `roadmaps` in the dep array — otherwise `located` stays cached against the
  // old roadmap shape after content generation/regeneration.
  const located = useMemo(
    () => {
      void roadmaps;
      return activeContentId ? findLearningContent(activeContentId) : undefined;
    },
    [activeContentId, findLearningContent, roadmaps]
  );

  // If the saved contentId no longer resolves (deleted, roadmap reloaded), clear it.
  useEffect(() => {
    if (activeContentId && !located) {
      setActiveContentId(null);
    }
  }, [activeContentId, located, setActiveContentId]);

  // Reset scroll + reading progress when switching lessons.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    if (progressRef.current) progressRef.current.style.transform = "scaleX(0)";
  }, [activeContentId]);

  useEffect(() => () => cancelAnimationFrame(progressRaf.current), []);

  if (!located) {
    return (
      <div className="h-full w-full flex items-center justify-center px-8">
        <div className="text-center max-w-md anim-fade-up">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-active/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-active" />
          </div>
          <h2 className="text-xl font-bold text-ink font-display mb-2">
            No lesson selected
          </h2>
          <p className="text-sm text-meta mb-6">
            Pick a learning content from your roadmap to start reading.
          </p>
          <Button
            onClick={() => setActiveTab("roadmap")}
            className="bg-active hover:bg-active/90 text-white font-display font-semibold"
          >
            <MapIcon className="w-4 h-4 mr-2" />
            Go to Roadmap
          </Button>
        </div>
      </div>
    );
  }

  const { content, skillpath } = located;
  const contents = skillpath.learning_contents || [];
  const currentIdx = contents.findIndex((c) => c.content_id === content.content_id);

  // A skillpath completed at the backend level means every lesson is done.
  const skillpathCompleted = skillpath.status === "completed";
  const completedIds = new Set(
    skillpathCompleted
      ? contents.map((c) => c.content_id)
      : contents
          .map((c) => c.content_id)
          .filter((id) => completedContentIds[id])
  );

  // Updating React state here would re-render the whole view — rail, footer,
  // and the full markdown tree — on every scroll tick. Write the bar's
  // transform directly instead, throttled to one layout read per frame.
  const onScroll = () => {
    if (progressRaf.current) return;
    progressRaf.current = requestAnimationFrame(() => {
      progressRaf.current = 0;
      const el = scrollRef.current;
      const bar = progressRef.current;
      if (!el || !bar) return;
      const max = el.scrollHeight - el.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, el.scrollTop / max) : 0})`;
    });
  };

  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden">
      <LearnContentRail
        skillpath={skillpath}
        contents={contents}
        activeContentId={content.content_id}
        completedIds={completedIds}
        onSelect={(id) => setActiveContentId(id)}
        onBackToRoadmap={() => setActiveTab("roadmap")}
      />
      <main className="flex flex-col h-full overflow-hidden relative">
        {/* reading progress */}
        <div className="absolute top-0 left-0 right-0 h-0.5 z-20 bg-transparent">
          <div
            ref={progressRef}
            className="h-full w-full bg-active origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
          {/* 44rem keeps the reading measure ~75ch at 15.5px — max-w-3xl made
              article lines uncomfortably long. */}
          <div className="max-w-[44rem] mx-auto px-8 py-10 pb-24">
            {content.content_type === "article" && <ArticleReader article={content} />}
            {content.content_type === "coding_problem" && (
              <CodingProblemHandoff problem={content} skillpath={skillpath} />
            )}
            {content.content_type === "multiple_choice" && <QuizCard quiz={content} />}
          </div>
        </div>
        {content.content_type === "article" && (
          <ArticleToc scrollRef={scrollRef} contentId={content.content_id} />
        )}
        <LessonFooter
          contents={contents}
          currentIdx={currentIdx}
          onSelect={(id) => setActiveContentId(id)}
          completed={completedIds.has(content.content_id)}
          skillpath={skillpath}
          roadmapId={located.roadmapId}
        />
      </main>
    </div>
  );
}
