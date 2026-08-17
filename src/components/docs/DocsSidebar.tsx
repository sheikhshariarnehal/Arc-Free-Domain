"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Sparkles,
  BookOpen,
  Triangle,
  Zap,
  GitBranch,
  Server,
  Layers,
  Shield,
  Activity,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Terminal,
  FileCode,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DocNavItem {
  title: string;
  href: string;
  badge?: string;
  icon?: React.ElementType;
}

export interface DocNavGroup {
  title: string;
  icon: React.ElementType;
  items: DocNavItem[];
  defaultOpen?: boolean;
}

export const DOC_NAVIGATION: DocNavGroup[] = [
  {
    title: "Welcome",
    icon: BookOpen,
    defaultOpen: true,
    items: [
      { title: "Documentation Hub", href: "/docs", icon: Globe },
      { title: "System Status", href: "/subdomain-status", icon: Activity },
    ],
  },
  {
    title: "Deployment Guides",
    icon: Layers,
    defaultOpen: true,
    items: [
      { title: "Vercel & Next.js", href: "/docs/vercel", badge: "CNAME", icon: Triangle },
      { title: "Netlify", href: "/docs/netlify", badge: "CNAME", icon: Zap },
      { title: "GitHub Pages", href: "/docs/github-pages", badge: "CNAME", icon: GitBranch },
      { title: "Custom Server / VPS", href: "/docs/vps", badge: "A Record", icon: Server },
    ],
  },
  {
    title: "DNS & Edge Infrastructure",
    icon: Terminal,
    defaultOpen: true,
    items: [
      { title: "Cloudflare Edge & SSL", href: "/docs#cloudflare-ssl", icon: Shield },
      { title: "Record Types & Quotas", href: "/docs#dns-records", icon: FileCode },
    ],
  },
  {
    title: "Trust & Safety",
    icon: ShieldAlert,
    defaultOpen: false,
    items: [
      { title: "Reserved Names Policy", href: "/docs#reserved-names", icon: Shield },
      { title: "Report Abuse", href: "/report", icon: ShieldAlert },
    ],
  },
];

interface DocsSidebarProps {
  onSearchClick?: () => void;
  className?: string;
}

export function DocsSidebar({ onSearchClick, className }: DocsSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Welcome: true,
    "Deployment Guides": true,
    "DNS & Edge Infrastructure": true,
    "Trust & Safety": true,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return (
    <aside
      className={cn(
        "flex flex-col w-72 shrink-0 bg-[#08090d] border-r border-white/[0.08] select-none h-screen sticky top-0 overflow-y-auto scrollbar-thin",
        className
      )}
    >
      {/* Top Brand & Theme Switcher Pill */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-7 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
            <Image
              src="/ARC.webp"
              alt="ARC.BD Logo"
              width={22}
              height={22}
              className="size-4.5 object-contain"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">
              ARC<span className="text-zinc-400 font-mono">.BD</span>
            </span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-300 border border-white/[0.08]">
              DOCS
            </span>
          </div>
        </Link>

        {/* 3-State Theme Pill (System | Light | Dark) */}
        {mounted && (
          <div className="flex items-center rounded-full border border-white/[0.1] bg-[#12131a] p-0.5 shadow-inner">
            <button
              onClick={() => setTheme("system")}
              title="System Theme"
              className={cn(
                "size-6 flex items-center justify-center rounded-full transition-colors cursor-pointer",
                theme === "system"
                  ? "bg-white/[0.15] text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Monitor className="size-3" />
            </button>
            <button
              onClick={() => setTheme("light")}
              title="Light Theme"
              className={cn(
                "size-6 flex items-center justify-center rounded-full transition-colors cursor-pointer",
                theme === "light"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Sun className="size-3" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              title="Dark Theme"
              className={cn(
                "size-6 flex items-center justify-center rounded-full transition-colors cursor-pointer",
                theme === "dark"
                  ? "bg-white/[0.2] text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Moon className="size-3" />
            </button>
          </div>
        )}
      </div>

      {/* Search & Assistant Trigger Bar */}
      <div className="px-4 py-2.5 shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={onSearchClick}
          className="flex-1 flex items-center justify-between h-9 px-3 rounded-xl border border-white/[0.08] bg-[#12131a] hover:border-white/[0.18] hover:bg-white/[0.04] transition-all text-xs text-zinc-400 group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="size-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            <span>Search docs...</span>
          </div>
          <kbd className="font-mono text-[10px] font-semibold bg-white/[0.08] text-zinc-300 border border-white/[0.08] px-1.5 py-0.5 rounded">
            {isMac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>

        <Link
          href="/dashboard"
          title="Open Developer Console"
          className="size-9 rounded-xl border border-white/[0.08] bg-[#12131a] hover:border-white/[0.18] hover:bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-white transition-all shrink-0"
        >
          <Sparkles className="size-3.5 text-primary" />
        </Link>
      </div>

      {/* Navigation Groups List */}
      <nav className="flex-1 px-3 py-3 space-y-5">
        {DOC_NAVIGATION.map((group) => {
          const isOpen = openGroups[group.title] !== false;
          const GroupIcon = group.icon;

          return (
            <div key={group.title} className="space-y-1">
              {/* Group Title Header (Collapsible) */}
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer group select-none"
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="size-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                  <span className="text-[11px] font-semibold">{group.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="size-3 text-zinc-500 group-hover:text-zinc-300 transition-transform" />
                ) : (
                  <ChevronRight className="size-3 text-zinc-500 group-hover:text-zinc-300 transition-transform" />
                )}
              </button>

              {/* Group Items */}
              {isOpen && (
                <div className="space-y-0.5 border-l border-white/[0.06] ml-3.5 pl-2.5 pt-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group",
                          isActive
                            ? "bg-primary/15 text-primary font-semibold border border-primary/25 shadow-xs"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {ItemIcon && (
                            <ItemIcon
                              className={cn(
                                "size-3.5 shrink-0 transition-colors",
                                isActive
                                  ? "text-primary"
                                  : "text-zinc-500 group-hover:text-zinc-300"
                              )}
                            />
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] font-mono px-1.5 py-0.2 rounded border shrink-0",
                              isActive
                                ? "bg-primary/20 border-primary/30 text-primary"
                                : "bg-white/[0.05] border-white/[0.08] text-zinc-400"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Sticky External Links */}
      <div className="p-3.5 border-t border-white/[0.08] bg-[#0c0d12] shrink-0 space-y-1 text-xs">
        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <span>Developer Console</span>
          <ExternalLink className="size-3 text-zinc-500" />
        </Link>
        <a
          href="https://github.com/sheikhshariarnehal/Arc-Free-Domain"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <span>GitHub Repository</span>
          <ExternalLink className="size-3 text-zinc-500" />
        </a>
      </div>
    </aside>
  );
}
