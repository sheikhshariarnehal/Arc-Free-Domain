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
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all">
              <Globe className="size-4 text-blue-400" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              ARC<span className="text-blue-400 font-mono">.BD</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/report" className="hover:text-white transition-colors">Report Abuse</Link>
          </div>

          {/* Desktop User Profile Dropdown / Sign In Button */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="skeuo-button skeuo-button-outline px-3.5 py-1.5 h-9 text-xs gap-2 text-white">
                    <Avatar className="size-5 border border-white/20">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[9px] font-bold font-mono">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[100px] truncate text-slate-200">
                      {userName}
                    </span>
                    <ChevronDown className="size-3 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-2 space-y-1 bg-card border-white/15 shadow-xl">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                        {isAdmin ? (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-blue-400 border-blue-500/30">Developer</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-white/10 focus:text-white rounded-lg">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="size-3.5 text-blue-400" />
                      <span>Dashboard Overview</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-white/10 focus:text-white rounded-lg">
                    <Link href="/dashboard/domains" className="flex items-center gap-2">
                      <Globe2 className="size-3.5 text-slate-400" />
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

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-white/10 rounded-lg">
                    <Link href="/docs" className="flex items-center gap-2">
                      <BookOpen className="size-3.5 text-muted-foreground" />
                      <span>Documentation</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-xs focus:bg-white/10 rounded-lg">
                    <Link href="/report" className="flex items-center gap-2">
                      <Flag className="size-3.5 text-muted-foreground" />
                      <span>Report Abuse</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/10" />

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
              <Button size="sm" variant="outline" asChild className="text-xs font-semibold rounded-full border-white/15">
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
        <div className="md:hidden bg-background/95 border-b border-white/10 px-4 pt-2 pb-4 space-y-2 text-sm font-medium">
          <Link href="/" className="block py-2 text-foreground hover:text-white">Home</Link>
          <Link href="/docs" className="block py-2 text-foreground hover:text-white">Documentation</Link>
          <Link href="/report" className="block py-2 text-foreground hover:text-white">Report Abuse</Link>

          <div className="pt-2 border-t border-white/10">
            {session ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 pb-2">
                  <Avatar className="size-7 border border-white/20">
                    <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs font-bold font-mono">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{userName}</p>
                    <p className="text-[10px] text-muted-foreground">{userEmail}</p>
                  </div>
                </div>

                <Link href="/dashboard" className="block text-blue-400 font-semibold py-1.5">
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
              <Link href="/login" className="text-blue-400 font-semibold block pt-1">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
