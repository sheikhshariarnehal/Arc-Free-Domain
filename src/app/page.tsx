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
import { ShaderBackground } from "@/components/ui/dq";

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
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-400 overflow-x-hidden relative">
      {/* Full-bleed Silk Shader Background covering from top-0 behind Navbar down through Hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[920px] z-0 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 50%, rgba(0, 0, 0, 0.75) 72%, rgba(0, 0, 0, 0.25) 86%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 50%, rgba(0, 0, 0, 0.75) 72%, rgba(0, 0, 0, 0.25) 86%, transparent 100%)",
        }}
      >
        <ShaderBackground className="h-full w-full opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/15 via-60% to-background" />
      </div>

      <Navbar transparent />

      <main className="relative z-10 flex-1 flex min-w-0 w-full flex-col items-center">
        {/* Hero Section */}
        <section className="relative mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-24 pb-12 text-center sm:px-6 sm:pt-28 sm:pb-16 md:min-h-screen md:py-28 lg:px-8">
          {/* Headline */}
            <h1 className="mb-4 w-full max-w-3xl text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-white sm:mb-5">
              <span>Free </span>
              <span className="inline-block bg-[#0e1d36] text-[#3b82f6] px-2 py-0.5 rounded-md border-0 border-transparent shadow-none ring-0 outline-none">
                .arc.bd
              </span>
              <span> domains</span>
              <span className="block mt-1">for developers.</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-6 w-full max-w-xl px-2 text-sm font-normal leading-relaxed text-slate-300 sm:mb-8 sm:px-0 sm:text-base">
              <span className="block">Claim your free custom address. Use it on your</span>
              <span className="block">web site, portfolio or project</span>
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
                      placeholder="your-project"
                      aria-label="Subdomain name to check"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                        setAvailability('idle');
                      }}
                      className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none font-mono font-medium pr-2"
                    />
                    {searchQuery && (
                      <button type="button" onClick={clearSearch} aria-label="Clear subdomain search" className="p-1 text-slate-400 hover:text-white transition-colors mr-1 shrink-0">
                        <X className="size-3.5" />
                      </button>
                    )}
                    <span className="text-xs text-slate-300 font-mono font-semibold mr-1.5 shrink-0 select-none">
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
                    {loading ? "Checking..." : "Check availability"}
                  </Button>
                </div>

                <div className="hidden sm:flex relative items-center skeuo-input rounded-full p-1.5 pl-4 transition-all group overflow-hidden">
                  <Search className="size-4 text-slate-400 shrink-0 mr-2.5 transition-colors group-focus-within:text-blue-400" />
                  <input
                    type="text"
                    placeholder="your-project"
                    aria-label="Subdomain name to check"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setAvailability('idle');
                    }}
                    className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none font-mono font-medium"
                  />
                  {searchQuery && (
                    <button type="button" onClick={clearSearch} aria-label="Clear subdomain search" className="p-1 text-slate-400 hover:text-white transition-colors mr-1 shrink-0">
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
                    {loading ? "Checking..." : "Check availability"}
                  </Button>
                </div>
              </form>

              {/* Availability Result Card - Minimal Feedback UX */}
              {availability !== 'idle' && (
                <div className="w-full mt-2.5 animate-slide-up">
                  {availability === 'available' && (
                    <div className="flex w-full items-center justify-between gap-3 rounded-full border-none bg-emerald-500/10 px-4 py-1.5 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300 font-mono">
                        <CheckCircle className="size-4 text-emerald-400 shrink-0" />
                        <span><strong className="font-semibold text-white">{searchQuery}</strong>.arc.bd is available</span>
                      </div>
                      <Button
                        onClick={handleClaimClick}
                        disabled={claiming}
                        className="h-7.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 text-xs shrink-0 transition-all shadow-sm"
                      >
                        {claiming && <Loader2 className="size-3 mr-1 animate-spin" />}
                        {claiming ? "Claiming..." : "Claim"}
                      </Button>
                    </div>
                  )}

                  {availability === 'taken' && (
                    <div className="flex flex-col gap-2 p-3 px-4 rounded-2xl w-full border-none bg-rose-500/10 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-rose-300 font-mono">
                        <XCircle className="size-4 shrink-0 text-rose-400" />
                        <span><strong className="font-semibold text-white">{searchQuery}</strong>.arc.bd is already taken</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-rose-500/20 text-xs font-mono text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400 text-[11px] font-medium shrink-0 mr-1">
                          <Lightbulb className="size-3 text-amber-400" /> Suggestions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {getAlternatives(searchQuery).map((alt) => (
                            <button
                              key={alt}
                              onClick={() => handleSuggestionClick(alt)}
                              className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border-none transition-all cursor-pointer text-[11px] font-mono"
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">Built for fast deployment</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium max-w-md mx-auto">Automated DNS management with zero configuration overhead.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Gift, title: "Zero Cost", desc: "No credit card or recurring charges. Free for personal, student, and production projects." },
              { icon: Zap, title: "Instant Propagation", desc: "Records sync to Cloudflare's global edge network within seconds of saving." },
              { icon: Code, title: "Connect Any Host", desc: "Native setup guides for Vercel, Netlify, GitHub Pages, Render, Railway, or VPS." },
              { icon: Shield, title: "Global Anycast Edge", desc: "Backed by Cloudflare's resilient global infrastructure for reliable DNS uptime." },
              { icon: Settings, title: "Full Record Control", desc: "Manage root and subdomain A, CNAME, and TXT records right from your dashboard." },
              { icon: Globe, title: "Up to 5 Subdomains", desc: "Claim and manage multiple project addresses from one unified developer account." }
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

        {/* How it works */}
        <section
          className="w-full max-w-4xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 text-center"
          style={{ contentVisibility: "auto", containIntrinsicSize: "500px" }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">How it works</h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-8 sm:mb-12 max-w-md mx-auto">Get your domain live in three straightforward steps.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { step: "1", title: "Find a name", desc: "Search for your preferred subdomain and verify availability in real time." },
              { step: "2", title: "Claim your address", desc: "Sign in with GitHub or email to link the subdomain to your account." },
              { step: "3", title: "Route your traffic", desc: "Add your host's CNAME target or VPS IP address to start receiving requests." }
            ].map((item, i) => (
              <Card key={i} className="text-center p-5 sm:p-6 border border-white/10 bg-card/90">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="flex size-7 items-center justify-center rounded-full bg-blue-500/15 text-blue-400 font-mono text-xs font-bold mb-3 border border-blue-400/20">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-sm text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
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
