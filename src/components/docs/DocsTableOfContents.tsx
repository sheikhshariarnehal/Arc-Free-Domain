"use client";

import React, { useEffect, useState } from "react";
import { List, AlignLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
  level?: number;
}

interface DocsTableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export function DocsTableOfContents({
  items,
  className,
}: DocsTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");

  useEffect(() => {
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "0px 0px -65% 0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div className={cn("space-y-3.5", className)}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
        <AlignLeft className="size-3.5 text-zinc-400" />
        <span>On this page</span>
      </div>

      <nav className="space-y-1 text-[13px] border-l border-white/[0.08]">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 90;
                  window.scrollTo({ top: y, behavior: "smooth" });
                  setActiveId(item.id);
                  history.replaceState(null, "", `#${item.id}`);
                }
              }}
              className={cn(
                "block py-1.5 transition-all -ml-px border-l-2 leading-snug cursor-pointer",
                item.level === 3 ? "pl-5 text-xs" : "pl-3 text-xs sm:text-[13px]",
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              )}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
