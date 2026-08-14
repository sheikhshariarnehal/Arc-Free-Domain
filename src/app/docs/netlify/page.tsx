import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Zap, CheckCircle2, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Connect .arc.bd Domain to Netlify",
  description:
    "Comprehensive guide to connecting your free .arc.bd subdomain to Netlify sites with TXT verification, CNAME DNS records, and Let's Encrypt SSL.",
  alternates: {
    canonical: "/docs/netlify",
  },
  openGraph: {
    title: "How to Connect .arc.bd Domain to Netlify | ARC.BD Docs",
    description:
      "Comprehensive guide to connecting your free .arc.bd subdomain to Netlify sites with TXT verification, CNAME DNS records, and Let's Encrypt SSL.",
    url: "https://arc.bd/docs/netlify",
  },
};

export default function NetlifyDoc() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8 lg:pt-28">
        <Link href="/docs" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-8 w-fit transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-emerald-400 text-black flex items-center justify-center font-bold">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Connect to Netlify</h1>
            <p className="text-sm text-muted-foreground">Complete guide: Deploy your site and connect your .arc.bd subdomain with automatic SSL</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* STEP 1: Connect Git Repo */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Connect Your Repository to Netlify
            </h2>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Go to <strong>netlify.com</strong> and sign in to your account.</li>
              <li>Click <strong>Add new site</strong> → <strong>Import an existing project</strong>.</li>
              <li>Select your Git provider (GitHub, GitLab, Bitbucket) and authorize Netlify.</li>
              <li>Choose your repository, configure build settings, and click <strong>Deploy site</strong>.</li>
              <li>Netlify will generate a temporary subdomain like <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">goplayapp.netlify.app</code>.</li>
            </ol>
          </div>

          {/* STEP 2: Go to Domain Management */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Access Domain Management in Netlify
            </h2>
            
            <p className="text-sm text-muted-foreground">From your project dashboard:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Scroll down to the <strong>Custom domain</strong> section (top right of dashboard).</li>
              <li>Click the blue button <strong>Go to Domain management</strong>.</li>
            </ol>

            <div className="bg-muted border border-border rounded-lg overflow-hidden">
              <img 
                src="/doc/netlify/screen1.png" 
                alt="Netlify project dashboard showing Custom domain button"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>

          {/* STEP 3: Add Custom Domain */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Add Your ARC.BD Subdomain
            </h2>
            
            <p className="text-sm text-muted-foreground">In the Domain management section:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Click <strong>Add a domain</strong> dropdown and select <strong>Add a domain you already own</strong>.</li>
              <li>Enter your claimed ARC.BD subdomain (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">namecheak.arc.bd</code>).</li>
              <li>Click <strong>Verify</strong>.</li>
            </ol>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted border border-border rounded-lg overflow-hidden">
                <img 
                  src="/doc/netlify/screen2.png" 
                  alt="Domain management page with Add a domain options"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="bg-muted border border-border rounded-lg overflow-hidden">
                <img 
                  src="/doc/netlify/screen3.png" 
                  alt="Enter your ARC.BD subdomain dialog"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Handle TXT Verification (if needed) */}
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
              <HelpCircle className="size-5 shrink-0 text-amber-400" />
              Subdomain Ownership Verification (Important Step)
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you enter your ARC.BD subdomain, Netlify checks if it is already registered. Since <strong>arc.bd</strong> is registered to the ARC.BD platform, Netlify will ask you to verify ownership by adding a TXT record:
            </p>

            <div className="bg-muted border border-border rounded-lg p-4 space-y-3">
              <div className="text-sm font-semibold text-foreground">Record Details from Netlify:</div>
              <div className="space-y-2 font-mono text-xs">
                <div><strong>Host:</strong> subdomain-owner-verification</div>
                <div><strong>Value:</strong> (unique verification code)</div>
              </div>
            </div>

            <div className="bg-muted border border-border rounded-lg overflow-hidden">
              <img 
                src="/doc/netlify/screen4.png" 
                alt="Netlify TXT verification record details"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>

            <p className="text-sm text-muted-foreground font-semibold">
              Copy these values - you will add this TXT record in the ARC.BD dashboard next.
            </p>
          </div>

          {/* STEP 5: Add TXT Record in ARC.BD */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">4</span>
              Add TXT Verification Record in ARC.BD Dashboard
            </h2>
            
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Go to your <Link href="/dashboard/domains" className="text-primary underline">ARC.BD Domain Dashboard</Link>.</li>
              <li>Click <strong>Manage</strong> on your subdomain (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">namecheak.arc.bd</code>).</li>
              <li>Find the <strong>Quick Setup Presets</strong> section - you will not use a preset for this step.</li>
              <li>Go to <strong>DNS Records</strong> section and click <strong>Add Record</strong>.</li>
              <li>Add the TXT record from Netlify:
                <div className="bg-muted border border-border rounded-lg p-3 font-mono text-xs mt-2 space-y-1">
                  <div><strong>Type:</strong> TXT</div>
                  <div><strong>Name / Host:</strong> subdomain-owner-verification</div>
                  <div><strong>Value:</strong> (paste the code from Netlify)</div>
                </div>
              </li>
              <li>Click <strong>Save Record</strong>.</li>
            </ol>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted border border-border rounded-lg overflow-hidden">
                <img 
                  src="/doc/netlify/screen7.png" 
                  alt="ARC.BD My Subdomains page showing Manage button"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="bg-muted border border-border rounded-lg overflow-hidden">
                <img 
                  src="/doc/netlify/screen8.png" 
                  alt="ARC.BD DNS configuration with Quick Setup Presets and Add Record"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="bg-muted border border-border rounded-lg overflow-hidden">
              <img 
                src="/doc/netlify/screen9.png" 
                alt="Adding CNAME record in ARC.BD for Netlify"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>

          {/* STEP 6: Netlify Detects TXT Verification */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">5</span>
              Wait for Netlify to Detect TXT Record
            </h2>
            
            <p className="text-sm text-muted-foreground">
              After adding the TXT record in ARC.BD:
            </p>

            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li><strong>DNS propagation takes 5-30 minutes</strong> (usually faster).</li>
              <li>Netlify continuously checks for the TXT record.</li>
              <li>Once detected, Netlify will automatically mark the subdomain as verified.</li>
            </ul>

            <div className="bg-muted border border-border rounded-lg overflow-hidden">
              <img 
                src="/doc/netlify/screen6.png" 
                alt="Netlify pending external DNS verification status"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>

          {/* STEP 7: Add CNAME Record for Routing */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">6</span>
              Configure CNAME Record in ARC.BD
            </h2>
            
            <p className="text-sm text-muted-foreground">
              Once Netlify verifies ownership, go back to your ARC.BD domain and add the CNAME record to route traffic to Netlify:
            </p>

            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Go to your domain DNS Records section in ARC.BD.</li>
              <li>Add a new record with:
                <div className="bg-muted border border-border rounded-lg p-3 font-mono text-xs mt-2 space-y-1">
                  <div><strong>Type:</strong> CNAME (Hostname)</div>
                  <div><strong>Name / Host:</strong> @ (or leave empty for root)</div>
                  <div><strong>Target Hostname:</strong> goplayapp.netlify.app (your Netlify domain)</div>
                </div>
              </li>
              <li>Click <strong>Save Record</strong>.</li>
            </ol>

            <div className="bg-muted border border-border rounded-lg overflow-hidden">
              <img 
                src="/doc/netlify/screen9.png" 
                alt="Adding CNAME record pointing to Netlify"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>

            <p className="text-sm text-amber-400 font-semibold mt-3">
              💡 Tip: You can use the Vercel CNAME quick preset in ARC.BD as a reference, but change the target to your actual Netlify domain.
            </p>
          </div>

          {/* STEP 8: SSL Certificate Provisioning */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <CheckCircle2 className="size-5 shrink-0" />
              SSL/TLS Certificate Auto-Provisioning
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once DNS is fully propagated and Netlify confirms the subdomain is pointing correctly:
            </p>

            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Netlify automatically provisions an <strong>SSL/TLS certificate</strong> via Let&apos;s Encrypt.</li>
              <li>This happens in the background - <strong>no action required from you</strong>.</li>
              <li>Check Netlify&apos;s <strong>Domain management</strong> page for a green checkmark indicating the domain is live.</li>
              <li>Your site will now be accessible via https://namecheak.arc.bd with full encryption.</li>
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted border border-border rounded-lg overflow-hidden">
                <img 
                  src="/doc/netlify/screen5.png" 
                  alt="Netlify production domains showing Pending DNS verification"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="bg-muted border border-border rounded-lg overflow-hidden">
                <img 
                  src="/doc/netlify/screen11.png" 
                  alt="Netlify SSL certificate waiting on DNS propagation"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="bg-muted border border-border rounded-lg overflow-hidden mt-4">
              <img 
                src="/doc/netlify/screen10.png" 
                alt="Netlify domain successfully configured and live"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
              <HelpCircle className="size-5 shrink-0 text-amber-400" />
              Troubleshooting
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="border-l-2 border-amber-500/50 pl-4 py-1 space-y-1">
                <strong className="text-foreground block">DNS Records Not Taking Effect?</strong>
                <p>
                  DNS changes can take 5-48 hours to propagate globally. Most changes are live within 30 minutes. Use <code className="text-amber-400 font-mono">nslookup namecheak.arc.bd</code> or online DNS checkers to verify.
                </p>
              </div>

              <div className="border-l-2 border-amber-500/50 pl-4 py-1 space-y-1">
                <strong className="text-foreground block">SSL Certificate Delayed?</strong>
                <p>
                  SSL provisioning usually happens within 5-15 minutes after DNS is fully propagated. If it takes longer, ensure all DNS records are correctly configured and Netlify shows the domain as verified.
                </p>
              </div>

              <div className="border-l-2 border-amber-500/50 pl-4 py-1 space-y-1">
                <strong className="text-foreground block">Still Having Issues?</strong>
                <p>
                  Check <a href="https://docs.netlify.com/domains-dns/custom-domains/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Netlify&apos;s Custom Domains Docs</a> or <Link href="/report" className="text-primary underline">contact ARC.BD Support</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Timeline */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Quick Timeline</h2>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold min-w-fit">1-5 min:</span>
                <span>Add TXT verification record in ARC.BD.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold min-w-fit">5-30 min:</span>
                <span>DNS propagates, Netlify detects TXT record and verifies subdomain.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold min-w-fit">Immediately:</span>
                <span>Add CNAME record in ARC.BD to route traffic to Netlify.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold min-w-fit">5-30 min:</span>
                <span>CNAME propagates, your subdomain points to Netlify.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold min-w-fit">5-15 min:</span>
                <span>Netlify provisions SSL certificate - your site is now LIVE!</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
