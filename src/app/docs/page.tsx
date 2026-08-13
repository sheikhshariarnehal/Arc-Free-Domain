"use client";

import Navbar from "@/components/Navbar";
import { BookOpen, Triangle, GitBranch, Server, Zap, ArrowRight } from "lucide-react";
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
      name: "Netlify Deployment",
      href: "/docs/netlify",
      icon: Zap,
      badge: "CNAME / A",
      desc: "Deploy your site to Netlify and configure your ARC.BD subdomain with automatic SSL.",
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
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <Badge variant="outline" className="mb-4 min-h-8 rounded-full border-emerald-500/30 bg-emerald-500/5 px-3.5 py-1 font-mono text-xs text-emerald-400">
            <BookOpen className="mr-1.5 size-3.5" /> Knowledge Base
          </Badge>
          <h1 className="mb-3 max-w-3xl text-[clamp(2rem,7vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-foreground text-balance">
            Documentation &amp; Guides
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Step-by-step guides to connect your ARC.BD subdomain with hosting providers and cloud servers.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <Card className="h-full min-w-0 border border-border/60 bg-card/40 transition-colors duration-200 group-hover:border-emerald-500/30 group-hover:bg-card/80">
                <CardContent className="flex h-full min-h-56 min-w-0 flex-col justify-between p-5 sm:min-h-64 sm:p-6">
                  <div className="min-w-0">
                    <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                        <guide.icon className="size-5" aria-hidden="true" />
                      </div>
                      <Badge variant="secondary" className="min-w-0 max-w-full shrink truncate border-border/40 font-mono text-[10px] text-muted-foreground">
                        {guide.badge}
                      </Badge>
                    </div>

                    <h2 className="mb-2 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-emerald-400">
                      {guide.name}
                    </h2>
                    <p className="break-words text-sm leading-relaxed text-muted-foreground">
                      {guide.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex min-h-11 items-center text-sm font-medium text-emerald-400">
                    Read Guide <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mt-auto border-t border-border/50 px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground sm:px-6">
        ARC.BD Knowledge Base &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
