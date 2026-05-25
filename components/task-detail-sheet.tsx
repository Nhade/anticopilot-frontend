import React from "react";
import {
  Zap,
  Target,
  Code2,
  CheckCircle2,
  Wand2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/task-item";
import { useStore } from "@/lib/store";
import { formatEstimatedTime } from "@/lib/format";
import type { LearningContentItem } from "@/lib/types";

export function TaskDetailSheet() {
  const {
    selectedTaskId,
    setSelectedTaskId,
    roadmaps,
    activeRoadmapId,
    generateSkillpathContent,
    contentGenerationStatus,
    contentGenerationError,
    pendingContentSkillpathId,
    openLearningContent,
  } = useStore();

  // Find the task in store data by skillpath ID (which transforms.ts sets as
  // `id`). Title-based matching used to be a fallback but it allowed wrong-task
  // matches on title collisions; all callers now pass the skillpath_id.
  let task = null;
  for (const roadmap of roadmaps) {
    for (const milestone of roadmap.milestones || []) {
      task = milestone.tasks.find(t => t.id === selectedTaskId);
      if (task) break;
    }
    if (task) break;
  }

  const handleOpenInVSCode = () => {
    const roadmapId = task?.roadmap_id || activeRoadmapId;
    const skillpathId = task?.skillpath_id || task?.id;
    if (!skillpathId || !roadmapId) return;
    const uri = `vscode://anticopilot.anti-copilot/open-task?roadmapId=${encodeURIComponent(roadmapId)}&taskId=${encodeURIComponent(skillpathId)}`;
    window.location.href = uri;
  };

  const learningContents = (task?.learning_contents || []) as LearningContentItem[];
  const hasContents = learningContents.length > 0;
  const targetRoadmapId = task?.roadmap_id || activeRoadmapId;
  const isGeneratingForThis =
    contentGenerationStatus === 'generating' &&
    pendingContentSkillpathId === (task?.skillpath_id || task?.id);

  const handleGenerateContent = async () => {
    if (!task || !targetRoadmapId) return;
    const skillpathId = task.skillpath_id || task.id;
    if (!skillpathId) return;
    try {
      await generateSkillpathContent(targetRoadmapId, skillpathId, { force: !task.need_generation });
    } catch (err) {
      console.error('Failed to generate skillpath content', err);
    }
  };

  return (
    <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
        <SheetHeader className="mb-2">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-active/10 text-active text-[10px] font-bold uppercase tracking-wider border border-active/20 shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              Active Task
            </span>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
              <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">{task?.title}</SheetTitle>
              {task?.estimated_hours ? (
                <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-300 shadow-sm whitespace-nowrap">
                  EST. {formatEstimatedTime(task.estimated_hours).toUpperCase()}
                </div>
              ) : null}
            </div>
            {task?.practice_mode && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 dark:border-indigo-500/30 text-[11px] font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  Practice mode: {task.practice_mode.replace(/_/g, ' ')}
                </div>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-8 mt-2 pb-24 px-4 overflow-y-auto h-full">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2">
              <Target className="w-4 h-4 text-active" /> Objective
            </h4>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {task?.subtitle || task?.description || "No description available."}
            </p>
          </div>

          {task?.learning_objectives && task.learning_objectives.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4">
                <CheckCircle2 className="w-4 h-4 text-active" /> Learning Objectives
              </h4>
              <div className="space-y-3">
                {task.learning_objectives.map((objective: string, idx: number) => (
                  <TaskItem
                    key={idx}
                    completed={task.status === "completed"}
                    text={objective}
                    active={task.status === "active" && idx === 0}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4">
              <BookOpen className="w-4 h-4 text-active" /> Learning Content
            </h4>
            {hasContents ? (
              <div className="space-y-4">
                {learningContents.map((content) => (
                  <LearningContentCard
                    key={content.content_id}
                    content={content}
                    onOpenLesson={(contentId) => {
                      openLearningContent(contentId);
                    }}
                  />
                ))}
              </div>
            ) : (
              <GenerateContentPanel
                onGenerate={handleGenerateContent}
                isGenerating={isGeneratingForThis}
                error={
                  contentGenerationStatus === 'error' &&
                  pendingContentSkillpathId === (task?.skillpath_id || task?.id)
                    ? contentGenerationError
                    : null
                }
                disabled={!task || !targetRoadmapId}
              />
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
          <Button
            className="w-full bg-active hover:bg-active/90 text-white rounded-xl shadow-xl shadow-active/20 transition-all active:scale-95 flex items-center justify-center gap-2 h-12 text-base font-bold"
            onClick={handleOpenInVSCode}
          >
            <Code2 className="w-5 h-5" />
            Open in VS Code
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}

function GenerateContentPanel({
  onGenerate,
  isGenerating,
  error,
  disabled,
}: {
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
  disabled: boolean;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-900/40 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
          <Wand2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
            No learning content yet
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Generate an article, coding problem, or quiz for this skill path so you can start practicing.
          </p>
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="break-words">{error}</span>
        </div>
      )}
      <Button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className="w-full bg-purple-500 hover:bg-purple-500/90 text-white"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" /> Generate Learning Content
          </>
        )}
      </Button>
    </div>
  );
}

function LearningContentCard({
  content,
  onOpenLesson,
}: {
  content: LearningContentItem;
  onOpenLesson: (contentId: string) => void;
}) {
  const meta = contentTypeMeta(content.content_type);

  return (
    <button
      type="button"
      onClick={() => onOpenLesson(content.content_id)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-active/40 hover:bg-active/[0.03] dark:hover:bg-active/[0.06] transition-colors group"
    >
      <div className={`w-9 h-9 rounded-lg ${meta.bg} ${meta.fg} flex items-center justify-center flex-shrink-0`}>
        <meta.Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500/70">
          {meta.label}
        </div>
        <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
          {content.title}
        </div>
        {content.description && (
          <div className="text-xs text-slate-500 dark:text-zinc-500 truncate mt-0.5">
            {content.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-zinc-500 group-hover:text-active transition-colors shrink-0">
        Open
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
}

function contentTypeMeta(type: LearningContentItem['content_type']) {
  switch (type) {
    case 'article':
      return { label: 'Article', Icon: BookOpen, bg: 'bg-active/10', fg: 'text-active' };
    case 'coding_problem':
      return { label: 'Coding Problem', Icon: Code2, bg: 'bg-orange-500/10', fg: 'text-orange-500' };
    case 'multiple_choice':
      return { label: 'Quiz', Icon: HelpCircle, bg: 'bg-purple-500/10', fg: 'text-purple-500' };
  }
}
