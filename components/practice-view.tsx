import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, Check, X, ArrowRight, Clock, Calendar } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { GeneratedTask, ReviewConcept } from "@/lib/types";
import { formatDistanceToNow, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function PracticeView() {
  const { dueReviews, allReviews, fetchAllReviews, fetchDueReviews, generateReviewTask, submitReviewGrade, reviewsLoading, reviewsError } = useStore();
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<GeneratedTask | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);

  useEffect(() => {
    fetchDueReviews();
    fetchAllReviews();
  }, [fetchDueReviews, fetchAllReviews]);

  const handleStartPractice = async (conceptId: string) => {
    setLoading(true);
    setActiveConceptId(conceptId);
    setShowSolution(false);
    try {
      const task = await generateReviewTask(conceptId);
      setCurrentTask(task);
    } catch (e) {
      console.error(e);
      setActiveConceptId(null);
    }
    setLoading(false);
  };

  const handleGrade = async (grade: 1 | 2 | 3 | 4) => {
    if (!activeConceptId) return;
    setLoading(true);
    await submitReviewGrade(activeConceptId, grade);
    setCurrentTask(null);
    setShowSolution(false);
    setActiveConceptId(null);
    // Refresh lists
    fetchDueReviews();
    fetchAllReviews();
    setLoading(false);
  };

  const renderLanguageBadge = (language?: string) => {
    if (!language) return null;
    const colors: Record<string, string> = {
      python: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      typescript: "bg-blue-600/10 text-blue-600 border-blue-600/20",
      javascript: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      go: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      rust: "bg-orange-700/10 text-orange-700 border-orange-700/20",
    };

    return (
      <Badge variant="outline" className={`text-[10px] uppercase px-1.5 py-0 h-5 font-bold ${colors[language.toLowerCase()] || "bg-slate-500/10 text-slate-500"}`}>
        {language}
      </Badge>
    );
  };

  if (reviewsLoading && allReviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <div className="w-8 h-8 border-2 border-active border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-zinc-400">Loading practice queue...</p>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <X className="w-10 h-10 text-red-400" />
        <h2 className="text-lg font-semibold">Could not load reviews</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 text-center max-w-sm">{reviewsError}</p>
      </div>
    );
  }

  if (allReviews.length === 0 && !currentTask) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 pt-20">
        <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 text-slate-400 rounded-full flex items-center justify-center">
          <BrainCircuit size={40} />
        </div>
        <h2 className="text-2xl font-bold">No concepts tracked yet</h2>
        <p className="text-slate-500 dark:text-zinc-400 text-center max-w-sm">
          Start coding in VS Code and AntiCopilot will automatically identify concepts you should practice.
        </p>
      </div>
    );
  }

  if (currentTask) {
    return (
      <div className="max-w-3xl mx-auto py-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BrainCircuit className="text-active" />
            Concept Practice
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{currentTask.content}</ReactMarkdown>
          </div>

          {!showSolution ? (
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setShowSolution(true)} className="bg-active hover:bg-active/90">
                Show Solution <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-slate-50 dark:bg-zinc-950/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <h3 className="font-semibold mb-4">Solution</h3>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{currentTask.solution}</ReactMarkdown>
                </div>
              </div>
              
              <div className="border-t border-slate-200 dark:border-zinc-800 pt-6">
                <h3 className="text-center font-medium mb-4">How did you do?</h3>
                <div className="flex justify-center gap-2 md:gap-3">
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleGrade(1)} disabled={loading}>
                    Again (1)
                  </Button>
                  <Button variant="outline" size="sm" className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950" onClick={() => handleGrade(2)} disabled={loading}>
                    Hard (2)
                  </Button>
                  <Button variant="outline" size="sm" className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950" onClick={() => handleGrade(3)} disabled={loading}>
                    Good (3)
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => handleGrade(4)} disabled={loading}>
                    Easy (4)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const upcomingReviews = allReviews.filter(r => !isPast(new Date(r.due))).sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Queue</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">
            Strengthen your conceptual memory through spaced repetition.
          </p>
        </div>
      </div>

      {dueReviews.length > 0 ? (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-active" />
            <h2 className="text-lg font-semibold">Ready for Review ({dueReviews.length})</h2>
          </div>
          <div className="grid gap-4">
            {dueReviews.map((concept) => (
              <ConceptCard key={concept.concept_id} concept={concept} onStart={() => handleStartPractice(concept.concept_id)} loading={loading && activeConceptId === concept.concept_id} isDue={true} />
            ))}
          </div>
        </section>
      ) : (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6 mb-12 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shrink-0">
            <Check size={20} />
          </div>
          <div>
            <div className="font-semibold text-green-600 dark:text-green-400">You're caught up!</div>
            <p className="text-sm text-green-600/70 dark:text-green-400/70">All current concepts have been practiced. Your next review is waiting below.</p>
          </div>
        </div>
      )}

      {upcomingReviews.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Upcoming Practice</h2>
          </div>
          <div className="grid gap-4 opacity-70 hover:opacity-100 transition-opacity">
            {upcomingReviews.map((concept) => (
              <ConceptCard key={concept.concept_id} concept={concept} onStart={() => handleStartPractice(concept.concept_id)} loading={loading && activeConceptId === concept.concept_id} isDue={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ConceptCard({ concept, onStart, loading, isDue }: { concept: ReviewConcept, onStart: () => void, loading: boolean, isDue: boolean }) {
  const metadata = concept.concept_metadata;
  const conceptName = metadata.concept_name || metadata.concept || "Programming Concept";
  const language = metadata.language;
  const dueTime = new Date(concept.due);

  return (
    <div className={`bg-white dark:bg-zinc-900 border ${isDue ? 'border-active/30 dark:border-active/20 shadow-xs' : 'border-slate-200 dark:border-zinc-800'} p-5 rounded-xl flex items-center justify-between hover:shadow-md transition-all group`}>
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDue ? 'text-active' : 'text-slate-400'}`}>
            {concept.source_type === 'struggle_signal' ? 'Weakness' : 'Skill Path'}
          </span>
          {language && (
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-slate-200 dark:border-zinc-800 font-mono">
              {language.toUpperCase()}
            </Badge>
          )}
        </div>
        <h3 className="text-base font-semibold truncate group-hover:text-active transition-colors">{conceptName}</h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {isDue ? "Ready now" : `Due ${formatDistanceToNow(dueTime, { addSuffix: true })}`}
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
          <div>{concept.reps} reviews</div>
          {metadata.misconception && (
            <>
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
              <div className="truncate italic max-w-[200px]" title={metadata.misconception}>
                Targeting previous mistake
              </div>
            </>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onStart} 
        disabled={loading}
        size="sm"
        variant={isDue ? "default" : "secondary"}
        className={`shrink-0 ${isDue ? 'bg-active hover:bg-active/90' : ''}`}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <BrainCircuit className="w-3 h-3 mr-2" />}
        {loading ? "Generating..." : (isDue ? "Practice Now" : "Review Early")}
      </Button>
    </div>
  );
}
