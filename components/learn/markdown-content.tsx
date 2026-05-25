"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
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
        // headings
        "prose-headings:font-bold prose-headings:tracking-tight",
        "prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4",
        "prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3",
        "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2",
        // body
        "prose-p:text-[15px] prose-p:leading-[1.75]",
        "prose-li:text-[15px] prose-li:leading-[1.7] prose-li:my-1",
        "prose-strong:text-slate-900 prose-strong:dark:text-zinc-100 prose-strong:font-bold",
        "prose-em:text-slate-800 prose-em:dark:text-zinc-200",
        // links
        "prose-a:text-active prose-a:no-underline hover:prose-a:underline",
        // inline code (we override block code below; this catches anything that slips through)
        "prose-code:before:content-none prose-code:after:content-none",
        // tables (gfm)
        "prose-table:text-[14px]",
        "prose-th:bg-slate-100 prose-th:dark:bg-zinc-800 prose-th:px-3 prose-th:py-2",
        "prose-td:px-3 prose-td:py-2 prose-td:border-slate-200 prose-td:dark:border-zinc-800",
        // blockquote
        "prose-blockquote:border-l-active prose-blockquote:bg-active/5 prose-blockquote:not-italic prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg",
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
      <code
        className="rounded bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[0.875em] font-mono text-slate-800 dark:text-zinc-200 border border-slate-200/60 dark:border-zinc-700/60"
        {...rest}
      >
        {children}
      </code>
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
