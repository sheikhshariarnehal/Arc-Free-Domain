"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  PanelLeft,
  Menu,
  Globe,
  Shield,
  Plus,
  LogOut,
  FileText,
  ChevronRight,
  ChevronDown,
  Moon,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Home,
  BookOpen,
  X,
  Radio,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface DashboardHeaderProps {
  userEmail?: string;
  userName?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileNav?: () => void;
}

export function DashboardHeader({
  userEmail = "user@arc.bd",
  userName = "User",
  avatarUrl,
  isAdmin = false,
  sidebarOpen = true,
  onToggleSidebar,
  onOpenMobileNav,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMac, setIsMac] = useState(false);

  // OS detection for keyboard shortcuts (⌘K vs Ctrl+K)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
    }
  }, []);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Breadcrumbs resolver
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [];

    if (segments[0] === "dashboard") {
      crumbs.push({ label: "Dashboard", href: "/dashboard" });
      if (segments[1] === "domains") {
        crumbs.push({ label: "My Subdomains", href: "/dashboard/domains" });
        if (segments[2]) {
          crumbs.push({ label: "DNS Configuration", href: `/dashboard/domains/${segments[2]}` });
        }
      }
    } else if (segments[0] === "docs") {
      crumbs.push({ label: "Documentation", href: "/docs" });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Search items for command palette
  const commandItems = [
    { title: "Dashboard Overview", subtitle: "View subdomain usage and analytics", href: "/dashboard", icon: Home, category: "Navigation" },
    { title: "My Subdomains", subtitle: "Manage DNS records and active subdomains", href: "/dashboard/domains", icon: Globe, category: "Navigation" },
    { title: "Claim New Subdomain", subtitle: "Register a free .arc.bd name", href: "/dashboard/domains?action=claim", icon: Plus, category: "Actions" },
    { title: "Connect to Vercel", subtitle: "Step-by-step CNAME guide for Next.js & React", href: "/docs/vercel", icon: FileText, category: "Documentation" },
    { title: "Connect to GitHub Pages", subtitle: "Configure CNAME records for repository sites", href: "/docs/github-pages", icon: FileText, category: "Documentation" },
    { title: "Connect to VPS / Nginx", subtitle: "Point an A record to your server IPv4 address", href: "/docs/vps", icon: FileText, category: "Documentation" },
    { title: "Infrastructure Status", subtitle: "Check Cloudflare Edge and database health", href: "/subdomain-status", icon: Radio, category: "System" },
    { title: "Public Website", subtitle: "Visit the ARC.BD homepage and search domains", href: "/docs", icon: ArrowUpRight, category: "Links" },
    { title: "Report Abuse", subtitle: "Report phishing, scam, or malicious subdomains", href: "/report", icon: Shield, category: "Support" },
  ];

  if (isAdmin) {
    commandItems.unshift({
      title: "Admin Panel",
      subtitle: "Review domain claims, reserved names, and abuse reports",
      href: "/admin",
      icon: Shield,
      category: "Admin",
    });
  }

  const filteredCommands = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#1e2330] bg-[#0c0e14] backdrop-blur-xl transition-all shrink-0">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 w-full">
          {/* Left Section: Mobile Sidebar Toggle + NextAdmin Search Input */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile Navigation Trigger (Mobile only) */}
            <button
              onClick={onOpenMobileNav}
              className="md:hidden flex size-9.5 items-center justify-center rounded-xl border border-[#222838] bg-[#141721] text-zinc-400 hover:text-white hover:bg-[#191d2a] shrink-0 transition-all cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <Menu className="size-4.5" />
            </button>

            {/* NextAdmin Wide Search Input Box */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-full max-w-xs sm:max-w-sm md:max-w-md items-center justify-between gap-2 rounded-xl bg-[#141721] border border-[#222838] px-3.5 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 hover:border-[#2d344a] hover:bg-[#191d2a] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group cursor-pointer shadow-xs"
              aria-label="Search pages and documentation"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="size-4 shrink-0 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                <span className="truncate text-zinc-400 group-hover:text-zinc-200">Search pages...</span>
              </div>
              <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-zinc-300">
                {isMac ? <span>⌘ K</span> : <span>Ctrl K</span>}
              </kbd>
            </button>
          </div>

          {/* Right Section: Theme Toggle, Notifications, Profile Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Dark / Light Mode Toggle Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="size-9.5 rounded-xl border border-[#222838] bg-[#141721] hover:bg-[#191d2a] hover:border-[#2d344a] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  aria-label="Toggle theme mode"
                >
                  <Moon className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Theme
              </TooltipContent>
            </Tooltip>

            {/* Notification Bell with Dropdown */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative size-9.5 rounded-xl border border-[#222838] bg-[#141721] hover:bg-[#191d2a] hover:border-[#2d344a] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      aria-label="System status notifications"
                    >
                      <Bell className="size-4" />
                      <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500 ring-2 ring-[#0c0e14] shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Notifications
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent align="end" className="w-72 p-0 border-[#1e2330] bg-[#12141c] shadow-2xl">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1e2330] bg-[#141721]">
                  <div className="flex items-center gap-2">
                    <Zap className="size-3.5 text-primary" />
                    <span className="text-xs font-semibold text-white">Infrastructure</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono py-0 h-5">
                    Operational
                  </Badge>
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Cloudflare Edge DNS</span>
                    <span className="text-emerald-400 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>SSL Provisioning</span>
                    <span className="text-emerald-400 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Database Sync</span>
                    <span className="text-emerald-400 font-medium">Healthy</span>
                  </div>
                </div>
                <div className="p-2 border-t border-[#1e2330] bg-[#141721] text-center">
                  <Link
                    href="/subdomain-status"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    View System Status Page →
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* NextAdmin User Account Profile Pill */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border border-[#222838] bg-[#141721] hover:bg-[#191d2a] hover:border-[#2d344a] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all cursor-pointer shadow-xs"
                  aria-label="User account options"
                >
                  <Avatar className="size-7.5 ring-1 ring-white/15 shadow-2xs">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />}
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs font-mono">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-white truncate max-w-[100px] sm:max-w-[140px] hidden sm:inline-block">
                    {userName}
                  </span>
                  <ChevronDown className="size-3.5 text-zinc-400 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border shadow-2xl p-1.5">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    {isAdmin ? (
                      <Badge className="w-fit mt-1 text-xs bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono">
                        Administrator
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit mt-1 text-xs text-muted-foreground font-mono">
                        Free Account (5 Slots)
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <Home className="size-4 text-muted-foreground" /> Overview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/domains" className="flex items-center gap-2">
                      <Globe className="size-4 text-muted-foreground" /> My Subdomains
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/docs" className="flex items-center gap-2">
                      <BookOpen className="size-4 text-muted-foreground" /> Documentation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/report" className="flex items-center gap-2.5">
                      <Shield className="size-4 text-muted-foreground" />
                      <span>Report Abuse</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-2.5 text-amber-400 hover:text-amber-300 font-medium">
                        <Shield className="size-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2.5"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Command / Search Palette Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <DialogHeader className="p-0 border-b border-white/[0.08]">
            <div className="flex items-center px-4 h-12 gap-2.5">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                placeholder="Search subdomains, documentation, actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 outline-none focus:outline-none px-0 text-sm bg-transparent placeholder:text-muted-foreground text-foreground"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Clear search input"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <kbd className="text-[10px] font-mono uppercase bg-white/[0.06] text-muted-foreground border border-white/[0.1] px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
                ESC
              </kbd>
            </div>
          </DialogHeader>

          <div className="p-2 max-h-80 overflow-y-auto space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredCommands.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-foreground shrink-0 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      <item.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 text-muted-foreground ml-2">
                    {item.category}
                  </Badge>
                </Link>
              ))
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.08] bg-white/[0.02] text-[11px] text-muted-foreground">
            <span>Tip: Press {isMac ? "⌘K" : "Ctrl+K"} anytime to open this search</span>
            <span className="font-mono">ARC.BD</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
