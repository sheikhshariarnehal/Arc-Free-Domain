import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import VercelDocClient from "./VercelDocClient";

export const metadata: Metadata = {
  title: "How to Connect .arc.bd Domain to Vercel | ARC.BD Documentation",
  description:
    "Step-by-step guide to connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records, instant edge routing, and automated TLS certificate verification.",
  alternates: {
    canonical: "/docs/vercel",
  },
  openGraph: {
    title: "How to Connect .arc.bd Domain to Vercel | ARC.BD Docs",
    description:
      "Step-by-step tutorial on connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records and automated SSL certificate verification.",
    url: "https://arc.bd/docs/vercel",
    siteName: "ARC.BD Documentation",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connect .arc.bd Subdomain to Vercel",
    description:
      "Step-by-step tutorial on connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records and automated SSL certificate verification.",
  },
};

export default function VercelDocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <VercelDocClient />
      <footer className="border-t border-border/50 px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground sm:px-6">
        ARC.BD Knowledge Base &copy; {new Date().getFullYear()} &middot; Built for developers in Bangladesh and worldwide.
      </footer>
    </div>
  );
}
