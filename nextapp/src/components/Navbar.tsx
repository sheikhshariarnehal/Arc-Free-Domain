"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Globe, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
    <nav className="sticky top-0 z-50 glass-card rounded-none border-t-0 border-x-0 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer">
            <Globe className="h-8 w-8 text-emerald-400" />
            <Link href="/" className="text-xl font-bold text-white tracking-tight">
              ARC<span className="text-emerald-400">.BD</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link href="/docs" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Docs</Link>
              <Link href="/report" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Report Abuse</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                Login / Register
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white focus:outline-none p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-card absolute w-full border-t border-white/10 rounded-b-xl shadow-2xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link href="/" className="hover:text-emerald-400 hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link href="/docs" className="hover:text-emerald-400 hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium">Docs</Link>
            <Link href="/report" className="hover:text-emerald-400 hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium">Report Abuse</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-emerald-400 hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
                <button onClick={handleSignOut} className="text-red-400 text-left hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium">Sign Out</button>
              </>
            ) : (
              <Link href="/login" className="text-emerald-400 hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

