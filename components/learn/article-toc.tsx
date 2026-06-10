"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

interface ArticleTocProps {
  /** The scrollable container hosting the rendered article. */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Identity of the rendered lesson — triggers a heading re-scan. */
  contentId: string;
}

function slugify(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-") || "section";
  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

/**
 * Floating "On this page" rail for article lessons. Builds itself from the
 * rendered DOM (h2/h3 inside the article prose) rather than re-parsing the
 * markdown, so entries always match what's on screen — inline code, bold,
 * etc. already resolved to plain text. Only shown when the viewport leaves
 * enough room beside the centered reading column.
 */
export function ArticleToc({ scrollRef, contentId }: ArticleTocProps) {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const headingsRef = useRef<HTMLElement[]>([]);

  // Scan headings and assign anchor ids after the article commits.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const headings = Array.from(
      container.querySelectorAll<HTMLElement>(
        "article .prose h2, article .prose h3"
      )
    );
    const used = new Set<string>();
    const next = headings.map<TocEntry>((el) => {
      const text = el.textContent ?? "";
      const id = slugify(text, used);
      el.id = id;
      return { id, text, level: el.tagName === "H2" ? 2 : 3 };
    });
    headingsRef.current = headings;
    setEntries(next);
    setActiveId(next[0]?.id ?? null);
  }, [scrollRef, contentId]);

  // Scroll the heading to the top of the container — and only the container.
  // scrollIntoView would also scroll every scrollable ancestor, including the
  // app shell's overflow-hidden <body> (which is still programmatically
  // scrollable), dragging the nav/sidebar out of the viewport.
  const scrollToEntry = (id: string) => {
    const container = scrollRef.current;
    const el = headingsRef.current.find((h) => h.id === id);
    if (!container || !el) return;
    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      24;
    container.scrollTo({ top, behavior: "smooth" });
  };

  // Scroll spy — the last heading above the top quarter of the container wins.
  // rAF-throttled: scroll can fire faster than paint, and the handler reads
  // layout (getBoundingClientRect) for every heading.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || entries.length === 0) return;
    let raf = 0;
    const spy = () => {
      // Sections near the end may never reach the activation threshold —
      // when the container is scrolled to the bottom, the last entry wins.
      const atBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
      if (atBottom) {
        setActiveId(entries[entries.length - 1].id);
        return;
      }
      const threshold = container.getBoundingClientRect().top + 120;
      let current = entries[0]?.id ?? null;
      for (const el of headingsRef.current) {
        if (el.getBoundingClientRect().top <= threshold) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        spy();
      });
    };
    spy();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollRef, entries]);

  if (entries.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="absolute right-5 top-10 bottom-20 w-44 z-10 hidden min-[1400px]:block pointer-events-none"
    >
      <div className="pointer-events-auto max-h-full overflow-y-auto pr-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-meta/80 mb-2.5 font-display">
          On this page
        </div>
        <ul className="space-y-0.5 border-l border-outline/40">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => scrollToEntry(entry.id)}
                className={cn(
                  "block w-full text-left text-[12px] leading-snug py-1 pr-1 border-l-2 -ml-px transition-colors",
                  entry.level === 2 ? "pl-3" : "pl-6",
                  activeId === entry.id
                    ? "border-active text-active font-semibold"
                    : "border-transparent text-meta hover:text-ink"
                )}
              >
                {entry.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
