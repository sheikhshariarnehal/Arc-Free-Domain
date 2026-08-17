import type { Metadata } from "next";
import GithubPagesDocClient from "./GithubPagesDocClient";

export const metadata: Metadata = {
  title: "Connect .arc.bd Subdomain to GitHub Pages | ARC.BD Documentation",
  description:
    "Complete step-by-step tutorial on configuring CNAME records and hosting GitHub Pages repositories with custom .arc.bd subdomains and enforced HTTPS.",
  alternates: {
    canonical: "/docs/github-pages",
  },
  openGraph: {
    title: "Connect .arc.bd Subdomain to GitHub Pages | ARC.BD Docs",
    description:
      "Complete step-by-step guide to configuring CNAME records and hosting your GitHub Pages repositories on a free .arc.bd custom subdomain.",
    url: "https://arc.bd/docs/github-pages",
    siteName: "ARC.BD Documentation",
    type: "article",
  },
};

export default function GithubPagesDocPage() {
  return <GithubPagesDocClient />;
}
