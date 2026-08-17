"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationLink {
  title: string;
  href: string;
  category?: string;
}

interface DocsPaginationProps {
  prev?: PaginationLink | null;
  next?: PaginationLink | null;
  className?: string;
}

export function DocsPagination({ prev, next, className }: DocsPaginationProps) {
  if (!prev && !next) return null;

  return (
    <div
      className={cn(
        "mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/[0.08]",
        className
      )}
    >
      {/* Previous Link */}
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0d0e14] p-4.5 hover:border-white/[0.2] hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
            <ChevronLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Previous</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-white group-hover:text-primary transition-colors tracking-tight">
            {prev.title}
          </div>
          {prev.category && (
            <div className="mt-0.5 text-[11px] text-zinc-500 font-mono">
              {prev.category}
            </div>
          )}
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next Link */}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col justify-between items-end text-right rounded-xl border border-white/[0.08] bg-[#0d0e14] p-4.5 hover:border-white/[0.2] hover:bg-white/[0.02] transition-all sm:col-start-2"
        >
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
            <span>Next</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="mt-2 text-sm font-semibold text-white group-hover:text-primary transition-colors tracking-tight">
            {next.title}
          </div>
          {next.category && (
            <div className="mt-0.5 text-[11px] text-zinc-500 font-mono">
              {next.category}
            </div>
          )}
        </Link>
      ) : null}
    </div>
  );
}
