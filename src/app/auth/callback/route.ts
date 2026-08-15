import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

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
    const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code);

    // Send a welcome email for brand-new OAuth sign-ups (Google, GitHub).
    // Detection: created_at within the last 60 seconds means this is the first
    // time this user has authenticated (not a returning login).
    const user = sessionData?.user;
    if (user?.email && user.created_at) {
      const createdAt = new Date(user.created_at).getTime();
      const isNewUser = Date.now() - createdAt < 60_000;

      if (isNewUser) {
        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split("@")[0];

        // Fire-and-forget — don't block the redirect on email delivery
        sendWelcomeEmail({ to: user.email, userName }).catch((err) =>
          console.error("[OAuth Welcome Email Error]", err)
        );
      }
    }
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
