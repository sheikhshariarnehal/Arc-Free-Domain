import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Triangle, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Connect .arc.bd Domain to Vercel",
  description:
    "Step-by-step tutorial on connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records and automated SSL certificate verification.",
  alternates: {
    canonical: "/docs/vercel",
  },
  openGraph: {
    title: "How to Connect .arc.bd Domain to Vercel | ARC.BD Docs",
    description:
      "Step-by-step tutorial on connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records and automated SSL certificate verification.",
    url: "https://arc.bd/docs/vercel",
  },
};

export default function VercelDoc() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <Link href="/docs" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-8 w-fit transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
            <Triangle className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Connect to Vercel</h1>
            <p className="text-sm text-muted-foreground">Step-by-step guide to hosting your website on Vercel with your .arc.bd subdomain.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* How It Works Alert */}
          <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="size-5 shrink-0" />
              Direct Authoritative DNS Resolution
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ARC.BD runs a dedicated, high-speed Authoritative DNS network. When you connect your <code className="text-foreground font-mono">.arc.bd</code> subdomain to Vercel, visitors connect <strong>directly to Vercel&apos;s global edge network</strong> with zero proxy delay, automatic SSL, and full support for WebSockets and serverless functions.
            </p>
          </div>

          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Add Domain to Vercel Project
            </h2>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Open your project on the <strong>Vercel Dashboard</strong>.</li>
              <li>Go to <strong>Settings</strong> &rarr; <strong>Domains</strong>.</li>
              <li>Enter your full subdomain (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">yourname.arc.bd</code>) and click <strong>Add</strong>.</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Configure DNS in ARC.BD Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              Go to your <Link href="/dashboard/domains" className="text-primary underline">ARC.BD Domain Dashboard</Link>, open your subdomain, and add the CNAME record:
            </p>
            <div className="bg-muted border border-border rounded-xl p-4 font-mono text-xs space-y-1">
              <div><strong className="text-primary">Type:</strong> CNAME</div>
              <div><strong className="text-primary">Name / Host:</strong> @</div>
              <div><strong className="text-primary">Target Hostname:</strong> cname.vercel-dns.com</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tip: If Vercel requires ownership verification, also add the TXT verification record with name <code className="text-foreground font-mono">_vercel</code>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Verify &amp; Go Live!
            </h2>
            <p className="text-sm text-muted-foreground">
              Vercel will automatically detect the DNS record and issue an SSL certificate within seconds. Your domain status on Vercel will turn <strong>Valid Configuration</strong> and your site will be live globally!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
