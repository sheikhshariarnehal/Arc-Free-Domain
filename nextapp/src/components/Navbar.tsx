"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Globe, LogOut, LayoutDashboard, ArrowRight, Shield, User, Globe2, BookOpen, Flag, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async (currentSession: any) => {
      if (currentSession?.user) {
        const u = currentSession.user;
        setUserEmail(u.email || "");
        setUserName(u.user_metadata?.full_name || u.email?.split("@")[0] || "User");
        
        try {
          const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", u.id)
            .single();
          if (data?.role === "admin") {
            setIsAdmin(true);
          }
        } catch {
          // ignore if table profile not populated yet
        }
      } else {
        setUserEmail("");
        setUserName("");
        setIsAdmin(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUser(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchUser(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "U";
    return nameStr.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
              <Globe className="size-4" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">
              ARC<span className="text-emerald-400 font-mono">.BD</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link href="/report" className="hover:text-foreground transition-colors">Report Abuse</Link>
          </div>

          {/* Desktop User Profile Dropdown / Sign In Button */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 px-3 border-border/80 bg-card hover:bg-secondary/80 flex items-center gap-2.5 rounded-xl transition-all"
                  >
                    <Avatar className="size-6 border border-emerald-500/30">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-foreground max-w-[120px] truncate">
                      {userName}
                    </span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-2 space-y-1">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                        {isAdmin ? (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Admin</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 text-emerald-400 border-emerald-500/30">Developer</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-border/60" />

                  <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-emerald-500/10 focus:text-emerald-400 rounded-lg">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="size-3.5 text-emerald-400" />
                      <span>Dashboard Overview</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-emerald-500/10 focus:text-emerald-400 rounded-lg">
                    <Link href="/dashboard/domains" className="flex items-center gap-2">
                      <Globe2 className="size-3.5 text-emerald-400" />
                      <span>My Subdomains</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-purple-500/10 focus:text-purple-400 rounded-lg">
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="size-3.5 text-purple-400" />
                        <span>Admin Control Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-border/60" />

                  <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-secondary rounded-lg">
                    <Link href="/docs" className="flex items-center gap-2">
                      <BookOpen className="size-3.5 text-muted-foreground" />
                      <span>Documentation</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-secondary rounded-lg">
                    <Link href="/report" className="flex items-center gap-2">
                      <Flag className="size-3.5 text-muted-foreground" />
                      <span>Report Abuse</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/60" />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg"
                  >
                    <LogOut className="size-3.5 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="outline" asChild className="text-xs font-semibold rounded-xl border-border/80 hover:bg-secondary">
                <Link href="/login">
                  Sign In <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground hover:text-foreground p-2">
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-background/95 border-b border-border px-4 pt-2 pb-4 space-y-2 text-sm font-medium">
          <Link href="/" className="block py-2 text-foreground hover:text-emerald-400">Home</Link>
          <Link href="/docs" className="block py-2 text-foreground hover:text-emerald-400">Documentation</Link>
          <Link href="/report" className="block py-2 text-foreground hover:text-emerald-400">Report Abuse</Link>

          <div className="pt-2 border-t border-border">
            {session ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 pb-2">
                  <Avatar className="size-7 border border-emerald-500/30">
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{userName}</p>
                    <p className="text-[10px] text-muted-foreground">{userEmail}</p>
                  </div>
                </div>

                <Link href="/dashboard" className="block text-emerald-400 font-semibold py-1.5">
                  Dashboard Overview
                </Link>
                <Link href="/dashboard/domains" className="block text-slate-300 py-1.5">
                  My Subdomains
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="block text-purple-400 font-semibold py-1.5">
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleSignOut} className="text-destructive text-xs block py-1.5">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-emerald-400 font-semibold block pt-1">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
