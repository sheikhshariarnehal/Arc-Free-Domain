import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Triangle, GitBranch, Server, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Documentation & Deployment Guides",
  description:
    "Step-by-step DNS configuration guides to connect your free .arc.bd subdomain to Vercel, Netlify, GitHub Pages, or any custom VPS.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Documentation & Deployment Guides | ARC.BD",
    description:
      "Step-by-step DNS configuration guides to connect your free .arc.bd subdomain to Vercel, Netlify, GitHub Pages, or any custom VPS.",
    url: "https://arc.bd/docs",
  },
};

export default function DocsPage() {
  const guides = [
    {
      name: "Vercel",
      href: "/docs/vercel",
      icon: Triangle,
      badge: "CNAME",
      desc: "Route traffic to Next.js or React apps on Vercel with fast edge routing and automated SSL.",
    },
    {
      name: "Netlify",
      href: "/docs/netlify",
      icon: Zap,
      badge: "CNAME",
      desc: "Deploy web apps to Netlify with automated TLS certificate provisioning and edge caching.",
    },
    {
      name: "GitHub Pages",
      href: "/docs/github-pages",
      icon: GitBranch,
      badge: "CNAME",
      desc: "Point your custom subdomain directly to any public or organization GitHub Pages repository.",
    },
    {
      name: "Custom Server / VPS",
      href: "/docs/vps",
      icon: Server,
      badge: "A Record",
      desc: "Point an A record to your cloud VPS, virtual machine, or dedicated server IPv4 address.",
    },
  ];

  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8 lg:pt-28">
        {/* Page Header */}
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Documentation
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
            Connect your subdomain to cloud hosting providers and servers.
          </p>
        </div>

        {/* 2x2 Balanced Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card p-5 sm:p-6 transition-all duration-200 hover:border-primary/50 hover:bg-secondary/40 hover:shadow-md shadow-xs">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/80 text-foreground border border-border/80 transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                      <guide.icon className="size-4.5" aria-hidden="true" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-mono text-[11px] font-medium text-foreground/80 border-border/80 bg-secondary/80 px-2.5 py-0.5 rounded-md"
                    >
                      {guide.badge}
                    </Badge>
                  </div>

                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {guide.name}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {guide.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs sm:text-sm font-medium text-primary transition-colors group-hover:text-primary/90">
                  <span>Read Setup Guide</span>
                  <ArrowRight className="ml-1.5 size-3.5 sm:size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Help & Support Strip */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">Have a custom hosting setup?</p>
              <p className="text-xs text-muted-foreground mt-0.5">ARC.BD supports standard A, CNAME, and TXT edge DNS records compatible with any server or host.</p>
            </div>
          </div>
          <Link
            href="/dashboard/domains"
            className="text-xs font-semibold text-foreground hover:text-primary transition-colors shrink-0 underline underline-offset-4"
          >
            Manage Subdomains &rarr;
          </Link>
        </div>
      </main>

      <footer className="border-t border-border/50 px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground sm:px-6">
        ARC.BD Knowledge Base &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
