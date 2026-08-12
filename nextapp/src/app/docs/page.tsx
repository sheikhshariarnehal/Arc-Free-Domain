"use client";

import Navbar from "@/components/Navbar";
import { BookOpen, Triangle, GitBranch, Server } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  const guides = [
    { name: 'Connect to Vercel', href: '/docs/vercel', icon: Triangle, desc: 'Setup your .arc.bd domain with Vercel hosting using CNAME.' },
    { name: 'Connect to GitHub Pages', href: '/docs/github-pages', icon: GitBranch, desc: 'Configure A records to host your site on GitHub Pages.' },
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
