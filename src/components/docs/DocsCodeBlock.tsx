"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CodeTab {
  label: string;
  code: string;
  language?: string;
  filename?: string;
}

interface DocsCodeBlockProps {
  tabs?: CodeTab[];
  code?: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function DocsCodeBlock({
  tabs,
  code,
  language = "bash",
  filename,
  className,
}: DocsCodeBlockProps) {
  const codeTabs: CodeTab[] =
    tabs && tabs.length > 0
      ? tabs
      : [
          {
            label: filename || language || "Code",
            code: code || "",
            language,
            filename,
          },
        ];

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeTab = codeTabs[activeTabIndex] || codeTabs[0];

  const handleCopy = async () => {
    if (!activeTab?.code) return;
    try {
      await navigator.clipboard.writeText(activeTab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0d12] shadow-xl",
        className
      )}
    >
      {/* Top Bar: Tabs & Copy Button */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#12131a] px-3.5 py-2">
        {/* Tabs List */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {codeTabs.map((tab, idx) => {
            const isActive = idx === activeTabIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTabIndex(idx)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-all cursor-pointer select-none",
                  isActive
                    ? "bg-white/[0.1] text-white shadow-xs"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
              >
                {tab.filename ? (
                  <Terminal className="size-3.5 opacity-60" />
                ) : null}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer shrink-0 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Viewer Body */}
      <div className="relative overflow-x-auto p-4 text-xs sm:text-[13px] font-mono leading-relaxed text-zinc-200">
        <pre className="selection:bg-primary/30 selection:text-primary-foreground font-mono">
          <code>{activeTab?.code}</code>
        </pre>
      </div>
    </div>
  );
}
