"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Github,
} from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocsCallout } from "@/components/docs/DocsCallout";
import { DocsCodeBlock } from "@/components/docs/DocsCodeBlock";
import { DocsPagination } from "@/components/docs/DocsPagination";

const TOC_ITEMS = [
  { id: "overview", label: "Overview & CNAME Target" },
  { id: "generator", label: "Interactive DNS Helper" },
  { id: "step-1", label: "1. Add CNAME File in GitHub" },
  { id: "step-2", label: "2. Add CNAME in ARC.BD" },
  { id: "step-3", label: "3. Enforce HTTPS in GitHub" },
  { id: "troubleshooting", label: "Troubleshooting & FAQ" },
];

export default function GithubPagesDocClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState("my-project");
  const [githubUsername, setGithubUsername] = useState("octocat");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanSlug = customSlug.toLowerCase().replace(/[^a-z0-9-]/g, "") || "my-project";
  const fullDomain = `${cleanSlug}.arc.bd`;
  const cleanUsername = githubUsername.toLowerCase().replace(/[^a-z0-9-]/g, "") || "octocat";
  const githubTarget = `${cleanUsername}.github.io`;

  return (
    <DocsLayout
      category="Deployment Guides"
      title="Connect .arc.bd Subdomain to GitHub Pages"
      description="Host your open-source projects, documentation sites, and personal developer portfolios on GitHub Pages using a free custom .arc.bd address."
      toc={TOC_ITEMS}
      prev={{ title: "Netlify Setup Guide", href: "/docs/netlify", category: "Deployment Guides" }}
      next={{ title: "Custom Server / VPS Setup Guide", href: "/docs/vps", category: "Deployment Guides" }}
    >
      {/* ── 1. Overview ── */}
      <section id="overview">
        <h2>Overview &amp; CNAME Target</h2>
        <p>
          GitHub Pages routes custom subdomains using a <strong>CNAME</strong> record that points directly to your personal or organization GitHub username: <code>[username].github.io</code>.
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
              Aliases traffic to GitHub&apos;s global CDN.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Target Hostname
            </div>
            <div className="text-sm font-bold font-mono text-primary truncate">
              {githubTarget}
            </div>
            <p className="text-xs text-zinc-400">
              Your GitHub Pages endpoint.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              SSL / HTTPS
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              <span>Enforced HTTPS</span>
            </div>
            <p className="text-xs text-zinc-400">
              Automatic Let&apos;s Encrypt certificate.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive DNS Helper ── */}
      <section id="generator">
        <h2>Interactive DNS Record Generator</h2>
        <p>
          Enter your GitHub username and desired subdomain to generate the required DNS records:
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
                  placeholder="my-project"
                  className="w-full bg-transparent text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <span className="text-xs font-mono font-semibold text-zinc-400 shrink-0 pl-1">
                  .arc.bd
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Your GitHub Username:
              </label>
              <div className="flex items-center rounded-lg border border-white/[0.12] bg-[#141620] px-3 py-2 shadow-inner">
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="octocat"
                  className="w-full bg-transparent text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <span className="text-xs font-mono font-semibold text-zinc-400 shrink-0 pl-1">
                  .github.io
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
                <span className="text-emerald-400 font-semibold">{githubTarget}</span>
                <button
                  onClick={() => copyToClipboard(githubTarget, "target")}
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
              Live URL: <strong className="text-white">https://{fullDomain}</strong>
            </span>
            <Link
              href={`/dashboard/domains?preset=github&subdomain=${cleanSlug}`}
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
        <h2>1. Configure Custom Domain in GitHub Repository</h2>
        <ol>
          <li>Open your repository on <strong>GitHub.com</strong>.</li>
          <li>Click <strong>Settings</strong> &rarr; <strong>Pages</strong> (under Code and automation).</li>
          <li>
            Under <strong>Custom domain</strong>, enter your full domain:
            <br />
            <code>{fullDomain}</code>
          </li>
          <li>Click <strong>Save</strong>.</li>
        </ol>

        <DocsCallout type="tip" title="CNAME file in root / public">
          GitHub will automatically commit a file named <code>CNAME</code> to the root of your publishing branch. If you are building with Vite or Astro, ensure you place the <code>CNAME</code> file in your <code>/public</code> directory.
        </DocsCallout>
      </section>

      {/* ── 4. Step 2 ── */}
      <section id="step-2">
        <h2>2. Configure CNAME in ARC.BD Dashboard</h2>
        <ol>
          <li>Log into your <strong>ARC.BD Developer Console</strong>.</li>
          <li>Choose your domain and click <strong>Add DNS Record</strong>.</li>
          <li>Set Type to <code>CNAME</code> and Value to <code>{githubTarget}</code>.</li>
          <li>Click <strong>Save Record</strong>.</li>
        </ol>
      </section>

      {/* ── 5. Step 3 ── */}
      <section id="step-3">
        <h2>3. Enforce HTTPS</h2>
        <p>
          Once DNS has propagated (usually within 1–2 minutes), return to GitHub Pages settings and check the <strong>Enforce HTTPS</strong> checkbox.
        </p>

        <DocsCodeBlock
          language="bash"
          code={`curl -I https://${fullDomain}`}
        />
      </section>

      {/* ── 6. Troubleshooting ── */}
      <section id="troubleshooting">
        <h2>Troubleshooting &amp; FAQ</h2>
        <div className="space-y-4 mt-4">
          <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12] p-4.5 space-y-1.5">
            <h3 className="text-sm font-semibold text-white mt-0 mb-1">
              &ldquo;Domain does not resolve to the GitHub Pages server&rdquo;
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verify that the target is set to <code>[your-username].github.io</code> and not your repository name. GitHub Pages routing handles repository paths automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Pagination */}
      <DocsPagination
        prev={{ title: "Netlify Setup Guide", href: "/docs/netlify", category: "Deployment Guides" }}
        next={{ title: "Custom Server / VPS Setup Guide", href: "/docs/vps", category: "Deployment Guides" }}
      />
    </DocsLayout>
  );
}
