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

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<{ user?: { id: string; email?: string; user_metadata?: Record<string, string> } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string; role?: string } | null>(null);

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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md transform-gpu will-change-transform">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform overflow-hidden" style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.25)" }}>
            <Image src="/arc.png" alt="ARC.BD Logo" width={32} height={32} className="size-7 object-contain" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            ARC<span className="text-blue-400 font-mono">.BD</span>
          </span>
        </Link>

        {/* High-Contrast Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-sm font-semibold">
          <Link href="/" className="text-slate-200 hover:text-white transition-colors">
            Overview
          </Link>
          <Link href="/docs" className="text-slate-200 hover:text-white transition-colors">
            Documentation
          </Link>
          <Link href="/docs/vercel" className="text-slate-200 hover:text-white transition-colors">
            Deployment Guides
          </Link>
          <Link href="/report" className="text-slate-200 hover:text-white transition-colors">
            Abuse Center
          </Link>
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="size-8 rounded-full bg-white/10 animate-pulse" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="skeuo-button px-3.5 py-1.5 h-9 text-xs gap-2 text-white border-0 outline-none">
                  <Avatar className="size-5">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={`${userName}'s profile`} className="object-cover" />}
                    <AvatarFallback className="bg-blue-500/30 text-blue-400 text-[9px] font-bold font-mono">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[110px] truncate text-white font-semibold">
                    {userName}
                  </span>
                  <ChevronDown className="size-3 text-slate-300" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60 p-2 space-y-1 bg-card border-none shadow-2xl rounded-xl">
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
                    <p className="text-[11px] text-slate-300 truncate font-mono">{userEmail}</p>
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
                      <BookOpen className="size-3.5 mr-2.5 text-slate-300" />
                      Guides &amp; API Docs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-white/10 rounded-lg text-slate-200 focus:text-white font-medium">
                    <Link href="/report" className="flex items-center py-1.5">
                      <AlertTriangle className="size-3.5 mr-2.5 text-slate-300" />
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
            <Button
              asChild
              variant="default"
              size="sm"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-300 transition-colors hover:text-white md:hidden"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="size-5 text-white" /> : <Menu className="size-5 text-white" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="border-b border-white/10 bg-card/95 px-4 pt-3 pb-6 space-y-4 backdrop-blur-md animate-slide-up md:hidden">
          <nav className="flex flex-col space-y-3 font-semibold text-sm">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-slate-200 hover:text-white transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/docs"
              onClick={() => setIsOpen(false)}
              className="text-slate-200 hover:text-white transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/docs/vercel"
              onClick={() => setIsOpen(false)}
              className="text-slate-200 hover:text-white transition-colors"
            >
              Deployment Guides
            </Link>
            <Link
              href="/report"
              onClick={() => setIsOpen(false)}
              className="text-slate-200 hover:text-white transition-colors"
            >
              Abuse Center
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
                  className="w-full justify-center"
                >
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="default"
                size="sm"
                className="w-full justify-center"
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
