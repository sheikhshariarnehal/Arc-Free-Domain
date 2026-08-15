import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import NetlifyDocClient from "./NetlifyDocClient";

export const metadata: Metadata = {
  title: "How to Connect .arc.bd Domain to Netlify | ARC.BD Documentation",
  description:
    "Complete step-by-step guide to connecting your free .arc.bd subdomain to Netlify sites with TXT ownership verification, CNAME DNS records, and automatic Let's Encrypt SSL.",
  alternates: {
    canonical: "/docs/netlify",
  },
  openGraph: {
    title: "How to Connect .arc.bd Domain to Netlify | ARC.BD Docs",
    description:
      "Step-by-step DNS configuration guide for connecting free .arc.bd subdomains to Netlify with fast edge routing and automatic TLS.",
    url: "https://arc.bd/docs/netlify",
    siteName: "ARC.BD Documentation",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connect .arc.bd Subdomain to Netlify",
    description:
      "Step-by-step DNS configuration guide for connecting free .arc.bd subdomains to Netlify with fast edge routing and automatic TLS.",
  },
};

export default function NetlifyDocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-teal-500/20 selection:text-teal-300">
      <Navbar />
      <NetlifyDocClient />
      <footer className="border-t border-border/50 px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground sm:px-6">
        ARC.BD Knowledge Base &copy; {new Date().getFullYear()} &middot; Built for developers in Bangladesh and worldwide.
      </footer>
    </div>
  );
}
