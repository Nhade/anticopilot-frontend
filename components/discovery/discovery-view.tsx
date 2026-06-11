"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, BrainCircuit, Loader2, Map as MapIcon, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/learn/markdown-content";
import { useStore } from "@/lib/store";
import { UIHintsInput } from "./ui-hints-input";

// Conversational roadmap creation (Mode A — spacious, single focused column).
// The discovery agent asks a few questions, then hands off to the learning
// director; we show a generation panel and the store navigates to the new
// roadmap once it lands.
export function DiscoveryView() {
  const { discovery, startDiscovery, sendDiscoveryMessage, resetDiscovery, setActiveTab } =
    useStore();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isThinking = discovery.status === "awaiting_agent" || discovery.status === "starting";
  const isGenerating = discovery.status === "generating_roadmap";
  const canSend = discovery.status === "awaiting_user";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [discovery.messages, discovery.status, discovery.uiHints]);

  useEffect(() => {
    if (canSend) textareaRef.current?.focus();
  }, [canSend]);

  // Grow the composer as input wraps onto new lines, capped at ~6 rows
  // (max-h-32); beyond that it scrolls.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft]);

  const submitDraft = () => {
    if (!draft.trim() || !canSend) return;
    sendDiscoveryMessage(draft);
    setDraft("");
  };

  const exitDiscovery = () => {
    resetDiscovery();
    setActiveTab("manage-roadmaps");
  };

  // Reached directly (e.g. tab restored) without a session — offer to start one.
  if (discovery.status === "idle") {
    return (
      <div className="h-full w-full flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-ai/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-ai" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
            Create a new roadmap
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
            Chat with the discovery agent about what you want to learn, and it will shape a
            personalized roadmap for you.
          </p>
          <Button onClick={() => startDiscovery()} className="bg-active hover:bg-active/90 text-white font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Start goal discovery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-8 pt-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ai/10 text-ai text-[10px] font-bold uppercase tracking-wider border border-ai/20">
              <Sparkles className="w-3 h-3" />
              Goal Discovery
            </span>
            {discovery.isMock && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                Mock conversation
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={exitDiscovery}
            title="Leave discovery"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="max-w-2xl mx-auto py-8 space-y-6">
          {discovery.messages.map((message, index) =>
            message.role === "agent" ? (
              <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <AgentAvatar />
                <MarkdownContent
                  className={cn(
                    "flex-1 min-w-0 pt-1.5",
                    // Compact the Learn-view prose defaults down to chat scale.
                    "prose-p:text-sm prose-p:leading-relaxed prose-p:my-2",
                    "prose-li:text-sm prose-li:leading-relaxed prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2",
                    "prose-h1:text-[15px] prose-h1:mt-4 prose-h1:mb-2",
                    "prose-h2:text-[15px] prose-h2:mt-4 prose-h2:mb-2 prose-h2:pb-0 prose-h2:border-0",
                    "prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1.5",
                    "prose-h4:text-sm prose-h4:mt-3 prose-h4:mb-1.5"
                  )}
                >
                  {message.text}
                </MarkdownContent>
              </div>
            ) : (
              <div key={index} className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-active text-white text-sm leading-relaxed whitespace-pre-wrap shadow-sm shadow-active/20">
                  {message.text}
                </p>
              </div>
            )
          )}

          {isThinking && (
            <div className="flex gap-3 items-center animate-in fade-in duration-300">
              <AgentAvatar />
              <div className="flex gap-1 pt-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-ai/60 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {canSend && discovery.uiHints && (
            <UIHintsInput hints={discovery.uiHints} onSubmit={(text) => sendDiscoveryMessage(text)} />
          )}

          {isGenerating && (
            <div className="pl-11 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="rounded-2xl border border-ai/20 bg-ai/5 dark:bg-ai/10 p-5 flex items-start gap-4">
                <Loader2 className="w-5 h-5 text-ai animate-spin shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                    Generating your roadmap
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    This can take a few minutes. We&apos;ll switch to it automatically as soon as
                    it&apos;s ready — it&apos;s safe to leave this screen.
                  </p>
                </div>
              </div>
            </div>
          )}

          {discovery.status === "error" && (
            <div className="pl-11 animate-in fade-in duration-300">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">{discovery.error}</p>
                {discovery.roadmapJobId ? (
                  <Button size="sm" variant="outline" onClick={exitDiscovery} className="rounded-xl">
                    <MapIcon className="w-3.5 h-3.5 mr-1.5" />
                    Check my roadmaps
                  </Button>
                ) : (
                  discovery.lastUserMessage && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendDiscoveryMessage(discovery.lastUserMessage!, { isRetry: true })}
                      className="rounded-xl"
                    >
                      Retry last message
                    </Button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <div
            className={cn(
              "flex items-end gap-2 rounded-2xl border bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-2 shadow-sm transition-colors",
              canSend
                ? "border-slate-200 dark:border-zinc-700 focus-within:border-active/50"
                : "border-slate-100 dark:border-zinc-800 opacity-60"
            )}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              disabled={!canSend}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitDraft();
                }
              }}
              placeholder={
                isGenerating
                  ? "Roadmap generation in progress..."
                  : isThinking
                    ? "The agent is thinking..."
                    : "Describe what you want to learn..."
              }
              className="flex-1 resize-none overflow-y-auto bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 px-2 py-2 max-h-32"
            />
            <Button
              size="icon"
              disabled={!canSend || !draft.trim()}
              onClick={submitDraft}
              className="rounded-xl bg-active hover:bg-active/90 text-white shrink-0 h-9 w-9"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentAvatar() {
  return (
    <div className="w-8 h-8 rounded-lg bg-ai/10 border border-ai/20 flex items-center justify-center shrink-0">
      <BrainCircuit className="w-4 h-4 text-ai" />
    </div>
  );
}
