import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Internally rewrites to a neutral status page while keeping the original
// "<slug>.arc.bd" hostname (and any path) in the browser's address bar. This
// guarantees a consistent response regardless of which sub-path was
// requested, and prevents an unclaimed/unconfigured subdomain from ever
// rendering a real app route (e.g. "/dashboard") by accident.
function rewriteToSubdomainStatus(
  request: NextRequest,
  slug: string,
  status: "not_found" | "pending"
) {
  const url = request.nextUrl.clone();
  url.pathname = "/subdomain-status";
  url.search = "";
  url.searchParams.set("slug", slug);
  url.searchParams.set("status", status);
  return NextResponse.rewrite(url);
}

export async function updateSession(request: NextRequest) {
  // If OAuth code parameter is delivered to root or non-callback route, forward to /auth/callback
  if (request.nextUrl.searchParams.has("code") && request.nextUrl.pathname !== "/auth/callback") {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Subdomain Proxy Router for Wildcard *.<root domain> Traffic
  //
  // Production: Cloudflare has a single "*.arc.bd" DNS record pointing at the
  // Dokploy server, so every claimed subdomain reaches this app without any
  // per-user DNS record ever being created. We resolve the hostname to a
  // claim purely from Supabase (source of truth) and either:
  //   1. reverse-proxy to the owner's configured target (A/CNAME record), or
  //   2. show a "pending setup" page (claimed, not yet pointed anywhere), or
  //   3. show a real 404 (never claimed / released).
  const rootDomain = (process.env.NEXT_PUBLIC_DOMAIN || "arc.bd").toLowerCase();
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .toLowerCase()
    .split(":")[0];

  // Determine the wildcard suffix that applies to this request. Production
  // always uses "*.<root domain>". In non-production environments we also
  // recognize "*.localhost" so the wildcard flow can be exercised locally
  // without touching real DNS (most OSes/browsers resolve *.localhost to
  // 127.0.0.1 automatically per RFC 6761).
  let wildcardSuffix: string | null = null;
  if (host.endsWith(`.${rootDomain}`)) {
    wildcardSuffix = `.${rootDomain}`;
  } else if (process.env.NODE_ENV !== "production" && host.endsWith(".localhost")) {
    wildcardSuffix = ".localhost";
  }

  if (wildcardSuffix) {
    // Suffix-safe extraction (never use split(".")[0] or a naive replace(),
    // both of which can be fooled by hostnames containing extra labels).
    const subdomainName = host.slice(0, -wildcardSuffix.length);

    // Ignore core platform subdomains (www, admin, api, app, dashboard) —
    // these are reserved and always served by the main app.
    const systemSubdomains = ["www", "admin", "api", "app", "dashboard"];

    // Reject anything that isn't a single, well-formed label before ever
    // touching the database (defends against malformed/spoofed Host headers,
    // e.g. "a.b.arc.bd" or empty labels).
    const isValidSlugShape = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdomainName);

    if (subdomainName && isValidSlugShape && !systemSubdomains.includes(subdomainName)) {
      try {
        // Uses a SECURITY DEFINER RPC (see migrations/20260814_add_resolve_subdomain_target_rpc.sql)
        // because `subdomains`/`dns_records` RLS policies only allow a row's
        // owner to SELECT it, and this code runs on behalf of anonymous
        // visitors with no session.
        const { data, error: resolveError } = await supabase.rpc(
          "resolve_subdomain_target",
          { subdomain_name: subdomainName }
        );

        if (resolveError) throw resolveError;

        const resolution = data as {
          claimed: boolean;
          target?: { type: string; content: string } | null;
        } | null;

        if (!resolution?.claimed) {
          // Never claimed (or released/suspended) — show a real 404 instead
          // of silently falling through to the main marketing page.
          return rewriteToSubdomainStatus(request, subdomainName, "not_found");
        }

        if (!resolution.target?.content) {
          // Claimed, but the owner hasn't pointed it anywhere yet.
          return rewriteToSubdomainStatus(request, subdomainName, "pending");
        }

        let target = resolution.target.content.trim().replace(/\.+$/, "");
        if (!target.startsWith("http://") && !target.startsWith("https://")) {
          target = `https://${target}`;
        }

        const targetUrl = new URL(target);
        targetUrl.hostname = targetUrl.hostname.replace(/\.+$/, "");
        targetUrl.pathname = request.nextUrl.pathname;
        targetUrl.search = request.nextUrl.search;

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("host", targetUrl.host);

        return NextResponse.rewrite(targetUrl, {
          request: {
            headers: requestHeaders,
          },
        });
      } catch (e) {
        console.error("[Subdomain Proxy Error]", e);
        return rewriteToSubdomainStatus(request, subdomainName, "pending");
      }
    }
  }

  // Refresh the session - important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  // /admin/login is always publicly accessible (the login page itself)
  const isAdminLoginPage = currentPath === "/admin/login";

  // Redirect unauthenticated users to the appropriate login page
  if (!isAdminLoginPage) {
    if (currentPath.startsWith("/admin") && !user) {
      // Admin routes → dedicated admin login
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", currentPath);
      return NextResponse.redirect(url);
    }

    if (currentPath.startsWith("/dashboard") && !user) {
      // Dashboard routes → regular user login
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", currentPath);
      return NextResponse.redirect(url);
    }
  }

  // Enforce admin role for /admin/* (except /admin/login)
  if (!isAdminLoginPage && currentPath.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      // Not an admin — send to their dashboard, not the admin login
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
