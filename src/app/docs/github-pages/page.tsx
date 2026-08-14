import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ArrowLeft, GitBranch, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Connect .arc.bd Domain to GitHub Pages",
  description:
    "Complete step-by-step guide to configuring CNAME records and hosting your GitHub Pages repositories on a free .arc.bd custom subdomain.",
  alternates: {
    canonical: "/docs/github-pages",
  },
  openGraph: {
    title: "Connect .arc.bd Domain to GitHub Pages | ARC.BD Docs",
    description:
      "Complete step-by-step guide to configuring CNAME records and hosting your GitHub Pages repositories on a free .arc.bd custom subdomain.",
    url: "https://arc.bd/docs/github-pages",
  },
};

export default function GithubPagesDoc() {
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
          <div className="size-11 rounded-xl bg-secondary text-foreground border border-border/80 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <GitBranch className="size-5.5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Connect to GitHub Pages</h1>
              <Badge variant="secondary" className="font-mono text-[11px]">CNAME</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Host your open-source projects, docs, or personal sites on GitHub Pages using your .arc.bd subdomain.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Architecture Overview */}
          <div className="p-4 sm:p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <h2 className="text-sm sm:text-base font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="size-4.5 shrink-0" />
              Automated Edge Proxying
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              ARC.BD automatically resolves your custom subdomain to your GitHub Pages repository with automated HTTPS encryption.
            </p>
          </div>

          {/* Step 1 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Deploy Your GitHub Repository
            </h2>
            <ol className="text-xs sm:text-sm text-muted-foreground space-y-2 list-decimal list-inside ml-1 leading-relaxed">
              <li>Open your repository on GitHub.</li>
              <li>Go to <strong>Settings</strong> &rarr; <strong>Pages</strong>.</li>
              <li>Select your branch (e.g. <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">main / root</code>) and click <strong>Save</strong>.</li>
              <li>Note your GitHub Pages username (typically <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">username.github.io</code>).</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Add CNAME Record in ARC.BD
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Open your subdomain in the <Link href="/dashboard/domains" className="text-primary hover:underline font-medium">ARC.BD Dashboard</Link> and configure the CNAME record:
            </p>
            <div className="bg-muted/60 border border-border/70 rounded-lg p-3.5 font-mono text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><strong className="text-foreground">CNAME</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Host / Name:</span><strong className="text-foreground">@</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Target Hostname:</span><strong className="text-primary">username.github.io</strong></div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Set Custom Domain in GitHub Pages
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Back in GitHub <strong>Settings &rarr; Pages &rarr; Custom domain</strong>, enter your subdomain (e.g. <code className="text-foreground font-mono">my-project.arc.bd</code>), check <strong>Enforce HTTPS</strong>, and click <strong>Save</strong>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
