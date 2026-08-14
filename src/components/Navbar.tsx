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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
      setProfile(data);
    } catch {
      // Fallback profile
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
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

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none px-3 pt-3 sm:pt-4 transition-all duration-300">
      <div
        className={`pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 transition-all duration-300 ease-out ${
          scrolled
            ? "w-full max-w-lg sm:max-w-xl h-10.5 sm:h-11 bg-gradient-to-b from-white/[0.24] via-white/[0.10] to-[#090b0f]/85 backdrop-blur-2xl backdrop-saturate-180 shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.35),0_12px_32px_-8px_rgba(0,0,0,0.6)] px-3.5 rounded-full"
            : "w-full max-w-4xl h-12 sm:h-14 bg-transparent backdrop-blur-none shadow-none border-none px-4 sm:px-6"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <div
            className="size-6.5 rounded-full bg-white/[0.08] flex items-center justify-center text-white group-hover:scale-105 transition-transform overflow-hidden"
          >
            <Image src="/arc.png" alt="ARC.BD Logo" width={22} height={22} className="size-4.5 object-contain" />
          </div>
          <span className="font-bold text-xs sm:text-[13px] tracking-tight text-white">
            ARC<span className="text-blue-400 font-mono">.BD</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-[13px] font-medium tracking-tight">
          <Link href="/" className="text-slate-300 hover:text-white transition-colors duration-200">
            Home
          </Link>
          <Link href="/docs" className="text-slate-400 hover:text-white transition-colors duration-200">
            Docs
          </Link>
          <Link href="/report" className="text-slate-400 hover:text-white transition-colors duration-200">
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
                <button className="flex items-center gap-1.5 h-7.5 rounded-full bg-gradient-to-b from-white/[0.22] to-white/[0.08] hover:from-white/[0.30] hover:to-white/[0.14] px-2.5 text-xs text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 outline-none">
                  <Avatar className="size-4.5">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={`${userName}'s profile`} className="object-cover" />}
                    <AvatarFallback className="bg-blue-500/30 text-blue-400 text-[8px] font-bold font-mono">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[75px] sm:max-w-[100px] truncate text-white text-[11px] font-medium">
                    {userName}
                  </span>
                  <ChevronDown className="size-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-2 space-y-1 bg-[#0e1015]/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl">
                <DropdownMenuLabel className="font-normal p-2.5">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white truncate">{userName}</p>
                      {isAdmin ? (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-blue-400 border-none bg-blue-500/20 font-semibold">Developer</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate font-mono">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/10 rounded-lg text-slate-200 focus:text-white font-medium">
                    <Link href="/dashboard" className="flex items-center py-1.5">
                      <LayoutDashboard className="size-3.5 mr-2.5 text-blue-400" />
                      Dashboard Overview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/10 rounded-lg text-slate-200 focus:text-white font-medium">
                    <Link href="/dashboard/domains" className="flex items-center py-1.5">
                      <Globe2 className="size-3.5 mr-2.5 text-blue-400" />
                      My Subdomains
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/10 rounded-lg text-slate-200 focus:text-white font-medium">
                      <Link href="/admin" className="flex items-center py-1.5">
                        <Shield className="size-3.5 mr-2.5 text-destructive" />
                        Admin Management
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/10 rounded-lg text-slate-200 focus:text-white font-medium">
                    <Link href="/docs" className="flex items-center py-1.5">
                      <BookOpen className="size-3.5 mr-2.5 text-slate-400" />
                      Guides &amp; API Docs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/10 rounded-lg text-slate-200 focus:text-white font-medium">
                    <Link href="/report" className="flex items-center py-1.5">
                      <AlertTriangle className="size-3.5 mr-2.5 text-slate-400" />
                      Report Abuse
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg py-1.5 font-medium"
                >
                  <LogOut className="size-3.5 mr-2.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white font-medium text-xs px-3.5 py-1 transition-all duration-200 border-none"
            >
              Sign In
            </Link>
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

      {/* Mobile Floating Drawer */}
      {isOpen && (
        <div className="pointer-events-auto absolute top-16 inset-x-4 max-w-md mx-auto rounded-2xl border border-white/15 bg-[#0e1118]/95 p-4 space-y-4 backdrop-blur-2xl shadow-2xl animate-slide-up md:hidden">
          <nav className="flex flex-col space-y-2.5 font-medium text-sm">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-slate-200 hover:text-white transition-colors p-1"
            >
              Home
            </Link>
            <Link
              href="/docs"
              onClick={() => setIsOpen(false)}
              className="text-slate-200 hover:text-white transition-colors p-1"
            >
              Docs
            </Link>
            <Link
              href="/report"
              onClick={() => setIsOpen(false)}
              className="text-slate-200 hover:text-white transition-colors p-1"
            >
              Report Abuse
            </Link>
          </nav>
          <div className="pt-2 border-t border-white/10 flex flex-col space-y-2">
            {session ? (
              <>
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="text-xs">
                    <p className="font-semibold text-white">{userName}</p>
                    <p className="text-slate-300 font-mono">{userEmail}</p>
                  </div>
                  {isAdmin && <Badge variant="destructive" className="text-[9px]">Admin</Badge>}
                </div>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="w-full justify-center rounded-full"
                >
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="default"
                size="sm"
                className="w-full justify-center rounded-full"
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
