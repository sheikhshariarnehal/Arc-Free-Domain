"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, Zap, CheckCircle2, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function NetlifyDoc() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <Link href="/docs" className="text-sm text-primary hover:underline flex items-center gap-1 mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Documentation
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-emerald-400 text-black flex items-center justify-center font-bold">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Connect to Netlify</h1>
            <p className="text-sm text-muted-foreground">Step-by-step guide to hosting your website on Netlify with your .arc.bd subdomain.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Connect Your Repository
            </h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Log into <strong>Netlify.com</strong> and click <strong>Add new site</strong> → <strong>Import an existing project</strong>.</li>
              <li>Select your Git provider (GitHub, GitLab, Bitbucket) and authorize Netlify.</li>
              <li>Choose your repository and configure build settings. Click <strong>Deploy site</strong>.</li>
              <li>Netlify will generate a temporary subdomain (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">random-name.netlify.app</code>).</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Add Custom Domain in Netlify
            </h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>In your Netlify site dashboard, go to <strong>Site settings</strong> → <strong>Domain management</strong>.</li>
              <li>Click <strong>Add a custom domain</strong> and enter your ARC.BD subdomain (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">myproject.arc.bd</code>).</li>
              <li>Netlify will prompt you to configure DNS. Keep this page open - you will need the DNS details next.</li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Configure DNS in ARC.BD Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Go to your <Link href="/dashboard/domains" className="text-primary underline">ARC.BD Domain Dashboard</Link>, open your domain, and add the DNS records from Netlify:
            </p>
            
            <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
              <div className="font-mono text-xs space-y-1">
                <div><strong className="text-primary">Option A: Using CNAME (Recommended)</strong></div>
                <div><strong className="text-primary">Type:</strong> CNAME</div>
                <div><strong className="text-primary">Name / Host:</strong> @</div>
                <div><strong className="text-primary">Target:</strong> &lt;your-site&gt;.netlify.app (from Netlify dashboard)</div>
              </div>
              
              <div className="border-t border-border my-2" />
              
              <div className="font-mono text-xs space-y-1">
                <div><strong className="text-primary">Option B: Using A Record (if CNAME unavailable)</strong></div>
                <div><strong className="text-primary">Type:</strong> A</div>
                <div><strong className="text-primary">Name / Host:</strong> @</div>
                <div><strong className="text-primary">IP Address:</strong> (Netlify provides this in domain settings)</div>
              </div>
            </div>
          </div>

          {/* DNS Propagation Section */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <CheckCircle2 className="size-5 shrink-0" />
              Waiting for DNS Propagation
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              After adding DNS records in ARC.BD:
            </p>

            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li><strong>DNS propagation typically takes 5–30 minutes</strong> globally (cached by ISPs).</li>
              <li>Netlify will check for DNS changes and confirm when detected (usually within 10 minutes).</li>
              <li>Check the <strong>Domain management</strong> page in Netlify for a green checkmark indicating DNS is configured.</li>
              <li>Once confirmed, Netlify automatically provisions an SSL/TLS certificate via Let&apos;s Encrypt - no extra action needed.</li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">4</span>
              Verify &amp; Live
            </h3>
            <p className="text-sm text-muted-foreground">
              Once Netlify confirms DNS and provisions the SSL certificate, your site will be live on your ARC.BD subdomain! You can now visit <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">myproject.arc.bd</code> in your browser.
            </p>
          </div>

          {/* Troubleshooting Section */}
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
              <HelpCircle className="size-5 shrink-0 text-amber-400" />
              Troubleshooting
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="border-l-2 border-amber-500/50 pl-4 py-1 space-y-1">
                <strong className="text-foreground block">DNS Not Resolving?</strong>
                <p>
                  Use <code className="text-amber-400 font-mono">nslookup myproject.arc.bd</code> or <code className="text-amber-400 font-mono">dig myproject.arc.bd</code> to check if your DNS records are live. Allow up to 48 hours for global propagation (though usually faster).
                </p>
              </div>

              <div className="border-l-2 border-amber-500/50 pl-4 py-1 space-y-1">
                <strong className="text-foreground block">SSL Certificate Not Provisioning?</strong>
                <p>
                  Ensure DNS is fully propagated and Netlify shows a green checkmark in <strong>Domain management</strong>. Once DNS is live, Netlify automatically provisions the cert within 5–10 minutes. Check <strong>SSL/TLS certificate</strong> status in site settings.
                </p>
              </div>

              <div className="border-l-2 border-amber-500/50 pl-4 py-1 space-y-1">
                <strong className="text-foreground block">Need Help?</strong>
                <p>
                  Refer to <a href="https://docs.netlify.com/domains-dns/custom-domains/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Netlify&apos;s Custom Domains Documentation</a> or contact <Link href="/report" className="text-primary underline">ARC.BD Support</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
