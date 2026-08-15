"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Server,
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
  GitBranch,
  Terminal,
  Lock,
  Code2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VPSDocClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [serverIp, setServerIp] = useState("198.51.100.1");
  const [customSlug, setCustomSlug] = useState("api");
  const [appPort, setAppPort] = useState("3000");
  const [activeConfigTab, setActiveConfigTab] = useState<"nginx" | "caddy" | "docker">("nginx");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const domain = `${customSlug || "api"}.arc.bd`;

  const nginxConfig = `server {
    listen 80;
    listen [::]:80;
    server_name ${domain};

    location / {
        proxy_pass http://127.0.0.1:${appPort || "3000"};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  const caddyConfig = `${domain} {
    reverse_proxy localhost:${appPort || "3000"}
}`;

  const dockerCompose = `services:
  app:
    image: your-app-image:latest
    ports:
      - "${appPort || "3000"}:${appPort || "3000"}"
    restart: unless-stopped`;

  const certbotCommand = `sudo certbot --nginx -d ${domain}`;

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "generator", label: "DNS & Config Generator" },
    { id: "step-1", label: "1. A Record" },
    { id: "step-2", label: "2. Firewall" },
    { id: "step-3", label: "3. Web Server" },
    { id: "step-4", label: "4. Free SSL" },
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
          <span>5 min read</span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/10 via-card to-card p-6 sm:p-8 mb-10 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="size-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold shrink-0 shadow-lg">
            <Server className="size-7" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Connect .arc.bd Domain to Custom VPS / Server
              </h1>
              <Badge
                variant="outline"
                className="font-mono text-[11px] border-sky-500/30 text-sky-400 bg-sky-500/10"
              >
                A Record
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-[11px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              >
                Certbot TLS
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Complete setup guide for Ubuntu, Debian, or Rocky Linux VPS, dedicated servers, Dokploy, Coolify, or Docker hosts using standard IPv4 A records and Nginx/Caddy reverse proxies.
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
            <Sparkles className="size-4 text-sky-400" />
            <span>At a Glance</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                DNS Record Type
              </div>
              <div className="text-sm font-semibold text-foreground">
                A Record (IPv4)
              </div>
              <p className="text-xs text-muted-foreground">
                Points subdomain directly to your VPS public IP.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Web Server / Proxy
              </div>
              <div className="text-sm font-semibold font-mono text-sky-400">
                Nginx / Caddy / Dokploy
              </div>
              <p className="text-xs text-muted-foreground">
                Reverse proxy to Node.js, Python, Go, or Docker container.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                SSL / HTTPS
              </div>
              <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                <Lock className="size-3.5" />
                Certbot Let&apos;s Encrypt
              </div>
              <p className="text-xs text-muted-foreground">
                Automated 1-command SSL certificate setup.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive DNS & Web Server Config Generator */}
        <section
          id="generator"
          className="p-5 sm:p-6 rounded-2xl border border-sky-500/30 bg-sky-950/20 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Terminal className="size-4 text-sky-400" />
                Interactive VPS DNS &amp; Server Config Generator
              </h2>
              <p className="text-xs text-muted-foreground">
                Customize your subdomain, server IP, and port to get exact copy-paste ready DNS and server configs.
              </p>
            </div>
            <Badge variant="secondary" className="w-fit text-[10px] font-mono">
              Live Helper
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Your ARC.BD Subdomain
              </label>
              <div className="flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="api"
                  className="w-full bg-transparent focus:outline-none font-mono text-foreground"
                />
                <span className="text-muted-foreground font-mono shrink-0">.arc.bd</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Your Server Public IPv4
              </label>
              <div className="flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                <input
                  type="text"
                  value={serverIp}
                  onChange={(e) => setServerIp(e.target.value.trim())}
                  placeholder="198.51.100.1"
                  className="w-full bg-transparent focus:outline-none font-mono text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                App Local Port
              </label>
              <div className="flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                <input
                  type="text"
                  value={appPort}
                  onChange={(e) => setAppPort(e.target.value.trim())}
                  placeholder="3000"
                  className="w-full bg-transparent focus:outline-none font-mono text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* DNS Record */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold text-[10px]">
                    DNS RECORD IN ARC.BD
                  </span>
                  <span className="text-muted-foreground font-sans text-xs">
                    IPv4 Address Target
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Type: A\nHost: @\nTarget: ${serverIp || "198.51.100.1"}`,
                      "vps-a"
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {copiedKey === "vps-a" ? (
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
                  <strong className="text-foreground">A</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Host / Name: </span>
                  <strong className="text-foreground">@ (or leave empty)</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Target IPv4: </span>
                  <strong className="text-sky-400">{serverIp || "198.51.100.1"}</strong>
                </div>
              </div>
            </div>

            {/* Web Server Config Tabs */}
            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Generated Web Server Config:</span>
                  <div className="flex rounded-lg bg-muted p-0.5 text-[11px]">
                    <button
                      onClick={() => setActiveConfigTab("nginx")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeConfigTab === "nginx"
                          ? "bg-card text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Nginx
                    </button>
                    <button
                      onClick={() => setActiveConfigTab("caddy")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeConfigTab === "caddy"
                          ? "bg-card text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Caddy
                    </button>
                    <button
                      onClick={() => setActiveConfigTab("docker")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeConfigTab === "docker"
                          ? "bg-card text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Docker
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const content =
                      activeConfigTab === "nginx"
                        ? nginxConfig
                        : activeConfigTab === "caddy"
                        ? caddyConfig
                        : dockerCompose;
                    copyToClipboard(content, `config-${activeConfigTab}`);
                  }}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {copiedKey === `config-${activeConfigTab}` ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="size-3" /> Copied Config</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="size-3" /> Copy Config</span>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-3.5 rounded-lg bg-black/40 border border-border font-mono text-xs overflow-x-auto text-sky-300 leading-relaxed max-h-60">
                  {activeConfigTab === "nginx" && nginxConfig}
                  {activeConfigTab === "caddy" && caddyConfig}
                  {activeConfigTab === "docker" && dockerCompose}
                </pre>
              </div>

              {activeConfigTab === "nginx" && (
                <div className="flex items-center justify-between p-2 rounded bg-muted/40 text-[11px] font-mono">
                  <span className="text-muted-foreground">Auto-SSL Command:</span>
                  <button
                    onClick={() => copyToClipboard(certbotCommand, "certbot")}
                    className="text-sky-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === "certbot" ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    <span>{certbotCommand}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* STEP 1 */}
        <section
          id="step-1"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-sky-500/10 text-sky-400 text-sm flex items-center justify-center font-bold border border-sky-500/20">
              1
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Add A Record in ARC.BD Dashboard
              </h2>
              <p className="text-xs text-muted-foreground">
                Point your .arc.bd subdomain to your server&apos;s public IPv4 address.
              </p>
            </div>
          </div>

          <ol className="text-xs sm:text-sm text-muted-foreground space-y-2.5 list-decimal list-inside ml-1 leading-relaxed">
            <li>
              Log in to your <Link href="/dashboard/domains" className="text-sky-400 hover:underline font-medium">ARC.BD Domains Dashboard</Link>.
            </li>
            <li>
              Click <strong>Manage</strong> on your subdomain.
            </li>
            <li>
              In the <strong>DNS Records</strong> section, click <strong>Add Record</strong>.
            </li>
            <li>
              Select Type: <strong>A</strong>, Host: <code className="text-foreground font-mono">@</code>, and enter your public IPv4 address.
            </li>
            <li>
              Click <strong>Save Record</strong>.
            </li>
          </ol>
        </section>

        {/* STEP 2 */}
        <section
          id="step-2"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-sky-500/10 text-sky-400 text-sm flex items-center justify-center font-bold border border-sky-500/20">
              2
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Configure VPS Firewall (UFW / Security Groups)
              </h2>
              <p className="text-xs text-muted-foreground">
                Allow incoming HTTP (port 80) and HTTPS (port 443) traffic.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Run these commands in your server terminal:
            </p>
            <div className="p-3.5 rounded-lg bg-black/40 border border-border font-mono text-xs text-foreground space-y-1.5">
              <div className="text-muted-foreground"># Open HTTP and HTTPS on Ubuntu/Debian</div>
              <div className="text-sky-300">sudo ufw allow 80/tcp</div>
              <div className="text-sky-300">sudo ufw allow 443/tcp</div>
              <div className="text-sky-300">sudo ufw reload</div>
            </div>
          </div>
        </section>

        {/* STEP 3 */}
        <section
          id="step-3"
          className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="size-7 rounded-xl bg-sky-500/10 text-sky-400 text-sm flex items-center justify-center font-bold border border-sky-500/20">
              3
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Setup Reverse Proxy (Nginx Configuration)
              </h2>
              <p className="text-xs text-muted-foreground">
                Create a virtual host configuration linking your subdomain to your application.
              </p>
            </div>
          </div>

          <ol className="text-xs sm:text-sm text-muted-foreground space-y-2.5 list-decimal list-inside ml-1 leading-relaxed">
            <li>
              Create a new Nginx site configuration:
              <div className="p-2.5 rounded bg-black/40 border border-border font-mono text-xs text-sky-300 mt-1">
                sudo nano /etc/nginx/sites-available/{domain}
              </div>
            </li>
            <li>
              Paste the generated Nginx configuration from the generator above.
            </li>
            <li>
              Enable the site and test configuration syntax:
              <div className="p-2.5 rounded bg-black/40 border border-border font-mono text-xs text-sky-300 mt-1 space-y-1">
                <div>sudo ln -s /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/</div>
                <div>sudo nginx -t</div>
                <div>sudo systemctl reload nginx</div>
              </div>
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
                <span>Free SSL Certificate via Certbot</span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  Automatic Renewal
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Install Let&apos;s Encrypt certificate with automatic 90-day auto-renewal.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Run Certbot to automatically configure HTTPS and redirect HTTP traffic:
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-border font-mono text-xs text-emerald-400">
              {certbotCommand}
            </div>
            <p>
              Follow the interactive prompts to choose redirect options. Certbot will update your Nginx configuration with valid SSL certificates automatically!
            </p>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="size-4.5 text-sky-400" />
            <span>Frequently Asked Questions & Troubleshooting</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Nginx 502 Bad Gateway error?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                This means Nginx is running but your application on port <code className="text-foreground font-mono">{appPort}</code> is stopped or crashed. Check your application logs (e.g. <code className="text-foreground font-mono">pm2 logs</code> or <code className="text-foreground font-mono">docker logs</code>).
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Certbot says &ldquo;Challenge failed for domain&rdquo;?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Make sure port 80 is open in your cloud provider&apos;s security group (AWS, Hetzner, DigitalOcean, Oracle) and that your A record has propagated before running Certbot.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Can I use Dokploy or Coolify?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Yes! When using self-hosted PaaS like Dokploy or Coolify on your VPS, point the A record to your server IP, and the PaaS Traefik proxy handles routing and SSL automatically without manual Nginx files.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Can I point multiple subdomains to one VPS?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Yes! You can point multiple ARC.BD subdomains to the same server IP with separate A records, and use virtual hosts (`server_name`) to route to different apps on different ports.
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
              href="/docs/github-pages"
              className="group p-4 rounded-xl border border-border/80 bg-card hover:border-violet-500/50 transition-all space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold group-hover:bg-violet-400 group-hover:text-black transition-colors">
                  <GitBranch className="size-4" />
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">CNAME</Badge>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-violet-400 transition-colors flex items-center justify-between">
                <span>GitHub Pages</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-muted-foreground">
                Host static documentation, portfolios, and repositories from GitHub.
              </p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to configure your VPS?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Manage A records with instant Cloudflare edge synchronization.</p>
            </div>
          </div>
          <Link
            href="/dashboard/domains"
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-semibold transition-colors shrink-0 shadow-sm"
          >
            Open Domain Manager &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
