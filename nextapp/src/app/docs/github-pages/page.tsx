"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, GitBranch } from "lucide-react";
import Link from "next/link";

export default function GithubPagesDoc() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 animate-fade-in">
        <Link href="/docs" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <GitBranch className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Connect to GitHub Pages</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-slate-300 text-lg">Use your ARC.BD subdomain as a custom domain for your GitHub Pages repository.</p>
          
          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 1: Configure ARC.BD DNS</h3>
          <p className="text-slate-300 mb-2">Go to your ARC.BD Dashboard, select your domain, and add a CNAME record pointing to your GitHub pages URL:</p>
          <div className="bg-slate-900 border border-white/10 rounded-lg p-4 font-mono text-sm mb-4">
            Type: CNAME<br/>
            Target: &lt;your-username&gt;.github.io
          </div>

          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 2: Add Custom Domain in GitHub</h3>
          <ul className="text-slate-300 space-y-2 list-disc list-inside">
            <li>Go to your repository on GitHub.</li>
            <li>Navigate to <strong>Settings {'>'} Pages</strong>.</li>
            <li>Under "Custom domain", type your ARC.BD subdomain (e.g., <code>repo.arc.bd</code>).</li>
            <li>Click Save. GitHub will perform a DNS check.</li>
            <li>Once the DNS check passes, check the "Enforce HTTPS" box.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
