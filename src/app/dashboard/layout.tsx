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
          className={`fixed md:sticky top-0 left-0 z-50 flex flex-col h-screen bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border transition-all duration-300 ease-in-out shrink-0 select-none ${
            mobileNavOpen
              ? "translate-x-0 w-64 shadow-2xl"
              : "-translate-x-full md:translate-x-0"
          } ${sidebarOpen ? "md:w-64" : "md:w-16"}`}
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between px-3.5 border-b border-sidebar-border h-14 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 overflow-hidden group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md p-0.5"
            >
              <Image
                src="/ARC.webp"
                alt="ARC.BD Logo"
                width={30}
                height={30}
                className="size-7.5 object-contain rounded-md shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
              {sidebarOpen && (
                <div className="flex flex-col leading-none min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-sidebar-foreground">ARC.BD</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-primary/10 text-primary border-primary/20 font-mono">
                      FREE
                    </Badge>
                  </div>
                  <span className="text-[10.5px] text-muted-foreground truncate mt-0.5">Free Subdomains</span>
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
          <nav className="flex-1 px-2.5 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
            {/* Admin Section (If Administrator) */}
            {isAdmin && (
              <div className="space-y-1">
                {sidebarOpen && (
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                    Administration
                  </p>
                )}
                {sidebarOpen ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-500/15 border border-amber-500/20 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Shield className="size-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="truncate">Admin Panel</span>
                    </div>
                    <ChevronRight className="size-3.5 text-amber-400/70 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/admin"
                        onClick={() => setMobileNavOpen(false)}
                        className="flex items-center justify-center size-10 mx-auto rounded-lg text-amber-400 hover:bg-amber-500/15 border border-amber-500/20 transition-colors"
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
              </div>
            )}

            {/* Main Navigation Section */}
            <div className="space-y-1">
              {sidebarOpen && (
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Manage
                </p>
              )}

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
                          className={`flex items-center justify-center size-10 mx-auto rounded-lg transition-colors relative ${
                            isActive
                              ? "bg-secondary text-primary font-semibold shadow-xs"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                          }`}
                        >
                          <item.icon className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                          {isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-primary" />
                          )}
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
                    className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-secondary text-foreground font-semibold shadow-2xs border border-border/60"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <item.icon className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isActive ? (
                      <span className="size-1.5 rounded-full bg-primary" />
                    ) : (
                      <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Resources Section */}
            <div className="space-y-1">
              {sidebarOpen && (
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Resources
                </p>
              )}

              {resourceNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center justify-center size-10 mx-auto rounded-lg transition-colors ${
                            isActive
                              ? "bg-secondary text-primary font-semibold"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                          }`}
                        >
                          <item.icon className="size-4 shrink-0" />
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
                    className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-secondary text-foreground font-semibold shadow-2xs border border-border/60"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Subdomain Quota Widget */}
          {sidebarOpen && (
            <div className="px-3 py-3 mx-2.5 mb-2 rounded-xl bg-secondary/40 border border-border/60 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">Subdomains Claimed</span>
                <span className="font-mono font-semibold text-foreground">{subdomainCount} of 5</span>
              </div>
              <Progress value={Math.min((subdomainCount / 5) * 100, 100)} className="h-1.5" />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                <span>{remainingSlots === 0 ? "Quota full" : `${remainingSlots} slot(s) left`}</span>
                <Link
                  href="/dashboard/domains?action=claim"
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5"
                >
                  + Claim <Sparkles className="size-2.5" />
                </Link>
              </div>
            </div>
          )}

          <Separator className="bg-sidebar-border" />

          {/* Bottom User Profile Trigger */}
          <div className="p-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex w-full items-center gap-2.5 p-2 rounded-xl hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                    !sidebarOpen ? "justify-center" : ""
                  }`}
                  aria-label="User profile and account settings"
                >
                  <Avatar className="size-8 shrink-0 border border-sidebar-border shadow-2xs">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-semibold text-sidebar-foreground truncate">{userName}</p>
                        <p className="text-[10.5px] text-muted-foreground truncate">{userEmail}</p>
                      </div>
                      <ChevronsUpDown className="size-3.5 text-muted-foreground/70 shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border shadow-2xl p-1.5">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                    {isAdmin ? (
                      <Badge className="w-fit mt-1 text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono">
                        Administrator
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit mt-1 text-[9px] text-muted-foreground font-mono">
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
