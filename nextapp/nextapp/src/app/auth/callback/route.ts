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
  }

  // If a domain claim was pending, pass it to the dashboard page as a query
  // param. The dashboard handles the actual claim client-side once the session
  // cookies are fully established in the browser.
  if (claimName) {
    const destination = new URL("/dashboard/domains", requestUrl.origin);
    destination.searchParams.set("claim", claimName);
    return NextResponse.redirect(destination);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
