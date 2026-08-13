import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getPublicOrigin(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || "https";

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`;
  }

  if (process.env.NODE_ENV === "development") {
    return `http://${host || "localhost:3000"}`;
  }

  return "https://arc.bd";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard/domains";
  const claimName = requestUrl.searchParams.get("claim");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const origin = getPublicOrigin(request);

  // Sanitize destination to ensure redirects stay strictly on relative path routes
  let targetPath = "/dashboard/domains";
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    targetPath = next;
  }

  if (claimName) {
    const destination = new URL("/dashboard/domains", origin);
    destination.searchParams.set("claim", claimName);
    return NextResponse.redirect(destination);
  }

  return NextResponse.redirect(new URL(targetPath, origin));
}
