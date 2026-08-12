"use client";

import Navbar from "@/components/Navbar";
import { BookOpen, Triangle, GitBranch, Server, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  const guides = [
    {
      name: "Vercel Integration",
      href: "/docs/vercel",
      icon: Triangle,
      badge: "CNAME",
      desc: "Connect your .arc.bd subdomain to Vercel deployments using target cname.vercel-dns.com.",
    },
    {
      name: "GitHub Pages",
      href: "/docs/github-pages",
      icon: GitBranch,
      badge: "CNAME / A",
      desc: "Point your domain to GitHub Pages (username.github.io) with automated SSL.",
    },
    {
      name: "Custom VPS / Server",
      href: "/docs/vps",
      icon: Server,
      badge: "IPv4 A Record",
      desc: "Direct your subdomain to any custom server or cloud instance using an IPv4 A-record.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 sm:py-20">
        <div className="mb-12">
          <Badge variant="outline" className="mb-4 border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-mono py-1 px-3.5 rounded-full">
            <BookOpen className="size-3 mr-1.5 inline" /> Knowledge Base
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">
            Documentation &amp; Guides
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
            Step-by-step guides to connect your ARC.BD subdomain with hosting providers and cloud servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {guides.map((guide, i) => (
            <Link key={i} href={guide.href} className="group">
              <Card className="bg-card/40 border-border/60 hover:border-emerald-500/30 hover:bg-card/80 transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <guide.icon className="size-5" />
                      </div>
                      <Badge variant="secondary" className="font-mono text-[10px] text-muted-foreground border-border/40">
                        {guide.badge}
                      </Badge>
                    </div>

                    <h2 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-emerald-400 transition-colors">
                      {guide.name}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {guide.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-medium text-emerald-400 mt-6 group-hover:translate-x-1 transition-transform">
                    Read Guide <ArrowRight className="size-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground mt-auto">
        ARC.BD Knowledge Base &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
