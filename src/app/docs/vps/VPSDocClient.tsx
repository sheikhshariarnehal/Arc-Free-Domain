"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Server,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocsCallout } from "@/components/docs/DocsCallout";
import { DocsCodeBlock } from "@/components/docs/DocsCodeBlock";
import { DocsPagination } from "@/components/docs/DocsPagination";

const TOC_ITEMS = [
  { id: "overview", label: "Overview & Requirements" },
  { id: "generator", label: "Interactive A Record Generator" },
  { id: "step-1", label: "1. Add A Record in ARC.BD" },
  { id: "step-2", label: "2. Configure Nginx / Reverse Proxy" },
  { id: "step-3", label: "3. SSL & Test Routing" },
  { id: "troubleshooting", label: "Troubleshooting & FAQ" },
];

export default function VPSDocClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState("api-service");
  const [serverIp, setServerIp] = useState("198.51.100.42");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanSlug = customSlug.toLowerCase().replace(/[^a-z0-9-]/g, "") || "api-service";
  const fullDomain = `${cleanSlug}.arc.bd`;
  const cleanIp = serverIp.trim() || "198.51.100.42";

  return (
    <DocsLayout
      category="Deployment Guides"
      title="Connect .arc.bd Subdomain to Custom VPS / Server"
      description="Configure standard A records to point your free .arc.bd subdomain directly to any cloud VPS (DigitalOcean, Hetzner, AWS, Linode) or dedicated Linux server."
      toc={TOC_ITEMS}
      prev={{ title: "GitHub Pages Setup Guide", href: "/docs/github-pages", category: "Deployment Guides" }}
      next={{ title: "Documentation Hub", href: "/docs", category: "Getting Started" }}
    >
      {/* ── 1. Overview ── */}
      <section id="overview">
        <h2>Overview &amp; Requirements</h2>
        <p>
          If you are self-hosting your application on a cloud VPS (Virtual Private Server) or dedicated Linux box, you will configure an <strong>A record</strong> that routes your subdomain traffic directly to your server&apos;s public IPv4 address.
        </p>

        <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              DNS Record Type
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              A Record
            </div>
            <p className="text-xs text-zinc-400">
              Direct IPv4 address mapping.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Target Value
            </div>
            <div className="text-sm font-bold font-mono text-primary truncate">
              {cleanIp}
            </div>
            <p className="text-xs text-zinc-400">
              Your server public IPv4.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0d12] space-y-1 shadow-xs">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              SSL Termination
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              <span>Universal SSL / Origin</span>
            </div>
            <p className="text-xs text-zinc-400">
              Automatic edge SSL included.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive DNS Helper ── */}
      <section id="generator">
        <h2>Interactive A Record Generator</h2>
        <p>
          Enter your subdomain prefix and public server IPv4 address:
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
                  placeholder="api-service"
                  className="w-full bg-transparent text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <span className="text-xs font-mono font-semibold text-zinc-400 shrink-0 pl-1">
                  .arc.bd
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Server Public IPv4 Address:
              </label>
              <div className="flex items-center rounded-lg border border-white/[0.12] bg-[#141620] px-3 py-2 shadow-inner">
                <input
                  type="text"
                  value={serverIp}
                  onChange={(e) => setServerIp(e.target.value)}
                  placeholder="198.51.100.42"
                  className="w-full bg-transparent text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-[#08090d] p-4 font-mono text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
              <span className="text-zinc-400">Record Type:</span>
              <span className="text-emerald-400 font-bold">A</span>
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
              <span className="text-zinc-400">IPv4 Address:</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{cleanIp}</span>
                <button
                  onClick={() => copyToClipboard(cleanIp, "target")}
                  className="p-1 text-zinc-400 hover:text-white"
                  title="Copy IP"
                >
                  {copiedKey === "target" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-zinc-400 font-mono">
              Direct Route: <strong className="text-white">https://{fullDomain}</strong> &rarr; <code className="text-emerald-400">{cleanIp}</code>
            </span>
            <Link
              href={`/dashboard/domains?preset=vps&subdomain=${cleanSlug}`}
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
        <h2>1. Add A Record in ARC.BD Dashboard</h2>
        <ol>
          <li>Log into your <strong>ARC.BD Developer Console</strong>.</li>
          <li>Choose your domain and click <strong>Add DNS Record</strong>.</li>
          <li>Select Type: <code>A</code>.</li>
          <li>Enter your server&apos;s public IPv4 address: <code>{cleanIp}</code>.</li>
          <li>Click <strong>Save Record</strong>.</li>
        </ol>
      </section>

      {/* ── 4. Step 2 ── */}
      <section id="step-2">
        <h2>2. Configure Nginx / Caddy Reverse Proxy</h2>
        <p>
          Configure your server&apos;s web server to listen for requests for <code>{fullDomain}</code> and reverse proxy to your backend application:
        </p>

        <DocsCodeBlock
          tabs={[
            {
              label: "Nginx (/etc/nginx/sites-available)",
              code: `server {
    listen 80;
    server_name ${fullDomain};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`,
              language: "nginx",
              filename: "nginx.conf",
            },
            {
              label: "Caddy (Caddyfile)",
              code: `${fullDomain} {
    reverse_proxy 127.0.0.1:3000
}`,
              language: "caddy",
              filename: "Caddyfile",
            },
            {
              label: "Docker Compose",
              code: `services:
  app:
    image: my-backend-app:latest
    ports:
      - "3000:3000"
    environment:
      - DOMAIN=${fullDomain}`,
              language: "yaml",
              filename: "docker-compose.yml",
            },
          ]}
        />
      </section>

      {/* ── 5. Step 3 ── */}
      <section id="step-3">
        <h2>3. SSL &amp; Verification</h2>
        <p>
          Test your server DNS resolution and HTTP response status:
        </p>

        <DocsCodeBlock
          tabs={[
            {
              label: "dig (A record test)",
              code: `dig +short A ${fullDomain} @1.1.1.1`,
              language: "bash",
            },
            {
              label: "curl (HTTP response)",
              code: `curl -I http://${fullDomain}`,
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
              &ldquo;Connection refused&rdquo; on port 80 or 443
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verify that your cloud firewall (e.g. AWS Security Groups, Hetzner Firewall, UFW on Ubuntu) allows inbound traffic on port 80 (HTTP) and port 443 (HTTPS): <code>sudo ufw allow 80/tcp && sudo ufw allow 443/tcp</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Pagination */}
      <DocsPagination
        prev={{ title: "GitHub Pages Setup Guide", href: "/docs/github-pages", category: "Deployment Guides" }}
        next={{ title: "Documentation Hub", href: "/docs", category: "Getting Started" }}
      />
    </DocsLayout>
  );
}
