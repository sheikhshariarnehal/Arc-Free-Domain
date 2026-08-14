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
              Instant Reverse-Proxy Deployment (Recommended)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Because ARC.BD uses an advanced wildcard gateway, you <strong>do not need</strong> to register or verify your custom domain in Vercel settings! 
              You can simply map your subdomain to your raw Vercel deployment URL (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">yourproject.vercel.app</code>) and we will instantly reverse-proxy all traffic, keeping your clean <code className="text-foreground font-mono">.arc.bd</code> URL in the address bar.
            </p>
          </div>

          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Get your Vercel URL
            </h2>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Open your Vercel Dashboard and go to your project.</li>
              <li>Under the <strong>Deployment</strong> section, copy your raw <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">.vercel.app</code> production URL.</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Configure Target in ARC.BD Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              Go to your <Link href="/dashboard/domains" className="text-primary underline">ARC.BD Domain Dashboard</Link>, open your subdomain, and add a CNAME record:
            </p>
            <div className="bg-muted border border-border rounded-xl p-4 font-mono text-xs space-y-1">
              <div><strong className="text-primary">Type:</strong> CNAME</div>
              <div><strong className="text-primary">Name / Host:</strong> @</div>
              <div><strong className="text-primary">Target Hostname:</strong> yourproject.vercel.app</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Do not enter <code className="text-foreground font-mono">cname.vercel-dns.com</code> as target; instead enter your specific <code className="text-foreground font-mono">yourproject.vercel.app</code> URL so we can reverse-proxy directly to your app.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Go Live!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your site is immediately active. Visiting your <code className="text-foreground font-mono">yourname.arc.bd</code> subdomain will instantly display your Vercel project with automatic SSL and zero configuration on Vercel's side.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
