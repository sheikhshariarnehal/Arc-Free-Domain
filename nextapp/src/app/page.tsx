"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search, CheckCircle, XCircle, Gift, Zap, Code, Shield, Settings, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle');
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const checkAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setAvailability('idle');
    setReason(null);

    try {
      const res = await fetch(`/api/subdomains/check?name=${encodeURIComponent(searchQuery.trim())}`);
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

  const handleClaimClick = async () => {
    if (!searchQuery.trim()) return;
    setClaiming(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // User is logged in! Directly claim subdomain
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
      // Not logged in -> Go to login page with claim param
      router.push(`/login?claim=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <section className="w-full max-w-4xl mx-auto text-center py-20 px-4 flex flex-col items-center animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Your name. <br className="hidden md:block"/>
            Your project. <br className="hidden md:block"/>
            <span className="text-gradient">Your domain.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl">
            Claim a free .arc.bd subdomain in seconds. Perfect for portfolios, side projects, and startups in Bangladesh.
          </p>
          
          <form onSubmit={checkAvailability} className="w-full max-w-2xl relative flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full flex items-center group">
              <Search className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="my-awesome-project"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setAvailability('idle'); setReason(null); }}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-24 text-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 backdrop-blur-sm"
              />
              <div className="absolute right-4 text-slate-500 font-medium">.arc.bd</div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? "Checking..." : "Check"}
            </button>
          </form>

          <div className="h-16 mt-4 flex items-center justify-center">
            {availability === 'available' && (
              <div className="flex items-center gap-4 animate-fade-in bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">{searchQuery}.arc.bd is available!</span>
                <button
                  onClick={handleClaimClick}
                  disabled={claiming}
                  className="bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg flex items-center gap-2"
                >
                  {claiming && <Loader2 className="h-4 w-4 animate-spin" />}
                  Claim Free
                </button>
              </div>
            )}
            {availability === 'taken' && (
              <div className="flex items-center gap-2 animate-fade-in bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-xl">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-medium">{searchQuery}.arc.bd is not available ({reason || 'Taken'}).</span>
              </div>
            )}
          </div>
        </section>

        <section className="w-full max-w-7xl mx-auto py-20 px-4">
          <div className="text-center mb-16 animate-slide-up" style={{animationDelay: "0.1s"}}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why choose ARC.BD?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to get your project online quickly and reliably.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Gift, title: "Free Forever", desc: "No hidden fees, no credit card required. Free subdomains for everyone." },
              { icon: Zap, title: "Instant DNS", desc: "Global DNS propagation in seconds, not hours. Powered by modern infrastructure." },
              { icon: Code, title: "Developer Friendly", desc: "Easily integrate with Vercel, GitHub Pages, Netlify, or your own VPS." },
              { icon: Shield, title: "100% Uptime", desc: "Enterprise-grade DNS routing ensures your site stays online." },
              { icon: Settings, title: "Easy Management", desc: "Intuitive dashboard to manage A, CNAME, and TXT records effortlessly." },
              { icon: Globe, title: "Built for Bangladesh", desc: "Fast resolution times and a community of local builders." }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 group animate-slide-up" style={{animationDelay: `${0.1 * i}s`}}>
                <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-5xl mx-auto py-20 px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-16">Get started in 3 simple steps</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent -translate-y-1/2 z-0" />
            
            {[
              { step: "1", title: "Search", desc: "Find your perfect subdomain" },
              { step: "2", title: "Claim", desc: "Create an account to reserve it" },
              { step: "3", title: "Configure", desc: "Point it to your hosting provider" }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center glass-card p-8 rounded-2xl w-full md:w-1/3">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="border-t border-white/5 mt-auto bg-slate-950/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-slate-500" />
            <span className="text-slate-400 font-semibold">ARC.BD &copy; 2024</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="/report" className="hover:text-emerald-400 transition-colors">Report Abuse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
