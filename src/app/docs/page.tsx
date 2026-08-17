import type { Metadata } from "next";
import Link from "next/link";
import {
  Triangle,
  Zap,
  GitBranch,
  Server,
  ArrowRight,
  ShieldCheck,
  Globe,
  Lock,
  Layers,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocsCallout } from "@/components/docs/DocsCallout";
import { DocsCodeBlock } from "@/components/docs/DocsCodeBlock";
import { DocsPagination } from "@/components/docs/DocsPagination";

export const metadata: Metadata = {
  title: "Documentation & Deployment Guides | ARC.BD",
  description:
    "Official developer documentation for ARC.BD free subdomains. Step-by-step DNS routing guides for Vercel, Netlify, GitHub Pages, and custom VPS.",
  alternates: {
    canonical: "/docs",
  },
};

const TOC_ITEMS = [
  { id: "quickstart", label: "Quickstart Overview" },
  { id: "guides", label: "Hosting Guides" },
  { id: "dns-records", label: "DNS Record Types" },
  { id: "cloudflare-ssl", label: "Cloudflare Edge & SSL" },
  { id: "quotas", label: "Quotas & Fair Use" },
];

export default function DocsPage() {
  const guides = [
    {
      name: "Vercel & Next.js",
      href: "/docs/vercel",
      icon: Triangle,
      badge: "CNAME",
      desc: "Fast Anycast edge routing for Next.js, React, or Astro apps on Vercel with automatic TLS.",
    },
    {
      name: "Netlify",
      href: "/docs/netlify",
      icon: Zap,
      badge: "CNAME",
      desc: "Deploy static or serverless web apps on Netlify with automated SSL certificate provisioning.",
    },
    {
      name: "GitHub Pages",
      href: "/docs/github-pages",
      icon: GitBranch,
      badge: "CNAME",
      desc: "Route your custom subdomain directly to any public GitHub Pages repository via CNAME record.",
    },
    {
      name: "Custom Server / VPS",
      href: "/docs/vps",
      icon: Server,
      badge: "A Record",
      desc: "Point an A record directly to any cloud VPS (DigitalOcean, Hetzner, AWS, Linode) IPv4 address.",
    },
  ];

  return (
    <DocsLayout
      category="Getting Started"
      title="ARC.BD Documentation"
      description="Learn how to claim, configure, and route your free .arc.bd subdomains to any hosting platform or cloud server."
      toc={TOC_ITEMS}
      next={{ title: "Vercel Setup Guide", href: "/docs/vercel", category: "Deployment Guides" }}
    >
      {/* ── 1. Quickstart Section ── */}
      <section id="quickstart">
        <h2>Quickstart Overview</h2>
        <p>
          ARC.BD gives developers, students, and indie creators free, high-performance <strong>.arc.bd</strong> subdomains backed by Cloudflare Anycast DNS and automated SSL encryption.
        </p>

        <DocsCallout type="info" title="Zero Configuration Overhead">
          Every subdomain is provisioned with automated Universal SSL at Cloudflare&apos;s global edge within seconds of claiming. No credit card or renewal fees required.
        </DocsCallout>

        <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-[#0d0e14] p-4 space-y-1.5 shadow-xs">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
              1
            </div>
            <h3 className="text-sm font-semibold text-white">Claim a Name</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Find an available name in the search bar and link it to your account.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0d0e14] p-4 space-y-1.5 shadow-xs">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
              2
            </div>
            <h3 className="text-sm font-semibold text-white">Select Host Preset</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use 1-click Quick Presets for Vercel, Netlify, GitHub Pages, or VPS.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0d0e14] p-4 space-y-1.5 shadow-xs">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
              3
            </div>
            <h3 className="text-sm font-semibold text-white">Instant Edge Sync</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Records propagate across Cloudflare data centers globally in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Hosting Guides ── */}
      <section id="guides">
        <h2>Hosting &amp; Deployment Guides</h2>
        <p>
          Select your hosting provider below for a complete step-by-step setup guide:
        </p>

        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0c0d12] p-5 hover:border-white/[0.22] hover:bg-white/[0.03] transition-all shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.1] text-white group-hover:bg-primary group-hover:text-white transition-colors">
                    <guide.icon className="size-4.5" />
                  </div>
                  <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-300">
                    {guide.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                  {guide.name}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  {guide.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary group-hover:text-primary/90">
                <span>View Setup Guide</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. DNS Records ── */}
      <section id="dns-records">
        <h2>Supported DNS Record Types</h2>
        <p>
          ARC.BD gives you granular control over standard DNS records directly from your developer dashboard:
        </p>

        <div className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5 pl-4">Record Type</th>
                <th className="p-3.5">Typical Purpose</th>
                <th className="p-3.5">Example Target</th>
                <th className="p-3.5 pr-4">Propagation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              <tr>
                <td className="p-3.5 pl-4 font-mono font-bold text-primary">CNAME</td>
                <td className="p-3.5">Aliases to cloud platforms (Vercel, Netlify, GitHub)</td>
                <td className="p-3.5 font-mono text-zinc-400">cname.vercel-dns.com</td>
                <td className="p-3.5 pr-4 text-emerald-400 font-medium">Instant (&lt; 5s)</td>
              </tr>
              <tr>
                <td className="p-3.5 pl-4 font-mono font-bold text-emerald-400">A</td>
                <td className="p-3.5">Direct IPv4 mapping for custom VPS &amp; servers</td>
                <td className="p-3.5 font-mono text-zinc-400">198.51.100.42</td>
                <td className="p-3.5 pr-4 text-emerald-400 font-medium">Instant (&lt; 5s)</td>
              </tr>
              <tr>
                <td className="p-3.5 pl-4 font-mono font-bold text-amber-400">TXT</td>
                <td className="p-3.5">Site verification tokens (Google, Resend, GitHub)</td>
                <td className="p-3.5 font-mono text-zinc-400">google-site-verification=...</td>
                <td className="p-3.5 pr-4 text-emerald-400 font-medium">Instant (&lt; 5s)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4">
          You can test DNS resolution on your machine using <code>dig</code> or <code>nslookup</code>:
        </p>

        <DocsCodeBlock
          language="bash"
          tabs={[
            {
              label: "dig (Linux / macOS)",
              code: "dig +short CNAME yourproject.arc.bd @1.1.1.1",
              language: "bash",
            },
            {
              label: "nslookup (Windows)",
              code: "nslookup yourproject.arc.bd 1.1.1.1",
              language: "cmd",
            },
            {
              label: "curl (HTTP Test)",
              code: "curl -I https://yourproject.arc.bd",
              language: "bash",
            },
          ]}
        />
      </section>

      {/* ── 4. Cloudflare Edge & SSL ── */}
      <section id="cloudflare-ssl">
        <h2>Cloudflare Edge &amp; Automated SSL</h2>
        <p>
          All <code>.arc.bd</code> domains operate on Cloudflare&apos;s global Anycast edge network with over 330 points of presence worldwide.
        </p>

        <DocsCallout type="tip" title="Automatic HTTPS Enforcement">
          Universal SSL certificates are provisioned automatically. You do not need to generate certificates using Certbot or manage renewal cron jobs.
        </DocsCallout>
      </section>

      {/* ── 5. Quotas & Fair Use ── */}
      <section id="quotas">
        <h2>Quotas &amp; Fair Use Policy</h2>
        <p>
          Every verified developer account can register and manage up to <strong>5 active subdomains</strong> simultaneously.
        </p>
        <ul>
          <li>Free forever for open source, portfolios, APIs, side projects, and student learning.</li>
          <li>Phishing, malware hosting, impersonation, or illegal content results in immediate permanent suspension.</li>
          <li>Subdomains with no active DNS records for &gt; 180 days may be reclaimed for the community.</li>
        </ul>
      </section>

      {/* Pagination Footer */}
      <DocsPagination
        next={{ title: "Vercel & Next.js Setup Guide", href: "/docs/vercel", category: "Deployment Guides" }}
      />
    </DocsLayout>
  );
}
