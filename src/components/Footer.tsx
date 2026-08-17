"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Heart, MessageSquare, Globe, ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/components/TechIcons";
import ThemeToggle from "@/components/ui/footer";

const navigation = {
  categories: [
    {
      id: "platform",
      name: "Platform",
      sections: [
        {
          id: "product",
          name: "Product",
          items: [
            { name: "Subdomain Search", href: "/#hero" },
            { name: "Fast Deployment", href: "/#features" },
            { name: "How It Works", href: "/#how-it-works" },
            { name: "Supported Stacks", href: "/#stacks" },
          ],
        },
        {
          id: "resources",
          name: "Resources",
          items: [
            { name: "Documentation", href: "/docs" },
            { name: "DNS Setup Guide", href: "/docs#dns" },
            { name: "Vercel & Next.js", href: "/docs#vercel" },
            { name: "GitHub Pages", href: "/docs#github-pages" },
          ],
        },
        {
          id: "community",
          name: "Community",
          items: [
            { name: "GitHub Issues", href: "https://github.com/sheikhshariarnehal/Arc-Free-Domain/issues" },
            { name: "Repository", href: "https://github.com/sheikhshariarnehal/Arc-Free-Domain" },
            { name: "Discussions", href: "https://github.com/sheikhshariarnehal/Arc-Free-Domain/discussions" },
            { name: "Developer Support", href: "mailto:support@arc.bd" },
          ],
        },
        {
          id: "legal",
          name: "Legal & Trust",
          items: [
            { name: "Terms of Service", href: "/terms" },
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Report Abuse", href: "/report" },
            { name: "Security", href: "/docs#security" },
          ],
        },
      ],
    },
  ],
};

const Underline = "hover:-translate-y-1 border border-dotted border-white/20 hover:border-white/40 rounded-xl p-2.5 transition-transform duration-150 text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] inline-flex items-center justify-center";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-black text-foreground relative z-10 px-4 sm:px-6 lg:px-8">
      {/* Brand & Mission Statement Header */}
      <div className="mx-auto max-w-5xl pt-10 sm:pt-14 pb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div
              className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-white overflow-hidden border border-white/15 shadow-sm shrink-0 group-hover:border-white/30 transition-colors"
              style={{ boxShadow: "inset 0 1px 0px 0 rgba(255, 255, 255, 0.25)" }}
            >
              <Image src="/ARC.webp" alt="ARC.BD Logo" width={28} height={28} className="size-7 object-contain" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">ARC.BD</span>
          </Link>
          <div className="h-8 w-px bg-white/10 hidden sm:block shrink-0" />
          <p className="text-xs leading-relaxed text-zinc-400">
            A free, high-performance subdomain platform providing modern <span className="text-zinc-200 font-mono font-medium">.arc.bd</span> addresses with automated Cloudflare Anycast DNS routing and instant Universal SSL. Designed to empower developers, students, and indie creators across Bangladesh and worldwide to ship side projects, portfolios, and APIs with zero configuration overhead.
          </p>
        </div>
      </div>

      {/* Categorized Navigation Columns */}
      <div className="mx-auto max-w-5xl py-8">
        <div className="border-b border-dotted border-white/15"> </div>
        <div className="py-8 sm:py-10">
          {navigation.categories.map((category) => (
            <div
              key={category.id}
              className="grid grid-cols-2 sm:grid-cols-4 gap-8 leading-6"
            >
              {category.sections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-400 font-semibold mb-4">
                    {section.name}
                  </h3>
                  <ul
                    role="list"
                    aria-labelledby={`${category.id}-${section.id}-heading`}
                    className="flex flex-col space-y-2.5"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-dotted border-white/15"> </div>
      </div>

      {/* Social Links & Theme/Scroll Pill */}
      <div className="flex flex-wrap items-center justify-center gap-6 gap-y-6 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-3 px-4">
          <Link
            aria-label="Email Support"
            href="mailto:support@arc.bd"
            className={Underline}
          >
            <Mail strokeWidth={1.5} className="h-4 w-4" />
          </Link>
          <Link
            aria-label="GitHub Repository"
            href="https://github.com/sheikhshariarnehal/Arc-Free-Domain"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <GitHubIcon size={16} className="text-zinc-400" />
          </Link>
          <Link
            aria-label="Discussions"
            href="https://github.com/sheikhshariarnehal/Arc-Free-Domain/discussions"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <MessageSquare strokeWidth={1.5} className="h-4 w-4" />
          </Link>
          <Link
            aria-label="Website"
            href="/"
            className={Underline}
          >
            <Globe strokeWidth={1.5} className="h-4 w-4" />
          </Link>
        </div>
        <ThemeToggle />
      </div>

      {/* Bottom Copyright & Credit Bar */}
      <div className="mx-auto pb-10 pt-2 flex flex-col justify-between text-center text-xs text-zinc-500 max-w-5xl">
        <div className="flex flex-row items-center justify-center gap-1.5 text-zinc-400">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="font-semibold text-white">ARC.BD</span>
          <span>· Powered by</span>
          <span className="text-zinc-300 font-medium">Cloudflare Anycast DNS</span>
          <span>· Made with</span>
          <Heart className="text-red-500 mx-0.5 h-3.5 w-3.5 fill-red-500 animate-pulse" />
          <span>for developers</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

