"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft, Triangle } from "lucide-react";
import Link from "next/link";

export default function VercelDoc() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 animate-fade-in">
        <Link href="/docs" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <Triangle className="h-8 w-8 text-white fill-white" />
          <h1 className="text-3xl font-bold text-white">Connect to Vercel</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-slate-300 text-lg">Connecting your ARC.BD subdomain to a Vercel project is incredibly simple using CNAME records.</p>
          
          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 1: Add domain in Vercel</h3>
          <ul className="text-slate-300 space-y-2 list-disc list-inside">
            <li>Go to your Vercel Project Settings {'>'} Domains.</li>
            <li>Enter your claimed subdomain (e.g., <code>myproject.arc.bd</code>) and click Add.</li>
            <li>Vercel will show that it is waiting for DNS configuration.</li>
          </ul>

          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 2: Configure ARC.BD Dashboard</h3>
          <ul className="text-slate-300 space-y-2 list-disc list-inside">
            <li>Go to the ARC.BD Dashboard and select your domain.</li>
            <li>In the Quick Setup Wizard, click the <strong>Vercel</strong> preset.</li>
            <li>Alternatively, manually add a record:
              <div className="bg-slate-900 border border-white/10 rounded-lg p-4 mt-2 font-mono text-sm overflow-x-auto">
                Type: CNAME<br/>
                Target: cname.vercel-dns.com
              </div>
            </li>
          </ul>

          <h3 className="text-white text-xl font-semibold mt-8 mb-4">Step 3: Wait for Propagation</h3>
          <p className="text-slate-300">DNS changes usually propagate instantly on our network, but Vercel may take a minute or two to verify the certificate and show the domain as active.</p>
        </div>
      </main>
    </div>
  );
}
