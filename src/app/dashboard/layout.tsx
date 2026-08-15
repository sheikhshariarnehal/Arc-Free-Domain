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
  ChevronsUpDown,
  ChevronRight,
  X,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Activity,
  Plus,
  Sparkles,
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
      <div className="min-h-screen flex bg-background text-foreground">
        {/* Mobile overlay backdrop */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed md:sticky top-0 left-0 z-50 flex flex-col h-screen bg-background/95 backdrop-blur-md border-r border-border/60 transition-all duration-300 ease-in-out shrink-0 select-none ${
            mobileNavOpen
              ? "translate-x-0 w-64 shadow-2xl"
              : "-translate-x-full md:translate-x-0"
          } ${sidebarOpen ? "md:w-64" : "md:w-16"}`}
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between px-3.5 border-b border-border/60 h-14 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 overflow-hidden group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md p-1"
            >
              <div className="size-7 rounded-md bg-white/[0.06] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                <Image
                  src="/ARC.webp"
                  alt="ARC.BD Logo"
                  width={24}
                  height={24}
                  className="size-5 object-contain"
                />
              </div>
              {sidebarOpen && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-bold tracking-tight text-white">ARC<span className="text-zinc-400 font-mono">.BD</span></span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 font-mono">
                    DEV
                  </Badge>
                </div>
              )}
            </Link>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary"
              aria-label="Close navigation menu"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Navigation Links Area */}
          <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
            {/* Primary Dashboard Links */}
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              if (!sidebarOpen) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center justify-center size-9 mx-auto rounded-lg transition-all ${
                          isActive
                            ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                        }`}
                      >
                        <item.icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-zinc-400"}`} />
                        <span className="sr-only">{item.name}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all group ${
                    isActive
                      ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <item.icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-200"} transition-colors`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                </Link>
              );
            })}

            {/* Documentation Links */}
            {resourceNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);

              if (!sidebarOpen) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center justify-center size-9 mx-auto rounded-lg transition-all ${
                          isActive
                            ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                        }`}
                      >
                        <item.icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-zinc-400"}`} />
                        <span className="sr-only">{item.name}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all group ${
                    isActive
                      ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <item.icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-200"} transition-colors`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                </Link>
              );
            })}

            {/* Admin Panel (If Administrator) */}
            {isAdmin && (
              <>
                <div className="pt-2 pb-1">
                  <Separator className="bg-border/60" />
                </div>
                {sidebarOpen ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium text-amber-400 hover:bg-amber-500/15 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Shield className="size-4 shrink-0 text-amber-400 group-hover:scale-105 transition-transform" />
                      <span className="truncate">Admin Panel</span>
                    </div>
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/admin"
                        onClick={() => setMobileNavOpen(false)}
                        className="flex items-center justify-center size-9 mx-auto rounded-lg text-amber-400 hover:bg-amber-500/15 transition-colors"
                      >
                        <Shield className="size-4 shrink-0" />
                        <span className="sr-only">Admin Panel</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      Admin Panel
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </nav>

          {/* Subdomain Quota Capsule */}
          {sidebarOpen && (
            <div className="mx-2.5 mb-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Domain Usage</span>
                <span className={`font-mono text-[11px] font-semibold ${remainingSlots === 0 ? "text-amber-400" : "text-zinc-300"}`}>
                  {subdomainCount} / 5
                </span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    remainingSlots === 0 ? "bg-amber-400" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, (subdomainCount / 5) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Bottom User Profile Trigger */}
          <div className="p-2 shrink-0 border-t border-border/60">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex w-full items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.10] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all cursor-pointer group ${
                    !sidebarOpen ? "justify-center" : ""
                  }`}
                  aria-label="User profile and account settings"
                >
                  <Avatar className="size-7.5 shrink-0 ring-1 ring-white/15">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold font-mono">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-medium text-white truncate">{userName}</p>
                        <p className="text-[11px] text-zinc-400 truncate font-mono">{userEmail}</p>
                      </div>
                      <ChevronsUpDown className="size-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0" />
                    </>
                  )}
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
                      <LayoutDashboard className="size-4 text-muted-foreground" /> Overview
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
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-2 text-amber-400">
                        <Shield className="size-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
          <DashboardHeader
            userEmail={userEmail}
            userName={userName}
            avatarUrl={avatarUrl}
            isAdmin={isAdmin}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
