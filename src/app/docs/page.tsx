import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Triangle, GitBranch, Server, Zap, ArrowRight } from "lucide-react";
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
      desc: "Connect your subdomain to Vercel deployments with fast edge routing and automatic SSL.",
    },
    {
      name: "Netlify",
      href: "/docs/netlify",
      icon: Zap,
      badge: "CNAME",
      desc: "Deploy static sites and web apps to Netlify with automated TLS certificate provisioning.",
    },
    {
      name: "GitHub Pages",
      href: "/docs/github-pages",
      icon: GitBranch,
      badge: "CNAME",
      desc: "Point your custom subdomain to any public or organization GitHub Pages repository.",
    },
    {
      name: "Custom VPS",
      href: "/docs/vps",
      icon: Server,
      badge: "A Record",
      desc: "Direct traffic to your own VPS, cloud VM, or dedicated server using an IPv4 address.",
    },
  ];

  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="mb-3 max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-foreground text-balance">
            Documentation &amp; Guides
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Step-by-step guides to connect your ARC.BD subdomain with hosting providers and cloud servers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-card/60 p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:bg-card/90 group-hover:shadow-lg group-hover:shadow-primary/5">
                <div className="flex flex-col">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105">
                      <guide.icon className="size-5" aria-hidden="true" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 border border-white/10 bg-white/5 font-mono text-[11px] font-medium text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-foreground"
                    >
                      {guide.badge}
                    </Badge>
                  </div>

                  <h2 className="text-lg font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-white">
                    {guide.name}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {guide.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-sm font-medium text-primary transition-colors duration-200 group-hover:text-primary/90">
                  <span>Read Guide</span>
                  <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </div>
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
