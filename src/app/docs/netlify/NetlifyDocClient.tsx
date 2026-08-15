"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
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
  GitBranch,
  Server,
  Info,
  Maximize2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScreenshotModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function ScreenshotModal({ src, alt, onClose }: ScreenshotModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-muted-foreground truncate max-w-md">
              {alt}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close image preview"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-2 sm:p-4 bg-black/40 flex items-center justify-center max-h-[80vh] overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

interface ImageFrameProps {
  src: string;
  alt: string;
  caption?: string;
  onEnlarge: (src: string, alt: string) => void;
}

function ImageFrame({ src, alt, caption, onEnlarge }: ImageFrameProps) {
  return (
    <figure className="group relative rounded-xl border border-border/70 bg-card overflow-hidden transition-all duration-200 hover:border-teal-500/40 hover:shadow-md">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/30 text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="ml-1 text-[11px] text-muted-foreground/80 truncate">
            {caption || alt}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onEnlarge(src, alt)}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 transition-opacity"
        >
          <Maximize2 className="size-3" />
          <span>Zoom</span>
        </button>
      </div>
      <div
        className="relative cursor-zoom-in bg-black/20"
        onClick={() => onEnlarge(src, alt)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </div>
      {caption && (
        <figcaption className="px-3.5 py-2 text-xs text-muted-foreground bg-muted/20 border-t border-border/40">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function NetlifyDocClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{ src: string; alt: string } | null>(null);
  const [customSlug, setCustomSlug] = useState("my-app");
  const [netlifyApp, setNetlifyApp] = useState("my-cool-site.netlify.app");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "generator", label: "DNS Helper" },
    { id: "step-1", label: "1. Deploy Repo" },
    { id: "step-2", label: "2. Domain Setup" },
    { id: "step-3", label: "3. TXT Verification" },
    { id: "step-4", label: "4. CNAME Routing" },
    { id: "step-5", label: "5. SSL Provisioning" },
    { id: "troubleshooting", label: "Troubleshooting" },
  ];

  return (
    <>
      {activeModal && (
        <ScreenshotModal
          src={activeModal.src}
          alt={activeModal.alt}
          onClose={() => setActiveModal(null)}
        />
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-28">
        {/* Breadcrumb & Navigation */}
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
        <header className="relative rounded-2xl border border-teal-500/20 bg-gradient-to-b from-teal-500/10 via-card to-card p-6 sm:p-8 mb-10 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="size-14 rounded-2xl bg-teal-400 text-teal-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-teal-500/20">
              <Zap className="size-7 fill-current" />
            </div>
            
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Connect .arc.bd Domain to Netlify
                </h1>
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] border-teal-500/30 text-teal-400 bg-teal-500/10"
                >
                  CNAME + TXT
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                >
                  Auto SSL
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Step-by-step guide to connect your free <code className="text-foreground font-mono font-medium">.arc.bd</code> subdomain to Netlify sites with DNS verification, high-performance edge routing, and automated Let&apos;s Encrypt TLS.
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

        {/* Content Container */}
        <div className="space-y-10">

          {/* Section: Overview at a Glance */}
          <section id="overview" className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-teal-400" />
              <span>At a Glance</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Verification Method
                </div>
                <div className="text-sm font-semibold text-foreground">
                  TXT Ownership Record
                </div>
                <p className="text-xs text-muted-foreground">
                  Required once to prove domain ownership.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Routing Record
                </div>
                <div className="text-sm font-semibold text-foreground">
                  CNAME Target
                </div>
                <p className="text-xs text-muted-foreground">
                  Points root hostname to Netlify site URL.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  SSL / HTTPS
                </div>
                <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Automatic Let&apos;s Encrypt
                </div>
                <p className="text-xs text-muted-foreground">
                  Provisions in 5-15 mins after DNS propagates.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Interactive DNS Generator */}
          <section
            id="generator"
            className="p-5 sm:p-6 rounded-2xl border border-teal-500/30 bg-teal-950/20 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Zap className="size-4 text-teal-400" />
                  Interactive DNS Record Helper
                </h2>
                <p className="text-xs text-muted-foreground">
                  Type your subdomain and Netlify app URL to generate your exact copy-paste ready records.
                </p>
              </div>
              <Badge variant="secondary" className="w-fit text-[10px] font-mono">
                Live Helper
              </Badge>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Your Netlify Site Domain
                </label>
                <div className="flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                  <input
                    type="text"
                    value={netlifyApp}
                    onChange={(e) => setNetlifyApp(e.target.value.toLowerCase().trim())}
                    placeholder="my-cool-site.netlify.app"
                    className="w-full bg-transparent focus:outline-none font-mono text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Generated DNS Records Display */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-foreground">
                Records to enter in your ARC.BD Subdomain Manager:
              </div>

              {/* Record 1: TXT Verification */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-card/80 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                      STEP 1 RECORD (TXT)
                    </span>
                    <span className="text-muted-foreground font-sans text-xs">
                      Subdomain Ownership Proof
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Type: TXT\nHost: subdomain-owner-verification\nValue: (Your Netlify verification token)`,
                        "txt-record"
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300"
                  >
                    {copiedKey === "txt-record" ? (
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
                    <strong className="text-foreground">TXT</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Host/Name: </span>
                    <strong className="text-foreground">subdomain-owner-verification</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Value: </span>
                    <strong className="text-amber-400">Your token from Netlify</strong>
                  </div>
                </div>
              </div>

              {/* Record 2: CNAME Routing */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-card/80 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-bold text-[10px]">
                      STEP 2 RECORD (CNAME)
                    </span>
                    <span className="text-muted-foreground font-sans text-xs">
                      Live Traffic Routing
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Type: CNAME\nHost: @\nTarget: ${netlifyApp || "your-site.netlify.app"}`,
                        "cname-record"
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300"
                  >
                    {copiedKey === "cname-record" ? (
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
                    <span className="text-muted-foreground">Host/Name: </span>
                    <strong className="text-foreground">@ (or leave empty)</strong>
                  </div>
                  <div className="truncate">
                    <span className="text-muted-foreground">Target: </span>
                    <strong className="text-teal-400">{netlifyApp || "your-site.netlify.app"}</strong>
                  </div>
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
              <span className="size-7 rounded-xl bg-teal-500/10 text-teal-400 text-sm flex items-center justify-center font-bold border border-teal-500/20">
                1
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  Deploy Your Repository to Netlify
                </h2>
                <p className="text-xs text-muted-foreground">
                  Create a new Netlify site connected to GitHub, GitLab, or Bitbucket.
                </p>
              </div>
            </div>

            <ol className="text-xs sm:text-sm text-muted-foreground space-y-2.5 list-decimal list-inside ml-1 leading-relaxed">
              <li>
                Log in to your <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline font-medium inline-flex items-center gap-0.5">Netlify Dashboard <ExternalLink className="size-3 inline" /></a>.
              </li>
              <li>
                Click <strong>Add new site</strong> &rarr; select <strong>Import an existing project</strong>.
              </li>
              <li>
                Authenticate with your Git provider and select your project repository.
              </li>
              <li>
                Configure your build command (e.g. <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">npm run build</code>) and publish directory.
              </li>
              <li>
                Click <strong>Deploy site</strong>. Netlify will provision an initial preview URL like <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">goplayapp.netlify.app</code>.
              </li>
            </ol>
          </section>

          {/* STEP 2 */}
          <section
            id="step-2"
            className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="size-7 rounded-xl bg-teal-500/10 text-teal-400 text-sm flex items-center justify-center font-bold border border-teal-500/20">
                2
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  Add Your Subdomain in Netlify Domain Management
                </h2>
                <p className="text-xs text-muted-foreground">
                  Add your claimed .arc.bd subdomain as a custom domain in Netlify.
                </p>
              </div>
            </div>

            <ol className="text-xs sm:text-sm text-muted-foreground space-y-2.5 list-decimal list-inside ml-1 leading-relaxed">
              <li>
                From your Netlify project dashboard, scroll to the <strong>Custom domain</strong> widget.
              </li>
              <li>
                Click <strong>Go to Domain management</strong>.
              </li>
              <li>
                Click the <strong>Add a domain</strong> button &rarr; choose <strong>Add a domain you already own</strong>.
              </li>
              <li>
                Enter your claimed ARC.BD domain (e.g. <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{customSlug}.arc.bd</code>) and click <strong>Verify</strong>.
              </li>
            </ol>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <ImageFrame
                src="/doc/netlify/screen1.png"
                alt="Netlify project dashboard showing Custom domain button"
                caption="1. Click 'Go to Domain management' from project overview"
                onEnlarge={(src, alt) => setActiveModal({ src, alt })}
              />
              <ImageFrame
                src="/doc/netlify/screen3.png"
                alt="Enter your ARC.BD subdomain in Netlify dialog"
                caption="2. Type your full .arc.bd subdomain and click Verify"
                onEnlarge={(src, alt) => setActiveModal({ src, alt })}
              />
            </div>
          </section>

          {/* STEP 3 */}
          <section
            id="step-3"
            className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-5 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="size-7 rounded-xl bg-amber-500/20 text-amber-400 text-sm flex items-center justify-center font-bold border border-amber-500/30">
                3
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                  <span>Verify Subdomain Ownership (TXT Record)</span>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                    Essential Step
                  </Badge>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Why this happens: Netlify verifies root domain delegation for security before routing traffic.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/80 text-xs sm:text-sm space-y-2.5 leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Info className="size-4 text-amber-400 shrink-0" />
                <span>Netlify will display a TXT record verification dialog:</span>
              </div>
              <p>
                Netlify requires proof of ownership to prevent domain hijacking. Copy the unique verification token shown in Netlify&apos;s dialog.
              </p>
            </div>

            <ImageFrame
              src="/doc/netlify/screen4.png"
              alt="Netlify TXT verification record details modal"
              caption="Netlify TXT record prompt with host 'subdomain-owner-verification' and unique token"
              onEnlarge={(src, alt) => setActiveModal({ src, alt })}
            />

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground">
                How to add the TXT record in ARC.BD:
              </h3>
              <ol className="text-xs sm:text-sm text-muted-foreground space-y-2 list-decimal list-inside ml-1 leading-relaxed">
                <li>
                  Open your <Link href="/dashboard/domains" className="text-teal-400 hover:underline font-medium">ARC.BD Subdomains Dashboard</Link>.
                </li>
                <li>
                  Click <strong>Manage</strong> on your domain.
                </li>
                <li>
                  Scroll to the <strong>DNS Records</strong> section and click <strong>Add Record</strong>.
                </li>
                <li>
                  Select <strong>TXT</strong> type, enter <code className="text-foreground bg-muted px-1 rounded font-mono">subdomain-owner-verification</code> as Host, and paste the code into Value.
                </li>
                <li>
                  Click <strong>Save Record</strong>.
                </li>
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <ImageFrame
                src="/doc/netlify/screen7.png"
                alt="ARC.BD My Subdomains page showing Manage button"
                caption="Click 'Manage' on your subdomain in ARC.BD"
                onEnlarge={(src, alt) => setActiveModal({ src, alt })}
              />
              <ImageFrame
                src="/doc/netlify/screen8.png"
                alt="ARC.BD DNS configuration Add Record interface"
                caption="Add TXT record in the DNS Records section"
                onEnlarge={(src, alt) => setActiveModal({ src, alt })}
              />
            </div>
          </section>

          {/* STEP 4 */}
          <section
            id="step-4"
            className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="size-7 rounded-xl bg-teal-500/10 text-teal-400 text-sm flex items-center justify-center font-bold border border-teal-500/20">
                4
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  Configure CNAME Routing Record in ARC.BD
                </h2>
                <p className="text-xs text-muted-foreground">
                  Once Netlify verifies the TXT record, point your traffic to Netlify&apos;s edge servers.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              In your ARC.BD Subdomain DNS Manager, add a <strong>CNAME</strong> record that directs visitors to your Netlify site URL:
            </p>

            <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-950/20 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-teal-500/20">
                <span className="text-teal-400 font-bold font-sans">CNAME Record Parameters</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `CNAME | @ | ${netlifyApp || "your-site.netlify.app"}`,
                      "cname-step"
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300"
                >
                  {copiedKey === "cname-step" ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="size-3" /> Copied</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="size-3" /> Copy</span>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div><span className="text-muted-foreground">Type:</span> <strong className="text-foreground">CNAME</strong></div>
                <div><span className="text-muted-foreground">Host / Name:</span> <strong className="text-foreground">@</strong></div>
                <div className="truncate"><span className="text-muted-foreground">Target:</span> <strong className="text-teal-400">{netlifyApp || "your-site.netlify.app"}</strong></div>
              </div>
            </div>

            <ImageFrame
              src="/doc/netlify/screen9.png"
              alt="Adding CNAME record in ARC.BD for Netlify"
              caption="Saving CNAME record pointing to your Netlify application domain"
              onEnlarge={(src, alt) => setActiveModal({ src, alt })}
            />
          </section>

          {/* STEP 5 */}
          <section
            id="step-5"
            className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-5 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="size-7 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center font-bold border border-emerald-500/30">
                5
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                  <span>Automatic TLS/SSL Certificate Provisioning</span>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                    Automatic
                  </Badge>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Netlify automatically requests and installs a free Let&apos;s Encrypt certificate.
                </p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground space-y-2.5 leading-relaxed">
              <p>
                After your CNAME record propagates (usually 2–10 minutes):
              </p>
              <ul className="space-y-1.5 list-disc list-inside ml-1">
                <li>Netlify detects active DNS routing to its servers.</li>
                <li>A Let&apos;s Encrypt SSL/TLS certificate is automatically provisioned.</li>
                <li>Your site becomes securely accessible over <strong>https://{customSlug}.arc.bd</strong>.</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <ImageFrame
                src="/doc/netlify/screen5.png"
                alt="Netlify production domains pending verification status"
                caption="Netlify DNS status updating to verified"
                onEnlarge={(src, alt) => setActiveModal({ src, alt })}
              />
              <ImageFrame
                src="/doc/netlify/screen10.png"
                alt="Netlify domain successfully configured and live with SSL"
                caption="Domain successfully live with active SSL certificate"
                onEnlarge={(src, alt) => setActiveModal({ src, alt })}
              />
            </div>
          </section>

          {/* Timeline Summary */}
          <section className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs">
            <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-teal-400" />
              <span>Deployment Timeline</span>
            </h2>

            <div className="relative pl-6 space-y-4 border-l border-border/70 ml-2 text-xs sm:text-sm">
              <div className="relative">
                <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-teal-400 ring-4 ring-card" />
                <div className="font-semibold text-foreground">0 min: Add TXT Verification Record</div>
                <p className="text-xs text-muted-foreground">Add the Netlify ownership token in your ARC.BD dashboard.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-teal-400 ring-4 ring-card" />
                <div className="font-semibold text-foreground">2–5 min: Netlify Detects TXT Record</div>
                <p className="text-xs text-muted-foreground">Domain ownership is verified on Netlify.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-teal-400 ring-4 ring-card" />
                <div className="font-semibold text-foreground">Immediately: Add CNAME Routing Record</div>
                <p className="text-xs text-muted-foreground">Point your subdomain to your Netlify site URL in ARC.BD.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-400 ring-4 ring-card" />
                <div className="font-semibold text-emerald-400">5–15 min: SSL Certificate Live</div>
                <p className="text-xs text-muted-foreground">Netlify provisions Let&apos;s Encrypt certificate and your site goes live worldwide.</p>
              </div>
            </div>
          </section>

          {/* Troubleshooting Accordion */}
          <section id="troubleshooting" className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="size-4.5 text-teal-400" />
              <span>Frequently Asked Questions & Troubleshooting</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Why does Netlify require TXT verification?
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Because <code className="text-foreground font-mono">arc.bd</code> is a shared platform root domain, Netlify checks that the person configuring <code className="text-foreground font-mono">my-app.arc.bd</code> legitimately controls the subdomain before binding it to an account.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  How long does DNS propagation take?
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  ARC.BD uses Cloudflare edge DNS with rapid TTL updates. Most changes take effect within 1 to 5 minutes worldwide, though some local ISP caches may take up to 15 minutes.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Netlify says &ldquo;Waiting on DNS propagation&rdquo; for SSL?
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  This is completely normal. Netlify tests your CNAME record from multiple worldwide checkpoints before requesting the Let&apos;s Encrypt certificate. Click <strong>Verify DNS configuration</strong> in Netlify after 5 minutes.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Can I use Netlify Forms &amp; Serverless Functions?
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Yes! CNAME routing passes all HTTP headers, POST bodies, and cookies directly to Netlify without any interference or limitations.
                </p>
              </div>
            </div>
          </section>

          {/* Related Guides Navigation */}
          <section className="pt-6 border-t border-border/60 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Explore Other Hosting Guides</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Link
                href="/docs/vercel"
                className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Triangle className="size-4 fill-current" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px]">CNAME</Badge>
                </div>
                <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Vercel</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Deploy Next.js and React apps on Vercel with zero-delay edge routing.
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
                  Host static documentation, portfolios, and repositories directly from GitHub.
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

          {/* Manage Subdomains Banner */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Ready to connect your subdomain?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Manage DNS records with instant Cloudflare edge synchronization.</p>
              </div>
            </div>
            <Link
              href="/dashboard/domains"
              className="px-4 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-teal-950 text-xs font-semibold transition-colors shrink-0 shadow-sm"
            >
              Open Domain Manager &rarr;
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
