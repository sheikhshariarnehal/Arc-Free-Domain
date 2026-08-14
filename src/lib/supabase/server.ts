import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-anon-key";

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackKey;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

export async function createAdminClient() {
  const cookieStore = await cookies();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isKeyValid =
    serviceRoleKey &&
    serviceRoleKey !== "your_supabase_service_role_key" &&
    serviceRoleKey.trim().length > 0;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const keyToUse = isKeyValid
    ? serviceRoleKey
    : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackKey);

  return createServerClient(url, keyToUse, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  );
}
