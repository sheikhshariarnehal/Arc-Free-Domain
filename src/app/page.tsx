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
  Lightbulb, 
  Globe, 
  X,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Server,
  Cloud
} from "lucide-react";
import { 
  NextjsIcon, 
  AstroIcon, 
  RemixIcon, 
  ViteIcon, 
  DockerIcon, 
  NodejsIcon, 
  GitHubIcon, 
  CloudflareIcon 
} from "@/components/TechIcons";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Dynamic import for WebGL Canvas component: zero SSR footprint and faster initial First Contentful Paint (FCP)
const ShaderBackground = dynamic(
  () => import("@/components/ui/dq").then((mod) => mod.ShaderBackground),
  { ssr: false }
);

const SUPPORTED_STACKS = [
  { name: "Next.js", icon: NextjsIcon },
  { name: "Astro", icon: AstroIcon },
  { name: "Remix", icon: RemixIcon },
  { name: "Vite", icon: ViteIcon },
  { name: "Docker", icon: DockerIcon },
  { name: "Node.js", icon: NodejsIcon },
  { name: "GitHub Pages", icon: GitHubIcon },
  { name: "Cloudflare", icon: CloudflareIcon },
  { name: "FastAPI / Python", icon: Zap },
  { name: "Go / Rust", icon: Cpu }
];

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle');
  const [takenReason, setTakenReason] = useState<string | null>(null);
  const [isReserved, setIsReserved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Active fetch abort controller to prevent request racing and wasted network calls
  const abortControllerRef = useRef<AbortController | null>(null);

  // Global keyboard shortcut ('/' or 'Cmd/Ctrl + K') to quickly focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus() || mobileInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const checkAvailability = async (e?: React.FormEvent, nameOverride?: string) => {
    if (e) e.preventDefault();
    const query = (nameOverride || searchQuery).trim().toLowerCase();
    if (!query || query.length < 3) return;

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

  // Debounced auto-check on typing
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query || query.length < 3) {
      setAvailability('idle');
      setTakenReason(null);
      setIsReserved(false);
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability(undefined, query);
    }, 380);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const handleClaimClick = async (providerPreset?: string) => {
    const cleanQuery = searchQuery.trim().toLowerCase() || "my-project";
    setClaiming(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      try {
        const res = await fetch("/api/subdomains/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cleanQuery }),
        });
        const data = await res.json();
        if (res.ok) {
          router.push(`/dashboard/domains/${data.id || ''}${providerPreset ? `?preset=${providerPreset}` : ''}`);
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
      router.push(`/login?claim=${encodeURIComponent(cleanQuery)}${providerPreset ? `&preset=${providerPreset}` : ''}`);
    }
  };

  const getAlternatives = (query: string) => {
    const clean = query.trim().toLowerCase();
    return [`${clean}-app`, `${clean}-dev`, `get-${clean}`];
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">
      {/* Full-bleed Silk Shader Background with Responsive Fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[680px] sm:h-[860px] md:h-[940px] z-0 overflow-hidden"
        style={{
          contain: "paint layout",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        }}
      >
        <ShaderBackground className="h-full w-full opacity-90 sm:opacity-95" />
      </div>

      <Navbar transparent />

      <main className="relative z-10 flex-1 flex min-w-0 w-full flex-col items-center">
        {/* Hero Section */}
        <section className="relative mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-20 pb-8 text-center sm:px-6 sm:pt-28 sm:pb-14 lg:px-8">

          {/* .arc.bd — Display-scale centrepiece badge */}
          <div
            className="mb-4 sm:mb-6 inline-flex items-center justify-center font-mono font-bold tracking-[-0.04em] select-none"
            style={{
              fontSize: "clamp(2.4rem, 8.5vw, 6rem)",
              lineHeight: 1,
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 0 60px rgba(255,255,255,0.07), 0 2px 0 rgba(0,0,0,0.5)",
              letterSpacing: "-0.04em",
            }}
            aria-hidden="true"
          >
            <span style={{ color: "rgba(255,255,255,0.35)" }}>/</span>
            <span>arc.bd</span>
          </div>

          {/* Headline — single grammatical arc orbiting the badge */}
          <h1 className="mb-2.5 sm:mb-4 w-full max-w-xl text-[clamp(1.1rem,2.8vw,1.5rem)] font-semibold leading-snug tracking-[-0.02em] text-zinc-300 px-1">
            Free subdomains for developers, students &amp; side projects.
          </h1>

          {/* Subheadline */}
          <p className="mb-6 sm:mb-8 w-full max-w-md px-2 text-xs sm:text-sm font-normal leading-relaxed text-zinc-500 sm:px-0">
            Search a name, claim it in seconds, point it anywhere. Cloudflare DNS included.
          </p>

          {/* Search Bar Container — full hero width */}
          <div className="w-full min-w-0 max-w-2xl px-0">
            <form onSubmit={checkAvailability} className="w-full">
              {/* Mobile Input Container */}
              <div className="flex flex-col gap-2.5 sm:hidden w-full">
                <div className="relative flex items-center skeuo-input rounded-full px-4 py-2.5 transition-all duration-200 group w-full overflow-hidden">
                  <Search className="size-4 text-zinc-400 shrink-0 mr-2 group-focus-within:text-blue-400 transition-colors duration-200" strokeWidth={1.5} />
                  <input
                    ref={mobileInputRef}
                    type="text"
                    placeholder="your-project"
                    aria-label="Subdomain name to check"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    }}
                    className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none font-mono font-medium pr-1"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={clearSearch} 
                      aria-label="Clear subdomain search" 
                      className="p-1 text-zinc-400 hover:text-white transition-all duration-150 mr-1 shrink-0 active:scale-90 cursor-pointer"
                    >
                      <X className="size-3.5" strokeWidth={2} />
                    </button>
                  )}
                  <span className="text-xs text-zinc-400 font-mono font-semibold mr-1 shrink-0 select-none">
                    .arc.bd
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10.5 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all duration-150 cursor-pointer"
                >
                  {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Search className="size-3.5 mr-1.5" strokeWidth={2} />}
                  {loading ? "Checking..." : "Check availability"}
                </Button>
              </div>

              {/* Desktop Input Container with Keyboard Shortcut Pill */}
              <div className="hidden sm:flex relative items-center skeuo-input rounded-full p-1.5 pl-4 transition-all duration-200 group overflow-hidden">
                <Search className="size-4 text-zinc-400 shrink-0 mr-2.5 transition-colors duration-200 group-focus-within:text-blue-400" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="your-project"
                  aria-label="Subdomain name to check"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  }}
                  className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none font-mono font-medium"
                />
                
                {/* Keyboard Shortcut Hint Pill */}
                {!searchQuery && (
                  <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-zinc-400 border border-white/10 mr-2 select-none pointer-events-none">
                    /
                  </kbd>
                )}

                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={clearSearch} 
                    aria-label="Clear subdomain search" 
                    className="p-1 text-zinc-400 hover:text-white transition-all duration-150 mr-1 shrink-0 active:scale-90 cursor-pointer"
                  >
                    <X className="size-3.5" strokeWidth={2} />
                  </button>
                )}
                <span className="text-xs text-zinc-400 font-mono font-semibold mr-3 shrink-0 select-none">.arc.bd</span>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-5 text-xs font-semibold shrink-0 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Search className="size-3.5 mr-1" strokeWidth={2} />}
                  {loading ? "Checking..." : "Check availability"}
                </Button>
              </div>
            </form>

            {/* Availability Result Card with Live Region */}
            {availability !== 'idle' && (
              <div role="status" aria-live="polite" className="w-full mt-2.5 animate-spring-up">
                {availability === 'available' && (
                  <div className="flex flex-col sm:flex-row w-full items-center justify-between gap-3 rounded-2xl sm:rounded-full border border-emerald-500/20 bg-emerald-500/10 p-3 sm:py-1.5 sm:px-4 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300 font-mono text-left">
                      <CheckCircle className="size-4 text-emerald-400 shrink-0 animate-spring-up" strokeWidth={1.75} />
                      <span><strong className="font-semibold text-white">{searchQuery}</strong>.arc.bd is available</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className="text-[11px] text-emerald-400/80 font-medium hidden sm:inline">100% Free Forever</span>
                      <Button
                        onClick={() => handleClaimClick()}
                        disabled={claiming}
                        className="group h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 text-xs shrink-0 transition-all duration-150 active:scale-[0.98] shadow-sm w-full sm:w-auto flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {claiming && <Loader2 className="size-3 mr-1 animate-spin" />}
                        <span>{claiming ? "Reserving..." : "Claim Subdomain"}</span>
                        {!claiming && <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform duration-150" strokeWidth={2} />}
                      </Button>
                    </div>
                  </div>
                )}

                {availability === 'taken' && (
                  <div className="flex flex-col gap-2.5 p-3.5 px-4 rounded-2xl w-full border border-white/15 bg-[#09090b]/95 backdrop-blur-md text-left shadow-xl">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200 font-mono">
                      {isReserved ? (
                        <ShieldAlert className="size-4 shrink-0 text-zinc-400" strokeWidth={1.5} />
                      ) : (
                        <XCircle className="size-4 shrink-0 text-zinc-400" strokeWidth={1.5} />
                      )}
                      <span>
                        <strong className="font-semibold text-white">{searchQuery}</strong>.arc.bd is {isReserved ? "a reserved system name" : "already taken"}
                      </span>
                    </div>

                    {!isReserved && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.08] text-xs font-mono text-zinc-300">
                        <span className="flex items-center gap-1 text-zinc-400 text-[11px] font-medium shrink-0 mr-1">
                          <Lightbulb className="size-3 text-zinc-300" strokeWidth={1.5} /> Alternatives:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {getAlternatives(searchQuery).map((alt, idx) => (
                            <button
                              key={alt}
                              onClick={() => handleSuggestionClick(alt)}
                              style={{ animationDelay: `${idx * 40}ms` }}
                              className="animate-chip-in px-2.5 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/15 hover:scale-105 active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all duration-150 cursor-pointer text-[11px] font-mono"
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

            {/* Feature caption — responsive row with subtle separators */}
            <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-[10.5px] sm:text-[11px] font-mono text-zinc-500 select-none">
              <span>Free forever</span>
              <span className="text-zinc-700 select-none">·</span>
              <span>Anycast DNS</span>
              <span className="text-zinc-700 select-none">·</span>
              <span>Edge SSL included</span>
            </div>
          </div>

          {/* Supported Stacks & Deployments Ticker / Pill Strip */}
          <div className="w-full max-w-4xl mx-auto mt-10 sm:mt-16 flex flex-col items-center">
            {/* Soft Faded Divider that blends into darkness */}
            <div className="w-full max-w-xs sm:max-w-xl h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-5 sm:mb-8" />
            <div className="text-[10px] font-mono text-zinc-600 tracking-[0.14em] uppercase mb-3.5 sm:mb-4 text-center select-none">
              Works with your stack
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 px-2">
              {SUPPORTED_STACKS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] sm:text-xs font-mono text-zinc-500 hover:border-white/15 hover:text-zinc-200 transition-colors select-none"
                  >
                    <Icon size={12} className="shrink-0 text-zinc-500" strokeWidth={1.5} />
                    <span>{item.name}</span>
                  </div>
                );
              })}
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
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal max-w-md mx-auto">Automated DNS management with zero configuration overhead.</p>
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
              <Card
                key={i}
                className="group p-5 sm:p-6 rounded-lg flex flex-col gap-3 border border-white/[0.12] bg-[#111115] hover:bg-[#16161b] hover:border-white/[0.22] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <CardContent className="p-0 flex flex-col gap-3">
                  <div
                    className="size-8 rounded-[4px] bg-white/[0.07] border border-white/[0.08] flex items-center justify-center text-zinc-300 group-hover:bg-white/[0.12] group-hover:border-white/[0.18] group-hover:text-white transition-all duration-150"
                  >
                    <item.icon className="size-4 text-zinc-300 group-hover:text-white transition-colors" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-sm text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          className="w-full max-w-4xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] text-center"
          style={{ contentVisibility: "auto", containIntrinsicSize: "500px" }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">How it works</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mb-8 sm:mb-12 max-w-md mx-auto">Get your domain live in three straightforward steps.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { step: "1", title: "Find a name", desc: "Search for your preferred subdomain and verify availability in real time." },
              { step: "2", title: "Claim your address", desc: "Sign in with GitHub or email to link the subdomain to your account." },
              { step: "3", title: "Route your traffic", desc: "Add your host's CNAME target or VPS IP address to start receiving requests." }
            ].map((item, i) => (
              <Card
                key={i}
                className="group text-center p-5 sm:p-6 rounded-lg border border-white/[0.12] bg-[#111115] hover:bg-[#16161b] hover:border-white/[0.22] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <CardContent className="p-0 flex flex-col items-center">
                  <div
                    className="flex size-7.5 items-center justify-center rounded-[4px] bg-white/[0.07] border border-white/[0.08] text-white font-mono text-xs font-bold mb-3 group-hover:bg-white/[0.12] group-hover:border-white/[0.18] transition-all duration-150"
                  >
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-sm text-white mb-1.5 tracking-tight">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-black text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded bg-white/12 flex items-center justify-center text-white overflow-hidden"
              style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.25)" }}
            >
              <Image src="/ARC.webp" alt="ARC.BD Logo" width={20} height={20} className="size-4 object-contain" />
            </div>
            <span className="font-semibold text-white">ARC.BD</span>
            <span className="text-zinc-500">&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-zinc-400 font-medium">
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
