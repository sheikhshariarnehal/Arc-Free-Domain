"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  FileText,
  LogOut,
  Shield,
  ShieldAlert,
  ChevronsUpDown,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  X,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Activity,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/DashboardHeader";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Subdomains", href: "/dashboard/domains", icon: Globe },
];

const resourceNavItems: NavItem[] = [
  { name: "Documentation", href: "/docs", icon: BookOpen },
  { name: "System Status", href: "/subdomain-status", icon: Activity },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("User");
  const [userName, setUserName] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [subdomainCount, setSubdomainCount] = useState<number>(0);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
        setUserName(user.user_metadata?.full_name || user.email.split("@")[0] || "User");
        setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, avatar_url, full_name")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") setIsAdmin(true);
        if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
        if (profile?.full_name) setUserName(profile.full_name);
      }
    });

    // Fetch user subdomain count for the sidebar quota indicator
    fetch("/api/subdomains")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSubdomainCount(data.length);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const remainingSlots = Math.max(0, 5 - subdomainCount);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen flex bg-[#06070a] text-foreground relative selection:bg-primary/20 selection:text-primary">
        {/* Scoped Dashboard Atmospheric Background (Matches component tones, does NOT affect homepage) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {/* Top ambient radial illumination */}
          <div
            className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[140px] opacity-15"
            style={{
              background: "radial-gradient(ellipse at center, rgba(87, 80, 241, 0.25) 0%, transparent 75%)",
            }}
          />
        </div>

        {/* Mobile overlay backdrop */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Sidebar Navigation (Seamlessly integrated into canvas background) */}
        <aside
          className={`fixed md:sticky top-0 left-0 z-50 flex flex-col h-screen bg-[#06070a] border-none transition-all duration-300 ease-in-out shrink-0 select-none ${
            mobileNavOpen
              ? "translate-x-0 w-64 shadow-2xl"
              : "-translate-x-full md:translate-x-0"
          } ${sidebarOpen ? "md:w-64" : "md:w-18"}`}
        >
          {/* Brand Header */}
          {sidebarOpen ? (
            <div className="flex items-center justify-between px-4 h-16 shrink-0">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 overflow-hidden group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg p-1"
              >
                <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 group-hover:border-primary/40 group-hover:bg-primary/15 transition-all overflow-hidden">
                  <Image
                    src="/ARC.webp"
                    alt="ARC.BD Logo"
                    width={24}
                    height={24}
                    className="size-5 object-contain"
                  />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold tracking-tight text-white">ARC<span className="text-zinc-400 font-mono">.BD</span></span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 font-mono">
                    DEV
                  </Badge>
                </div>
              </Link>

              {/* Sidebar Collapse Button (Desktop) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="hidden md:flex size-8 items-center justify-center rounded-lg border border-[#222838] bg-[#141721] text-zinc-400 hover:text-white hover:border-[#2d344a] hover:bg-[#191d2a] transition-all cursor-pointer shrink-0"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-4" />
              </button>

              {/* Close button on Mobile */}
              <button
                onClick={() => setMobileNavOpen(false)}
                className="md:hidden text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
                aria-label="Close navigation menu"
              >
                <X className="size-4.5" />
              </button>
            </div>
          ) : (
            /* Collapsed Brand Header */
            <div className="flex items-center justify-center h-16 shrink-0 px-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex size-9 items-center justify-center rounded-xl border border-[#222838] bg-[#141721] text-zinc-400 hover:text-white hover:border-primary/50 hover:bg-[#191d2a] transition-all cursor-pointer shadow-xs"
                    aria-label="Expand sidebar"
                  >
                    <PanelLeftClose className="size-4.5 rotate-180 text-primary" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium">
                  Expand Sidebar
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Navigation Links Area */}
          <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto overflow-x-hidden scrollbar-thin">
            {/* Section 1: MAIN MENU */}
            <div>
              {sidebarOpen && (
                <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.12em] text-zinc-400 uppercase select-none">
                  MAIN MENU
                </div>
              )}

              {/* Collapsible Dashboard Group (NextAdmin style) */}
              <div className="space-y-1">
                {sidebarOpen ? (
                  <>
                    <button
                      onClick={() => setDashboardOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <LayoutDashboard className="size-4 text-zinc-400 group-hover:text-white transition-colors shrink-0" />
                        <span className="truncate">Dashboard</span>
                      </div>
                      {dashboardOpen ? (
                        <ChevronUp className="size-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
                      ) : (
                        <ChevronDown className="size-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
                      )}
                    </button>

                    {/* Submenu Items under Dashboard */}
                    {dashboardOpen && (
                      <div className="pl-3.5 space-y-1 mt-0.5 border-l border-white/[0.06] ml-4">
                        {mainNavItems.map((item) => {
                          const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));

                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setMobileNavOpen(false)}
                              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-medium transition-all ${
                                isActive
                                  ? "bg-[#141721] text-white border border-[#222838] shadow-xs"
                                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                              }`}
                            >
                              <span className="truncate">{item.name}</span>
                            </Link>
                          );
                        })}
                        <Link
                          href="/subdomain-status"
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-medium transition-all ${
                            pathname === "/subdomain-status"
                              ? "bg-[#141721] text-white border border-[#222838] shadow-xs"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                          }`}
                        >
                          <span className="truncate">System Status</span>
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  /* Collapsed Sidebar: Icons only with tooltips */
                  <div className="space-y-1.5 flex flex-col items-center">
                    {/* Overview */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center justify-center size-9.5 rounded-xl transition-all ${
                            pathname === "/dashboard"
                              ? "bg-[#141721] text-white border border-[#222838] shadow-xs"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                          }`}
                        >
                          <LayoutDashboard className={`size-4.5 shrink-0 ${pathname === "/dashboard" ? "text-primary" : "text-zinc-400"}`} />
                          <span className="sr-only">Overview</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        Overview
                      </TooltipContent>
                    </Tooltip>

                    {/* My Subdomains */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/dashboard/domains"
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center justify-center size-9.5 rounded-xl transition-all ${
                            pathname.startsWith("/dashboard/domains")
                              ? "bg-[#141721] text-white border border-[#222838] shadow-xs"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                          }`}
                        >
                          <Globe className={`size-4.5 shrink-0 ${pathname.startsWith("/dashboard/domains") ? "text-primary" : "text-zinc-400"}`} />
                          <span className="sr-only">My Subdomains</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        My Subdomains
                      </TooltipContent>
                    </Tooltip>

                    {/* System Status */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/subdomain-status"
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center justify-center size-9.5 rounded-xl transition-all ${
                            pathname === "/subdomain-status"
                              ? "bg-[#141721] text-white border border-[#222838] shadow-xs"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                          }`}
                        >
                          <Activity className={`size-4.5 shrink-0 ${pathname === "/subdomain-status" ? "text-primary" : "text-zinc-400"}`} />
                          <span className="sr-only">System Status</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        System Status
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: OTHERS */}
            <div className="pt-2">
              {sidebarOpen && (
                <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.12em] text-zinc-400 uppercase select-none">
                  OTHERS
                </div>
              )}
              <div className="space-y-1.5 flex flex-col items-center">
                {/* Documentation */}
                {sidebarOpen ? (
                  <Link
                    href="/docs"
                    onClick={() => setMobileNavOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <BookOpen className="size-4 shrink-0 text-zinc-400" />
                    <span className="truncate">Documentation</span>
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/docs"
                        onClick={() => setMobileNavOpen(false)}
                        className="flex items-center justify-center size-9.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <BookOpen className="size-4.5 shrink-0" />
                        <span className="sr-only">Documentation</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      Documentation
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Report Abuse */}
                {sidebarOpen ? (
                  <Link
                    href="/report"
                    onClick={() => setMobileNavOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <ShieldAlert className="size-4 shrink-0 text-zinc-400" />
                    <span className="truncate">Report Abuse</span>
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/report"
                        onClick={() => setMobileNavOpen(false)}
                        className="flex items-center justify-center size-9.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <ShieldAlert className="size-4.5 shrink-0" />
                        <span className="sr-only">Report Abuse</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      Report Abuse
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Admin Link if user is admin */}
                {isAdmin && (
                  sidebarOpen ? (
                    <Link
                      href="/admin"
                      onClick={() => setMobileNavOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <Shield className="size-4 shrink-0 text-amber-400" />
                      <span className="truncate">Admin Panel</span>
                    </Link>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/admin"
                          onClick={() => setMobileNavOpen(false)}
                          className="flex items-center justify-center size-9.5 rounded-xl text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          <Shield className="size-4.5 shrink-0" />
                          <span className="sr-only">Admin Panel</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        Admin Panel
                      </TooltipContent>
                    </Tooltip>
                  )
                )}
              </div>
            </div>
          </nav>

          {/* NextAdmin "Upgrade to Pro" Bottom Card Style */}
          {sidebarOpen && (
            <div className="p-3 shrink-0">
              <div className="rounded-2xl bg-[#12141c] border border-[#1e2330] p-4 text-center flex flex-col gap-2.5 shadow-md">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white tracking-tight">Free Developer Tier</p>
                  <p className="text-xs text-zinc-400 leading-snug">
                    Claim up to 5 free .arc.bd subdomains with Anycast DNS.
                  </p>
                </div>
                <div className="w-full bg-[#1c202d] h-1.5 rounded-full overflow-hidden border border-[#262c3e]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      subdomainCount >= 5 ? "bg-amber-400" : "bg-[#5750F1]"
                    }`}
                    style={{ width: `${Math.min(100, (subdomainCount / 5) * 100)}%` }}
                  />
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-full h-9 rounded-lg bg-[#5750F1] hover:bg-[#4842e4] text-white font-medium text-xs transition-all shadow-md active:scale-98"
                >
                  <Link href="/dashboard/domains?action=claim">
                    <Plus className="size-3.5 mr-1" /> Claim Subdomain
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Workspace (NextAdmin Unified Shell Architecture) */}
        <div className="min-w-0 flex-1 p-2 sm:p-3 lg:p-3.5 xl:p-4 h-screen overflow-hidden flex flex-col relative z-10 bg-transparent">
          <div className="flex h-full flex-col overflow-hidden border border-[#1e2330] bg-[#0c0e14] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <DashboardHeader
              userEmail={userEmail}
              userName={userName}
              avatarUrl={avatarUrl}
              isAdmin={isAdmin}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
              onOpenMobileNav={() => setMobileNavOpen(true)}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
              <div className="w-full space-y-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
