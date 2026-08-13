import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // Subdomain Proxy Router for Wildcard *.arc.bd Traffic
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").toLowerCase().split(":")[0];

  if (host && host.endsWith(".arc.bd")) {
    const subdomainName = host.replace(".arc.bd", "").trim();

    // Ignore core platform subdomains (www, admin, api, app)
    const systemSubdomains = ["www", "admin", "api", "app", "dashboard"];
    if (subdomainName && !systemSubdomains.includes(subdomainName)) {
      try {
        const { data: subdomain } = await supabase
          .from("subdomains")
          .select("id, name, status")
          .eq("name", subdomainName)
          .eq("status", "active")
          .single();

        if (subdomain) {
          // Fetch target DNS record for this subdomain
          const { data: records } = await supabase
            .from("dns_records")
            .select("type, content")
            .eq("subdomain_id", subdomain.id)
            .eq("status", "active");

          const routingRecord = records?.find((r) => r.type === "CNAME" || r.type === "A");

          if (routingRecord && routingRecord.content) {
            let target = routingRecord.content.trim();
            if (!target.startsWith("http://") && !target.startsWith("https://")) {
              target = `https://${target}`;
            }

            const targetUrl = new URL(target);
            targetUrl.pathname = request.nextUrl.pathname;
            targetUrl.search = request.nextUrl.search;

            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("host", targetUrl.host);

            return NextResponse.rewrite(targetUrl, {
              request: {
                headers: requestHeaders,
              },
            });
          }
        }
      } catch (e) {
        console.error("[Subdomain Proxy Error]", e);
      }
    }
  }

  // Refresh the session - important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users trying to access protected routes
  const protectedPaths = ["/dashboard", "/admin"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect admin paths if user is not admin
  if (request.nextUrl.pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
