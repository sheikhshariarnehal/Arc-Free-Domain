"use client";

import Navbar from "@/components/Navbar";
import { Flag, Send } from "lucide-react";

export default function ReportAbuse() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg glass-card p-8 rounded-2xl animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Flag className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Report Abuse</h1>
              <p className="text-sm text-slate-400">Help us keep ARC.BD safe for everyone.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Subdomain to report</label>
              <div className="flex items-center">
                <input type="text" placeholder="example" className="flex-1 bg-slate-900/50 border border-white/10 rounded-l-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600" />
                <span className="bg-white/5 border border-l-0 border-white/10 py-2.5 px-4 rounded-r-xl text-slate-500 font-medium">.arc.bd</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Your Email</label>
              <input type="email" placeholder="you@example.com" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Category</label>
              <select className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none">
                <option>Phishing / Malware</option>
                <option>Copyright Violation</option>
                <option>Spam</option>
                <option>Other Illegal Content</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Additional Details</label>
              <textarea rows={4} placeholder="Please provide specific URLs or evidence..." className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600 resize-none"></textarea>
            </div>

            <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all mt-4 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Send className="h-5 w-5" /> Submit Report
            </button>
          </form>
        </div>
      </main>
      
      <footer className="border-t border-white/5 py-6 text-center text-sm text-slate-500">
        ARC.BD takes abuse seriously. All reports are reviewed within 24 hours.
      </footer>
    </div>
  );
}
