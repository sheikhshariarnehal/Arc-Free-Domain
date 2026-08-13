"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, GitBranch, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function GithubPagesDoc() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <Link href="/docs" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-8 w-fit transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Connect to GitHub Pages</h1>
            <p className="text-sm text-muted-foreground">Step-by-step guide to pointing your .arc.bd subdomain to a GitHub Pages repository with automated SSL.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
              Configure DNS in ARC.BD Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Go to your <Link href="/dashboard/domains" className="text-blue-400 hover:underline">ARC.BD Domain Dashboard</Link>, open your domain, and add a CNAME record:
            </p>
            <div className="bg-muted/50 border border-border rounded-xl p-4 font-mono text-xs space-y-1">
              <div><strong className="text-blue-400">Type:</strong> CNAME</div>
              <div><strong className="text-blue-400">Name / Host:</strong> @</div>
              <div><strong className="text-blue-400">Target Hostname:</strong> &lt;username&gt;.github.io</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">2</span>
              Add Custom Domain in GitHub Repository
            </h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Open your repository on GitHub and go to <strong>Settings</strong> → <strong>Pages</strong>.</li>
              <li>Under <strong>Custom domain</strong>, enter your claimed ARC.BD subdomain (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">myproject.arc.bd</code>).</li>
              <li>Click <strong>Save</strong>. GitHub will perform an automated DNS verification check.</li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <CheckCircle2 className="size-5 shrink-0" />
              Enforce HTTPS
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once the DNS check passes in GitHub Pages settings, check the <strong>Enforce HTTPS</strong> checkbox to enable automatic SSL encryption.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
