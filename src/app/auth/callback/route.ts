import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard/domains";
  const claimName = requestUrl.searchParams.get("claim");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // If a domain claim was pending before OAuth, attempt it now that the
    // user session is established (server-side, so cookies are available).
    if (claimName) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Call the claim API internally using the base URL
          const claimUrl = new URL("/api/subdomains/claim", requestUrl.origin);
          await fetch(claimUrl.toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Forward the cookies so the API route sees the session
              Cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({ name: claimName }),
          });
        }
      } catch (e) {
        // Non-fatal: user still lands on dashboard, can claim manually
        console.error("[auth/callback] auto-claim failed:", e);
      }
    }
  }

  // Redirect to dashboard/domains so the claimed domain shows up immediately
  const destination = claimName ? "/dashboard/domains" : next;
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
