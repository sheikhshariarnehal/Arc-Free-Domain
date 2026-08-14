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
    { title: "Public Website", subtitle: "Visit the ARC.BD homepage and search domains", href: "/", icon: ArrowUpRight, category: "Links" },
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
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-6">
          {/* Left Section: Sidebar Toggle & Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Desktop Sidebar Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onToggleSidebar}
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex size-8.5 text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0 focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Toggle sidebar width"
                >
                  <PanelLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Toggle Sidebar
              </TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border/60 hidden md:block" />

            {/* Breadcrumb Trail */}
            <nav aria-label="Breadcrumb navigation" className="flex items-center gap-1.5 min-w-0">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                    {idx > 0 && <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />}
                    {isLast ? (
                      <span className="text-sm font-semibold text-foreground truncate">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors truncate hidden sm:inline-block"
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
              className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card/60 px-2.5 sm:px-3 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
              aria-label="Search pages and documentation"
            >
              <Search className="size-3.5 sm:size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="hidden sm:inline-block">Search...</span>
              <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {isMac ? <span>⌘K</span> : <span>Ctrl K</span>}
              </kbd>
            </button>

            {/* System Notifications Popover */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative size-9 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      aria-label="System status notifications"
                    >
                      <Bell className="size-4" />
                      <span className="absolute top-2 right-2 size-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  System Notifications
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-border">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Infrastructure Status</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono">
                    All Systems Operational
                  </Badge>
                </div>
                <div className="p-3 space-y-2.5 max-h-72 overflow-y-auto">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/50 border border-border/50 text-xs">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Cloudflare Edge DNS Connected</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">Automated DNS synchronization is running smoothly across all edge nodes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/50 border border-border/50 text-xs">
                    <Globe className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">5 Free Subdomain Slots</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">Each developer account receives up to 5 custom .arc.bd subdomains.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/50 border border-border/50 text-xs">
                    <Sparkles className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Instant Edge SSL Security</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">Automated SSL certificates are provisioned for every active subdomain.</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-border bg-muted/20 text-center">
                  <Link
                    href="/subdomain-status"
                    className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Infrastructure Health <ArrowUpRight className="size-3" />
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
              <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-2xl border-border">
                <DropdownMenuLabel className="font-normal px-2 py-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {isAdmin ? (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono">
                          <Shield className="size-3 mr-1" /> Administrator
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                          Free Developer Account
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                      <Home className="size-4 text-muted-foreground" />
                      <span>Overview</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/domains" className="flex items-center gap-2.5">
                      <Globe className="size-4 text-muted-foreground" />
                      <span>My Subdomains</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/docs" className="flex items-center gap-2.5">
                      <BookOpen className="size-4 text-muted-foreground" />
                      <span>Documentation</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/" className="flex items-center gap-2.5">
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                      <span>Public Homepage</span>
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
