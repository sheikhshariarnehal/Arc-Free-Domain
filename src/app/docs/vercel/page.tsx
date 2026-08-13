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
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Add Subdomain in Vercel
            </h2>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Open your Vercel Project Dashboard → <strong>Settings</strong> → <strong>Domains</strong>.</li>
              <li>Type your claimed ARC.BD domain (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">myproject.arc.bd</code>) and click <strong>Add</strong>.</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Configure DNS in ARC.BD Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              Go to your <Link href="/dashboard/domains" className="text-primary underline">ARC.BD Domain Dashboard</Link>, open your domain, and use the <strong>Vercel CNAME</strong> preset, or manually add:
            </p>
            <div className="bg-muted border border-border rounded-xl p-4 font-mono text-xs space-y-1">
              <div><strong className="text-primary">Type:</strong> CNAME</div>
              <div><strong className="text-primary">Name / Host:</strong> @</div>
              <div><strong className="text-primary">Target:</strong> cname.vercel-dns.com</div>
            </div>
          </div>

          {/* Vercel Ownership Claim / TXT Verification Section */}
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
              <AlertTriangle className="size-5 shrink-0 text-amber-400" />
              Vercel "Claim Domain Ownership" or TXT Record Verification
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              If Vercel asks you to verify DNS ownership with a TXT record:
            </p>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="border-l-2 border-amber-500/50 pl-4 py-1 space-y-1">
                <strong className="text-foreground block">Case A: Vercel asks for TXT record at <code className="text-amber-400 font-mono">_vercel.your-subdomain.arc.bd</code></strong>
                <p>In your ARC.BD Domain Dashboard, click <strong>Add Record</strong> and enter:</p>
                <div className="bg-background border border-border rounded-lg p-3 font-mono text-xs mt-2 space-y-1">
                  <div><strong>Type:</strong> TXT</div>
                  <div><strong>Name / Host:</strong> _vercel</div>
                  <div><strong>Value:</strong> vc-domain-verify=... (copied from Vercel)</div>
                </div>
              </div>

              <div className="border-l-2 border-amber-500/50 pl-4 py-1 space-y-1">
                <strong className="text-foreground block">Case B: Vercel asks for TXT record at <code className="text-amber-400 font-mono">_vercel.arc.bd</code> ("Claim Domain Ownership")</strong>
                <p className="leading-relaxed">
                  This happens because <code className="text-foreground font-mono">arc.bd</code> was previously added to another Vercel account.
                </p>
                <div className="bg-background border border-border rounded-lg p-3 text-xs space-y-2 mt-2">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    How to fix permanently (For Platform Admin / Vercel Domain Owner):
                  </div>
                  <p>
                    In the Vercel Account that owns the main <code className="text-foreground font-mono">arc.bd</code> domain, go to <strong>Vercel Team Settings → Domains → arc.bd</strong> and enable <strong>"Allow external Vercel accounts to use subdomains"</strong>.
                  </p>
                  <p>
                    Alternatively, the Admin can add the requested <code className="text-foreground font-mono">_vercel.arc.bd</code> TXT verification record in the <Link href="/admin/dns" className="text-primary underline">ARC.BD Root DNS Panel</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Verify &amp; Live
            </h2>
            <p className="text-sm text-muted-foreground">
              Once configured, click <strong>Verify</strong> in Vercel. SSL certificates are provisioned automatically by Vercel and Cloudflare, and your site will be live within seconds!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
