"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Terminal, 
  Layers, 
  Activity, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Server,
  Cloud,
  RotateCcw
} from "lucide-react";
import { 
  VercelIcon, 
  GitHubIcon, 
  RailwayIcon, 
  CloudflareIcon 
} from "@/components/TechIcons";
import { Button } from "@/components/ui/button";

export interface DevWorkbenchProps {
  subdomain: string;
  isAvailable: boolean;
  onClaim?: (providerPreset?: string) => void;
}

type ProviderKey = "vercel" | "github" | "vps" | "railway" | "tunnel";
type ModeKey = "cli" | "record" | "latency";

interface ProviderConfig {
  name: string;
  badge: string;
  icon: React.ComponentType<{ size?: number | string; className?: string; strokeWidth?: number }>;
  recordType: "CNAME" | "A";
  target: (sub: string) => string;
  proxied: boolean;
  docUrl: string;
  guide: string;
  digResponse: (sub: string) => string;
  curlHeaders: (sub: string) => string;
  pingOutput: (sub: string) => string;
}

const PROVIDERS: Record<ProviderKey, ProviderConfig> = {
  vercel: {
    name: "Vercel",
    badge: "Next.js & Frontend",
    icon: VercelIcon,
    recordType: "CNAME",
    target: () => "cname.vercel-dns.com",
    proxied: false,
    docUrl: "/docs#vercel",
    guide: "Add your domain in Vercel Project > Settings > Domains. Zero configuration needed.",
    digResponse: (sub) => `; <<>> DiG 9.10.6 <<>> ${sub}.arc.bd +short\n;; ANSWER SECTION:\n${sub}.arc.bd.    300  IN  CNAME  cname.vercel-dns.com.\n76.76.21.21`,
    curlHeaders: (sub) => `HTTP/2 200 OK\nserver: Vercel\nx-vercel-id: dac1::iad1::4892k-189\nx-matched-path: /\nx-arc-domain: ${sub}.arc.bd\nstrict-transport-security: max-age=63072000; includeSubDomains; preload\ncontent-type: text/html; charset=utf-8`,
    pingOutput: (sub) => `PING ${sub}.arc.bd (76.76.21.21): 56 data bytes\n64 bytes from 76.76.21.21: icmp_seq=0 ttl=58 time=12.4 ms\n64 bytes from 76.76.21.21: icmp_seq=1 ttl=58 time=11.9 ms\n64 bytes from 76.76.21.21: icmp_seq=2 ttl=58 time=12.1 ms\n--- ${sub}.arc.bd ping statistics ---\n3 packets transmitted, 3 packets received, 0.0% packet loss\nround-trip min/avg/max/stddev = 11.9/12.1/12.4/0.2 ms`
  },
  github: {
    name: "GitHub Pages",
    badge: "Static Sites & Docs",
    icon: GitHubIcon,
    recordType: "CNAME",
    target: (sub) => `${sub}.github.io`,
    proxied: false,
    docUrl: "/docs#github-pages",
    guide: "Add a CNAME file with your .arc.bd address in your repository root.",
    digResponse: (sub) => `; <<>> DiG 9.10.6 <<>> ${sub}.arc.bd +short\n;; ANSWER SECTION:\n${sub}.arc.bd.    300  IN  CNAME  ${sub}.github.io.\n185.199.108.153\n185.199.109.153\n185.199.110.153\n185.199.111.153`,
    curlHeaders: (sub) => `HTTP/2 200 OK\nserver: GitHub.com\nx-github-request-id: E198:3A41:409FE:8C20A\nx-arc-edge: active\ncontent-type: text/html; charset=utf-8\nstrict-transport-security: max-age=31536000`,
    pingOutput: (sub) => `PING ${sub}.arc.bd (185.199.108.153): 56 data bytes\n64 bytes from 185.199.108.153: icmp_seq=0 ttl=57 time=24.1 ms\n64 bytes from 185.199.108.153: icmp_seq=1 ttl=57 time=23.8 ms\n--- ${sub}.arc.bd ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss`
  },
  vps: {
    name: "Custom VPS",
    badge: "Dedicated Server",
    icon: Server,
    recordType: "A",
    target: () => "157.245.89.21",
    proxied: true,
    docUrl: "/docs#vps",
    guide: "Point an A record to your server IP. Works seamlessly with Nginx, Caddy, or Traefik.",
    digResponse: (sub) => `; <<>> DiG 9.10.6 <<>> ${sub}.arc.bd +short\n;; ANSWER SECTION:\n${sub}.arc.bd.    300  IN  A  157.245.89.21\n;; SERVER: 1.1.1.1#53(1.1.1.1) (Cloudflare Edge Anycast)`,
    curlHeaders: (sub) => `HTTP/2 200 OK\nserver: nginx/1.24.0\ncf-ray: 8ef1092789ba-DAC\ncf-cache-status: DYNAMIC\nx-arc-domain: ${sub}.arc.bd\ncontent-type: text/html`,
    pingOutput: (sub) => `PING ${sub}.arc.bd (157.245.89.21): 56 data bytes\n64 bytes from 157.245.89.21: icmp_seq=0 ttl=61 time=9.8 ms\n64 bytes from 157.245.89.21: icmp_seq=1 ttl=61 time=10.2 ms\n--- ${sub}.arc.bd ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss`
  },
  railway: {
    name: "Railway / Render",
    badge: "Container Apps",
    icon: RailwayIcon,
    recordType: "CNAME",
    target: () => "app.up.railway.app",
    proxied: false,
    docUrl: "/docs",
    guide: "Paste your Railway or Render custom domain target for auto SSL renewal.",
    digResponse: (sub) => `; <<>> DiG 9.10.6 <<>> ${sub}.arc.bd +short\n;; ANSWER SECTION:\n${sub}.arc.bd.    300  IN  CNAME  app.up.railway.app.\n104.18.28.120`,
    curlHeaders: (sub) => `HTTP/2 200 OK\nserver: railway-edge\nx-railway-request-id: r-9482910\nx-arc-routing: anycast-edge\ncontent-type: application/json`,
    pingOutput: (sub) => `PING ${sub}.arc.bd (104.18.28.120): 56 data bytes\n64 bytes from 104.18.28.120: icmp_seq=0 ttl=59 time=18.6 ms\n64 bytes from 104.18.28.120: icmp_seq=1 ttl=59 time=18.4 ms\n--- ${sub}.arc.bd ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss`
  },
  tunnel: {
    name: "Cloudflare Tunnel",
    badge: "Secure Localhost",
    icon: CloudflareIcon,
    recordType: "CNAME",
    target: () => "9f8e4b21-4190.cfargotunnel.com",
    proxied: true,
    docUrl: "/docs",
    guide: "Route directly to your local dev machine or homelab without opening firewall ports.",
    digResponse: (sub) => `; <<>> DiG 9.10.6 <<>> ${sub}.arc.bd +short\n;; ANSWER SECTION:\n${sub}.arc.bd.    300  IN  CNAME  9f8e4b21-4190.cfargotunnel.com.\n198.41.200.24`,
    curlHeaders: (sub) => `HTTP/2 200 OK\nserver: cloudflare\ncf-ray: 901f48b12-DAC\nx-tunnel-type: cloudflared\ncontent-type: text/html`,
    pingOutput: (sub) => `PING ${sub}.arc.bd (198.41.200.24): 56 data bytes\n64 bytes from 198.41.200.24: icmp_seq=0 ttl=60 time=11.2 ms\n--- ${sub}.arc.bd ping statistics ---\n1 packets transmitted, 1 packets received, 0.0% packet loss`
  }
};

const LATENCY_POPS = [
  { city: "Dhaka, Bangladesh", code: "DAC", ping: "11.4 ms", status: "Optimal", bar: "w-[92%]" },
  { city: "Singapore", code: "SIN", ping: "32.8 ms", status: "Fast", bar: "w-[78%]" },
  { city: "Frankfurt, Germany", code: "FRA", ping: "108.2 ms", status: "Normal", bar: "w-[45%]" },
  { city: "San Jose, CA (USA)", code: "SJC", ping: "139.5 ms", status: "Normal", bar: "w-[38%]" }
];

export default function DevWorkbench({ subdomain, isAvailable, onClaim }: DevWorkbenchProps) {
  const activeSub = subdomain.trim() ? subdomain.trim().toLowerCase() : "your-project";
  const [provider, setProvider] = useState<ProviderKey>("vercel");
  const [mode, setMode] = useState<ModeKey>("cli");
  const [cliCommand, setCliCommand] = useState<"dig" | "curl" | "ping">("dig");
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const currentProvider = PROVIDERS[provider];
  const fullDomain = `${activeSub}.arc.bd`;

  // Trigger brief simulation execution when changing tab or command
  useEffect(() => {
    setIsExecuting(true);
    const timer = setTimeout(() => {
      setIsExecuting(false);
    }, 140);
    return () => clearTimeout(timer);
  }, [provider, cliCommand, activeSub]);

  const terminalOutput = useMemo(() => {
    if (cliCommand === "dig") return currentProvider.digResponse(activeSub);
    if (cliCommand === "curl") return currentProvider.curlHeaders(activeSub);
    return currentProvider.pingOutput(activeSub);
  }, [cliCommand, currentProvider, activeSub]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 text-left animate-spring-up">
      {/* Workbench Card Shell — Sleek Monochrome Dark Aesthetic */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/90 shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300">
        
        {/* Top Header Bar with Provider Tabs & Mode Switcher */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-3 sm:px-4 py-2.5 gap-2">
          
          {/* Left: Window Dots & Provider Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="hidden sm:flex items-center gap-1.5 mr-1 shrink-0 select-none">
              <span className="size-2 rounded-full bg-zinc-700 inline-block" />
              <span className="size-2 rounded-full bg-zinc-700 inline-block" />
              <span className="size-2 rounded-full bg-zinc-700 inline-block" />
            </div>

            <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/[0.06] shrink-0">
              {(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => {
                const p = PROVIDERS[key];
                const ProviderIcon = p.icon;
                const active = provider === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProvider(key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 ${
                      active
                        ? "bg-white/10 text-white shadow-xs border border-white/10"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <ProviderIcon size={12} className="shrink-0 text-zinc-300" strokeWidth={1.5} />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: View Mode Toggle */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 md:pb-0 shrink-0">
            <div className="flex items-center w-full md:w-auto justify-between bg-black/50 p-0.5 rounded-lg border border-white/[0.06] text-xs">
              <button
                type="button"
                onClick={() => setMode("cli")}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer flex-1 md:flex-initial ${
                  mode === "cli"
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Terminal className="size-3.5 shrink-0 text-zinc-300" strokeWidth={1.5} />
                <span>CLI</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("record")}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer flex-1 md:flex-initial ${
                  mode === "record"
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="size-3.5 shrink-0 text-zinc-300" strokeWidth={1.5} />
                <span>DNS Record</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("latency")}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer flex-1 md:flex-initial ${
                  mode === "latency"
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Activity className="size-3.5 shrink-0 text-zinc-300" strokeWidth={1.5} />
                <span>Edge Latency</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="p-4 sm:p-5">

          {/* MODE 1: Interactive Live Terminal (CLI) */}
          {mode === "cli" && (
            <div className="flex flex-col gap-3 font-mono">
              {/* Command Sub-Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-white/[0.06] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 font-sans text-[11px] font-medium mr-1">Command:</span>
                  {(["dig", "curl", "ping"] as const).map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => setCliCommand(cmd)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                        cliCommand === cmd
                          ? "bg-white/10 text-white border border-white/15"
                          : "text-zinc-400 hover:text-zinc-200 bg-white/[0.04]"
                      }`}
                    >
                      {cmd}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExecuting(true);
                      setTimeout(() => setIsExecuting(false), 200);
                    }}
                    title="Simulate re-running query"
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-[11px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className={`size-3 ${isExecuting ? "animate-spin text-white" : ""}`} strokeWidth={1.5} />
                    <span className="hidden sm:inline">Query</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(terminalOutput)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-[11px] transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="size-3 text-white" strokeWidth={2} /> : <Copy className="size-3" strokeWidth={1.5} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Terminal Screen Container */}
              <div className="relative rounded-xl bg-[#09090b] border border-white/[0.07] p-3.5 sm:p-4 text-xs overflow-x-auto min-h-[140px] shadow-inner font-mono">
                {/* Active prompt line */}
                <div className="flex items-center gap-2 text-zinc-400 pb-2 mb-2 border-b border-white/[0.05] select-none">
                  <span className="text-zinc-300">arc.bd-edge@dac1</span>
                  <span className="text-zinc-500">:</span>
                  <span className="text-zinc-400">~</span>
                  <span className="text-zinc-500">$</span>
                  <span className="text-white font-medium">
                    {cliCommand === "dig" && `dig +short ${fullDomain}`}
                    {cliCommand === "curl" && `curl -I https://${fullDomain}`}
                    {cliCommand === "ping" && `ping -c 3 ${fullDomain}`}
                  </span>
                  <span className="size-1.5 bg-zinc-400 animate-pulse rounded-full inline-block ml-1" />
                </div>

                {/* Output Stream */}
                {isExecuting ? (
                  <div className="flex items-center gap-2 text-zinc-400 py-4 italic text-xs">
                    <span className="size-1.5 rounded-full bg-zinc-400 animate-ping" />
                    <span>Resolving DNS from Dhaka Anycast node...</span>
                  </div>
                ) : (
                  <pre className="text-zinc-300 leading-relaxed whitespace-pre font-mono text-[11.5px] sm:text-xs selection:bg-white/15">
                    {terminalOutput}
                  </pre>
                )}
              </div>

              {/* Provider Guide Hint */}
              <div className="flex items-center justify-between text-xs text-zinc-400 font-sans pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-200 font-medium">{currentProvider.name}:</span>
                  <span>{currentProvider.guide}</span>
                </span>
                <a
                  href={currentProvider.docUrl}
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors shrink-0 ml-2 font-medium"
                >
                  <span>Setup Docs</span>
                  <ExternalLink className="size-3" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          )}

          {/* MODE 2: Visual DNS Record Inspector */}
          {mode === "record" && (
            <div className="flex flex-col gap-4 font-sans text-xs">
              {/* Record Row Card */}
              <div className="rounded-xl border border-white/[0.08] bg-[#09090b] p-3.5 sm:p-4">
                <div className="text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-3">
                  Configured Cloudflare Edge Record
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center font-mono">
                  <div>
                    <span className="block text-[10px] text-zinc-400 font-sans mb-1">TYPE</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white border border-white/15">
                      {currentProvider.recordType}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-zinc-400 font-sans mb-1">NAME / HOST</span>
                    <span className="text-white font-medium">{activeSub}</span>
                  </div>

                  <div className="col-span-2 sm:col-span-2">
                    <span className="block text-[10px] text-zinc-400 font-sans mb-1">TARGET VALUE</span>
                    <span className="text-zinc-300 truncate block bg-white/[0.04] px-2 py-1 rounded border border-white/[0.06]">
                      {currentProvider.target(activeSub)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-zinc-400 font-sans mb-1">TTL / PROXY</span>
                    <span className="inline-flex items-center gap-1 text-zinc-300">
                      <Cloud className="size-3.5 text-zinc-400" strokeWidth={1.5} />
                      <span>{currentProvider.proxied ? "Proxied" : "DNS Only"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Edge Guarantee Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300">
                  <Zap className="size-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
                  <div>
                    <div className="font-medium text-white text-[11px]">Instant Propagation</div>
                    <div className="text-[10px] text-zinc-400">Syncs to 300+ global edge locations</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300">
                  <ShieldCheck className="size-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
                  <div>
                    <div className="font-medium text-white text-[11px]">Automatic SSL / TLS</div>
                    <div className="text-[10px] text-zinc-400">Free edge certificates with renewal</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300">
                  <Globe className="size-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
                  <div>
                    <div className="font-medium text-white text-[11px]">Zero Fees Forever</div>
                    <div className="text-[10px] text-zinc-400">Free custom subdomain for developers</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: Global Anycast Latency Matrix */}
          {mode === "latency" && (
            <div className="flex flex-col gap-3 font-sans text-xs">
              <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-white/[0.06]">
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider">Anycast Edge Points of Presence</span>
                <span className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                  <span className="size-1.5 rounded-full bg-zinc-300 inline-block" />
                  <span>Global Uptime 100%</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LATENCY_POPS.map((pop) => (
                  <div
                    key={pop.code}
                    className="p-3 rounded-xl bg-[#09090b] border border-white/[0.06] flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-white bg-white/10 px-1.5 py-0.5 rounded border border-white/[0.08]">
                          {pop.code}
                        </span>
                        <span className="text-zinc-300 font-medium">{pop.city}</span>
                      </div>
                      <span className="font-mono text-xs font-medium text-zinc-200">
                        {pop.ping}
                      </span>
                    </div>

                    <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
                      <div className={`h-full bg-zinc-400 rounded-full ${pop.bar}`} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-zinc-400 mt-1">
                Requests to <strong className="text-zinc-200 font-mono font-normal">{fullDomain}</strong> automatically resolve through the nearest Anycast PoP with direct BDIX routing in Bangladesh.
              </p>
            </div>
          )}
        </div>

        {/* Bottom CTA Strip */}
        <div className="border-t border-white/[0.08] bg-white/[0.02] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300 font-mono text-center sm:text-left">
            <span className="size-1.5 rounded-full bg-zinc-400 inline-block shrink-0" />
            <span>Ready to route <strong className="text-white font-medium">{fullDomain}</strong> to {currentProvider.name}</span>
          </div>

          <Button
            onClick={() => onClaim && onClaim(provider)}
            className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-sm shadow-blue-600/20 shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>Claim & Configure for {currentProvider.name}</span>
            <ArrowRight className="size-3.5 shrink-0" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
