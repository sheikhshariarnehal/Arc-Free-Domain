import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Abuse & Security Issues",
  description:
    "Report malicious subdomains, phishing, malware, copyright infringement, or policy violations on the ARC.BD platform.",
  alternates: {
    canonical: "/report",
  },
  openGraph: {
    title: "Report Abuse & Security Issues | ARC.BD",
    description:
      "Report malicious subdomains, phishing, malware, copyright infringement, or policy violations on the ARC.BD platform.",
    url: "https://arc.bd/report",
  },
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
