---
target: "http://localhost:3000/login"
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-15T09-28-55Z
slug: localhost-login
---
### Method: dual-agent (A: 5c39496c-156b-499c-a333-a112c717a90b · B: f915790e-4c80-4383-bc6f-9ea21c7550e4)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3/4 | Session check flashes a smaller box causing layout shift; domain claiming lacks explicit feedback if post-auth claim errors out. |
| 2 | Match System / Real World | 4/4 | Standard developer auth mental model (Email, Password, GitHub, Google, Sign In / Sign Up). |
| 3 | User Control and Freedom | 2/4 | No self-service password reset option ("Forgot password?"); locked-out users cannot recover. |
| 4 | Consistency and Standards | 3/4 | Adheres to dark UI and skeuomorphic styles; tab switch lacks ARIA tab semantics. |
| 5 | Error Prevention | 3/4 | Standard HTML5 validation, but lacks live password strength/complexity guidance during registration. |
| 6 | Recognition Rather Than Recall | 3/4 | Domain claim name is clearly visible in top banner; missing standard form `autoComplete` attributes. |
| 7 | Flexibility and Efficiency | 3/4 | 1-click GitHub & Google OAuth options provide fast entry; missing password manager metadata. |
| 8 | Aesthetic and Minimalist Design | 4/4 | Clean dark card aesthetic, subtle specular top-rim highlight, zero visual clutter or tacky halos. |
| 9 | Error Recovery | 2/4 | Raw Supabase error strings displayed directly; post-auth claim errors are dropped in `console.error`. |
| 10 | Help and Documentation | 2/4 | No inline help link or support link for users facing login issues or blocked accounts. |
| **Total** | | **29/40** | **Good / Acceptable (72.5%)** |

#### Design Specificity Verdict

**LLM Assessment**: The login interface occupies a solid middle ground between a generic SaaS auth template and a specialized DNS provisioner gateway. When accessed with `?claim=<subdomain>`, it dynamically displays a helpful banner (`Sign in or create an account to claim {claimName}.arc.bd free!`), preserving domain intent. However, when accessed directly (without a query param), the screen lacks product-specific DNA: no mention of the 5-domain quota, instantaneous Cloudflare DNS setup, or developer-first DNS control.

**Deterministic Scan**: Deterministic scan passed with **0 antipattern violations** across all scanned rules (`side-tab`, `border-accent-on-rounded`, `overused-font`, `flat-type-hierarchy`, `gradient-text`, `ai-color-palette`, `dark-glow`, `monotonous-spacing`, `bounce-easing`, `pulsing-dot`, `marketing-buzzword`, `em-dash-overuse`). The top-rim highlights and skeuomorphic button press styles (`skeuo-button-primary`, `skeuo-button-surface`) are authentic tactile details rather than generic AI glowing noise.

#### Overall Impression
A clean, focused, and well-styled authentication surface with good tactile micro-interactions and intent preservation for domain claims, but weakened by missing standard auth fundamentals (password recovery, autocomplete tags) and silent failure modes during post-auth claim execution.

#### What's Working
1. **Context-Aware Intent Preservation**: Seamlessly extracts `?claim=` and `?redirect=` parameters, presents a claim reassurance banner, and passes query parameters through both email/password submissions and OAuth redirect callback flows.
2. **Tactile Craft & Micro-interactions**: The skeuomorphic button hierarchy (`skeuo-button-primary` and `skeuo-button-surface`), top-rim specular highlights (`box-shadow: inset 0 1px 0px 0 rgba(255, 255, 255, 0.2)`), and smooth password visibility toggle provide high physical polish.
3. **Low-Friction Registration Path**: Direct session sign-in immediately upon sign-up avoids email-confirmation friction and accelerates the path to active DNS setup.

#### Priority Issues

- **[P1] Missing Password Reset Flow ("Forgot Password?")**
  - **Why it matters**: Users who forget their password cannot regain access to their account or domains, causing permanent drop-off and support burden.
  - **Fix**: Add a `"Forgot password?"` action below the password input in Sign In mode triggering a Supabase `resetPasswordForEmail` prompt/modal.
  - **Suggested command**: `$impeccable harden src/app/login/page.tsx`

- **[P1] Missing Form Autocomplete Attributes**
  - **Why it matters**: Password managers (1Password, Bitwarden, Apple Keychain, Chrome) fail to properly index fields, forcing manual copy-pasting and increasing user error.
  - **Fix**: Add standard `autoComplete` attributes: `autoComplete="email"`, `autoComplete={isLogin ? "current-password" : "new-password"}`, and `autoComplete="name"`.
  - **Suggested command**: `$impeccable harden src/app/login/page.tsx`

- **[P2] Silent Failure on Post-Authentication Subdomain Claim**
  - **Why it matters**: If claiming the domain fails in `handleClaimAfterAuth()`, the error is swallowed in `console.error` and the user lands on an empty dashboard with no feedback.
  - **Fix**: Handle non-200 responses from `/api/subdomains/claim`, pass status to the dashboard via URL parameter (e.g. `?claim_error=...`), or surface an error toast before routing.
  - **Suggested command**: `$impeccable clarify src/app/login/page.tsx`

- **[P2] Layout Shift During Initial Session Verification**
  - **Why it matters**: `checkingSession` renders a standalone 40px container that expands abruptly when the full form mounts, causing Cumulative Layout Shift (CLS).
  - **Fix**: Match the skeleton container height and bounding dimensions to the login card (`min-h-[460px] max-w-md w-full`) with subtle skeleton pulse bars.
  - **Suggested command**: `$impeccable polish src/app/login/page.tsx`

- **[P3] Missing ARIA Semantics on Mode Tabs & Password Toggle**
  - **Why it matters**: Screen readers announce the Sign In / Sign Up controls as generic buttons without tab semantics or selected state indicators.
  - **Fix**: Add `role="tablist"` / `role="tab"`, `aria-selected={isLogin}`, and explicit `aria-label="Toggle password visibility"` to the toggle button.
  - **Suggested command**: `$impeccable audit src/app/login/page.tsx`

#### Persona Red Flags
- **Jordan (First-Timer Domain Claimer)**: If an account is created with Google OAuth or email and the background claim request encounters a collision or rate limit, Jordan is dumped on an empty dashboard with zero indication of what happened to their chosen subdomain.
- **Alex (Power User)**: Password manager autofill fails due to missing `autoComplete` attributes, slowing down fast login workflows.
- **Sam (Accessibility & Keyboard User)**: Mode switch lacks ARIA tab attributes, making the segmented toggle non-semantic for screen reader users.

#### Minor Observations
- No back-link directly to the homepage or documentation from within the card (relies solely on the floating navbar).
- OAuth button icons: GitHub uses monochrome SVG while Google uses full multi-color SVG; both render crisply with high contrast.
- Default redirect fallback `/dashboard/domains` correctly aligns with user intent.

#### Questions to Consider
- *Could ARC.BD eliminate password fatigue entirely by offering Magic Link OTP alongside GitHub/Google OAuth?*
- *What if domain claiming featured a 10-minute temporary reservation locker with a live countdown timer during authentication?*
- *How should the UI guide users who encounter OAuth email collisions (e.g., signing in with GitHub using an email already registered via password)?*
