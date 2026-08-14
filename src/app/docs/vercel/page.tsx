import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Triangle, CheckCircle2, Copy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Connect .arc.bd Domain to Vercel",
  description:
    "Step-by-step tutorial on connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records and automated SSL certificate verification.",
  alternates: {
    canonical: "/docs/vercel",
  },
  openGraph: {
    title: "Connect .arc.bd Domain to Vercel | ARC.BD Docs",
    description:
      "Step-by-step tutorial on connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records and automated SSL certificate verification.",
    url: "https://arc.bd/docs/vercel",
  },
};

export default function VercelDoc() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8 lg:pt-28">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium mb-6 group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Documentation</span>
        </Link>
        
        <div className="flex items-center gap-3.5 mb-8">
          <div className="size-11 rounded-xl bg-white text-black flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Triangle className="size-5.5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Connect to Vercel</h1>
              <Badge variant="secondary" className="font-mono text-[11px]">CNAME</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Host Next.js, React, or static web applications on Vercel with your .arc.bd subdomain.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Architecture Overview */}
          <div className="p-4 sm:p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <h2 className="text-sm sm:text-base font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="size-4.5 shrink-0" />
              Direct Edge DNS Resolution
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              When configured, traffic to your <code className="text-foreground font-mono">.arc.bd</code> subdomain routes directly to Vercel&apos;s global edge network with zero proxy delay, automated SSL provisioning, and full support for serverless functions.
            </p>
          </div>

          {/* Step 1 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Add Domain in Vercel Dashboard
            </h2>
            <ol className="text-xs sm:text-sm text-muted-foreground space-y-2 list-decimal list-inside ml-1 leading-relaxed">
              <li>Open your project in the <strong>Vercel Dashboard</strong>.</li>
              <li>Navigate to <strong>Settings</strong> &rarr; <strong>Domains</strong>.</li>
              <li>Enter your full subdomain (e.g. <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">my-app.arc.bd</code>) and click <strong>Add</strong>.</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Add CNAME Record in ARC.BD
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Open your subdomain in the <Link href="/dashboard/domains" className="text-primary hover:underline font-medium">ARC.BD Dashboard</Link>, click <strong>Quick Setup Preset &rarr; Vercel</strong> or manually create this record:
            </p>
            <div className="bg-muted/60 border border-border/70 rounded-lg p-3.5 font-mono text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><strong className="text-foreground">CNAME</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Host / Name:</span><strong className="text-foreground">@</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Target Hostname:</span><strong className="text-primary">cname.vercel-dns.com</strong></div>
            </div>
            <p className="text-xs text-muted-foreground">
              If Vercel prompts for ownership verification, also add the provided TXT record using host <code className="text-foreground font-mono">_vercel</code>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Automatic Verification &amp; SSL
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Vercel automatically detects the DNS configuration and provisions an SSL certificate. Once the status badge switches to <strong>Valid Configuration</strong>, your website is live worldwide.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
