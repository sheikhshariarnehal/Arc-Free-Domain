# ARC.BD — Free Subdomain Platform
## Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** MVP  
**Domain:** `arc.bd`  
**Primary Stack:** Next.js + Cloudflare + Supabase  
**Business Model:** Free subdomain claiming initially  
**Target Users:** Developers, students, creators, startups, projects, communities, and small businesses

---

## 1. Product Overview

ARC.BD is a free subdomain platform that allows users to claim and manage personalized subdomains under:

**`*.arc.bd`**

Examples:

- `nehal.arc.bd`
- `myproject.arc.bd`
- `portfolio.arc.bd`
- `app.arc.bd`
- `startup.arc.bd`

The platform provides a simple dashboard where users can search for an available subdomain, claim it for free, and configure DNS records to point the subdomain to their website, application, server, or other supported destination.

### Core Value Proposition

> **Get a free, clean `.arc.bd` subdomain for your project in seconds.**

The initial version should focus on making subdomain claiming extremely simple.

---

# 2. Goals

## Primary Goals

1. Allow users to create an account.
2. Allow users to search for available `.arc.bd` names.
3. Allow users to claim an available subdomain for free.
4. Automatically create the corresponding Cloudflare DNS record.
5. Allow users to manage their claimed subdomains.
6. Allow users to configure basic DNS destinations.
7. Prevent duplicate claims.
8. Provide an admin panel for managing users and subdomains.
9. Keep the platform secure against DNS abuse.
10. Build the system so paid/premium features can be added later.

---

# 3. Non-Goals for MVP

The first version will NOT include:

- Paid domains
- Domain purchasing
- Domain transfer
- Full DNS hosting for arbitrary external domains
- Website hosting
- File deployment
- VPS provisioning
- Email hosting
- Advanced DNS record types
- Team accounts
- Marketplace bidding
- Reselling actual `.bd` domains

ARC.BD is initially a **free subdomain allocation + DNS management platform**.

---

# 4. Target Users

### Developers

Want:

`project.arc.bd`

for a web application or API.

### Students

Want:

`name.arc.bd`

for portfolios and university projects.

### Startups

Want:

`startup.arc.bd`

for prototypes or temporary products.

### Creators

Want:

`name.arc.bd`

for a personal website.

### Communities

Want:

`community.arc.bd`

for community websites.

---

# 5. User Journey

## Step 1 — Visit ARC.BD

User opens:

`arc.bd`

Landing page displays:

> Claim your free `.arc.bd` subdomain.

Search box:

`[ yourname ] .arc.bd`

Button:

**Check Availability**

---

## Step 2 — Search

User enters:

`nehal`

System validates the requested name.

Checks:

- Syntax
- Reserved words
- Existing claims
- Existing Cloudflare DNS records
- Platform blacklist
- Minimum/maximum length

If available:

> `nehal.arc.bd` is available 🎉

Button:

**Claim Free**

---

## Step 3 — Authentication

If the user isn't logged in:

> Sign in to claim this subdomain.

Authentication options:

- Google
- Email/password
- Magic link

Recommended MVP:

**Google + email authentication through Supabase Auth.**

---

## Step 4 — Claim

User confirms:

> You're claiming `nehal.arc.bd`.

Button:

**Claim Subdomain**

Backend:

1. Re-check availability.
2. Create database reservation.
3. Create Cloudflare DNS record.
4. Store Cloudflare record ID.
5. Mark subdomain as active.
6. Return success.

---

## Step 5 — Dashboard

User sees:

### My Domains

| Subdomain | Status | Target | Actions |
|---|---|---|---|
| `nehal.arc.bd` | Active | `192.0.2.1` | Manage |

---

# 6. Core Features

## 6.1 Subdomain Search

Search endpoint:

`GET /api/subdomains/check?name=nehal`

Response:

```json
{
  "name": "nehal",
  "domain": "nehal.arc.bd",
  "available": true
}
```

### Validation

Allowed:

```text
a-z
0-9
-
```

Rules:

- 3–32 characters
- Cannot start with `-`
- Cannot end with `-`
- No spaces
- No special characters
- Case-insensitive

Examples:

Valid:

```text
nehal
my-app
project123
dev2026
```

Invalid:

```text
-nehal
nehal-
my app
my_app
```

---

# 7. Reserved Names

Certain names must never be claimable.

Examples:

```text
www
api
admin
app
mail
ftp
ns1
ns2
dashboard
status
support
help
blog
docs
cdn
static
assets
auth
login
signup
```

The admin should be able to manage the reserved-name list dynamically.

Database:

`reserved_subdomains`

Fields:

- `id`
- `name`
- `reason`
- `created_at`

---

# 8. Claiming System

Each user can claim a configurable number of subdomains.

MVP default:

**5 subdomains per user**

Example:

```text
nehal.arc.bd
portfolio.arc.bd
project.arc.bd
testapp.arc.bd
api-project.arc.bd
```

The limit should be stored as a configurable system setting rather than hard-coded.

---

# 9. Subdomain Ownership

Every claimed subdomain must belong to exactly one user.

Example:

```text
User A
   ↓
nehal.arc.bd
```

Another user cannot claim:

```text
nehal.arc.bd
```

even if the DNS record is removed manually.

The database is the authoritative ownership system.

---

# 10. DNS Management

Cloudflare will be the DNS provider for `arc.bd`.

The backend will communicate with Cloudflare using its API.

Cloudflare provides APIs for creating, updating, listing, and deleting DNS records. The API supports scoped API-token authentication and requires DNS write permission for record changes.

### Important security rule

The Cloudflare API token must **never** be exposed to the browser.

Architecture:

```text
Browser
   ↓
Next.js API
   ↓
Cloudflare API
```

Never:

```text
Browser
   ↓
Cloudflare API Token
```

---

# 11. DNS Records — MVP

Start with only:

### A Record

Example:

```text
nehal.arc.bd → 203.0.113.10
```

### CNAME Record

Example:

```text
nehal.arc.bd → example.vercel.app
```

Potential later support:

- AAAA
- TXT
- MX
- CAA

For MVP, keep the interface simple.

Cloudflare notes that A/AAAA records cannot coexist with a CNAME record at the same hostname, so the application must enforce this constraint.

---

# 12. DNS Management UI

User opens:

`Dashboard → nehal.arc.bd`

Display:

```text
nehal.arc.bd

Status
● Active

DNS

Type       Target
A          203.0.113.10

[ Edit ]
[ Delete ]
```

Add record:

```text
Record Type

○ A
○ CNAME

Target

[________________]

[ Save ]
```

---

# 13. Proxy Status

For MVP, use a controlled default.

Recommended:

### A records

Default:

**DNS Only**

### CNAME

Default:

**DNS Only**

Later, allow Cloudflare proxy configuration for compatible records.

Cloudflare supports proxied and DNS-only wildcard records, but proxying should be deliberately controlled because it changes how traffic reaches the origin.

---

# 14. Wildcard DNS

ARC.BD can optionally use:

```text
*.arc.bd
```

for platform-level infrastructure.

Cloudflare supports wildcard DNS records and specific DNS records take precedence over the wildcard.

However, **do not rely on the wildcard as the ownership database**.

The database should determine:

```text
nehal → User A
project → User B
startup → User C
```

Wildcard DNS can be used for platform infrastructure, but user-owned DNS records should be explicitly tracked.

---

# 15. Database Architecture

Use Supabase PostgreSQL.

## users

```text
id
email
name
avatar_url
role
status
created_at
updated_at
```

Roles:

```text
user
admin
```

---

## subdomains

```text
id
user_id
name
full_domain
status
cloudflare_record_id
record_type
target
proxied
created_at
updated_at
```

Status:

```text
pending
active
suspended
deleted
```

---

## reserved_subdomains

```text
id
name
reason
created_at
```

---

## dns_records

If you want multiple records per subdomain:

```text
id
subdomain_id
cloudflare_record_id
type
name
content
ttl
proxied
status
created_at
updated_at
```

---

## audit_logs

```text
id
user_id
action
resource_type
resource_id
metadata
ip_address
user_agent
created_at
```

Examples:

```text
SUBDOMAIN_CREATED
SUBDOMAIN_DELETED
DNS_RECORD_CREATED
DNS_RECORD_UPDATED
DNS_RECORD_DELETED
SUBDOMAIN_SUSPENDED
```

---

## system_settings

```text
id
key
value
updated_at
```

Examples:

```text
max_subdomains_per_user = 5
min_subdomain_length = 3
max_subdomain_length = 32
maintenance_mode = false
```

---

# 16. Important Race-Condition Protection

This is critical.

Two users could simultaneously request:

```text
app.arc.bd
```

The application must never allow both users to claim it.

The database must enforce uniqueness:

```text
UNIQUE(name)
```

The claim process should be:

```text
Request
   ↓
Validate
   ↓
Database transaction
   ↓
Unique constraint
   ↓
Create ownership
   ↓
Cloudflare record
```

If Cloudflare creation fails:

```text
Database claim
      ↓
Cloudflare FAILED
      ↓
Rollback / mark failed
```

Do not simply check:

```text
SELECT available
```

and then insert later without database-level protection.

---

# 17. API Architecture

Recommended Next.js App Router structure:

```text
app/
├── page.tsx
├── dashboard/
│   ├── page.tsx
│   └── domains/
│       └── [id]/
│           └── page.tsx
│
└── api/
    ├── subdomains/
    │   ├── check/
    │   │   └── route.ts
    │   ├── claim/
    │   │   └── route.ts
    │   └── [id]/
    │       └── route.ts
    │
    └── dns/
        ├── create/
        │   └── route.ts
        ├── update/
        │   └── route.ts
        └── delete/
            └── route.ts
```

---

# 18. API Endpoints

## Check availability

```http
GET /api/subdomains/check?name=nehal
```

---

## Claim

```http
POST /api/subdomains/claim
```

Request:

```json
{
  "name": "nehal"
}
```

---

## List user's subdomains

```http
GET /api/subdomains
```

---

## Get subdomain

```http
GET /api/subdomains/:id
```

---

## Delete subdomain

```http
DELETE /api/subdomains/:id
```

---

## Create DNS record

```http
POST /api/dns
```

Request:

```json
{
  "subdomain_id": "...",
  "type": "A",
  "content": "203.0.113.10"
}
```

---

## Update DNS record

```http
PATCH /api/dns/:id
```

---

## Delete DNS record

```http
DELETE /api/dns/:id
```

---

# 19. Landing Page

The homepage should be extremely simple.

### Hero

```text
Your name.
Your project.
Your domain.

Claim a free .arc.bd subdomain.

[ yourname ] .arc.bd

[ Check Availability ]
```

Example:

```text
nehal.arc.bd
```

### Benefits

```text
✓ Free
✓ Fast
✓ Developer friendly
✓ DNS management
✓ Built for Bangladesh
```

---

# 20. Dashboard

Navigation:

```text
ARC.BD

Dashboard
My Subdomains
Settings
────────────────
Documentation
Logout
```

Dashboard cards:

```text
My Subdomains
5 / 5

Active
4

DNS Records
7
```

---

# 21. Subdomain Details Page

Example:

```text
nehal.arc.bd

● Active

Your subdomain is active.

DNS Records

A
203.0.113.10
DNS Only

[ Edit ]

────────────────────

Created
August 12, 2026

Owner
You

[ Delete Subdomain ]
```

---

# 22. Admin Panel

Admin dashboard:

```text
Overview
Users
Subdomains
DNS Records
Reserved Names
Abuse Reports
Audit Logs
Settings
```

### Overview

Display:

```text
Total Users
1,240

Total Subdomains
3,582

Active Subdomains
3,401

Suspended
18

DNS Records
4,902
```

---

# 23. Admin Subdomain Management

Admin can:

- Search subdomains
- Search users
- View ownership
- Suspend subdomain
- Delete subdomain
- Restore subdomain
- View DNS records
- View audit history

Example:

```text
nehal.arc.bd

Owner: user@example.com
Status: Active

DNS:
A → 203.0.113.10

[ Suspend ]
[ Delete ]
```

---

# 24. Abuse Prevention

Because the domains are free, abuse prevention is extremely important.

Implement:

### Account verification

Require verified email before claiming.

### Rate limiting

Example:

```text
Availability checks:
60/minute/IP

Claim attempts:
10/hour/account

DNS modifications:
30/hour/account
```

These should be configurable.

### Claim limit

Default:

```text
5 subdomains/user
```

### Reserved names

Block sensitive/platform names.

### Abuse reporting

Every public subdomain should have a way to report abuse.

Example:

`arc.bd/report`

Report categories:

```text
Spam
Phishing
Malware
Impersonation
Copyright
Other
```

---

# 25. Security Requirements

## Cloudflare Token

Store:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID
```

only as server-side environment variables.

Use a scoped Cloudflare API token limited to the `arc.bd` zone and DNS operations rather than a global API key. Cloudflare recommends API tokens and supports resource-specific permissions.

---

## Server-side authorization

Every DNS request must verify:

```text
Authenticated user
        ↓
Owns subdomain?
        ↓
YES → Continue
NO  → 403
```

Never trust:

```text
user_id
```

sent from the client.

Use the authenticated Supabase user ID.

---

# 26. DNS Validation

For A records:

Accept only valid IPv4 addresses.

Reject:

```text
localhost
127.0.0.1
0.0.0.0
```

and other inappropriate/private targets according to your policy.

For CNAME:

Validate hostname syntax.

Prevent:

```text
arc.bd
*.arc.bd
```

and potentially dangerous self-referential configurations.

---

# 27. Account Abuse

Potential future protections:

- CAPTCHA/risk checks
- Device/IP rate limiting
- Email verification
- Suspicious-account detection
- Maximum claims per account
- Maximum claims per IP/device
- Temporary claim cooldown
- Admin moderation

Do not make CAPTCHA mandatory for every user initially unless abuse requires it.

---

# 28. DNS Synchronization

Cloudflare is the actual DNS provider.

Supabase stores the application's ownership state and Cloudflare record IDs.

Example:

```text
Supabase

nehal.arc.bd
cloudflare_record_id:
abc123


Cloudflare

nehal.arc.bd
A
203.0.113.10
```

The application should periodically verify that database state and Cloudflare state haven't diverged.

Future scheduled job:

```text
Every 15–60 minutes
        ↓
Check important records
        ↓
Detect mismatch
        ↓
Log discrepancy
        ↓
Notify admin
```

---

# 29. Failure Handling

If Cloudflare fails while claiming:

```text
Claim request
     ↓
Database reservation
     ↓
Cloudflare API
     ↓
FAILED
```

The system should not leave the subdomain permanently locked.

Possible status:

```text
pending
```

A cleanup job can remove stale pending claims.

Example:

```text
pending > 10 minutes
        ↓
release claim
```

---

# 30. User Experience Requirements

The platform should feel:

- Fast
- Minimal
- Developer-friendly
- Modern
- Trustworthy

Avoid complicated DNS terminology during claiming.

Instead of:

> Create DNS Resource Record

say:

> Where should your domain point?

Then show:

```text
Website / App

[ example.vercel.app ]
```

Advanced DNS management can remain inside the domain settings page.

---

# 31. Mobile Support

The platform must be fully responsive.

Primary screens:

```text
Mobile
Tablet
Desktop
```

The dashboard should work comfortably on mobile.

---

# 32. SEO

Landing page should target keywords such as:

```text
free subdomain
free .bd subdomain
free Bangladesh subdomain
developer subdomain
free domain for portfolio
free domain for project
```

SEO pages:

```text
/
how-it-works
/docs
/docs/dns
/docs/vercel
/docs/github-pages
/docs/cloudflare
```

---

# 33. Documentation

Create documentation explaining:

### Claim a subdomain

```text
1. Create an account
2. Search your name
3. Claim it
4. Configure DNS
```

### Connect to Vercel

Explain how users configure:

```text
project.arc.bd
```

with their deployment.

### Connect to GitHub Pages

Provide configuration instructions.

### Connect to VPS

Explain A record configuration.

---

# 34. Future Features

The architecture should leave room for:

### Premium names

```text
app.arc.bd
ai.arc.bd
dev.arc.bd
```

Potentially paid later.

### Custom domains

Allow users to connect:

```text
example.com
```

### Advanced DNS

```text
A
AAAA
CNAME
TXT
MX
CAA
```

### API

Developers can programmatically manage their subdomains.

Example:

```text
POST /v1/subdomains
```

### CLI

Potential future command:

```bash
arc claim myproject
```

### GitHub integration

Automatically configure:

```text
project.arc.bd
```

for GitHub Pages deployments.

### Vercel integration

Connect a Vercel project to:

```text
project.arc.bd
```

### Analytics

Show:

```text
Requests
Bandwidth
Visitors
```

if traffic is proxied through ARC infrastructure.

---

# 35. Monetization — Future

The MVP is completely free.

Later:

### Free

```text
5 subdomains
Basic DNS
```

### Pro

```text
৳99/year

20 subdomains
Advanced DNS
Analytics
API
```

### Premium

Premium subdomain names can have one-time or recurring pricing.

Example:

```text
ai.arc.bd
app.arc.bd
dev.arc.bd
```

Do not implement payments in MVP.

---

# 36. Recommended Technology Stack

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
```

## Backend

```text
Next.js App Router
Route Handlers
Server Actions where appropriate
```

## Authentication

```text
Supabase Auth
```

## Database

```text
Supabase PostgreSQL
```

## DNS

```text
Cloudflare DNS API
```

## Hosting

```text
Vercel
```

## Monitoring

Initially:

```text
Vercel Logs
Cloudflare Analytics
Supabase Logs
```

Later:

```text
Sentry
```

---

# 37. Environment Variables

Server-side only:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ZONE_ID=
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
CLOUDFLARE_API_TOKEN
```

to the browser.

---

# 38. MVP Release Scope

### Phase 1 — Foundation

- [ ] Next.js project
- [ ] Supabase project
- [ ] Authentication
- [ ] Database schema
- [ ] Cloudflare API integration

### Phase 2 — Domain System

- [ ] Availability checker
- [ ] Subdomain validation
- [ ] Reserved names
- [ ] Claim system
- [ ] Ownership system
- [ ] Cloudflare record creation

### Phase 3 — Dashboard

- [ ] Dashboard
- [ ] My subdomains
- [ ] Domain details
- [ ] DNS management
- [ ] Delete subdomain

### Phase 4 — Security

- [ ] Rate limiting
- [ ] Claim limits
- [ ] Email verification
- [ ] Audit logs
- [ ] Abuse reporting
- [ ] DNS validation

### Phase 5 — Admin

- [ ] Admin authentication
- [ ] User management
- [ ] Subdomain management
- [ ] Reserved names
- [ ] Abuse reports
- [ ] Audit logs
- [ ] System settings

### Phase 6 — Launch

- [ ] Documentation
- [ ] SEO
- [ ] Error monitoring
- [ ] Production testing
- [ ] Cloudflare configuration
- [ ] Backup strategy

---

# 39. MVP Success Metrics

Track:

### Acquisition

```text
Visitors
Signups
Verified users
```

### Subdomains

```text
Availability searches
Successful claims
Active subdomains
Deleted subdomains
```

### DNS

```text
DNS records created
DNS records modified
DNS failures
Cloudflare API errors
```

### Abuse

```text
Reports
Suspensions
Abusive accounts
```

---

# 40. Key Technical Decision

The most important architectural principle is:

> **Supabase owns the application state; Cloudflare owns DNS.**

```text
                 ARC.BD
                   │
             Next.js App
                   │
        ┌──────────┴──────────┐
        │                     │
     Supabase              Cloudflare
        │                     │
        │                 DNS Records
        │                     │
        └──────────┬──────────┘
                   │
              User Domain
                   │
             nehal.arc.bd
```

The database records:

> Who owns the subdomain?

Cloudflare records:

> Where does the subdomain resolve?

This separation makes the system easier to maintain and expand.

---

# 41. Final MVP Definition

The MVP is successful when a new user can:

1. Open `arc.bd`
2. Search for a name
3. See availability
4. Sign in
5. Claim the name for free
6. Receive `name.arc.bd`
7. Open the dashboard
8. Add an A or CNAME record
9. Point the domain to their project
10. Manage or delete the subdomain

The entire process should take **less than two minutes** for a normal user.

---

# 42. Product Vision

ARC.BD should eventually become more than a free-subdomain service.

The long-term vision is:

> **A developer-focused domain platform for Bangladesh and the wider web.**

Potential ecosystem:

```text
                 ARC.BD
                    │
       ┌────────────┼────────────┐
       │            │            │
   Subdomains     DNS          API
       │            │            │
       ├────────────┼────────────┤
       │            │            │
   Hosting      Deployments   Analytics
       │            │            │
       └────────────┼────────────┘
                    │
              Developer Platform
```

The MVP should therefore remain **small and reliable**, while the underlying database/API architecture is designed so these future capabilities can be added without rebuilding the entire platform.