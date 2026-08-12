"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, Server } from "lucide-react";
import Link from "next/link";

export default function VPSDoc() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 animate-fade-in">
        <Link href="/docs" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <Server className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Connect to Custom VPS</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-slate-300 text-lg">If you are hosting your own server (DigitalOcean, AWS, Linode, etc.), you can use an A record to point your domain to your server's IP address.</p>
          
          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Configuring the A Record</h3>
          <p className="text-slate-300 mb-2">Go to your ARC.BD Dashboard, select your domain, and add an A record:</p>
          <div className="bg-slate-900 border border-white/10 rounded-lg p-4 font-mono text-sm mb-4">
            Type: A<br/>
            Target: 198.51.100.1 (Replace with your server IPv4 address)
          </div>

          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Server Configuration (Nginx Example)</h3>
          <p className="text-slate-300 mb-2">Make sure your web server is configured to listen for your new domain name.</p>
          <div className="bg-slate-900 border border-white/10 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`server {
    listen 80;
    server_name myproject.arc.bd;

    location / {
        proxy_pass http://localhost:3000;
    }
}`}
          </div>
        </div>
      </main>
    </div>
  );
}
