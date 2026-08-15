"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Triangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  GitBranch,
  Server,
  Info,
  Globe,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VercelDocClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState("my-app");
  const [vercelTarget] = useState("cname.vercel-dns.com");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "generator", label: "DNS Helper" },
    { id: "step-1", label: "1. Deploy Project" },
    { id: "step-2", label: "2. Add Domain" },
    { id: "step-3", label: "3. CNAME Setup" },
    { id: "step-4", label: "4. SSL & Live" },
    { id: "troubleshooting", label: "Troubleshooting" },
  ];

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-28">
      {/* Breadcrumb & Meta */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Documentation</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span>3 min read</span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 via-card to-card p-6 sm:p-8 mb-10 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="size-14 rounded-2xl bg-white text-black flex items-center justify-center font-bold shrink-0 shadow-lg">
            <Triangle className="size-7 fill-current" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Connect .arc.bd Domain to Vercel
              </h1>
              <Badge
                variant="outline"
                className="font-mono text-[11px] border-white/20 text-foreground bg-white/5"
              >
                CNAME
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-[11px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              >
                Auto SSL
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Fast, global edge DNS routing for Next.js, React, Vite, or Astro apps on Vercel with automated Let&apos;s Encrypt / ZeroSSL TLS certificates.
            </p>
          </div>
        </div>

        {/* Quick Jump */}
        <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap gap-2 text-xs">
          <span className="text-muted-foreground font-medium self-center mr-1">Quick jump:</span>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50 text-[11px]"
            >
              {s.label}
            </a>
          ))}
        </div>
      </header>

      <div className="space-y-10">
        {/* At A Glance */}
        <section id="overview" className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>At a Glance</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                DNS Record Type
              </div>
              <div className="text-sm font-semibold text-foreground">
                CNAME Record
              </div>
              <p className="text-xs text-muted-foreground">
                Points directly to Vercel&apos;s Anycast edge network.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Target Hostname
              </div>
              <div className="text-sm font-semibold font-mono text-primary">
                cname.vercel-dns.com
              </div>
              <p className="text-xs text-muted-foreground">
                1-click Quick Preset available in ARC.BD.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                SSL / HTTPS
              </div>
              <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                Automated ZeroSSL
              </div>
              <p className="text-xs text-muted-foreground">
                Active in under 60 seconds after DNS resolves.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive DNS Generator */}
        <section
          id="generator"
          className="p-5 sm:p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Triangle className="size-4 text-primary fill-current" />
                Interactive Vercel DNS Record Helper
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your claimed subdomain to generate your exact copy-paste ready DNS settings.
              </p>
            </div>
            <Badge variant="secondary" className="w-fit text-[10px] font-mono">
              Live Helper
            </Badge>
          </div>

          {/* Subdomain input */}
          <div className="max-w-md space-y-1.5 pt-2">
            <label className="text-xs font-medium text-muted-foreground">
              Your ARC.BD Subdomain
            </label>
            <div className="flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-app"
                className="w-full bg-transparent focus:outline-none font-mono text-foreground"
              />
              <span className="text-muted-foreground font-mono shrink-0">.arc.bd</span>
            </div>
          </div>

          {/* Primary Record Output */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px]">
                    PRIMARY ROUTING RECORD
                  </span>
                  <span className="text-muted-foreground font-sans text-xs">
                    Vercel Edge Anycast
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Type: CNAME\nHost: @\nTarget: ${vercelTarget}`,
                      "vercel-cname"
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  {copiedKey === "vercel-cname" ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/40 p-2 rounded-lg text-[11px]">
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <strong className="text-foreground">CNAME</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Host / Name: </span>
                  <strong className="text-foreground">@ (or leave empty)</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Target Hostname: </span>
                  <strong className="text-primary">{vercelTarget}</strong>
                </div>
              </div>
            </div>

            {/* Optional TXT verification */}
            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                <Info className="size-3.5 text-primary shrink-0" />
                <span>If Vercel prompts for Domain Verification:</span>
              </div>
              <p className="text-[11px] pl-5">
                Add the provided TXT record in ARC.BD with Host: <code className="text-foreground font-mono">_vercel</code> and the unique verification string provided in your Vercel project settings.
              </p>
            </div>
          </div>
        </section>

        {/* STEP 1 */}
        <section
          id="step-1"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-primary/10 text-primary text-sm flex items-center justify-center font-bold border border-primary/20">
              1
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Deploy Your Project on Vercel
              </h2>
              <p className="text-xs text-muted-foreground">
                Import your Git repository (GitHub, GitLab, or Bitbucket) to Vercel.
              </p>
            </div>
          </div>

          <ol className="text-xs sm:text-sm text-muted-foreground space-y-2.5 list-decimal list-inside ml-1 leading-relaxed">
            <li>
              Log in to your <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">Vercel Dashboard <ExternalLink className="size-3 inline" /></a>.
            </li>
            <li>
              Click <strong>Add New...</strong> &rarr; select <strong>Project</strong>.
            </li>
            <li>
              Import your Git repository and configure any environment variables.
            </li>
            <li>
              Click <strong>Deploy</strong>. Vercel will build and assign an initial <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">.vercel.app</code> deployment URL.
            </li>
          </ol>
        </section>

        {/* STEP 2 */}
        <section
          id="step-2"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-primary/10 text-primary text-sm flex items-center justify-center font-bold border border-primary/20">
              2
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Add Subdomain in Vercel Project Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Attach your custom .arc.bd subdomain to the project.
              </p>
            </div>
          </div>

          <ol className="text-xs sm:text-sm text-muted-foreground space-y-2.5 list-decimal list-inside ml-1 leading-relaxed">
            <li>
              In your project dashboard on Vercel, navigate to <strong>Settings</strong> &rarr; <strong>Domains</strong>.
            </li>
            <li>
              In the domain input box, type your full claimed subdomain:
              <div className="bg-muted border border-border rounded-lg p-2.5 font-mono text-xs mt-1.5 text-foreground">
                {customSlug}.arc.bd
              </div>
            </li>
            <li>
              Click <strong>Add</strong>.
            </li>
            <li>
              Vercel will show the domain status with expected DNS configuration (<code className="text-primary font-mono text-xs">cname.vercel-dns.com</code>).
            </li>
          </ol>
        </section>

        {/* STEP 3 */}
        <section
          id="step-3"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-primary/10 text-primary text-sm flex items-center justify-center font-bold border border-primary/20">
              3
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Add CNAME Record in ARC.BD Dashboard
              </h2>
              <p className="text-xs text-muted-foreground">
                Use 1-click Quick Preset or manually configure your record.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Open your subdomain in the <Link href="/dashboard/domains" className="text-primary hover:underline font-medium">ARC.BD Dashboard</Link>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  Option A: 1-Click Quick Preset (Recommended)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In your domain overview, click <strong>Quick Setup Presets</strong> &rarr; <strong>Vercel</strong>. ARC.BD automatically fills and activates the exact CNAME configuration for you!
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5 text-muted-foreground" />
                  Option B: Manual DNS Configuration
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In <strong>DNS Records</strong>, click <strong>Add Record</strong>, choose <strong>CNAME</strong>, enter <code className="text-foreground font-mono">@</code> as Host, and set Target to <code className="text-primary font-mono">cname.vercel-dns.com</code>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 4 */}
        <section
          id="step-4"
          className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center font-bold border border-emerald-500/30">
              4
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <span>Automatic Verification &amp; Live SSL</span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  Valid Configuration
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Vercel detects the record and provisions TLS certificates immediately.
              </p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground space-y-2.5 leading-relaxed">
            <p>
              Within 30–60 seconds after saving your CNAME record in ARC.BD:
            </p>
            <ul className="space-y-1.5 list-disc list-inside ml-1">
              <li>Vercel&apos;s status badge switches to a green <strong>Valid Configuration</strong> indicator.</li>
              <li>An automatic TLS certificate is issued.</li>
              <li>Your application is now live at <strong>https://{customSlug}.arc.bd</strong>.</li>
            </ul>
          </div>
        </section>

        {/* Timeline */}
        <section className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span>Setup Timeline</span>
          </h2>

          <div className="relative pl-6 space-y-4 border-l border-border/70 ml-2 text-xs sm:text-sm">
            <div className="relative">
              <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-card" />
              <div className="font-semibold text-foreground">0 min: Add Domain in Vercel</div>
              <p className="text-xs text-muted-foreground">Add your .arc.bd subdomain in Vercel Settings &rarr; Domains.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-card" />
              <div className="font-semibold text-foreground">1 min: Apply Vercel Preset in ARC.BD</div>
              <p className="text-xs text-muted-foreground">Save the CNAME record pointing to cname.vercel-dns.com.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-400 ring-4 ring-card" />
              <div className="font-semibold text-emerald-400">1–3 min: Active Worldwide</div>
              <p className="text-xs text-muted-foreground">Vercel validates DNS and your app goes live with full HTTPS encryption.</p>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="size-4.5 text-primary" />
            <span>Frequently Asked Questions & Troubleshooting</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Vercel displays &ldquo;Invalid Configuration&rdquo;?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Ensure you haven&apos;t added conflicting A records to the same subdomain in ARC.BD. In DNS, an A record and a CNAME record cannot exist simultaneously at the same host.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Do Server Actions and API routes work?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Yes! CNAME routing passes all requests directly to Vercel&apos;s edge infrastructure, giving you full access to Serverless Functions, Server Actions, middleware, and streaming SSR.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                What about preview deployments?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your custom domain automatically points to your production Git branch. Pull requests and preview branches will continue to get separate preview URLs generated by Vercel.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                How fast is propagation?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Because ARC.BD leverages Cloudflare Anycast edge DNS, new CNAME records typically propagate globally within 30 to 90 seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Related Guides */}
        <section className="pt-6 border-t border-border/60 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Explore Other Hosting Guides</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Link
              href="/docs/netlify"
              className="group p-4 rounded-xl border border-border/80 bg-card hover:border-teal-500/50 transition-all space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                  <Zap className="size-4 fill-current" />
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">CNAME</Badge>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-teal-400 transition-colors flex items-center justify-between">
                <span>Netlify</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-muted-foreground">
                Deploy Jamstack apps to Netlify with automatic Let&apos;s Encrypt TLS.
              </p>
            </Link>

            <Link
              href="/docs/github-pages"
              className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <GitBranch className="size-4" />
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">CNAME</Badge>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                <span>GitHub Pages</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-muted-foreground">
                Host static documentation, portfolios, and repositories from GitHub.
              </p>
            </Link>

            <Link
              href="/docs/vps"
              className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Server className="size-4" />
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">A Record</Badge>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                <span>Custom VPS</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-muted-foreground">
                Point an A record to your cloud virtual machine or Docker host.
              </p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to connect to Vercel?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use the 1-click Vercel Quick Setup preset in your domain dashboard.</p>
            </div>
          </div>
          <Link
            href="/dashboard/domains"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors shrink-0 shadow-sm"
          >
            Open Domain Manager &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
