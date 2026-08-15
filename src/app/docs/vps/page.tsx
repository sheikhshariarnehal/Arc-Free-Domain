import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import VPSDocClient from "./VPSDocClient";

export const metadata: Metadata = {
  title: "How to Connect .arc.bd Domain to VPS / Linux Server | ARC.BD Documentation",
  description:
    "Learn how to configure A records and point your free .arc.bd subdomain to any custom VPS, Linux cloud server, Docker host, or dedicated machine with Nginx, Caddy, and Certbot SSL.",
  alternates: {
    canonical: "/docs/vps",
  },
  openGraph: {
    title: "How to Connect .arc.bd Domain to Custom Server / VPS | ARC.BD Docs",
    description:
      "Learn how to configure A records and point your free .arc.bd subdomain to any custom VPS, Linux cloud server, or dedicated machine with Nginx setup instructions.",
    url: "https://arc.bd/docs/vps",
    siteName: "ARC.BD Documentation",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connect .arc.bd Subdomain to Custom VPS / Server",
    description:
      "Configure A records and point your free .arc.bd subdomain to any custom VPS, Linux cloud server, or dedicated machine.",
  },
};

export default function VPSDocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-sky-500/20 selection:text-sky-300">
      <Navbar />
      <VPSDocClient />
      <footer className="border-t border-border/50 px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground sm:px-6">
        ARC.BD Knowledge Base &copy; {new Date().getFullYear()} &middot; Built for developers in Bangladesh and worldwide.
      </footer>
    </div>
  );
}
