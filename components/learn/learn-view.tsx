"use client";

import React, { useEffect, useMemo } from "react";
import { Map as MapIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { LearnContentRail } from "./learn-content-rail";
import { ArticleReader } from "./article-reader";
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
  } = useStore();

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

  if (!located) {
    return (
      <div className="h-full w-full flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-active/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-active" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
            No lesson selected
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
            Pick a learning content from your roadmap to start reading.
          </p>
          <Button
            onClick={() => setActiveTab("roadmap")}
            className="bg-active hover:bg-active/90 text-white"
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

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] overflow-hidden">
      <LearnContentRail
        skillpath={skillpath}
        contents={contents}
        activeContentId={content.content_id}
        onSelect={(id) => setActiveContentId(id)}
        onBackToRoadmap={() => setActiveTab("roadmap")}
      />
      <main className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-10 pb-32">
            {content.content_type === "article" && (
              <ArticleReader article={content} />
            )}
            {content.content_type === "coding_problem" && (
              <CodingProblemHandoff
                problem={content}
                skillpath={skillpath}
              />
            )}
            {content.content_type === "multiple_choice" && (
              <QuizCard quiz={content} />
            )}
          </div>
        </div>
        <LessonFooter
          contents={contents}
          currentIdx={currentIdx}
          onSelect={(id) => setActiveContentId(id)}
          skillpath={skillpath}
          roadmapId={located.roadmapId}
        />
      </main>
    </div>
  );
}
