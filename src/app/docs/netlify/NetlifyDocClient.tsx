"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
} from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocsCallout } from "@/components/docs/DocsCallout";
import { DocsCodeBlock } from "@/components/docs/DocsCodeBlock";
import { DocsPagination } from "@/components/docs/DocsPagination";

const TOC_ITEMS = [
  { id: "overview", label: "Overview & Requirements" },
  { id: "generator", label: "Interactive DNS Helper" },
  { id: "step-1", label: "1. Add Domain in Netlify" },
  { id: "step-2", label: "2. Add CNAME in ARC.BD" },
  { id: "step-3", label: "3. Verify TLS & Provisioning" },
  { id: "troubleshooting", label: "Troubleshooting & FAQ" },
];

export default function NetlifyDocClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState("my-site");
  const [netlifySiteName, setNetlifySiteName] = useState("app-demo-123");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanSlug = customSlug.toLowerCase().replace(/[^a-z0-9-]/g, "") || "my-site";
  const fullDomain = `${cleanSlug}.arc.bd`;
  const cleanNetlifySite = netlifySiteName.toLowerCase().replace(/[^a-z0-9-]/g, "") || "app-demo-123";
  const netlifyTarget = `${cleanNetlifySite}.netlify.app`;

  return (
    <DocsLayout
      category="Deployment Guides"
      title="Connect .arc.bd Subdomain to Netlify"
      description="Step-by-step DNS configuration guide for connecting free .arc.bd subdomains to Netlify sites with automatic TLS certificate issuance and edge routing."
      toc={TOC_ITEMS}
      prev={{ title: "Vercel & Next.js Setup Guide", href: "/docs/vercel", category: "Deployment Guides" }}
      next={{ title: "GitHub Pages Setup Guide", href: "/docs/github-pages", category: "Deployment Guides" }}
    >
      {/* ── 1. Overview ── */}
      <section id="overview">
        <h2>Overview &amp; Requirements</h2>
        <p>
          To connect your <code>.arc.bd</code> subdomain to Netlify, you will create a <strong>CNAME</strong> record pointing your custom domain directly to your <code>[site-name].netlify.app</code> hostname.
        </p>

        <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              DNS Record Type
            </div>
            <div className="text-sm font-bold text-white font-mono">
              CNAME Record
            </div>
            <p className="text-xs text-zinc-400">
              Aliases traffic to your Netlify app edge.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Target Hostname
            </div>
            <div className="text-sm font-bold font-mono text-primary truncate">
              {netlifyTarget}
            </div>
            <p className="text-xs text-zinc-400">
              Your Netlify site hostname.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              SSL / HTTPS
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              <span>Let&apos;s Encrypt / SSL</span>
            </div>
            <p className="text-xs text-zinc-400">
              Zero manual cert management.
            </p>
          </div>
        </div>

        <DocsCallout type="info" title="Netlify Free Tier Compatible">
          Works seamlessly on all Netlify plans (Starter, Pro, Enterprise) without requiring custom DNS nameserver delegation.
        </DocsCallout>
      </section>

      {/* ── 2. Interactive DNS Helper ── */}
      <section id="generator">
        <h2>Interactive DNS Record Generator</h2>
        <p>
          Fill in your ARC.BD subdomain and Netlify site name to generate the exact DNS record:
        </p>

        <div className="my-6 rounded-xl border border-white/[0.1] bg-[#0c0e15] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Your ARC.BD Subdomain:
              </label>
              <div className="flex items-center rounded-lg border border-white/[0.12] bg-[#141620] px-3 py-2 shadow-inner">
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-site"
                  className="w-full bg-transparent text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <span className="text-xs font-mono font-semibold text-zinc-400 shrink-0 pl-1">
                  .arc.bd
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Your Netlify App Name:
              </label>
              <div className="flex items-center rounded-lg border border-white/[0.12] bg-[#141620] px-3 py-2 shadow-inner">
                <input
                  type="text"
                  value={netlifySiteName}
                  onChange={(e) => setNetlifySiteName(e.target.value)}
                  placeholder="app-demo-123"
                  className="w-full bg-transparent text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <span className="text-xs font-mono font-semibold text-zinc-400 shrink-0 pl-1">
                  .netlify.app
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-[#08090d] p-4 font-mono text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
              <span className="text-zinc-400">Record Type:</span>
              <span className="text-primary font-bold">CNAME</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
              <span className="text-zinc-400">Host / Name:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{cleanSlug}</span>
                <button
                  onClick={() => copyToClipboard(cleanSlug, "host")}
                  className="p-1 text-zinc-400 hover:text-white"
                  title="Copy host name"
                >
                  {copiedKey === "host" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-zinc-400">Target / Value:</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{netlifyTarget}</span>
                <button
                  onClick={() => copyToClipboard(netlifyTarget, "target")}
                  className="p-1 text-zinc-400 hover:text-white"
                  title="Copy target"
                >
                  {copiedKey === "target" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-zinc-400 font-mono">
              Live Address: <strong className="text-white">https://{fullDomain}</strong>
            </span>
            <Link
              href={`/dashboard/domains?preset=netlify&subdomain=${cleanSlug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-semibold text-xs transition-all shadow-sm"
            >
              <span>Apply 1-Click Preset</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Step 1 ── */}
      <section id="step-1">
        <h2>1. Add Custom Domain in Netlify</h2>
        <ol>
          <li>Open your Netlify site dashboard.</li>
          <li>Go to <strong>Site configuration</strong> &rarr; <strong>Domain management</strong>.</li>
          <li>Click <strong>Add a domain</strong> under Custom domains.</li>
          <li>
            Enter your full custom address: <code>{fullDomain}</code> and click <strong>Verify</strong>.
          </li>
          <li>Click <strong>Add domain</strong>.</li>
        </ol>
      </section>

      {/* ── 4. Step 2 ── */}
      <section id="step-2">
        <h2>2. Configure CNAME in ARC.BD Dashboard</h2>
        <ol>
          <li>Log into your <strong>ARC.BD Developer Console</strong>.</li>
          <li>Open your subdomain record and choose <strong>Add DNS Record</strong>.</li>
          <li>Set Type to <code>CNAME</code> and Value to <code>{netlifyTarget}</code>.</li>
          <li>Click <strong>Save Record</strong>.</li>
        </ol>

        <DocsCallout type="tip" title="Netlify CLI Command">
          You can also configure your custom domain with Netlify CLI:
        </DocsCallout>

        <DocsCodeBlock
          language="bash"
          code={`netlify sites:configure --custom-domain ${fullDomain}`}
        />
      </section>

      {/* ── 5. Step 3 ── */}
      <section id="step-3">
        <h2>3. Verify TLS &amp; Edge Provisioning</h2>
        <p>
          Netlify will automatically provision a Let&apos;s Encrypt certificate once the CNAME is verified.
        </p>

        <DocsCodeBlock
          tabs={[
            {
              label: "curl (HTTPS status test)",
              code: `curl -I https://${fullDomain}`,
              language: "bash",
            },
            {
              label: "dig (CNAME check)",
              code: `dig +short CNAME ${fullDomain} @1.1.1.1`,
              language: "bash",
            },
          ]}
        />
      </section>

      {/* ── 6. Troubleshooting ── */}
      <section id="troubleshooting">
        <h2>Troubleshooting &amp; FAQ</h2>
        <div className="space-y-4 mt-4">
          <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12] p-4.5 space-y-1.5">
            <h3 className="text-sm font-semibold text-white mt-0 mb-1">
              Netlify reports &ldquo;Awaiting External DNS&rdquo;
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This message is normal for up to 1–2 minutes while Netlify&apos;s background worker performs HTTP verification. You can click &ldquo;Check DNS configuration&rdquo; to force an immediate refresh.
            </p>
          </div>
        </div>
      </section>

      {/* Pagination Footer */}
      <DocsPagination
        prev={{ title: "Vercel & Next.js Setup Guide", href: "/docs/vercel", category: "Deployment Guides" }}
        next={{ title: "GitHub Pages Setup Guide", href: "/docs/github-pages", category: "Deployment Guides" }}
      />
    </DocsLayout>
  );
}
