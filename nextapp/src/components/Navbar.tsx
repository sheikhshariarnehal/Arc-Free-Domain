"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Globe, LogOut, LayoutDashboard, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
              <Globe className="size-4" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">
              ARC<span className="text-emerald-400 font-mono">.BD</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link href="/report" className="hover:text-foreground transition-colors">Report Abuse</Link>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
                >
                  <LayoutDashboard className="size-3.5 text-emerald-400" />
                  <span>Dashboard</span>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSignOut}
                  className="size-8 rounded-xl border border-border/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" asChild className="text-xs font-semibold rounded-xl border-border/80 hover:bg-secondary">
                <Link href="/login">
                  Sign In <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground hover:text-foreground p-2">
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background/95 border-b border-border px-4 pt-2 pb-4 space-y-2 text-sm font-medium">
          <Link href="/" className="block py-2 text-foreground hover:text-emerald-400">Home</Link>
          <Link href="/docs" className="block py-2 text-foreground hover:text-emerald-400">Documentation</Link>
          <Link href="/report" className="block py-2 text-foreground hover:text-emerald-400">Report Abuse</Link>
          <div className="pt-2 border-t border-border">
            {session ? (
              <div className="flex items-center justify-between pt-1">
                <Link href="/dashboard" className="text-emerald-400 font-semibold flex items-center gap-2">
                  <LayoutDashboard className="size-4" /> Dashboard
                </Link>
                <button onClick={handleSignOut} className="text-destructive text-xs flex items-center gap-1">
                  <LogOut className="size-3" /> Sign Out
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
