"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  PanelLeft,
  Globe,
  Shield,
  Plus,
  LogOut,
  FileText,
  ChevronRight,
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
  onToggleSidebar?: () => void;
  onOpenMobileNav?: () => void;
}

export function DashboardHeader({
  userEmail = "user@arc.bd",
  userName = "User",
  avatarUrl,
  isAdmin = false,
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
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-all">
        <div className="flex h-14 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Left Section: Sidebar Toggle & Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Unified Sidebar Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 768) {
                      onOpenMobileNav?.();
                    } else {
                      onToggleSidebar?.();
                    }
                  }}
                  variant="ghost"
                  size="icon"
                  className="size-8.5 text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0 focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
                  aria-label="Toggle navigation menu"
                >
                  <PanelLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs hidden md:block">
                Toggle Sidebar
              </TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border/60 hidden md:block" />

            {/* Breadcrumb Trail */}
            <nav aria-label="Breadcrumb navigation" className="flex items-center gap-1.5 min-w-0">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={crumb.href} className={`flex items-center gap-1.5 min-w-0 ${!isLast ? "hidden sm:flex" : ""}`}>
                    {idx > 0 && <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0 hidden sm:inline-block" />}
                    {isLast ? (
                      <span className="text-sm font-semibold text-foreground truncate">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Search, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 items-center gap-2 rounded-[4px] border-none bg-card/60 px-2.5 sm:px-3 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
              aria-label="Search pages and documentation"
            >
              <Search className="size-3.5 sm:size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="hidden sm:inline-block">Search...</span>
              <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded-[3px] border-none bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {isMac ? <span>⌘K</span> : <span>Ctrl K</span>}
              </kbd>
            </button>

              {/* System Status Popover */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative size-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                        aria-label="System status notifications"
                      >
                        <Bell className="size-4" />
                        <span className="absolute top-2 right-2 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    System Health
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent align="end" className="w-72 p-0 shadow-2xl border-border">
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Zap className="size-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Infrastructure</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono py-0 h-5">
                      Operational
                    </Badge>
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Cloudflare Edge DNS</span>
                      <span className="text-emerald-400 font-medium">Connected</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>SSL Provisioning</span>
                      <span className="text-emerald-400 font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Database Sync</span>
                      <span className="text-emerald-400 font-medium">Healthy</span>
                    </div>
                  </div>
                  <div className="p-2 border-t border-border bg-muted/20 text-center">
                    <Link
                      href="/subdomain-status"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      Full Status Page <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Account Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    aria-label="User account options"
                  >
                    <Avatar className="size-8 border border-border shadow-2xs">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-2xl border-border">
                  <DropdownMenuLabel className="font-normal px-2 py-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                      <Badge variant="outline" className={`w-fit mt-1 text-xs font-mono ${isAdmin ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "text-muted-foreground"}`}>
                        {isAdmin ? "Administrator" : "Free Plan (5 Slots)"}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/docs" className="flex items-center gap-2.5">
                        <BookOpen className="size-4 text-muted-foreground" />
                        <span>Documentation</span>
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
        <DialogContent className="max-w-xl p-0 overflow-hidden border-border bg-card shadow-2xl">
          <DialogHeader className="p-0 border-b border-border">
            <div className="flex items-center px-4 h-12 gap-2.5">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search subdomains, documentation, actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-sm bg-transparent placeholder:text-muted-foreground"
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
              <kbd className="text-[10px] font-mono uppercase bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded">
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
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-md bg-secondary flex items-center justify-center text-foreground shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
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

          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
            <span>Tip: Press {isMac ? "⌘K" : "Ctrl+K"} anytime to open this search</span>
            <span>ARC.BD Subdomain Platform</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
