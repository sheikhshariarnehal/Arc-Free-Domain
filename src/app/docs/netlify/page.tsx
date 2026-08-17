import type { Metadata } from "next";
import NetlifyDocClient from "./NetlifyDocClient";

export const metadata: Metadata = {
  title: "Connect .arc.bd Subdomain to Netlify | ARC.BD Documentation",
  description:
    "Complete step-by-step guide to connecting your free .arc.bd subdomain to Netlify sites with CNAME DNS records and automatic Let's Encrypt SSL.",
  alternates: {
    canonical: "/docs/netlify",
  },
  openGraph: {
    title: "Connect .arc.bd Subdomain to Netlify | ARC.BD Docs",
    description:
      "Step-by-step DNS configuration guide for connecting free .arc.bd subdomains to Netlify with fast edge routing and automatic TLS.",
    url: "https://arc.bd/docs/netlify",
    siteName: "ARC.BD Documentation",
    type: "article",
  },
};

export default function NetlifyDocPage() {
  return <NetlifyDocClient />;
}
