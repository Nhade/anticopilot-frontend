import React from "react";
import {
  Activity,
  Target,
  BrainCircuit,
  Zap,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskItem } from "./task-item";
import { ClockIcon } from "./icons";
import { useStore } from "@/lib/store";

export function DashboardView() {
  const { user, setSelectedTaskId } = useStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Greeting */}
      <section className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Good evening, {user.name}.
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 text-base max-w-2xl">
          You have a decaying concept to review, then 25 minutes of auth work ahead.
        </p>
      </section>

      {/* PRIMARY MODULE: Review Blocker (dominant CTA) */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">
        <div className="relative overflow-hidden rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group transition-colors duration-300" onClick={() => { setSelectedTaskId("useEffect dependencies"); }}>
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="absolute inset-0 bg-linear-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="w-12 h-12 rounded-full bg-white dark:bg-amber-900/20 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-700/30 shadow-sm dark:shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Activity className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">Review blocker</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-1">useEffect dependencies</h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Repeated issue in <code className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-1 py-0.5 rounded text-xs">AuthModal.tsx</code> yesterday. Solidifying this unblocks cleaner hooks in the next milestone.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-meta font-medium">
              <BrainCircuit className="w-3.5 h-3.5" />
              Based on recent bug pattern
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 z-10">
            <Button
              className="bg-review hover:bg-review/90 text-white border-0 shadow-lg shadow-review/20 transition-all group-hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-review focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#09090b]"
              onClick={() => setSelectedTaskId("useEffect dependencies")}
            >
              <Target className="w-4 h-4 mr-2" />
              Start review
            </Button>
            <Button variant="outline" className="border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-sm" onClick={(e) => { e.stopPropagation(); }}>
              Snooze for today
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SECONDARY MODULE: Up Next After Review */}
        <section className="lg:col-span-2 space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-500">Up next after review</h2>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors duration-200">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-zinc-500">
                      <Zap className="w-3 h-3" /> Active project iteration
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">Complete client auth loop</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md">
                    JWT validation on the client - you already wrote the backend logic yesterday.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center ml-4 shrink-0">
                  <span className="text-sm font-bold text-slate-600 dark:text-zinc-300">65%</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <TaskItem completed={true} text="Token stored and initialized on auth state" />
                <TaskItem completed={true} text="AuthContext structure validated against backend contract" />
                <TaskItem completed={false} text="Stored token initializes auth state on page reload" active />
                <TaskItem completed={false} text="Unauthenticated users redirect to login on mount" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1.5">
                  <ClockIcon size={13} /> Est. 25 min remaining
                </span>
                <Button variant="outline" size="sm" className="border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 h-8">
                  <Code2 className="w-3.5 h-3.5" />
                  Open in VS Code
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* TERTIARY: Today at a Glance */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <h2 className="text-sm font-bold text-neutral-meta uppercase tracking-wider">Today at a glance</h2>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-active/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-active" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-meta font-bold uppercase tracking-wider">Streak</div>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">{user.streak} days</div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-active/10 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-active" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-meta font-bold uppercase tracking-wider">Today's pace</div>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">On track</div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-active/10 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-active" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-meta font-bold uppercase tracking-wider">Active roadmap</div>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">Auth & State</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
