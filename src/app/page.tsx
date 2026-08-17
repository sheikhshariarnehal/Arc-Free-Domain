"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  HelpCircle
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
import { ShaderHeroBg } from "@/components/ui/shader-hero";
import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";

const SUPPORTED_STACKS = [
  { name: "Next.js", icon: NextjsIcon, category: "Framework" },
  { name: "Astro", icon: AstroIcon, category: "Static / SSR" },
  { name: "Remix", icon: RemixIcon, category: "Fullstack" },
  { name: "Vite", icon: ViteIcon, category: "SPA" },
  { name: "Docker", icon: DockerIcon, category: "Containers" },
  { name: "Node.js", icon: NodejsIcon, category: "Runtime" },
  { name: "GitHub Pages", icon: GitHubIcon, category: "Hosting" },
  { name: "Cloudflare", icon: CloudflareIcon, category: "Edge DNS" },
  { name: "FastAPI", icon: Zap, category: "Python API" },
  { name: "Go / Rust", icon: Cpu, category: "Microservices" }
];

const FAQ_ITEMS = [
  {
    question: "Is a .arc.bd subdomain really 100% free forever?",
    answer: "Yes, completely free. ARC.BD was built to empower developers, students, and creators. There are no credit card requirements, trial periods, or surprise renewal charges."
  },
  {
    question: "Is automatic SSL / HTTPS encryption included?",
    answer: "Yes. All .arc.bd traffic is routed through Cloudflare's global Anycast edge network with automatic, zero-config Universal SSL certificates provisioned instantly."
  },
  {
    question: "How do I route my domain to Vercel, GitHub Pages, or a VPS?",
    answer: "Once you claim your address, open your dashboard and add your host's CNAME target (e.g. cname.vercel-dns.com, username.github.io) or your VPS IPv4 address (A Record). Global edge propagation takes just seconds."
  },
  {
    question: "How many subdomains can I manage per account?",
    answer: "Every developer account can claim and manage up to 5 active subdomains simultaneously with full control over A, CNAME, and TXT records."
  }
];

function AnimatedContainer({ className, delay = 0.1, children }: { delay?: number; className?: string; children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle');
  const [takenReason, setTakenReason] = useState<string | null>(null);
  const [isReserved, setIsReserved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">

      {/* ── Monochromatic MeshGradient shader background ── */}
      <ShaderHeroBg className="absolute top-0 inset-x-0 z-0 h-[720px] sm:h-[840px] pointer-events-none" />

      <Navbar transparent />

      <main className="relative z-10 flex-1 flex flex-col items-center w-full min-w-0">

        {/* ── 1. Hero Section ── */}
        <section className="relative mx-auto flex w-full min-w-0 max-w-5xl flex-col items-center px-4 pt-28 pb-14 sm:pt-36 sm:pb-18 text-center sm:px-6 lg:px-8">
          <AnimatedContainer delay={0.1} className="w-full flex flex-col items-center">
            
            {/* .arc.bd — Display-scale centrepiece badge */}
            <div
              className="mb-4 sm:mb-5 inline-flex items-center justify-center font-mono font-bold tracking-[-0.03em] select-none"
              style={{
                fontSize: "clamp(2.4rem, 8vw, 5.5rem)",
                lineHeight: 1,
                color: "rgba(255,255,255,0.96)",
                textShadow: "0 0 50px rgba(255,255,255,0.1), 0 2px 0 rgba(0,0,0,0.6)",
              }}
              aria-hidden="true"
            >
              <span className="text-white/35 mr-0.5">/</span>
              <span>arc.bd</span>
            </div>

            {/* Headline */}
            <h1 className="mb-3 sm:mb-4 w-full max-w-2xl text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug tracking-tight text-zinc-100 px-2">
              Free subdomains for developers, students &amp; side projects.
            </h1>

            {/* Subheadline */}
            <p className="mb-7 sm:mb-9 w-full max-w-lg px-2 text-sm sm:text-base font-normal leading-relaxed text-zinc-400">
              Search a name, claim it in seconds, point it anywhere. Fast Anycast DNS &amp; SSL included.
            </p>

            {/* Search Bar Container */}
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
                    className="w-full h-11 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all duration-150 cursor-pointer"
                  >
                    {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Search className="size-3.5 mr-1.5" strokeWidth={2} />}
                    {loading ? "Checking..." : "Check availability"}
                  </Button>
                </div>

                {/* Desktop Input Container */}
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
                    <kbd className="hidden md:inline-flex items-center px-2 py-0.5 rounded bg-white/[0.08] text-xs font-mono text-zinc-400 border border-white/10 mr-2 select-none pointer-events-none">
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

              {/* Availability Result Card */}
              {availability !== 'idle' && (
                <div role="status" aria-live="polite" className="w-full mt-3 animate-spring-up">
                  {availability === 'available' && (
                    <div className="flex flex-col sm:flex-row w-full items-center justify-between gap-3 rounded-2xl sm:rounded-full border border-emerald-500/25 bg-emerald-500/10 p-3.5 sm:py-2 sm:px-5 backdrop-blur-md">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-300 font-mono text-left">
                        <CheckCircle className="size-4.5 text-emerald-400 shrink-0" strokeWidth={2} />
                        <span><strong className="font-semibold text-white">{searchQuery}</strong>.arc.bd is available</span>
                      </div>
                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        <span className="text-xs text-emerald-400/90 font-medium hidden sm:inline">100% Free Forever</span>
                        <Button
                          onClick={() => handleClaimClick()}
                          disabled={claiming}
                          className="group h-8.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4.5 text-xs shrink-0 transition-all duration-150 active:scale-[0.98] shadow-sm w-full sm:w-auto flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {claiming && <Loader2 className="size-3 mr-1 animate-spin" />}
                          <span>{claiming ? "Reserving..." : "Claim Subdomain"}</span>
                          {!claiming && <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform duration-150" strokeWidth={2} />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {availability === 'taken' && (
                    <div className="flex flex-col gap-2.5 p-4 rounded-2xl w-full border border-white/15 bg-[#09090b]/95 backdrop-blur-md text-left shadow-xl">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200 font-mono">
                        {isReserved ? (
                          <ShieldAlert className="size-4 shrink-0 text-amber-400" strokeWidth={1.75} />
                        ) : (
                          <XCircle className="size-4 shrink-0 text-red-400" strokeWidth={1.75} />
                        )}
                        <span>
                          <strong className="font-semibold text-white">{searchQuery}</strong>.arc.bd is {isReserved ? "a reserved system name" : "already taken"}
                        </span>
                      </div>

                      {!isReserved && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-white/[0.08] text-xs font-mono text-zinc-300">
                          <span className="flex items-center gap-1 text-zinc-400 text-xs font-medium shrink-0 mr-1">
                            <Lightbulb className="size-3.5 text-zinc-300" strokeWidth={1.5} /> Try these alternatives:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {getAlternatives(searchQuery).map((alt, idx) => (
                              <button
                                key={alt}
                                onClick={() => handleSuggestionClick(alt)}
                                aria-label={`Search available alternative ${alt}.arc.bd`}
                                style={{ animationDelay: `${idx * 40}ms` }}
                                className="animate-chip-in px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/20 hover:scale-105 active:scale-95 text-zinc-200 hover:text-white border border-white/12 transition-all duration-150 cursor-pointer text-xs font-mono"
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

              {/* High-Contrast Value Proposition Caption */}
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs font-mono text-zinc-400 select-none">
                <span className="text-zinc-300">Free forever</span>
                <span className="text-zinc-600 select-none">·</span>
                <span className="text-zinc-300">Anycast DNS</span>
                <span className="text-zinc-600 select-none">·</span>
                <span className="text-zinc-300">Edge SSL included</span>
              </div>
            </div>
          </AnimatedContainer>
        </section>

        {/* ── 2. Dedicated Supported Stack & Integrations Strip ── */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-t border-white/[0.06] relative">
          <AnimatedContainer delay={0.15} className="flex flex-col items-center text-center">
            <h2 className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-400 font-semibold mb-5 sm:mb-6">
              Works seamlessly with your preferred stack
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl">
              {SUPPORTED_STACKS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-all duration-150 select-none shadow-xs"
                  >
                    <Icon size={14} className="shrink-0 text-zinc-400" strokeWidth={1.5} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </AnimatedContainer>
        </section>

        {/* ── 3. Feature Grid ── */}
        <section className="w-full max-w-5xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative">
          <AnimatedContainer className="mx-auto max-w-3xl text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Built for fast deployment
            </h2>
            <p className="text-zinc-400 mt-2.5 text-sm sm:text-base font-normal max-w-md mx-auto">
              Automated DNS management with zero configuration overhead.
            </p>
          </AnimatedContainer>

          <AnimatedContainer
            delay={0.2}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-x divide-y divide-dashed border border-dashed border-white/15 divide-white/15 bg-transparent"
          >
            {[
              { icon: Gift, title: "Zero Cost", description: "No credit card or recurring charges. Free for personal, student, and production projects." },
              { icon: Zap, title: "Instant Propagation", description: "Records sync to Cloudflare's global edge network within seconds of saving." },
              { icon: Code, title: "Connect Any Host", description: "Native setup guides for Vercel, Netlify, GitHub Pages, Render, Railway, or VPS." },
              { icon: Shield, title: "Global Anycast Edge", description: "Backed by Cloudflare's resilient global infrastructure for reliable DNS uptime." },
              { icon: Settings, title: "Full Record Control", description: "Manage root and subdomain A, CNAME, and TXT records right from your dashboard." },
              { icon: Globe, title: "Up to 5 Subdomains", description: "Claim and manage multiple project addresses from one unified developer account." }
            ].map((item, i) => (
              <FeatureCard key={i} feature={item} />
            ))}
          </AnimatedContainer>
        </section>

        {/* ── 4. How It Works ── */}
        <section className="w-full max-w-5xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative text-center">
          <AnimatedContainer className="mx-auto max-w-3xl text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              How it works
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal max-w-md mx-auto">
              Get your custom address live in three straightforward steps.
            </p>
          </AnimatedContainer>

          <AnimatedContainer
            delay={0.2}
            className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-y divide-dashed border border-dashed border-white/15 divide-white/15 text-left bg-transparent"
          >
            {[
              { step: "1", title: "Find a name", description: "Search for your preferred subdomain and verify availability in real time." },
              { step: "2", title: "Claim your address", description: "Sign in with GitHub or email to link the subdomain to your account." },
              { step: "3", title: "Route your traffic", description: "Add your host's CNAME target or VPS IP address to start receiving live traffic." }
            ].map((item, i) => (
              <FeatureCard key={i} feature={item} />
            ))}
          </AnimatedContainer>
        </section>

        {/* ── 5. Frequently Asked Questions (Glass Accordion) ── */}
        <section className="w-full max-w-3xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative">
          <AnimatedContainer className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center size-10 rounded-full bg-white/[0.06] border border-white/10 text-white mb-3">
              <HelpCircle className="size-5 text-zinc-300" strokeWidth={1.75} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Quick answers about routing, security, and usage limits.
            </p>
          </AnimatedContainer>

          <AnimatedContainer delay={0.2} className="space-y-3">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-[#101014]/60 backdrop-blur-xl overflow-hidden transition-colors duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`size-4 text-zinc-400 shrink-0 ml-3 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`}
                      strokeWidth={2}
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed border-t border-white/[0.04]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </AnimatedContainer>
        </section>

      </main>

      {/* ── Footer ── */}
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
