"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X, Shield, LogOut, ChevronDown, LayoutDashboard, Globe2, AlertTriangle, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({ transparent = false }: { transparent?: boolean } = {}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<{ user?: { id: string; email?: string; user_metadata?: Record<string, string> } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string; role?: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let prev = window.scrollY > 20;
    setScrolled(prev);
    const handleScroll = () => {
      const next = window.scrollY > 20;
      if (next !== prev) {
        prev = next;
        setScrolled(next);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) {
        setProfile(data);
      }
    } catch {
      // Fallback profile
    }
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const userName = profile?.full_name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";
  const avatarUrl = profile?.avatar_url || session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture;
  const isAdmin = profile?.role === "admin";

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isScrolled = mounted && scrolled;

  return (
    <header
      suppressHydrationWarning
      className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none px-3 pt-3 sm:pt-4 transform-gpu"
    >
      <div
        suppressHydrationWarning
        className={`pointer-events-auto flex items-center justify-between transition-[max-width,background-color,backdrop-filter,box-shadow,border-radius] duration-300 ease-out transform-gpu ${
          isScrolled
            ? "w-full max-w-lg sm:max-w-xl h-11 bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.40),0_10px_30px_-8px_rgba(0,0,0,0.35)] px-3.5 sm:px-4 rounded-full"
            : "w-full max-w-xl md:max-w-5xl h-11 bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-white/[0.04] md:bg-none md:bg-transparent backdrop-blur-xl md:backdrop-blur-none shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.40),0_10px_30px_-8px_rgba(0,0,0,0.35)] md:shadow-none border-none px-3.5 md:px-6 rounded-full md:rounded-none"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <div
            className="size-6.5 rounded-full bg-white/[0.08] flex items-center justify-center text-white group-hover:scale-105 transition-transform overflow-hidden"
          >
            <Image src="/ARC.webp" alt="ARC.BD Logo" width={22} height={22} className="size-4.5 object-contain" />
          </div>
          <span className="font-bold text-xs sm:text-[13px] tracking-tight text-white">
            ARC<span className="text-zinc-400 font-mono">.BD</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-[13px] font-medium tracking-tight">
          <Link href="/" className="text-zinc-200 hover:text-white transition-colors duration-200">
            Home
          </Link>
          <Link href="/docs" className="text-zinc-400 hover:text-white transition-colors duration-200">
            Docs
          </Link>
          <Link href="/report" className="text-zinc-400 hover:text-white transition-colors duration-200">
            Report Abuse
          </Link>
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {loading ? (
            <div className="size-6.5 rounded-full bg-white/10 animate-pulse" />
          ) : session ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-7.5 pl-0.5 pr-2 rounded-full hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 group cursor-pointer">
                  <Avatar className="size-6 ring-1 ring-white/20">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={`${userName}'s profile`} className="object-cover" />}
                    <AvatarFallback className="bg-white/10 text-white text-[10px] font-semibold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] lg:max-w-[160px] truncate text-zinc-200 group-hover:text-white text-xs font-medium tracking-tight transition-colors">
                    {userName}
                  </span>
                  <ChevronDown className="size-3 text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                style={{
                  backgroundImage: "linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 20px 48px 0 rgba(0, 0, 0, 0.7)",
                }}
                className="w-64 p-2 space-y-1 bg-[#101014]/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.14] rounded-2xl relative overflow-hidden text-card-foreground"
              >
                {/* Specular Radial Light Sheen */}
                <span
                  className="absolute inset-0 pointer-events-none rounded-[inherit]"
                  style={{
                    background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 255, 255, 0.12), transparent 70%)",
                  }}
                />

                <DropdownMenuLabel className="font-normal px-2.5 py-2 relative z-10">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white tracking-tight truncate">{userName}</p>
                      {isAdmin ? (
                        <Badge variant="destructive" className="text-[10px] px-2 py-0.5 h-4 font-mono rounded-full">Admin</Badge>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-blue-400/30 bg-blue-500/15 text-blue-400">
                          Developer
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/[0.08] my-1" />

                <DropdownMenuGroup className="relative z-10 space-y-0.5">
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/[0.08] focus:text-white hover:bg-white/[0.08] text-zinc-200 hover:text-white rounded-xl py-2 px-2.5 font-medium transition-all">
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="size-4 mr-2.5 text-blue-400 shrink-0" />
                      <span>Dashboard Overview</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/[0.08] focus:text-white hover:bg-white/[0.08] text-zinc-200 hover:text-white rounded-xl py-2 px-2.5 font-medium transition-all">
                    <Link href="/dashboard/domains" className="flex items-center">
                      <Globe2 className="size-4 mr-2.5 text-blue-400 shrink-0" />
                      <span>My Subdomains</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-amber-500/15 focus:text-amber-300 text-amber-400 rounded-xl py-2 px-2.5 font-medium transition-all">
                      <Link href="/admin" className="flex items-center">
                        <Shield className="size-4 mr-2.5 text-amber-400 shrink-0" />
                        <span>Admin Management</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/[0.08] my-1" />

                <DropdownMenuGroup className="relative z-10 space-y-0.5">
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/[0.08] focus:text-white hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded-xl py-2 px-2.5 font-medium transition-all">
                    <Link href="/docs" className="flex items-center">
                      <BookOpen className="size-4 mr-2.5 text-zinc-400 shrink-0" />
                      <span>Guides &amp; API Docs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/[0.08] focus:text-white hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded-xl py-2 px-2.5 font-medium transition-all">
                    <Link href="/report" className="flex items-center">
                      <Shield className="size-4 mr-2.5 text-zinc-400 shrink-0" />
                      <span>Report Abuse</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/[0.08] my-1" />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-xs text-red-400 focus:bg-red-500/15 focus:text-red-300 hover:bg-red-500/15 hover:text-red-300 cursor-pointer rounded-xl py-2 px-2.5 font-medium transition-all relative z-10"
                >
                  <LogOut className="size-4 mr-2.5 shrink-0 text-red-400" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="default"
              className="h-7.5 sm:h-8 rounded-full px-3.5 text-xs font-semibold"
            >
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-slate-400 transition-colors hover:text-white md:hidden shrink-0"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="size-4.5 text-white" /> : <Menu className="size-4.5 text-white" />}
        </button>
      </div>

      {/* Mobile Floating Drawer (Matches Header Glass Aesthetic) */}
      {isOpen && (
        <div className="pointer-events-auto absolute top-15 inset-x-3 max-w-lg sm:max-w-xl mx-auto rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.20] via-white/[0.08] to-white/[0.04] bg-[#09090b]/85 p-4 space-y-3.5 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.40),0_20px_40px_-15px_rgba(0,0,0,0.7)] animate-slide-up md:hidden">
          <nav className="flex flex-col space-y-1 font-medium text-sm">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-zinc-200 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="flex items-center gap-3">
                <Globe2 className="size-4 text-zinc-400 shrink-0" />
                Home
              </span>
            </Link>
            <Link
              href="/docs"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-zinc-200 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="flex items-center gap-3">
                <BookOpen className="size-4 text-zinc-400 shrink-0" />
                Documentation
              </span>
            </Link>
            <Link
              href="/report"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-zinc-200 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="flex items-center gap-3">
                <Shield className="size-4 text-zinc-400 shrink-0" />
                Report Abuse
              </span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col space-y-2.5">
            {session ? (
              <>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.12] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]">
                  <div className="text-xs min-w-0 pr-2">
                    <p className="font-semibold text-white tracking-tight truncate">{userName}</p>
                    <p className="text-zinc-400 font-mono text-[11px] truncate">{userEmail}</p>
                  </div>
                  {isAdmin ? (
                    <Badge variant="destructive" className="text-[10px] font-mono shrink-0 rounded-full px-2">Admin</Badge>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-blue-400/30 bg-blue-500/15 text-blue-400 shrink-0">Developer</span>
                  )}
                </div>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="w-full justify-center rounded-full h-9 font-semibold text-xs bg-white text-zinc-950 hover:bg-zinc-200"
                >
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <LayoutDashboard className="size-3.5 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8 text-xs font-medium"
                >
                  <LogOut className="size-3.5 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="default"
                size="sm"
                className="w-full justify-center rounded-full h-9.5 font-semibold text-xs bg-white text-zinc-950 hover:bg-zinc-200"
              >
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
