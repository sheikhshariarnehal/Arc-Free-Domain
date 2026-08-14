import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Server, Terminal, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Connect .arc.bd Domain to Custom Server / VPS",
  description:
    "Learn how to configure A records and point your free .arc.bd subdomain to any custom VPS, Linux cloud server, or dedicated machine with Nginx setup instructions.",
  alternates: {
    canonical: "/docs/vps",
  },
  openGraph: {
    title: "Connect .arc.bd Domain to Custom Server / VPS | ARC.BD Docs",
    description:
      "Learn how to configure A records and point your free .arc.bd subdomain to any custom VPS, Linux cloud server, or dedicated machine with Nginx setup instructions.",
    url: "https://arc.bd/docs/vps",
  },
};

export default function VPSDoc() {
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
            <Server className="size-5.5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Connect to Custom Server / VPS</h1>
              <Badge variant="secondary" className="font-mono text-[11px]">A Record</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Point your .arc.bd subdomain to any Linux VPS, Docker host, or cloud server using an IPv4 address.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Add A Record in ARC.BD Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Open your subdomain in the <Link href="/dashboard/domains" className="text-primary hover:underline font-medium">ARC.BD Dashboard</Link> and create an A record pointing to your server&apos;s public IPv4 address:
            </p>
            <div className="bg-muted/60 border border-border/70 rounded-lg p-3.5 font-mono text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><strong className="text-foreground">A</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Host / Name:</span><strong className="text-foreground">@</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Target IPv4:</span><strong className="text-primary">198.51.100.1</strong> <span className="text-muted-foreground text-[11px]">(your server IP)</span></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Configure Nginx Web Server
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Configure Nginx to route incoming traffic for your subdomain to your backend application:
            </p>
            <div className="bg-muted/70 border border-border rounded-lg p-4 font-mono text-xs overflow-x-auto text-slate-200">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 pb-2 border-b border-border text-[11px]">
                <Terminal className="size-3.5" /> /etc/nginx/sites-available/myproject.arc.bd
              </div>
              <pre className="text-xs leading-relaxed text-foreground">{`server {
    listen 80;
    server_name myproject.arc.bd;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
