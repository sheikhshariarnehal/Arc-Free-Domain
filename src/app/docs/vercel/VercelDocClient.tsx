"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Triangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Terminal,
} from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocsCallout } from "@/components/docs/DocsCallout";
import { DocsCodeBlock } from "@/components/docs/DocsCodeBlock";
import { DocsPagination } from "@/components/docs/DocsPagination";

const TOC_ITEMS = [
  { id: "overview", label: "Overview & Requirements" },
  { id: "generator", label: "Interactive DNS Helper" },
  { id: "step-1", label: "1. Add Domain in Vercel" },
  { id: "step-2", label: "2. Configure CNAME in ARC.BD" },
  { id: "step-3", label: "3. Verify & Live Check" },
  { id: "troubleshooting", label: "Troubleshooting & FAQ" },
];

export default function VercelDocClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState("my-portfolio");
  const [vercelTarget] = useState("cname.vercel-dns.com");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanSlug = customSlug.toLowerCase().replace(/[^a-z0-9-]/g, "") || "my-portfolio";
  const fullDomain = `${cleanSlug}.arc.bd`;

  return (
    <DocsLayout
      category="Deployment Guides"
      title="Connect .arc.bd Subdomain to Vercel"
      description="Deploy Next.js, React, Astro, or Remix applications to Vercel and route traffic seamlessly through ARC.BD with automated Cloudflare Anycast edge DNS and instant SSL."
      toc={TOC_ITEMS}
      prev={{ title: "Documentation Hub", href: "/docs", category: "Getting Started" }}
      next={{ title: "Netlify Setup Guide", href: "/docs/netlify", category: "Deployment Guides" }}
    >
      {/* ── 1. Overview ── */}
      <section id="overview">
        <h2>Overview &amp; Requirements</h2>
        <p>
          Connecting your free <code>.arc.bd</code> subdomain to a Vercel project requires creating a <strong>CNAME</strong> record that points your custom address to Vercel&apos;s global edge routing endpoint.
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
              Aliases traffic to Vercel Anycast edge.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Target Hostname
            </div>
            <div className="text-sm font-bold font-mono text-primary truncate">
              {vercelTarget}
            </div>
            <p className="text-xs text-zinc-400">
              Vercel&apos;s primary edge routing target.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              SSL / HTTPS
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              <span>Universal SSL</span>
            </div>
            <p className="text-xs text-zinc-400">
              Issued automatically with 0-config.
            </p>
          </div>
        </div>

        <DocsCallout type="info" title="Vercel Free Tier Compatible">
          This setup is 100% compatible with both Vercel Hobby (Free) and Pro accounts. No custom nameserver delegation is required.
        </DocsCallout>
      </section>

      {/* ── 2. Interactive DNS Helper ── */}
      <section id="generator">
        <h2>Interactive DNS Record Generator</h2>
        <p>
          Enter your subdomain name to generate the exact DNS record values needed for your ARC.BD dashboard:
        </p>

        <div className="my-6 rounded-xl border border-white/[0.1] bg-[#0c0e15] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Your Subdomain Prefix:
            </label>
            <div className="flex items-center rounded-lg border border-white/[0.12] bg-[#141620] px-3 py-2 max-w-md shadow-inner">
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-portfolio"
                className="w-full bg-transparent text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <span className="text-xs font-mono font-semibold text-zinc-400 shrink-0 pl-2">
                .arc.bd
              </span>
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
                <span className="text-emerald-400 font-semibold">{vercelTarget}</span>
                <button
                  onClick={() => copyToClipboard(vercelTarget, "target")}
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
              Result: <strong className="text-white">https://{fullDomain}</strong>
            </span>
            <Link
              href={`/dashboard/domains?preset=vercel&subdomain=${cleanSlug}`}
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
        <h2>1. Add Custom Domain in Vercel</h2>
        <ol>
          <li>Open your project in the <strong>Vercel Dashboard</strong>.</li>
          <li>Navigate to <strong>Settings</strong> &rarr; <strong>Domains</strong>.</li>
          <li>
            In the domain input field, enter your full subdomain address:
            <br />
            <code>{fullDomain}</code>
          </li>
          <li>Click <strong>Add</strong>. Select <em>&ldquo;Add subdomain (no redirect)&rdquo;</em>.</li>
        </ol>

        <DocsCallout type="tip" title="Vercel CLI Alternative">
          You can also add the domain directly from your terminal using the Vercel CLI:
        </DocsCallout>

        <DocsCodeBlock
          language="bash"
          code={`vercel domains add ${fullDomain}`}
        />
      </section>

      {/* ── 4. Step 2 ── */}
      <section id="step-2">
        <h2>2. Configure CNAME in ARC.BD Dashboard</h2>
        <ol>
          <li>Log in to your <strong>ARC.BD Developer Console</strong>.</li>
          <li>Select your registered subdomain from <strong>My Subdomains</strong>.</li>
          <li>Click <strong>Add DNS Record</strong> or choose the <strong>Vercel Quick Preset</strong>.</li>
          <li>
            Set the record type to <code>CNAME</code> and target to <code>cname.vercel-dns.com</code>.
          </li>
          <li>Click <strong>Save Record</strong>.</li>
        </ol>

        <DocsCallout type="info" title="Automatic Anycast Edge Sync">
          ARC.BD synchronizes changes directly with Cloudflare Anycast edge servers within 3 to 10 seconds.
        </DocsCallout>
      </section>

      {/* ── 5. Step 3 ── */}
      <section id="step-3">
        <h2>3. Verify &amp; Test Live Propagation</h2>
        <p>
          Once saved, Vercel will automatically detect the CNAME record and issue an SSL certificate.
        </p>

        <DocsCodeBlock
          tabs={[
            {
              label: "curl (HTTPS status test)",
              code: `curl -I https://${fullDomain}`,
              language: "bash",
            },
            {
              label: "dig (DNS check)",
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
              Vercel shows &ldquo;Invalid Configuration&rdquo;
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ensure you selected <code>CNAME</code> (not A record) and that the target is exactly <code>cname.vercel-dns.com</code> without any trailing periods. Allow up to 60 seconds for DNS caches to refresh.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12] p-4.5 space-y-1.5">
            <h3 className="text-sm font-semibold text-white mt-0 mb-1">
              Can I configure preview / staging branches?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Yes! You can register subdomains like <code>staging-app.arc.bd</code> and assign them to specific Git branches in Vercel Domain Settings.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Pagination */}
      <DocsPagination
        prev={{ title: "Documentation Hub", href: "/docs", category: "Getting Started" }}
        next={{ title: "Netlify Setup Guide", href: "/docs/netlify", category: "Deployment Guides" }}
      />
    </DocsLayout>
  );
}
