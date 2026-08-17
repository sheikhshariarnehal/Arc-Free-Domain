import type { Metadata } from "next";
import VercelDocClient from "./VercelDocClient";

export const metadata: Metadata = {
  title: "Connect .arc.bd Subdomain to Vercel | ARC.BD Documentation",
  description:
    "Step-by-step guide to connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records, instant edge routing, and automated TLS certificate verification.",
  alternates: {
    canonical: "/docs/vercel",
  },
  openGraph: {
    title: "Connect .arc.bd Subdomain to Vercel | ARC.BD Docs",
    description:
      "Step-by-step guide to connecting your free .arc.bd subdomain to Vercel projects with CNAME DNS records and automated SSL certificate verification.",
    url: "https://arc.bd/docs/vercel",
    siteName: "ARC.BD Documentation",
    type: "article",
  },
};

export default function VercelDocPage() {
  return <VercelDocClient />;
}
