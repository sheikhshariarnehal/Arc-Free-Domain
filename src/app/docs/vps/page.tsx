"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, Server, Terminal } from "lucide-react";
import Link from "next/link";

export default function VPSDoc() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <Link href="/docs" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-8 w-fit transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Connect to Custom VPS / Server</h1>
            <p className="text-sm text-muted-foreground">Step-by-step guide to pointing your .arc.bd subdomain to any cloud server, VPS, or dedicated machine using an IPv4 A-record.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
              Configure A-Record in ARC.BD Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Go to your <Link href="/dashboard/domains" className="text-blue-400 hover:underline">ARC.BD Domain Dashboard</Link>, open your domain, and add an A record:
            </p>
            <div className="bg-muted/50 border border-border rounded-xl p-4 font-mono text-xs space-y-1">
              <div><strong className="text-blue-400">Type:</strong> A</div>
              <div><strong className="text-blue-400">Name / Host:</strong> @</div>
              <div><strong className="text-blue-400">IPv4 Address:</strong> 198.51.100.1 <span className="text-muted-foreground">(replace with your server IP)</span></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">2</span>
              Configure Your Web Server (Nginx Example)
            </h3>
            <p className="text-sm text-muted-foreground">
              Ensure your web server (Nginx, Caddy, Apache) is configured to listen for your claimed subdomain:
            </p>
            <div className="bg-muted/50 border border-border rounded-xl p-4 font-mono text-xs overflow-x-auto text-slate-200">
              <div className="flex items-center gap-2 text-slate-400 mb-2 pb-2 border-b border-border text-[11px]">
                <Terminal className="size-3.5" /> /etc/nginx/sites-available/myproject.arc.bd
              </div>
              <pre className="text-xs leading-relaxed">{`server {
    listen 80;
    server_name myproject.arc.bd;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
