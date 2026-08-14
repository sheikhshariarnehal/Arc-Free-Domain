# ARC.BD — Migrate Existing Subdomain System to Wildcard DNS + Dokploy

You are working on my existing ARC.BD project.

## Important Context

ARC.BD is a free subdomain platform where users can claim subdomains such as:

- `nehal.arc.bd`
- `myproject.arc.bd`
- `portfolio.arc.bd`

The existing project already has the subdomain claiming system implemented, but it currently relies on the previous architecture where `arc.bd` / individual subdomains are associated with Vercel/domain configuration.

I now want to migrate the project to a **single wildcard DNS architecture**.

### Target architecture

```text
                         Internet
                            │
                            ▼
                       Cloudflare
                            │
                     *.arc.bd wildcard
                            │
                            ▼
                         Dokploy
                            │
                         Next.js
                            │
                            ▼
                        Supabase
```

The goal is:

```text
nehal.arc.bd
rahim.arc.bd
portfolio.arc.bd
anything.arc.bd
```

to automatically reach the same application without creating an individual DNS record for every user.

---

# VERY IMPORTANT

Do NOT rewrite the entire project.

First inspect the existing codebase and understand:

1. Current authentication
2. Current Supabase schema
3. Current subdomain claim logic
4. Current domain validation
5. Current Vercel/domain integration
6. Current middleware
7. Current routing
8. Current user/project/site model
9. Existing API routes/server actions
10. Existing deployment configuration

Preserve existing functionality wherever possible.

Only replace the parts that are related to the old per-domain/Vercel architecture.

---

# New Architecture

## 1. Cloudflare

The DNS configuration outside the application will be:

```text
Type: A
Name: *
Value: DOKPLOY_SERVER_IP
Proxy: Proxied
```

This means:

```text
*.arc.bd → Dokploy server
```

No individual DNS record should be created when a user claims a subdomain.

The application must therefore NOT depend on creating DNS records.

---

# 2. Subdomain Claiming

The existing claim flow should remain mostly unchanged.

When a user claims:

```text
nehal
```

the database should store the claimed slug.

For example:

```text
slug = "nehal"
status = "active"
user_id = ...
```

The system must NOT create:

```text
nehal.arc.bd
```

as an individual DNS record.

The wildcard DNS record handles it automatically.

---

# 3. Subdomain Validation

Keep or improve the existing validation.

A valid slug should:

- be lowercase
- contain only `a-z`
- contain numbers where allowed by the existing rules
- allow `-` where appropriate
- have a reasonable minimum/maximum length
- not begin or end with `-`
- not contain spaces
- not contain dots
- not contain `/`
- not contain `_`
- not contain special characters

Normalize input before checking availability.

Example:

```text
NeHal → nehal
```

Then check uniqueness against the database.

---

# 4. Reserved Subdomains

Inspect the existing reserved-subdomain implementation.

Preserve it.

At minimum, make sure these kinds of names cannot be claimed:

```text
www
api
app
admin
dashboard
auth
login
signup
support
docs
mail
cdn
static
assets
status
```

Do NOT blindly overwrite the existing reserved list.

Extend it only if necessary.

---

# 5. Hostname Detection

Implement hostname-based routing.

When the user visits:

```text
https://nehal.arc.bd
```

the application should detect:

```text
nehal.arc.bd
```

and extract:

```text
nehal
```

The application should then find the corresponding record in Supabase.

Conceptually:

```ts
const hostname = request.headers.get("host");

const normalizedHostname = hostname
  ?.split(":")[0]
  .toLowerCase();

if (normalizedHostname?.endsWith(".arc.bd")) {
    const slug = normalizedHostname.slice(
        0,
        -".arc.bd".length
    );
}
```

Do not use a fragile `split(".")[0]` implementation without validating the complete hostname.

---

# 6. Root Domain Behavior

The following must remain the main ARC.BD application:

```text
https://arc.bd
```

It should continue showing the existing marketplace/dashboard/landing page.

Only hostnames matching:

```text
*.arc.bd
```

should enter subdomain/site routing.

Example:

```text
arc.bd
    → Main ARC.BD application

nehal.arc.bd
    → Nehal's claimed site

portfolio.arc.bd
    → Portfolio site

unknown.arc.bd
    → Proper 404 / subdomain not found page
```

---

# 7. Middleware

Inspect the current middleware.

Modify it instead of creating a second conflicting middleware.

The middleware should:

1. Detect the hostname.
2. Determine whether it is the root domain or a subdomain.
3. Extract the slug for valid `*.arc.bd` hosts.
4. Prevent malformed hostnames.
5. Preserve authentication behavior.
6. Preserve existing protected routes.
7. Rewrite internally to the correct site/project route if required.

Do not expose an internal route unnecessarily.

For example:

```text
nehal.arc.bd
```

may internally resolve to something like:

```text
/sites/nehal
```

while the browser continues displaying:

```text
nehal.arc.bd
```

---

# 8. Database Lookup

Reuse the existing Supabase schema if it already supports this.

Do not create duplicate tables unless necessary.

The lookup should effectively be:

```sql
SELECT *
FROM subdomains
WHERE slug = $1
AND status = 'active';
```

If the project uses a different existing table/model, adapt to it instead.

The database remains the source of truth.

---

# 9. Unknown Subdomain

If someone visits:

```text
randomdoesnotexist.arc.bd
```

and there is no active claim:

Return a proper 404 page.

Do NOT redirect every unknown subdomain to `arc.bd`.

The response should clearly indicate that the subdomain does not exist.

---

# 10. User Site Rendering

When a valid subdomain is found, render the existing user's/project's website using the existing project architecture.

Do not create a second frontend application.

Reuse the existing components and rendering system.

For example:

```text
nehal.arc.bd
        ↓
slug = nehal
        ↓
Supabase
        ↓
user/project/site data
        ↓
existing renderer
```

---

# 11. Remove Old Vercel Dependency

Search the entire repository for code related to:

- Vercel domain creation
- Vercel domain verification
- Vercel domain assignment
- Vercel project domains
- per-user Vercel domain configuration
- domain ownership verification
- domain transfer
- Vercel API calls
- Vercel domain environment variables

Do NOT automatically delete them.

First determine whether each piece is still required.

Remove or disable only the functionality that exists solely because of the old architecture.

The application should no longer require each user to add:

```text
arc.bd
```

to their own Vercel account.

---

# 12. No Individual DNS Management

The new implementation must NOT do this:

```text
User claims nehal
        ↓
Create DNS record
        ↓
nehal.arc.bd
```

Instead:

```text
User claims nehal
        ↓
Database record only
        ↓
*.arc.bd already catches request
```

This is a core requirement.

---

# 13. Security

Do not trust the hostname blindly.

Validate:

```text
*.arc.bd
```

strictly.

For example:

Valid:

```text
nehal.arc.bd
portfolio.arc.bd
my-project.arc.bd
```

Invalid:

```text
nehal.example.com
evil.com
arc.bd.evil.com
evil.arc.bd.example.com
```

Also make sure user-controlled hostname values cannot be used for:

- SQL injection
- open redirects
- SSRF
- arbitrary proxying
- filesystem traversal
- cache poisoning

Use parameterized Supabase queries / the existing safe database layer.

---

# 14. Caching

Be careful with Next.js/CDN caching.

The response for:

```text
nehal.arc.bd
```

must never accidentally be served to:

```text
rahim.arc.bd
```

The hostname must be part of the cache key wherever necessary.

Review:

- Next.js caching
- middleware rewrites
- `fetch()` caching
- Cloudflare caching
- static generation
- route caching

Do not introduce shared caching that can leak one user's site to another user.

---

# 15. SEO

For a user's subdomain:

```text
nehal.arc.bd
```

the canonical URL should remain:

```text
https://nehal.arc.bd
```

Do not accidentally canonicalize every site to:

```text
https://arc.bd
```

unless the existing product explicitly requires that behavior.

---

# 16. Local Development

Support local development without requiring real `arc.bd` DNS.

For example, document a method such as:

```text
nehal.localhost
```

or a hosts-file approach.

The production logic must use:

```text
*.arc.bd
```

but development should remain easy.

Do not hard-code production-only behavior that makes local development impossible.

---

# 17. Environment Variables

Inspect existing environment variables.

Remove obsolete Vercel/domain variables only if they are no longer used anywhere.

Add only variables actually required by the new implementation.

Do not expose Supabase service-role keys to the browser.

---

# 18. Testing

Before considering the migration complete, test:

### Root domain

```text
https://arc.bd
```

Expected:

```text
Main ARC.BD website
```

### Existing claimed subdomain

```text
https://existing.arc.bd
```

Expected:

```text
Existing user's site
```

### New claimed subdomain

Claim:

```text
test123
```

Then:

```text
https://test123.arc.bd
```

Expected:

```text
User/project site
```

### Unknown subdomain

```text
https://does-not-exist.arc.bd
```

Expected:

```text
404
```

### Reserved name

Attempt:

```text
www
```

Expected:

```text
Rejected
```

### Duplicate

Two users attempt:

```text
nehal
```

Expected:

```text
Only one succeeds
```

The uniqueness check must be race-condition safe.

Use a database unique constraint rather than relying only on frontend validation.

---

# 19. Important Existing Functionality

Do NOT break:

- authentication
- Google login
- Supabase auth
- user dashboard
- subdomain search
- subdomain claiming
- subdomain release
- profile/project management
- existing admin functionality
- existing UI
- existing API routes
- existing database structure
- existing deployment configuration

Only migrate the domain-routing architecture.

---

# 20. Deployment

The final production architecture should be:

```text
Cloudflare
    │
    ├── arc.bd
    │
    └── *.arc.bd
             │
             ▼
          Dokploy
             │
             ▼
          Next.js
             │
             ▼
          Supabase
```

Cloudflare DNS should contain a wildcard record similar to:

```text
*.arc.bd → Dokploy server
```

The application itself should perform hostname-based routing.

---

# 21. Implementation Process

Before modifying files:

### Step 1

Inspect the repository and identify the current subdomain architecture.

### Step 2

List the files that need modification.

### Step 3

Explain what the current system does.

### Step 4

Explain exactly what will change.

### Step 5

Implement the migration.

### Step 6

Run TypeScript/build/lint/tests.

### Step 7

Fix any issues introduced by the migration.

### Step 8

Give me a final deployment checklist containing:

- Cloudflare DNS changes
- Dokploy changes
- environment variables
- database changes
- application changes
- testing steps
- rollback procedure

## Critical Rule

Do not make assumptions about the existing codebase.

Inspect the existing implementation first.

Do not create duplicate middleware, duplicate database tables, duplicate routing systems, or a second authentication system.

Reuse the existing architecture wherever possible.

The final result must allow:

```text
https://arc.bd
```

and:

```text
https://username.arc.bd
```

to work from the same deployed application using a single wildcard DNS configuration.

The user must NOT need to add `arc.bd` or individual `username.arc.bd` domains to their own Vercel accounts.

Do not modify the Public Suffix List as part of this implementation.