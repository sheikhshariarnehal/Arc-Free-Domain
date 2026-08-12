# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase Auth & PostgreSQL, Cloudflare DNS API v4

## Users

Developers, students, creators, startups, and communities in Bangladesh and globally who need a clean, free subdomain (`*.arc.bd`) for web apps, portfolios, APIs, or prototypes.

## Product Purpose

ARC.BD provides instant, clean, free `.arc.bd` subdomains with automated Cloudflare DNS record management. Users search for an available name, claim it in seconds, and point it to their server, Vercel, GitHub Pages, or custom target.

## Positioning

"Get a free, clean `.arc.bd` subdomain for your project in seconds." Zero-cost, developer-first subdomain provisioner tailored for Bangladesh and the web community.

## Operating Context

- Landing page with live subdomain availability search box (`[ yourname ] .arc.bd`).
- User Dashboard for domain oversight (up to 5 subdomains per user).
- Subdomain DNS manager for A and CNAME records with simple setup guidance ("Where should your domain point?").
- Admin Panel for user management, subdomain suspensions, reserved names list, and abuse queue.
- Public Abuse Reporting page (`/report`).
- Developer documentation (`/docs`) for Vercel, GitHub Pages, and VPS integration.

## Capabilities and Constraints

- Subdomain names: 3–32 characters, `a-z`, `0-9`, `-`, cannot start or end with hyphen.
- Reserved names protection (`www`, `api`, `admin`, `app`, `auth`, `mail`, `dashboard`, `docs`, `cdn`, `login`, `signup`, `status`, etc.).
- Supabase PostgreSQL maintains single source of truth for domain ownership; Cloudflare handles edge DNS resolution.
- Server-side Cloudflare API token security (never exposed to client).
- Cloudflare record co-existence validation (A and CNAME cannot coexist at root subdomain).

## Brand Commitments

- **Name:** ARC.BD
- **Design Language:** Modern, high-craft developer aesthetic. Rich dark mode theme, vibrant emerald/teal accents, smooth glassmorphism UI cards, responsive layouts, micro-animations, and clean typography (Inter / Outfit).

## Evidence on Hand

- `ARC.BD — Free Subdomain Platform Product Requirements Document.md`

## Product Principles

1. **Lightning Fast & Simple:** From search to active DNS in under 2 minutes.
2. **Developer-First UX:** Human-friendly DNS configuration instructions alongside full record control.
3. **Rock-Solid Security:** Atomic database reservation + Cloudflare synchronization preventing race conditions and stale claims.
4. **Platform Integrity:** Proactive abuse reporting, rate-limiting, and email verification.
