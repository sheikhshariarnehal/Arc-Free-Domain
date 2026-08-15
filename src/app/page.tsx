"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Gift, 
  Zap, 
  Code, 
  Shield, 
  Settings, 
  Loader2, 
  Lock, 
  Lightbulb, 
  Globe, 
  X,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShaderBackground } from "@/components/ui/dq";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle');
  const [takenReason, setTakenReason] = useState<string | null>(null);
  const [isReserved, setIsReserved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Active fetch abort controller to prevent request racing and wasted network calls
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkAvailability = async (e?: React.FormEvent, nameOverride?: string) => {
    if (e) e.preventDefault();
    const query = (nameOverride || searchQuery).trim().toLowerCase();
    if (!query) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setAvailability('idle');
    setTakenReason(null);
    setIsReserved(false);

    try {
      const res = await fetch(`/api/subdomains/check?name=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.available) {
        setAvailability('available');
      } else {
        setAvailability('taken');
        const reasonStr = data.reason || 'Already taken';
        setTakenReason(reasonStr);
        setIsReserved(reasonStr.toLowerCase().includes('reserved'));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setAvailability('taken');
      setTakenReason('Unable to verify availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setAvailability('idle');
    checkAvailability(undefined, suggestion);
  };

  const clearSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchQuery("");
    setAvailability('idle');
    setTakenReason(null);
    setIsReserved(false);
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
          setTakenReason(data.error || 'Subdomain is no longer available');
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
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">
      {/* Full-bleed Silk Shader Background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[660px] sm:h-[840px] z-0 overflow-hidden"
        style={{
          contain: "paint layout",
        }}
      >
        <ShaderBackground className="h-full w-full" />
        {/* Soft bottom blend to seamlessly bridge hero into features */}
        <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </div>

      <Navbar transparent />

      <main className="relative z-10 flex-1 flex min-w-0 w-full flex-col items-center">
        {/* Hero Section */}
        <section className="relative mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-24 pb-12 text-center sm:px-6 sm:pt-28 sm:pb-16 md:min-h-screen md:py-28 lg:px-8">
          {/* Headline */}
          <h1 className="mb-4 w-full max-w-3xl text-[clamp(2.25rem,7.5vw,4.25rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-white sm:mb-5 text-balance">
            <span>
              Free <span className="text-[#0084ff] font-mono">.</span><span className="inline-block bg-[#021c3d] text-[#0084ff] font-mono px-1.5 py-0.5 rounded-none align-baseline leading-none">arc.bd</span> domains
            </span>
            <span className="block mt-1 sm:mt-2">for developers.</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-8 w-full max-w-xl px-2 text-sm sm:text-base font-normal leading-relaxed text-slate-300 sm:px-0">
            <span>Claim your free custom address for your website, portfolio, or web app.</span>
          </p>

          {/* Search Bar Container */}
          <div className="w-full min-w-0 max-w-xl px-0 sm:px-1">
            <form onSubmit={checkAvailability} className="w-full">
              {/* Mobile Input Container */}
              <div className="flex flex-col gap-2.5 sm:hidden w-full">
                <div className="relative flex items-center skeuo-input rounded-full px-4.5 py-3 transition-all duration-200 group w-full overflow-hidden">
                  <Search className="size-4 text-slate-400 shrink-0 mr-2.5 group-focus-within:text-primary transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="your-project"
                    aria-label="Subdomain name to check"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setAvailability('idle');
                    }}
                    className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none font-mono font-medium pr-2"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={clearSearch} 
                      aria-label="Clear subdomain search" 
                      className="p-1 text-slate-400 hover:text-white transition-all duration-150 mr-1 shrink-0 active:scale-90"
                    >
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
                  className="w-full h-11 text-xs font-semibold rounded-full bg-foreground text-background hover:bg-foreground/90 active:scale-[0.99] transition-transform duration-150"
                >
                  {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Search className="size-3.5 mr-1.5" />}
                  {loading ? "Checking..." : "Check availability"}
                </Button>
              </div>

              {/* Desktop Input Container */}
              <div className="hidden sm:flex relative items-center skeuo-input rounded-full p-1.5 pl-4 transition-all duration-200 group overflow-hidden">
                <Search className="size-4 text-slate-400 shrink-0 mr-2.5 transition-colors duration-200 group-focus-within:text-primary" />
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
                  <button 
                    type="button" 
                    onClick={clearSearch} 
                    aria-label="Clear subdomain search" 
                    className="p-1 text-slate-400 hover:text-white transition-all duration-150 mr-1 shrink-0 active:scale-90"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
                <span className="text-xs text-slate-300 font-mono font-semibold mr-3 shrink-0 select-none">.arc.bd</span>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-5 text-xs font-semibold shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-transform duration-150"
                >
                  {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Search className="size-3.5 mr-1" />}
                  {loading ? "Checking..." : "Check availability"}
                </Button>
              </div>
            </form>

            {/* Availability Result Card with Live Region and Spring Animation */}
            {availability !== 'idle' && (
              <div role="status" aria-live="polite" className="w-full mt-2.5 animate-spring-up">
                {availability === 'available' && (
                  <div className="flex flex-col sm:flex-row w-full items-center justify-between gap-3 rounded-2xl sm:rounded-full border border-emerald-500/20 bg-emerald-500/10 p-3 sm:py-1.5 sm:px-4 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300 font-mono text-left">
                      <CheckCircle className="size-4 text-emerald-400 shrink-0 animate-spring-up" />
                      <span><strong className="font-semibold text-white">{searchQuery}</strong>.arc.bd is available</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className="text-[11px] text-emerald-400/80 font-medium hidden sm:inline">100% Free Forever</span>
                      <Button
                        onClick={handleClaimClick}
                        disabled={claiming}
                        className="group h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 text-xs shrink-0 transition-all duration-150 active:scale-[0.98] shadow-sm w-full sm:w-auto flex items-center justify-center gap-1"
                      >
                        {claiming && <Loader2 className="size-3 mr-1 animate-spin" />}
                        <span>{claiming ? "Reserving..." : "Claim Subdomain"}</span>
                        {!claiming && <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform duration-150" />}
                      </Button>
                    </div>
                  </div>
                )}

                {availability === 'taken' && (
                  <div className="flex flex-col gap-2.5 p-3 px-4 rounded-2xl w-full border border-rose-500/20 bg-rose-500/10 backdrop-blur-md text-left">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-rose-300 font-mono">
                      {isReserved ? (
                        <ShieldAlert className="size-4 shrink-0 text-amber-400" />
                      ) : (
                        <XCircle className="size-4 shrink-0 text-rose-400" />
                      )}
                      <span>
                        <strong className="font-semibold text-white">{searchQuery}</strong>.arc.bd is {isReserved ? "a reserved system name" : "already taken"}
                      </span>
                    </div>

                    {!isReserved && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-rose-500/20 text-xs font-mono text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400 text-[11px] font-medium shrink-0 mr-1">
                          <Lightbulb className="size-3 text-amber-400" /> Alternatives:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {getAlternatives(searchQuery).map((alt, idx) => (
                            <button
                              key={alt}
                              onClick={() => handleSuggestionClick(alt)}
                              style={{ animationDelay: `${idx * 40}ms` }}
                              className="animate-chip-in px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-primary/20 hover:scale-105 active:scale-95 text-slate-200 hover:text-primary border border-white/5 transition-all duration-150 cursor-pointer text-[11px] font-mono"
                            >
                              {alt}.arc.bd
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
          className="w-full max-w-6xl mx-auto pt-8 pb-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-none relative"
          style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}
        >
          {/* Soft Faded Divider */}
          <div className="w-full max-w-3xl mx-auto h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-10 sm:mb-14" />
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
              <Card key={i} className="group p-5 flex flex-col gap-2.5 border border-white/10 bg-card/90 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200">
                <CardContent className="p-0 flex flex-col gap-2.5">
                  <div
                    className="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200"
                    style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.25)" }}
                  >
                    <item.icon className="size-4 text-primary" />
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
              <Card key={i} className="group text-center p-5 sm:p-6 border border-white/10 bg-card/90 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary font-mono text-xs font-bold mb-3 border border-primary/20 group-hover:scale-110 transition-transform duration-200">
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
              <Image src="/ARC.webp" alt="ARC.BD Logo" width={20} height={20} className="size-4 object-contain" />
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
