"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
// Use the lazy, code-split highlighter (PrismAsyncLight) instead of the full
// `Prism` build: the full build statically bundles ~200+ language grammars, which
// Turbopack must compile and keep hot in dev — the main driver of the `next dev`
// process ballooning to multi-GB RSS. PrismAsyncLight loads each grammar on demand.
// Likewise, deep-import only the two themes we use rather than the `styles/prism`
// barrel, which pulls in every theme.
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import { useTheme } from "next-themes";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  children: string;
  className?: string;
}

/**
 * Shared markdown renderer for learning content.
 *
 *   • remark-gfm for tables, task lists, strikethrough, autolinks
 *   • react-syntax-highlighter (Prism) for fenced code with language detection
 *   • Theme-aware (next-themes) — uses oneDark / oneLight Prism themes
 *   • Inline `code` gets a pill style; block code gets a header with language label + copy button
 */
export function MarkdownContent({ children, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "prose prose-base dark:prose-invert max-w-none",
        // headings — Manrope display face, clear size steps between levels.
        // Content h1 sits below the page-level lesson title (34px), so it is
        // deliberately smaller than a document h1.
        "prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-ink",
        "prose-h1:text-[28px] prose-h1:font-extrabold prose-h1:leading-snug prose-h1:mt-12 prose-h1:mb-4",
        "prose-h2:text-[24px] prose-h2:font-extrabold prose-h2:leading-snug prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2.5 prose-h2:border-b prose-h2:border-outline/40",
        "prose-h3:text-[18px] prose-h3:mt-9 prose-h3:mb-2.5",
        "prose-h4:text-[15.5px] prose-h4:mt-7 prose-h4:mb-2",
        // body
        "prose-p:text-[15.5px] prose-p:leading-[1.8] prose-p:text-ink/90",
        "prose-li:text-[15.5px] prose-li:leading-[1.75] prose-li:my-1.5 prose-li:text-ink/90",
        "prose-ul:my-4 prose-ol:my-4 prose-li:marker:text-active/70 prose-ol:marker:font-semibold",
        "prose-strong:text-ink prose-strong:font-bold",
        "prose-em:text-ink/90",
        // links
        "prose-a:text-active prose-a:no-underline hover:prose-a:underline",
        // inline code (we override block code below; this catches anything that slips through)
        "prose-code:before:content-none prose-code:after:content-none",
        // tables (gfm)
        "prose-table:text-[14px]",
        "prose-th:bg-slate-100 prose-th:dark:bg-zinc-800 prose-th:px-3 prose-th:py-2",
        "prose-td:px-3 prose-td:py-2 prose-td:border-slate-200 prose-td:dark:border-zinc-800",
        // blockquote
        "prose-blockquote:border-l-active prose-blockquote:bg-active/5 prose-blockquote:not-italic prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-ink/80",
        // hr
        "prose-hr:border-slate-200 prose-hr:dark:border-zinc-800",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Inline-only markdown renderer for short LLM-generated strings (titles,
 * descriptions, quiz options, hints) that may contain `code`, **bold**, or
 * *emphasis* but are rendered inside an existing text element. Paragraphs are
 * unwrapped and block elements are flattened to their text content, so the
 * output is safe inside <p>, <span>, <h1>, or <button> parents. Links render
 * as plain text — these strings can appear inside interactive elements.
 */
export function MarkdownInline({ children, className }: MarkdownContentProps) {
  return (
    <span className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        allowedElements={["p", "code", "strong", "em", "del"]}
        unwrapDisallowed
        components={inlineComponents}
      >
        {children}
      </ReactMarkdown>
    </span>
  );
}

// py is 1px, not 0.5 — JetBrains Mono's font box is already ~1.31em tall, so
// any more vertical padding makes pills overflow tight line boxes (rail
// titles, headings) and overlap across wrapped lines.
const INLINE_CODE_CLS =
  "rounded bg-slate-200/70 dark:bg-zinc-800 px-1.5 py-px text-[0.875em] font-mono font-medium text-slate-900 dark:text-zinc-200 border border-slate-300/70 dark:border-zinc-700/60";

const inlineComponents: Components = {
  p({ children }) {
    return <>{children}</>;
  },
  code({ children }) {
    return <code className={INLINE_CODE_CLS}>{children}</code>;
  },
};

const markdownComponents: Components = {
  // Strip the default <pre> wrapper — CodeBlock provides its own.
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children, ...rest }) {
    const codeStr = String(children).replace(/\n$/, "");
    const match = /language-([\w-]+)/.exec(className || "");
    const isBlock = codeStr.includes("\n") || !!match;

    if (isBlock) {
      return <CodeBlock language={match?.[1] ?? "text"} code={codeStr} />;
    }

    return (
      <code className={INLINE_CODE_CLS} {...rest}>
        {children}
      </code>
    );
  },
  // GFM tables overflow the reading column on mobile / long cells — give them
  // their own horizontal scroll context.
  table({ children }) {
    return (
      <div className="overflow-x-auto my-5">
        <table className="my-0">{children}</table>
      </div>
    );
  },
  a({ href, children }) {
    const isExternal = href ? /^https?:\/\//.test(href) : false;
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
};

function CodeBlock({ language, code }: { language: string; code: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Until mounted, default to dark theme to avoid hydration mismatch.
  const isDark = !mounted ? true : resolvedTheme === "dark";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const displayLanguage =
    language === "text" || language === "plaintext" ? "" : language;

  return (
    <div className="not-prose my-5 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-100/60 dark:bg-zinc-900/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
          {displayLanguage || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-500 hover:text-active transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={displayLanguage || "text"}
        style={isDark ? oneDark : oneLight}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "14px 16px",
          background: "transparent",
          fontSize: "13.5px",
          lineHeight: "1.6",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
