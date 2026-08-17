import type { Metadata } from "next";
import VPSDocClient from "./VPSDocClient";

export const metadata: Metadata = {
  title: "Connect .arc.bd Subdomain to Custom Server / VPS | ARC.BD Documentation",
  description:
    "Learn how to configure A records and point your free .arc.bd subdomain to any custom VPS, Linux cloud server, Docker host, or dedicated machine with Nginx, Caddy, and Certbot SSL.",
  alternates: {
    canonical: "/docs/vps",
  },
  openGraph: {
    title: "Connect .arc.bd Subdomain to Custom Server / VPS | ARC.BD Docs",
    description:
      "Learn how to configure A records and point your free .arc.bd subdomain to any custom VPS, Linux cloud server, or dedicated machine with Nginx setup instructions.",
    url: "https://arc.bd/docs/vps",
    siteName: "ARC.BD Documentation",
    type: "article",
  },
};

export default function VPSDocPage() {
  return <VPSDocClient />;
}
