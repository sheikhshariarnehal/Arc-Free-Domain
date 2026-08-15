import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import GithubPagesDocClient from "./GithubPagesDocClient";

export const metadata: Metadata = {
  title: "How to Connect .arc.bd Domain to GitHub Pages | ARC.BD Documentation",
  description:
    "Complete step-by-step tutorial on configuring CNAME records and hosting GitHub Pages repositories with custom .arc.bd subdomains and enforced HTTPS.",
  alternates: {
    canonical: "/docs/github-pages",
  },
  openGraph: {
    title: "How to Connect .arc.bd Domain to GitHub Pages | ARC.BD Docs",
    description:
      "Complete step-by-step guide to configuring CNAME records and hosting your GitHub Pages repositories on a free .arc.bd custom subdomain.",
    url: "https://arc.bd/docs/github-pages",
    siteName: "ARC.BD Documentation",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connect .arc.bd Subdomain to GitHub Pages",
    description:
      "Step-by-step guide to configuring CNAME records and hosting your GitHub Pages repositories on a free .arc.bd custom subdomain.",
  },
};

export default function GithubPagesDocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-violet-500/20 selection:text-violet-300">
      <Navbar />
      <GithubPagesDocClient />
      <footer className="border-t border-border/50 px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground sm:px-6">
        ARC.BD Knowledge Base &copy; {new Date().getFullYear()} &middot; Built for developers in Bangladesh and worldwide.
      </footer>
    </div>
  );
}
