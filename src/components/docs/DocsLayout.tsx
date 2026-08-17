"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ExternalLink,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Layers,
  Activity,
  FileText,
} from "lucide-react";
import { GitHubIcon } from "@/components/TechIcons";
import { DocsSidebar } from "./DocsSidebar";
import { DocsTableOfContents, TocItem } from "./DocsTableOfContents";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: React.ReactNode;
  category?: string;
  title: string;
  description?: string;
  toc?: TocItem[];
  prev?: { title: string; href: string; category?: string } | null;
  next?: { title: string; href: string; category?: string } | null;
}

export function DocsLayout({
  children,
  category = "Documentation",
  title,
  description,
  toc = [],
  prev,
  next,
}: DocsLayoutProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null);

  // Keyboard shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyPageUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  const topNavTabs = [
    { label: "Docs", href: "/docs" },
    { label: "Vercel Guide", href: "/docs/vercel" },
    { label: "Netlify Guide", href: "/docs/netlify" },
    { label: "GitHub Pages", href: "/docs/github-pages" },
    { label: "VPS / Server", href: "/docs/vps" },
    { label: "System Status", href: "/subdomain-status" },
  ];

  const searchIndex = [
    { title: "Documentation Overview", href: "/docs", subtitle: "Getting started with ARC.BD subdomains" },
    { title: "Vercel & Next.js Setup Guide", href: "/docs/vercel", subtitle: "Configure CNAME records for Vercel deployment" },
    { title: "Netlify Setup Guide", href: "/docs/netlify", subtitle: "Point custom domains to Netlify apps" },
    { title: "GitHub Pages Setup Guide", href: "/docs/github-pages", subtitle: "Link .arc.bd subdomains to GitHub repositories" },
    { title: "Custom Server / VPS Setup Guide", href: "/docs/vps", subtitle: "Point A records to VPS IPv4 addresses" },
    { title: "Cloudflare Edge DNS & SSL", href: "/docs#cloudflare-ssl", subtitle: "Universal SSL and global Anycast infrastructure" },
    { title: "System Status & Uptime", href: "/subdomain-status", subtitle: "Live edge DNS and API operational metrics" },
    { title: "Developer Console / Dashboard", href: "/dashboard/domains", subtitle: "Claim and manage up to 5 free subdomains" },
  ];

  const filteredSearch = searchQuery.trim()
    ? searchIndex.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchIndex;

  return (
    <div className="min-h-screen flex flex-col bg-[#07080b] text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ── Top Header Navigation Bar (Browserbase Style) ── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08090d]/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Sidebar Toggle Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Open documentation navigation"
            >
              <Menu className="size-5" />
            </button>
            <Link href="/" className="font-bold text-sm text-white">
              ARC<span className="text-zinc-400 font-mono">.BD</span>
            </Link>
          </div>

          {/* Desktop Horizontal Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {topNavTabs.map((tab) => {
              const isActive =
                tab.href === "/docs"
                  ? pathname === "/docs"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none",
                    isActive
                      ? "bg-white/[0.08] text-white font-semibold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Quick Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Search docs"
            >
              <Search className="size-4" />
            </button>

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:border-white/[0.2] hover:bg-white/[0.08] text-xs font-medium text-white transition-all shadow-xs"
            >
              <span>Dashboard</span>
              <ExternalLink className="size-3 text-zinc-400" />
            </Link>

            {/* GitHub Link */}
            <a
              href="https://github.com/sheikhshariarnehal/Arc-Free-Domain"
              target="_blank"
              rel="noopener noreferrer"
              className="size-8 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              aria-label="View on GitHub"
            >
              <GitHubIcon size={15} />
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Layout Body ── */}
      <div className="flex-1 flex w-full max-w-[96rem] mx-auto">
        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="fixed top-0 left-0 bottom-0 w-72 bg-[#08090d] shadow-2xl z-10 flex flex-col">
              <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Navigation Menu
                </span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setMobileNavOpen(false)}>
                <DocsSidebar onSearchClick={() => setSearchOpen(true)} className="h-full border-none w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Left Column: Fixed / Sticky Desktop Sidebar */}
        <div className="hidden lg:block">
          <DocsSidebar onSearchClick={() => setSearchOpen(true)} />
        </div>

        {/* Center Column: Main Document Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 sm:py-12 max-w-4xl">
          {/* Category kicker */}
          {category && (
            <div className="mb-2 text-xs font-mono font-semibold uppercase tracking-wider text-primary">
              {category}
            </div>
          )}

          {/* Page Title & Copy Page Button */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
            <div className="space-y-2 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl font-normal">
                  {description}
                </p>
              )}
            </div>

            <button
              onClick={handleCopyPageUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#12131a] hover:border-white/[0.18] hover:bg-white/[0.05] text-xs font-medium text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer self-start active:scale-95"
              aria-label="Copy page link"
            >
              {copiedLink ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-zinc-400" />
                  <span>Copy page</span>
                </>
              )}
            </button>
          </div>

          {/* Article Main Body Content */}
          <article className="prose prose-invert prose-zinc max-w-none text-zinc-300 text-sm sm:text-[14.5px] leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:scroll-mt-20 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:scroll-mt-20 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_ol]:mb-4 [&_strong]:text-white [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-300 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-white/[0.08] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-white">
            {children}
          </article>

          {/* Page Feedback Strip */}
          <div className="mt-14 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="font-medium text-zinc-300">Was this page helpful?</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFeedbackGiven("yes")}
                  className={cn(
                    "p-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] transition-colors cursor-pointer",
                    feedbackGiven === "yes"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-[#12131a] hover:bg-white/[0.04]"
                  )}
                  aria-label="Yes, helpful"
                >
                  <ThumbsUp className="size-3.5" />
                </button>
                <button
                  onClick={() => setFeedbackGiven("no")}
                  className={cn(
                    "p-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] transition-colors cursor-pointer",
                    feedbackGiven === "no"
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : "bg-[#12131a] hover:bg-white/[0.04]"
                  )}
                  aria-label="No, not helpful"
                >
                  <ThumbsDown className="size-3.5" />
                </button>
              </div>
              {feedbackGiven && (
                <span className="text-emerald-400 font-medium text-[11px] animate-in fade-in duration-200">
                  Thank you for your feedback!
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/sheikhshariarnehal/Arc-Free-Domain/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Report an issue
              </a>
              <span>·</span>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Claim a subdomain
              </Link>
            </div>
          </div>
        </main>

        {/* Right Column: Sticky Table of Contents */}
        {toc && toc.length > 0 && (
          <div className="hidden xl:block w-64 shrink-0 py-12 pr-6">
            <div className="sticky top-20">
              <DocsTableOfContents items={toc} />
            </div>
          </div>
        )}
      </div>

      {/* ── Global Search / Command Dialog (⌘K) ── */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-[#0e1017] border-white/[0.12]">
          <DialogHeader className="p-0 border-b border-white/[0.08]">
            <div className="flex items-center px-4 h-12 gap-2.5">
              <Search className="size-4 text-zinc-400 shrink-0" />
              <input
                placeholder="Search documentation, guides, DNS records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 outline-none focus:outline-none px-0 text-sm bg-transparent placeholder:text-zinc-500 text-white font-medium"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <kbd className="text-[10px] font-mono uppercase bg-white/[0.06] text-zinc-400 border border-white/[0.1] px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>
          </DialogHeader>

          <div className="p-2 max-h-80 overflow-y-auto space-y-1">
            {filteredSearch.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-400">
                No documentation results found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredSearch.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all group cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{item.subtitle}</p>
                  </div>
                  <FileText className="size-4 text-zinc-500 group-hover:text-zinc-300 shrink-0 ml-2" />
                </Link>
              ))
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.08] bg-white/[0.02] text-[11px] text-zinc-500">
            <span>Tip: Navigate using ↑ ↓ and hit Enter</span>
            <span className="font-mono">ARC.BD Docs</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
