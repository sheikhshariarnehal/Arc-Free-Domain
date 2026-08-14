import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ArrowLeft, GitBranch, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Point .arc.bd Domain to GitHub Pages",
  description:
    "Complete step-by-step guide to configuring CNAME records and hosting your GitHub Pages repositories on a free .arc.bd custom subdomain.",
  alternates: {
    canonical: "/docs/github-pages",
  },
  openGraph: {
    title: "How to Point .arc.bd Domain to GitHub Pages | ARC.BD Docs",
    description:
      "Complete step-by-step guide to configuring CNAME records and hosting your GitHub Pages repositories on a free .arc.bd custom subdomain.",
    url: "https://arc.bd/docs/github-pages",
  },
};

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
          {/* How It Works Alert */}
          <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-3">
            <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <CheckCircle2 className="size-5 shrink-0 text-blue-400" />
              Instant Reverse-Proxy Deployment (Recommended)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Because ARC.BD uses an advanced wildcard gateway, you <strong>do not need</strong> to register or verify custom domains in GitHub settings! 
              Simply point your subdomain directly to your raw GitHub Pages URL (e.g., <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">username.github.io/repository</code>) and our servers will securely reverse-proxy all requests under your clean <code className="text-foreground font-mono">.arc.bd</code> subdomain.
            </p>
          </div>

          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
              Get your GitHub Pages URL
            </h2>
            <ol className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Deploy your project to GitHub Pages normally using your repository settings.</li>
              <li>Copy the raw deployment URL provided by GitHub (typically <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">username.github.io/repository-name</code>).</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">2</span>
              Configure Target in ARC.BD Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              Go to your <Link href="/dashboard/domains" className="text-blue-400 hover:underline">ARC.BD Domain Dashboard</Link>, open your domain, and add a CNAME record:
            </p>
            <div className="bg-muted/50 border border-border rounded-xl p-4 font-mono text-xs space-y-1">
              <div><strong className="text-blue-400">Type:</strong> CNAME</div>
              <div><strong className="text-blue-400">Name / Host:</strong> @</div>
              <div><strong className="text-blue-400">Target Hostname:</strong> username.github.io/repository-name</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Do not enter a generic hostname; point it directly to your specific repository path, and we will route all traffic perfectly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">3</span>
              Go Live!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your custom subdomain is instantly active. Visitors to <code className="text-foreground font-mono">yourname.arc.bd</code> will be seamlessly served from your GitHub Pages project with automatic SSL encryption.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
