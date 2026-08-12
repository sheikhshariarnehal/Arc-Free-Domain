import os

BASE_DIR = r"g:\arc.bd\nextapp"

files = {
    "src/app/globals.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }

  body {
    @apply bg-slate-950 text-slate-300 font-sans antialiased selection:bg-emerald-500/30;
    scroll-behavior: smooth;
  }
}

@layer utilities {
  .glass-card {
    @apply bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl;
  }
  
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400;
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #020617; /* slate-950 */
}
::-webkit-scrollbar-thumb {
  background: #1e293b; /* slate-800 */
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155; /* slate-700 */
}
""",
    "src/app/layout.tsx": """import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARC.BD | Free Subdomain Platform",
  description: "Claim your free .arc.bd subdomain in seconds. Built for developers and creators in Bangladesh.",
  keywords: ["arc.bd", "free subdomain", "bangladesh domain", "developer tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
""",
    "src/components/Navbar.tsx": """"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Placeholder session state
  const session = null;

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
          
          <div className="hidden md:block">
            {session ? (
              <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                Dashboard
              </Link>
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
              <Link href="/dashboard" className="text-emerald-400 hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
            ) : (
              <Link href="/login" className="text-emerald-400 hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
""",
    "src/app/page.tsx": """"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, CheckCircle, XCircle, Gift, Zap, Code, Shield, Settings, Globe } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle');

  const checkAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    // Mock check
    if (searchQuery.length > 3) setAvailability('available');
    else setAvailability('taken');
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Hero Section */}
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
                onChange={(e) => { setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setAvailability('idle'); }}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-24 text-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 backdrop-blur-sm"
              />
              <div className="absolute right-4 text-slate-500 font-medium">.arc.bd</div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95">
              Check
            </button>
          </form>

          {/* Availability Feedback */}
          <div className="h-16 mt-4 flex items-center justify-center">
            {availability === 'available' && (
              <div className="flex items-center gap-4 animate-fade-in bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">{searchQuery}.arc.bd is available!</span>
                <Link href={`/login?claim=${searchQuery}`} className="bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg">Claim Free</Link>
              </div>
            )}
            {availability === 'taken' && (
              <div className="flex items-center gap-2 animate-fade-in bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-xl">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-medium">{searchQuery}.arc.bd is already taken.</span>
              </div>
            )}
          </div>
        </section>

        {/* Features Grid */}
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

        {/* How it Works */}
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
      
      {/* Footer */}
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
""",
    "src/app/login/page.tsx": """"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Github } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="glass-card p-8 rounded-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-slate-400">
                {isLogin ? "Sign in to manage your domains" : "Start claiming free subdomains"}
              </p>
            </div>

            <div className="flex p-1 bg-slate-900/50 rounded-xl mb-6 border border-white/5">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input type="text" placeholder="John Doe" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600" />
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input type="email" placeholder="you@example.com" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600" />
                </div>
              </div>

              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-semibold transition-all mt-6 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]">
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 flex items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="mx-4 text-sm text-slate-500">or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
              <Github className="h-5 w-5" />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/auth/callback/route.ts": """import { NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // const supabase = await createClient()
    // await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
""",
    "src/app/dashboard/layout.tsx": """"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Settings, FileText, LogOut, Menu, X, User } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Subdomains', href: '/dashboard/domains', icon: Globe },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Documentation', href: '/docs', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 glass-card rounded-none border-y-0 border-l-0 z-50 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-emerald-400" />
            <span>ARC<span className="text-emerald-400">.BD</span></span>
          </Link>
          <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Dev User</p>
            <p className="text-xs text-slate-400">Free Plan</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="md:hidden flex items-center p-4 border-b border-white/10 glass-card rounded-none sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-300 p-1 mr-3">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-white">Dashboard</span>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
""",
    "src/app/dashboard/page.tsx": """"use client";

import { Activity, Globe, Search, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, Dev! 👋</h1>
          <p className="text-slate-400">Here's what's happening with your domains today.</p>
        </div>
        <Link href="/dashboard/domains/new" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Plus className="h-4 w-4" /> Claim New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Globe className="h-16 w-16" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Subdomains Used</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">2</span>
            <span className="text-sm text-slate-500">/ 5 limit</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="h-16 w-16" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Active Records</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">4</span>
          </div>
          <p className="mt-4 text-sm text-emerald-400 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            All systems operational
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Recent Subdomains</h2>
          <Link href="/dashboard/domains" className="text-sm text-emerald-400 hover:text-emerald-300">View all</Link>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input type="text" placeholder="Search domains..." className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Globe className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">project-{i}.arc.bd</h3>
                    <p className="text-xs text-slate-500">Created 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">Active</span>
                  <Link href={`/dashboard/domains/project-${i}`} className="text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/dashboard/domains/page.tsx": """"use client";

import { Globe, Plus, Search, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function DomainsList() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Subdomains</h1>
          <p className="text-slate-400 text-sm">Manage your ARC.BD subdomains and DNS records.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
          <Plus className="h-4 w-4" /> Claim New
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Search domains..." className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="text-sm text-slate-400">
            Showing 2 of 5 allowed
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Domain Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'portfolio.arc.bd', status: 'Active', target: 'cname.vercel-dns.com', date: 'Oct 24, 2023' },
                { name: 'api.arc.bd', status: 'Pending', target: '192.168.1.1', date: 'Oct 25, 2023' },
              ].map((domain, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-400" /> {domain.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${domain.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {domain.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{domain.target}</td>
                  <td className="px-6 py-4 text-slate-400">{domain.date}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/domains/${domain.name}`} className="text-emerald-400 hover:text-emerald-300 font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/dashboard/domains/[id]/page.tsx": """"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function DomainDetail() {
  const params = useParams();
  const domainId = params.id as string;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <Link href="/dashboard/domains" className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-4 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to domains
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{domainId}</h1>
            <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">Active</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Setup Wizard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-white/5 hover:border-emerald-500/50 text-left transition-all group">
            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Vercel</h3>
            <p className="text-xs text-slate-400 mt-1">Automatically configure CNAME for Vercel deployment.</p>
          </button>
          <button className="p-4 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-white/5 hover:border-emerald-500/50 text-left transition-all group">
            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">GitHub Pages</h3>
            <p className="text-xs text-slate-400 mt-1">Setup A records for GitHub Pages hosting.</p>
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">DNS Records</h2>
          <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Record
          </button>
        </div>
        
        <div className="p-4 bg-slate-900/50 border-b border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <select className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none">
                <option>CNAME</option>
                <option>A</option>
                <option>TXT</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Target</label>
              <input type="text" placeholder="e.g. cname.vercel-dns.com" className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-white/5 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Target</th>
                <th className="px-6 py-3 font-medium">TTL</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-bold text-emerald-400">CNAME</td>
                <td className="px-6 py-4 font-mono text-xs">cname.vercel-dns.com</td>
                <td className="px-6 py-4 text-slate-500">Auto</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-2">
          <ShieldAlert className="h-5 w-5" /> Danger Zone
        </h2>
        <p className="text-sm text-slate-400 mb-4">Once you delete a subdomain, there is no going back. Please be certain.</p>
        <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-all">
          Delete Subdomain
        </button>
      </div>
    </div>
  );
}
""",
    "src/app/admin/layout.tsx": """"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Globe, ShieldBan, Flag, Settings, Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Subdomains', href: '/admin/subdomains', icon: Globe },
    { name: 'Reserved Names', href: '/admin/reserved', icon: ShieldBan },
    { name: 'Abuse Reports', href: '/admin/reports', icon: Flag },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950">
      <aside className="w-64 glass-card rounded-none border-y-0 border-l-0 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold text-white tracking-tight">Admin Panel</span>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">Superuser Mode</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
""",
    "src/app/admin/page.tsx": """"use client";

import { Users, Globe, AlertTriangle, ShieldBan } from "lucide-react";

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">System Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "1,248", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Active Subdomains", value: "3,842", icon: Globe, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Pending Abuse Reports", value: "12", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Suspended Domains", value: "45", icon: ShieldBan, color: "text-red-400", bg: "bg-red-400/10" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6 mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Audit Logs</h2>
        <div className="space-y-4">
          {[
            { action: "User admin@arc.bd suspended domain malicious.arc.bd", time: "10 mins ago" },
            { action: "System updated DNS record for api.arc.bd", time: "1 hour ago" },
            { action: "New user registered: newdev@example.com", time: "2 hours ago" },
          ].map((log, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <span className="text-sm text-slate-300 font-mono">{log.action}</span>
              <span className="text-xs text-slate-500">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/admin/subdomains/page.tsx": """"use client";

import { Search, ShieldAlert, CheckCircle } from "lucide-react";

export default function AdminSubdomains() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Subdomain Management</h1>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Search by domain name or owner email..." className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
          <select className="bg-slate-900/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>

        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3 font-medium">Domain</th>
              <th className="px-6 py-3 font-medium">Owner</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-white">project-{i}.arc.bd</td>
                <td className="px-6 py-4 text-slate-400">user{i}@example.com</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">Active</span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors" title="Suspend">
                    <ShieldAlert className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
""",
    "src/app/admin/reserved/page.tsx": """"use client";

import { ShieldBan, Plus, Trash2 } from "lucide-react";

export default function AdminReserved() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Reserved Names</h1>
      <p className="text-sm text-slate-400 mb-4">Prevent users from registering specific subdomains (e.g., admin, www, api).</p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-card p-4 rounded-xl h-fit">
          <h2 className="font-semibold text-white mb-4">Add Reserved Name</h2>
          <form className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Name</label>
              <input type="text" placeholder="e.g., root" className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Reason</label>
              <input type="text" placeholder="System reserved" className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-medium transition-all flex justify-center items-center gap-2">
              <Plus className="h-4 w-4" /> Add Name
            </button>
          </form>
        </div>

        <div className="md:col-span-2 glass-card rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {['admin', 'www', 'api', 'mail', 'support'].map((name) => (
                <tr key={name} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono font-medium text-amber-400">{name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">System reserved</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/admin/reports/page.tsx": """"use client";

import { Flag, ExternalLink, ShieldBan, Check } from "lucide-react";

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Abuse Reports</h1>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[1, 2].map((i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="px-4 py-4 font-medium text-white flex items-center gap-2">
                  badsite{i}.arc.bd
                  <ExternalLink className="h-3 w-3 text-slate-500 cursor-pointer hover:text-white" />
                </td>
                <td className="px-4 py-4 text-rose-400 text-xs font-medium">Phishing / Malware</td>
                <td className="px-4 py-4 text-slate-500 text-xs">Today, 10:45 AM</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">Pending Review</span>
                </td>
                <td className="px-4 py-4 text-right flex justify-end gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Dismiss">
                    <Check className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Suspend Domain">
                    <ShieldBan className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
""",
    "src/app/admin/settings/page.tsx": """"use client";

import { Save } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">System Settings</h1>

      <div className="glass-card rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Limits & Constraints</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-sm font-medium text-slate-300">Max Subdomains Per User</label>
                <p className="text-xs text-slate-500">Default limit for free accounts</p>
              </div>
              <input type="number" defaultValue={5} className="w-20 bg-slate-900/50 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="text-sm font-medium text-slate-300">Min Name Length</label>
              </div>
              <input type="number" defaultValue={3} className="w-20 bg-slate-900/50 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="text-sm font-medium text-slate-300">Max Name Length</label>
              </div>
              <input type="number" defaultValue={63} className="w-20 bg-slate-900/50 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">System Status</h3>
          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm font-medium text-slate-300">Maintenance Mode</label>
              <p className="text-xs text-slate-500">Disable new registrations and modifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/report/page.tsx": """"use client";

import Navbar from "@/components/Navbar";
import { Flag, Send } from "lucide-react";

export default function ReportAbuse() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg glass-card p-8 rounded-2xl animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Flag className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Report Abuse</h1>
              <p className="text-sm text-slate-400">Help us keep ARC.BD safe for everyone.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Subdomain to report</label>
              <div className="flex items-center">
                <input type="text" placeholder="example" className="flex-1 bg-slate-900/50 border border-white/10 rounded-l-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600" />
                <span className="bg-white/5 border border-l-0 border-white/10 py-2.5 px-4 rounded-r-xl text-slate-500 font-medium">.arc.bd</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Your Email</label>
              <input type="email" placeholder="you@example.com" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Category</label>
              <select className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none">
                <option>Phishing / Malware</option>
                <option>Copyright Violation</option>
                <option>Spam</option>
                <option>Other Illegal Content</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Additional Details</label>
              <textarea rows={4} placeholder="Please provide specific URLs or evidence..." className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600 resize-none"></textarea>
            </div>

            <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all mt-4 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Send className="h-5 w-5" /> Submit Report
            </button>
          </form>
        </div>
      </main>
      
      <footer className="border-t border-white/5 py-6 text-center text-sm text-slate-500">
        ARC.BD takes abuse seriously. All reports are reviewed within 24 hours.
      </footer>
    </div>
  );
}
""",
    "src/app/docs/page.tsx": """"use client";

import Navbar from "@/components/Navbar";
import { BookOpen, Triangle, Github, Server } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  const guides = [
    { name: 'Connect to Vercel', href: '/docs/vercel', icon: Triangle, desc: 'Setup your .arc.bd domain with Vercel hosting using CNAME.' },
    { name: 'Connect to GitHub Pages', href: '/docs/github-pages', icon: Github, desc: 'Configure A records to host your site on GitHub Pages.' },
    { name: 'Connect to VPS', href: '/docs/vps', icon: Server, desc: 'Point your domain directly to a custom IP address.' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-emerald-400" />
            Documentation
          </h1>
          <p className="text-lg text-slate-400">Everything you need to know about setting up and managing your ARC.BD subdomain.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
          {guides.map((guide, i) => (
            <Link key={i} href={guide.href} className="glass-card p-6 rounded-2xl hover:bg-white/10 hover:border-emerald-500/50 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-slate-900/50 flex items-center justify-center mb-4 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                <guide.icon className="h-6 w-6 text-slate-300 group-hover:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{guide.name}</h2>
              <p className="text-sm text-slate-400">{guide.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
""",
    "src/app/docs/vercel/page.tsx": """"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, Triangle } from "lucide-react";
import Link from "next/link";

export default function VercelDoc() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 animate-fade-in">
        <Link href="/docs" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <Triangle className="h-8 w-8 text-white fill-white" />
          <h1 className="text-3xl font-bold text-white">Connect to Vercel</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-slate-300 text-lg">Connecting your ARC.BD subdomain to a Vercel project is incredibly simple using CNAME records.</p>
          
          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 1: Add domain in Vercel</h3>
          <ul className="text-slate-300 space-y-2 list-disc list-inside">
            <li>Go to your Vercel Project Settings {'>'} Domains.</li>
            <li>Enter your claimed subdomain (e.g., <code>myproject.arc.bd</code>) and click Add.</li>
            <li>Vercel will show that it is waiting for DNS configuration.</li>
          </ul>

          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 2: Configure ARC.BD Dashboard</h3>
          <ul className="text-slate-300 space-y-2 list-disc list-inside">
            <li>Go to the ARC.BD Dashboard and select your domain.</li>
            <li>In the Quick Setup Wizard, click the <strong>Vercel</strong> preset.</li>
            <li>Alternatively, manually add a record:
              <div className="bg-slate-900 border border-white/10 rounded-lg p-4 mt-2 font-mono text-sm overflow-x-auto">
                Type: CNAME<br/>
                Target: cname.vercel-dns.com
              </div>
            </li>
          </ul>

          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 3: Wait for Propagation</h3>
          <p className="text-slate-300">DNS changes usually propagate instantly on our network, but Vercel may take a minute or two to verify the certificate and show the domain as active.</p>
        </div>
      </main>
    </div>
  );
}
""",
    "src/app/docs/github-pages/page.tsx": """"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, Github } from "lucide-react";
import Link from "next/link";

export default function GithubPagesDoc() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 animate-fade-in">
        <Link href="/docs" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <Github className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Connect to GitHub Pages</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-slate-300 text-lg">Use your ARC.BD subdomain as a custom domain for your GitHub Pages repository.</p>
          
          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 1: Configure ARC.BD DNS</h3>
          <p className="text-slate-300 mb-2">Go to your ARC.BD Dashboard, select your domain, and add a CNAME record pointing to your GitHub pages URL:</p>
          <div className="bg-slate-900 border border-white/10 rounded-lg p-4 font-mono text-sm mb-4">
            Type: CNAME<br/>
            Target: &lt;your-username&gt;.github.io
          </div>

          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 2: Add Custom Domain in GitHub</h3>
          <ul className="text-slate-300 space-y-2 list-disc list-inside">
            <li>Go to your repository on GitHub.</li>
            <li>Navigate to <strong>Settings {'>'} Pages</strong>.</li>
            <li>Under "Custom domain", type your ARC.BD subdomain (e.g., <code>repo.arc.bd</code>).</li>
            <li>Click Save. GitHub will perform a DNS check.</li>
            <li>Once the DNS check passes, check the "Enforce HTTPS" box.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
""",
    "src/app/docs/vps/page.tsx": """"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, Server } from "lucide-react";
import Link from "next/link";

export default function VPSDoc() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 animate-fade-in">
        <Link href="/docs" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <Server className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Connect to Custom VPS</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-slate-300 text-lg">If you are hosting your own server (DigitalOcean, AWS, Linode, etc.), you can use an A record to point your domain to your server's IP address.</p>
          
          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Configuring the A Record</h3>
          <p className="text-slate-300 mb-2">Go to your ARC.BD Dashboard, select your domain, and add an A record:</p>
          <div className="bg-slate-900 border border-white/10 rounded-lg p-4 font-mono text-sm mb-4">
            Type: A<br/>
            Target: 198.51.100.1 (Replace with your server IPv4 address)
          </div>

          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Server Configuration (Nginx Example)</h3>
          <p className="text-slate-300 mb-2">Make sure your web server is configured to listen for your new domain name.</p>
          <div className="bg-slate-900 border border-white/10 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`server {
    listen 80;
    server_name myproject.arc.bd;

    location / {
        proxy_pass http://localhost:3000;
    }
}`}
          </div>
        </div>
      </main>
    </div>
  );
}
"""
}

def write_files():
    for rel_path, content in files.items():
        full_path = os.path.join(BASE_DIR, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Wrote {full_path}")

if __name__ == "__main__":
    write_files()
