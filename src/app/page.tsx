"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search, CheckCircle, XCircle, Gift, Zap, Code, Shield, Settings, Loader2, Lock, Lightbulb, Globe, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle');
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const checkAvailability = async (e?: React.FormEvent, nameOverride?: string) => {
    if (e) e.preventDefault();
    const query = (nameOverride || searchQuery).trim();
    if (!query) return;
    setLoading(true);
    setAvailability('idle');

    try {
      const res = await fetch(`/api/subdomains/check?name=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.available) {
        setAvailability('available');
      } else {
        setAvailability('taken');
      }
    } catch {
      setAvailability('taken');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setAvailability('idle');
    checkAvailability(undefined, suggestion);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setAvailability('idle');
  };

  const handleClaimClick = async () => {
    if (!searchQuery.trim()) return;
    setClaiming(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      try {
        const res = await fetch("/api/subdomains/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: searchQuery.trim() }),
        });
        const data = await res.json();
        if (res.ok) {
          router.push(`/dashboard/domains/${data.id || ''}`);
        } else {
          setAvailability('taken');
        }
      } catch {
        setAvailability('taken');
      } finally {
        setClaiming(false);
      }
    } else {
      router.push(`/login?claim=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getAlternatives = (query: string) => {
    const clean = query.trim().toLowerCase();
    return [`${clean}-app`, `${clean}-dev`, `get-${clean}`];
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-400 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex min-w-0 w-full flex-col items-center">
        {/* Hero Section */}
        <section className="mx-auto flex w-full min-w-0 max-w-5xl flex-col items-center px-4 py-[clamp(2.5rem,7vh,4.5rem)] text-center sm:px-6 lg:px-8">

          {/* Beta Badge */}
          <div className="mb-4 flex items-center justify-center gap-1.5 font-mono text-[11px] font-medium text-blue-400 sm:mb-5 sm:text-xs">
            <span className="size-1.5 rounded-full bg-blue-400" />
            <span>Public Beta</span>
          </div>

          {/* Headline */}
          <h1 className="mb-4 w-full max-w-4xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-white sm:mb-5">
            <span className="block">Get Your Free</span>
            <span className="mt-1 block text-blue-400 sm:mt-2">.arc.bd Domain</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-6 w-full max-w-2xl px-2 text-sm font-medium leading-relaxed text-slate-300 sm:mb-8 sm:px-0 sm:text-base">
            Claim your free <code className="font-mono font-semibold text-blue-400">.arc.bd</code> subdomain in seconds.{" "}
            <span className="inline">Direct routing to Vercel, Netlify, GitHub Pages, or custom VPS.</span>
          </p>

          {/* Search Bar */}
          <div className="w-full min-w-0 max-w-xl px-0 sm:px-1">
            <form onSubmit={checkAvailability} className="w-full">
              {/* Mobile Input Container */}
              <div className="flex flex-col gap-2.5 sm:hidden w-full">
                <div className="relative flex items-center skeuo-input rounded-full px-4.5 py-3 transition-all group w-full overflow-hidden">
                  <Search className="size-4 text-slate-400 shrink-0 mr-2.5 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="myproject"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setAvailability('idle');
                    }}
                    className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none font-mono font-medium pr-2"
                  />
                  {searchQuery && (
                    <button type="button" onClick={clearSearch} className="p-1 text-slate-400 hover:text-white transition-colors mr-1 shrink-0">
                      <X className="size-3.5" />
                    </button>
                  )}
                  <span className="text-xs text-blue-400 font-mono font-bold shrink-0 select-none bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-400/20">
                    .arc.bd
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="default"
                  className="w-full h-11 text-xs font-semibold rounded-full"
                >
                  {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Search className="size-3.5 mr-1.5" />}
                  {loading ? "Checking..." : "Check Availability"}
                </Button>
              </div>

              <div className="hidden sm:flex relative items-center skeuo-input rounded-full p-1.5 pl-4 transition-all group overflow-hidden">
                <Search className="size-4 text-slate-400 shrink-0 mr-2.5 transition-colors group-focus-within:text-blue-400" />
                <input
                  type="text"
                  placeholder="myproject"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setAvailability('idle');
                  }}
                  className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none font-mono font-medium"
                />
                {searchQuery && (
                  <button type="button" onClick={clearSearch} className="p-1 text-slate-400 hover:text-white transition-colors mr-1 shrink-0">
                    <X className="size-3.5" />
                  </button>
                )}
                <span className="text-xs text-slate-300 font-mono font-semibold mr-3 shrink-0 select-none">.arc.bd</span>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="default"
                  className="h-10 px-5 text-xs font-semibold shrink-0 rounded-full"
                >
                  {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Search className="size-3.5 mr-1" />}
                  {loading ? "Checking..." : "Check Availability"}
                </Button>
              </div>
            </form>

            {/* Availability Result Card */}
            {availability !== 'idle' && (
              <div className="w-full mt-3 animate-slide-up">
                {availability === 'available' && (
                  <div className="flex w-full flex-col items-stretch gap-3 rounded-lg border border-blue-400/30 bg-blue-400/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-2.5 text-sm text-white font-mono">
                      <CheckCircle className="size-4 text-blue-400 shrink-0" />
                      <span><strong className="font-semibold">{searchQuery}</strong>.arc.bd</span>
                    </div>
                    <Button
                      onClick={handleClaimClick}
                      disabled={claiming}
                      className="h-8 w-full shrink-0 rounded-full px-4 text-xs whitespace-nowrap sm:w-auto"
                    >
                      {claiming && <Loader2 className="size-3 mr-1.5 animate-spin" />}
                      {claiming ? "Claiming..." : "Claim Free"}
                    </Button>
                  </div>
                )}

                {availability === 'taken' && (
                  <div className="flex flex-col gap-2.5 p-4 rounded-lg w-full border border-destructive/30 bg-destructive/10">
                    <div className="flex items-center gap-2 text-sm text-white font-mono">
                      <XCircle className="size-4 shrink-0 text-destructive" />
                      <span><strong className="font-semibold">{searchQuery}</strong>.arc.bd unavailable</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-destructive/20 text-xs font-mono text-slate-200">
                      <span className="flex items-center gap-1.5 text-white font-medium shrink-0">
                        <Lightbulb className="size-3.5 text-amber-400" /> Try instead:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {getAlternatives(searchQuery).map((alt) => (
                          <button
                            key={alt}
                            onClick={() => handleSuggestionClick(alt)}
                            className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-blue-500/30 text-white hover:text-blue-300 border-none transition-all cursor-pointer text-[11px] sm:text-xs font-mono font-medium shadow-[inset_0_1px_0px_0_rgba(255,255,255,0.2)]"
                          >
                            {alt}.arc.bd
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Platform Feature Pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-300 sm:mt-7 sm:gap-x-5 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <Globe className="size-3.5 text-white shrink-0" /> Free Forever
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-white shrink-0" /> DNS Ready
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-white shrink-0" /> SSL Enabled
              </span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section
          className="w-full max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10"
          style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">Minimal Infrastructure</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium max-w-md mx-auto">Built for speed, reliability, and modern web developer workflows.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Gift, title: "Free Forever", desc: "No credit card required. 100% free subdomains for personal and commercial projects." },
              { icon: Zap, title: "Instant Cloudflare DNS", desc: "Global edge propagation in seconds via Cloudflare DNS API v4 integration." },
              { icon: Code, title: "Deploy Anywhere", desc: "Native support for Vercel, Netlify, GitHub Pages, Render, Railway, or VPS." },
              { icon: Shield, title: "99.9% High Availability", desc: "Backed by Cloudflare global anycast network for rock-solid uptime." },
              { icon: Settings, title: "Clean DNS Controls", desc: "Full control over A, CNAME, and TXT records right from your dashboard." },
              { icon: Globe, title: "Developer Community", desc: "Designed for Bangladesh and global builders bringing ideas online." }
            ].map((item, i) => (
              <Card key={i} className="p-5 flex flex-col gap-2.5 border border-white/10 bg-card/90">
                <CardContent className="p-0 flex flex-col gap-2.5">
                  <div
                    className="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white"
                    style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.25)" }}
                  >
                    <item.icon className="size-4 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 3-Step Process */}
        <section
          className="w-full max-w-4xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 text-center"
          style={{ contentVisibility: "auto", containIntrinsicSize: "500px" }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-8 sm:mb-12">Three Simple Steps</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { num: "01", title: "Search Domain", desc: "Type your preferred name and verify real-time availability." },
              { num: "02", title: "Claim Free", desc: "Sign up in seconds to lock your subdomain into your account." },
              { num: "03", title: "Configure DNS", desc: "Point your domain to Vercel, Netlify, GitHub Pages, or any server." }
            ].map((step, i) => (
              <Card key={i} className="text-center p-5 sm:p-6 border border-white/10 bg-card/90">
                <CardContent className="p-0 flex flex-col items-center">
                  <span className="font-mono text-lg sm:text-xl font-bold text-blue-400 mb-2">{step.num}</span>
                  <h3 className="font-semibold text-sm text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded bg-white/12 flex items-center justify-center text-white overflow-hidden"
              style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.25)" }}
            >
              <Image src="/arc.png" alt="ARC.BD Logo" width={20} height={20} className="size-4 object-contain" />
            </div>
            <span className="font-semibold text-white">ARC.BD</span>
            <span className="text-slate-300">&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-300 font-medium">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/report" className="hover:text-white transition-colors">Report Abuse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
