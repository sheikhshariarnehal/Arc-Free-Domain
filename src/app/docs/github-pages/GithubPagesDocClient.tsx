"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Triangle,
  Zap,
  Server,
  Info,
  FileCode,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GithubPagesDocClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState("octocat");
  const [customSlug, setCustomSlug] = useState("my-portfolio");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "generator", label: "DNS Helper" },
    { id: "step-1", label: "1. Enable Pages" },
    { id: "step-2", label: "2. CNAME Record" },
    { id: "step-3", label: "3. Custom Domain" },
    { id: "step-4", label: "4. Enforce HTTPS" },
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
          <span>4 min read</span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 via-card to-card p-6 sm:p-8 mb-10 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="size-14 rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold shrink-0 shadow-lg">
            <GitBranch className="size-7" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Connect .arc.bd Domain to GitHub Pages
              </h1>
              <Badge
                variant="outline"
                className="font-mono text-[11px] border-violet-500/30 text-violet-400 bg-violet-500/10"
              >
                CNAME
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-[11px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              >
                Free HTTPS
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Host static documentation, portfolios, and client demos directly from your GitHub repository using your free custom <code className="text-foreground font-mono">.arc.bd</code> subdomain.
            </p>
          </div>
        </div>

        {/* Quick Jump Bar */}
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
        {/* At a Glance */}
        <section id="overview" className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-violet-400" />
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
                Points your subdomain to GitHub Pages host.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Target Pattern
              </div>
              <div className="text-sm font-semibold font-mono text-violet-400">
                username.github.io
              </div>
              <p className="text-xs text-muted-foreground">
                Always points to your user/org GitHub Pages root.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                SSL / HTTPS
              </div>
              <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                <Lock className="size-3.5" />
                GitHub Enforced HTTPS
              </div>
              <p className="text-xs text-muted-foreground">
                Automatic Let&apos;s Encrypt certificate managed by GitHub.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive DNS Generator */}
        <section
          id="generator"
          className="p-5 sm:p-6 rounded-2xl border border-violet-500/30 bg-violet-950/20 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <GitBranch className="size-4 text-violet-400" />
                Interactive GitHub Pages Record Helper
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your GitHub username and subdomain to generate your exact DNS configuration and CNAME file.
              </p>
            </div>
            <Badge variant="secondary" className="w-fit text-[10px] font-mono">
              Live Helper
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Your GitHub Username or Org
              </label>
              <div className="flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="octocat"
                  className="w-full bg-transparent focus:outline-none font-mono text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Your ARC.BD Subdomain
              </label>
              <div className="flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-portfolio"
                  className="w-full bg-transparent focus:outline-none font-mono text-foreground"
                />
                <span className="text-muted-foreground font-mono shrink-0">.arc.bd</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Record Output */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 font-bold text-[10px]">
                    DNS RECORD FOR ARC.BD
                  </span>
                  <span className="text-muted-foreground font-sans text-xs">
                    CNAME Pointer
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Type: CNAME\nHost: @\nTarget: ${githubUser || "username"}.github.io`,
                      "gh-cname"
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300"
                >
                  {copiedKey === "gh-cname" ? (
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
                <div className="truncate">
                  <span className="text-muted-foreground">Target: </span>
                  <strong className="text-violet-400">{githubUser || "username"}.github.io</strong>
                </div>
              </div>
            </div>

            {/* CNAME File Preview */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground font-sans text-xs">
                    Root CNAME file in repository:
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${customSlug || "my-app"}.arc.bd`,
                      "gh-file"
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300"
                >
                  {copiedKey === "gh-file" ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="size-3" /> Copied</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="size-3" /> Copy</span>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 text-foreground font-mono text-[11px]">
                {customSlug || "my-app"}.arc.bd
              </div>
            </div>
          </div>
        </section>

        {/* STEP 1 */}
        <section
          id="step-1"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-violet-500/10 text-violet-400 text-sm flex items-center justify-center font-bold border border-violet-500/20">
              1
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Enable GitHub Pages in Your Repository
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure build and deployment settings on your GitHub repository.
              </p>
            </div>
          </div>

          <ol className="text-xs sm:text-sm text-muted-foreground space-y-2.5 list-decimal list-inside ml-1 leading-relaxed">
            <li>
              Open your repository on <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline font-medium inline-flex items-center gap-0.5">GitHub <ExternalLink className="size-3 inline" /></a>.
            </li>
            <li>
              Go to <strong>Settings</strong> &rarr; scroll to <strong>Pages</strong> in the sidebar.
            </li>
            <li>
              Under <strong>Build and deployment &rarr; Source</strong>, choose <strong>Deploy from a branch</strong>.
            </li>
            <li>
              Select your branch (e.g. <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">main</code>) and folder (<code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">/ (root)</code> or <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">/docs</code>).
            </li>
            <li>
              Click <strong>Save</strong>.
            </li>
          </ol>
        </section>

        {/* STEP 2 */}
        <section
          id="step-2"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-violet-500/10 text-violet-400 text-sm flex items-center justify-center font-bold border border-violet-500/20">
              2
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Add CNAME Record in ARC.BD Dashboard
              </h2>
              <p className="text-xs text-muted-foreground">
                Route traffic for your subdomain to your GitHub username&apos;s Pages endpoint.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Open your subdomain in the <Link href="/dashboard/domains" className="text-violet-400 hover:underline font-medium">ARC.BD Dashboard</Link> and add a CNAME record:
            </p>

            <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/20 font-mono text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div><span className="text-muted-foreground">Type:</span> <strong className="text-foreground">CNAME</strong></div>
                <div><span className="text-muted-foreground">Host / Name:</span> <strong className="text-foreground">@</strong></div>
                <div><span className="text-muted-foreground">Target:</span> <strong className="text-violet-400">{githubUser || "username"}.github.io</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Important Note:</span> Even if your repository is named <code className="text-foreground font-mono">my-repo</code>, always point the CNAME target to <code className="text-violet-400 font-mono">{githubUser || "username"}.github.io</code> (not the repository name). GitHub uses the CNAME file to route to the correct repo!
            </div>
          </div>
        </section>

        {/* STEP 3 */}
        <section
          id="step-3"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-violet-500/10 text-violet-400 text-sm flex items-center justify-center font-bold border border-violet-500/20">
              3
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Set Custom Domain in GitHub Pages Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Tell GitHub Pages which domain should serve this repository.
              </p>
            </div>
          </div>

          <ol className="text-xs sm:text-sm text-muted-foreground space-y-2.5 list-decimal list-inside ml-1 leading-relaxed">
            <li>
              In your repository <strong>Settings &rarr; Pages</strong>, scroll to the <strong>Custom domain</strong> section.
            </li>
            <li>
              Type your full subdomain: <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{customSlug}.arc.bd</code>.
            </li>
            <li>
              Click <strong>Save</strong>.
            </li>
            <li>
              GitHub will perform a DNS check. Once verified, GitHub automatically creates a <code className="text-foreground font-mono text-xs">CNAME</code> file in the root of your branch.
            </li>
          </ol>
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
                <span>Enforce HTTPS &amp; Verify Live Site</span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  Secure
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Ensure all visitors connect over encrypted TLS.
              </p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground space-y-2.5 leading-relaxed">
            <p>
              In your GitHub Pages settings:
            </p>
            <ul className="space-y-1.5 list-disc list-inside ml-1">
              <li>Wait 2–10 minutes for GitHub&apos;s TLS certificate issuance.</li>
              <li>Check the box for <strong>Enforce HTTPS</strong>.</li>
              <li>Your GitHub Pages project is now live at <strong>https://{customSlug}.arc.bd</strong>!</li>
            </ul>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="size-4.5 text-violet-400" />
            <span>Frequently Asked Questions & Troubleshooting</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Does GitHub Actions wipe my custom domain?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                If you use automated build pipelines (like Vite, Astro, or Next.js static export), ensure your build copies a <code className="text-foreground font-mono">public/CNAME</code> file to the output directory so deployments don&apos;t clear the setting.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                React / Vue Router showing 404 on refresh?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                GitHub Pages is a static file host. For Single Page Applications (SPAs) with client-side routing, add a <code className="text-foreground font-mono">404.html</code> file that redirects to <code className="text-foreground font-mono">index.html</code> (or use HashRouter).
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                &ldquo;Enforce HTTPS&rdquo; checkbox is disabled?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                GitHub waits until DNS propagation is verified across its global certbot nodes before enabling HTTPS. This usually activates within 5 to 15 minutes.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Can I use custom Jekyll themes?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Yes, full Jekyll support works seamlessly out of the box with custom domains on GitHub Pages.
              </p>
            </div>
          </div>
        </section>

        {/* Related Guides */}
        <section className="pt-6 border-t border-border/60 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Explore Other Hosting Guides</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Link
              href="/docs/vercel"
              className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold">
                  <Triangle className="size-4 fill-current" />
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">CNAME</Badge>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                <span>Vercel</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-muted-foreground">
                Deploy Next.js and React apps with zero-delay edge routing.
              </p>
            </Link>

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
              href="/docs/vps"
              className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold">
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
            <div className="size-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to connect GitHub Pages?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Manage DNS records with instant Cloudflare edge synchronization.</p>
            </div>
          </div>
          <Link
            href="/dashboard/domains"
            className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-black text-xs font-semibold transition-colors shrink-0 shadow-sm"
          >
            Open Domain Manager &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
