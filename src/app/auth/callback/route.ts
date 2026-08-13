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

  // Sanitize destination to ensure redirects stay strictly on current origin
  let targetPath = "/dashboard/domains";
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    targetPath = next;
  }

  if (claimName) {
    const destination = new URL("/dashboard/domains", requestUrl.origin);
    destination.searchParams.set("claim", claimName);
    return NextResponse.redirect(destination);
  }

  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}
