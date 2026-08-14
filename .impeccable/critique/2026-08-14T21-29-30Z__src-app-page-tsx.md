---
target: src/app/page.tsx
total_score: 27
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
timestamp: 2026-08-14T21-29-30Z
slug: src-app-page-tsx
---
# Design Critique: ARC.BD Homepage (`src/app/page.tsx`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4/4 | Real-time loading spinners, availability indicators, and instant feedback. |
| 2 | Match System / Real World | 3/4 | Developer-native language (Cloudflare Anycast, DNS records, VPS); minor copy typo ("web site"). |
| 3 | User Control and Freedom | 4/4 | One-click clear search button, instant suggestion selection, frictionless navigation. |
| 4 | Consistency and Standards | 3/4 | Inset search input vs flat border cards; accent color differs from brand emerald/teal token. |
| 5 | Error Prevention | 3/4 | Real-time input sanitization automatically strips invalid characters. |
| 6 | Recognition Rather Than Recall | 4/4 | `.arc.bd` suffix permanently anchored; 3 dynamic alternative suggestions on taken names. |
| 7 | Flexibility and Efficiency | n/a | *Persuade surface / Landing page: single streamlined action path.* |
| 8 | Aesthetic and Minimalist Design | 3/4 | Ambient silk shader elevates canvas; 6 feature cards share identical visual weight. |
| 9 | Error Recovery | 3/4 | Taken state provides 3 instant suggestions; reserved names are not distinguished from user claims. |
| 10 | Help and Documentation | n/a | *Persuade surface / Landing page: documentation linked in navbar and footer.* |
| **Total** | | **27/32** (~84%) | **Good (Solid foundation, targeted refinement recommended)** |

## Design Specificity Verdict

**LLM Assessment:** The search interaction with pinned `.arc.bd` suffix, instant regex character sanitization, and automated alternative suggestion chips is strongly tailored to developer domain registration. However, the visual styling relies heavily on generic dark-mode SaaS tropes (floating glass navbar, uniform Lucide icon cards, standard Tailwind blue `#3b82f6` rather than ARC.BD's emerald brand identity). The regional identity for Bangladeshi developers is also absent from the hero copy and metrics.

**Deterministic Scan:** Automated detector ran with 1 warning (`gray-on-color`), verified as a false positive caused by static AST matching of hover states. Code inspection revealed high-contrast AA-compliant text, proper `aria-label` attributes on interactive elements, and performant WebGL shader containment.

## Overall Impression
A fast, polished, and developer-friendly landing page with high-quality search UX and ambient visual craft. The single biggest opportunity is differentiating the brand with cohesive emerald/teal palette tokens, regional latency/community pride, and interactive DNS previews.

## What's Working
1. **Frictionless Real-Time Search UX:** Instant input sanitization with responsive inline feedback and dynamic alternative chips prevents dead-ends and keeps user momentum high.
2. **High-Craft Ambient Hero Surface:** The silk `ShaderBackground` coupled with the floating glassmorphic navbar creates a distinct, modern developer atmosphere.
3. **Concrete Developer-Centric Value Propositions:** Copy focuses on hard technical specifications (Cloudflare edge propagation, A/CNAME/TXT records, multi-host integration) rather than generic marketing claims.

## Priority Issues

### [P1] Brand Palette Divergence (Blue vs Emerald/Teal)
- **Why it matters:** Standard Tailwind blue blends ARC.BD into generic SaaS templates rather than establishing a memorable brand aesthetic.
- **Fix:** Update primary accent tokens in `globals.css` and `page.tsx` to cohesive emerald/teal hues (`#10b981`, `#059669`, `oklch(0.65 0.20 160)`).
- **Suggested command:** `$impeccable colorize`

### [P2] Abrupt Auth Redirection on Domain Claim
- **Why it matters:** First-time users clicking "Claim" are routed straight to `/login` without visual confirmation that their chosen subdomain is reserved for them.
- **Fix:** Add a brief reassurance badge or modal: *"Reserve [name].arc.bd — 100% Free with GitHub/Email login"*.
- **Suggested command:** `$impeccable clarify` / `$impeccable onboard`

### [P2] Reserved Subdomain Confusion in Error Recovery
- **Why it matters:** Searching for infrastructure words (`admin`, `api`, `dashboard`) reports "already taken" and generates suggestions like `admin-app.arc.bd`.
- **Fix:** Return a distinct status message (*"Reserved system name"*) with suggestions that avoid the reserved term.
- **Suggested command:** `$impeccable harden`

### [P3] Homogeneous Feature Cards Lack Interactive Demonstration
- **Why it matters:** 6 identical static cards reduce scanability and miss the opportunity to demonstrate live edge speed or DNS routing.
- **Fix:** Convert the feature row into an interactive DNS preview or tabbed host integration simulator.
- **Suggested command:** `$impeccable delight` / `$impeccable layout`

### [P3] Hero Subheadline Copy Polish
- **Why it matters:** `"web site, portfolio or project"` has an archaic split spelling and lacks crisp serial phrasing.
- **Fix:** Update to `"Claim your free custom address for your website, portfolio, or web app."`.
- **Suggested command:** `$impeccable polish`

## Persona Red Flags

- **Jordan (First-Timer Developer):** Clicks "Claim" and is redirected to `/login` without a clear onboarding message confirming that registration is 100% free with no credit card required.
- **Alex (Power User / Senior Engineer):** No multi-domain or bulk search capability; existing domain owners must navigate through the full landing page without a quick-jump shortcut to DNS record management from the hero.
- **Casey (Mobile Developer on Smartphone):** On small mobile screens (390px), the search input and button stack into separate vertical elements (`h-11` button + input container), pushing availability results and suggestion chips below the fold.

## Minor Observations
- Search placeholder contrast on mobile (`placeholder:text-slate-500`) is slightly lower than desktop (`placeholder:text-slate-400`).
- The asynchronous search result card lacks `aria-live="polite"` for screen readers.

## Questions to Consider
- *"What if we displayed a live BDIX / Dhaka ping latency pill (e.g., '⚡ 4ms average edge resolution across Bangladesh') to give local builders tangible pride in using `.arc.bd`?"*
- *"Could the availability card include an instant 1-click interactive DNS simulator showing how `CNAME` points to `cname.vercel-dns.com` before claiming?"*
