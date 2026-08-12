"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search, CheckCircle, XCircle, Gift, Zap, Code, Shield, Settings, Globe, Loader2, X, Sparkles, ArrowRight, Lock, Cpu } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const SUGGESTIONS = ["my-app", "dev-portfolio", "api-demo", "bangla-tech"];

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle');
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const checkAvailability = async (e?: React.FormEvent, nameOverride?: string) => {
    if (e) e.preventDefault();
    const query = (nameOverride || searchQuery).trim();
    if (!query) return;
    setLoading(true);
    setAvailability('idle');
    setReason(null);

    try {
      const res = await fetch(`/api/subdomains/check?name=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.available) {
        setAvailability('available');
      } else {
        setAvailability('taken');
        setReason(data.reason || 'Already taken or reserved');
      }
    } catch {
      setAvailability('taken');
      setReason('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setAvailability('idle');
    setReason(null);
    checkAvailability(undefined, suggestion);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setAvailability('idle');
    setReason(null);
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
          setReason(data.error || 'Failed to claim subdomain');
        }
      } catch (err: any) {
        setAvailability('taken');
        setReason('Failed to claim subdomain');
      } finally {
        setClaiming(false);
      }
    } else {
      router.push(`/login?claim=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground selection:bg-white/10 selection:text-white">
      {/* Subtle Background Radial Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-white/[0.02] blur-[150px]" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col items-center">
        {/* Skeuomorphic Landing Page Hero Section */}
        <section className="w-full max-w-4xl mx-auto text-center pt-16 pb-16 sm:pt-24 sm:pb-24 px-4 flex flex-col items-center">
          {/* Status Badge Pill */}
          <Badge
            variant="outline"
            className="mb-6 border-white/15 bg-white/5 backdrop-blur-md text-slate-300 text-[11px] font-mono py-1 px-3.5 rounded-full shadow-sm flex items-center gap-2 hover:bg-white/10 transition-all cursor-default"
          >
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span>Cloudflare Edge DNS &bull; Instant Free Subdomains</span>
          </Badge>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 text-foreground">
            Your name. Your project. <br />
            <span className="font-mono bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              .arc.bd
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground/90 max-w-lg mb-10 leading-relaxed font-normal">
            Claim a free <code className="text-slate-200 font-mono font-semibold">.arc.bd</code> subdomain in seconds. Direct routing to Vercel, GitHub Pages, or any VPS.
          </p>

          {/* Unified Floating Search Bar Container */}
          <div className="w-full max-w-xl">
            <form onSubmit={checkAvailability} className="w-full">
              <div className="relative flex items-center bg-card/90 border border-white/12 rounded-full p-1.5 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all group">
                <Search className="size-4 text-muted-foreground shrink-0 mr-2.5 transition-colors group-focus-within:text-foreground" />
                <input
                  type="text"
                  placeholder="my-cool-project"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setAvailability('idle');
                    setReason(null);
                  }}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors mr-1 shrink-0"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
                <span className="text-xs text-muted-foreground/70 font-mono font-medium mr-3 shrink-0 select-none">
                  .arc.bd
                </span>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-5 text-xs font-semibold shrink-0 rounded-full"
                >
                  {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Search className="size-3.5 mr-1" />}
                  {loading ? "Checking..." : "Check Availability"}
                </Button>
              </div>
            </form>

            {/* Quick Skeuomorphic Suggestion Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <span className="font-medium text-[11px]">Popular:</span>
              {SUGGESTIONS.map((sugg) => (
                <button
                  key={sugg}
                  onClick={() => handleSuggestionClick(sugg)}
                  className="relative inline-flex items-center justify-center transition-all duration-200 active:scale-95 hover:brightness-[125%] cursor-pointer px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 border-none overflow-hidden"
                  style={{
                    backgroundImage: "linear-gradient(180deg, #2d2d30, #18181b)",
                    boxShadow: "0 0px 0px -2px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <span
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{ boxShadow: "inset 0 1.5px 0px 0 rgba(255, 255, 255, 0.25)" }}
                  />
                  <span className="relative z-10 flex items-center gap-1">
                    {sugg}
                  </span>
                </button>
              ))}
            </div>

            {/* Platform Feature Telemetry Tags */}
            <div className="flex items-center justify-center gap-4 mt-6 text-[11px] font-mono text-muted-foreground/80">
              <span className="flex items-center gap-1">
                <Zap className="size-3 text-slate-400" /> &lt; 50ms Edge DNS
              </span>
              <span className="flex items-center gap-1">
                <Lock className="size-3 text-slate-400" /> Free SSL Included
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="size-3 text-slate-400" /> Vercel &amp; GitHub Ready
              </span>
            </div>

            {/* Availability Result Card */}
            <div className="min-h-14 mt-4 flex items-center justify-center">
              {availability === 'available' && (
                <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/15 px-4 py-2.5 rounded-xl w-full text-left animate-fade-in shadow-md">
                  <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium font-mono">
                    <CheckCircle className="size-4 shrink-0 text-emerald-400" />
                    <span>{searchQuery}.arc.bd is available!</span>
                  </div>
                  <Button
                    variant="emerald"
                    size="default"
                    onClick={handleClaimClick}
                    disabled={claiming}
                    className="shrink-0"
                  >
                    {claiming && <Loader2 className="size-3 mr-1 animate-spin" />}
                    Claim Free Now <ArrowRight className="size-3 ml-1" />
                  </Button>
                </div>
              )}

              {availability === 'taken' && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 px-4 py-2.5 rounded-xl w-full text-left text-sm text-destructive font-medium font-mono animate-fade-in shadow-md">
                  <XCircle className="size-4 shrink-0 text-destructive" />
                  <span>{searchQuery}.arc.bd is unavailable ({reason || 'Taken'}).</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="w-full max-w-6xl mx-auto py-16 px-4 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Minimal Infrastructure</h2>
            <p className="text-sm text-muted-foreground mt-1">Built for speed, reliability, and modern web developer workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Gift, title: "Free Forever", desc: "No credit card required. 100% free subdomains for personal and commercial projects." },
              { icon: Zap, title: "Instant Cloudflare DNS", desc: "Global edge propagation in seconds via Cloudflare DNS API v4 integration." },
              { icon: Code, title: "Deploy Anywhere", desc: "Native support for Vercel, GitHub Pages, Netlify, Render, Railway, or VPS." },
              { icon: Shield, title: "99.9% High Availability", desc: "Backed by Cloudflare global anycast network for rock-solid uptime." },
              { icon: Settings, title: "Clean DNS Controls", desc: "Full control over A, CNAME, and TXT records right from your dashboard." },
              { icon: Globe, title: "Developer Community", desc: "Designed for Bangladesh and global builders bringing ideas online." }
            ].map((item, i) => (
              <Card key={i} className="p-5 flex flex-col gap-2.5">
                <CardContent className="p-0 flex flex-col gap-2.5">
                  <div className="size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <item.icon className="size-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 3-Step Process */}
        <section className="w-full max-w-4xl mx-auto py-16 px-4 border-t border-white/10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-12">Three Simple Steps</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Search Domain", desc: "Type your preferred name and verify real-time availability." },
              { num: "02", title: "Claim Free", desc: "Sign up in seconds to lock your subdomain into your account." },
              { num: "03", title: "Configure DNS", desc: "Point your domain to Vercel, GitHub Pages, or any IPv4 server." }
            ].map((step, i) => (
              <Card key={i} className="text-center p-6">
                <CardContent className="p-0 flex flex-col items-center">
                  <span className="font-mono text-xl font-bold text-slate-300 mb-3">{step.num}</span>
                  <h3 className="font-semibold text-sm text-foreground mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <Globe className="size-3" />
            </div>
            <span className="font-medium text-foreground">ARC.BD</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/report" className="hover:text-foreground transition-colors">Report Abuse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
