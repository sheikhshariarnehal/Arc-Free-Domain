import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { getFullDomain } from "@/lib/utils";

// This route is only ever reached via an internal middleware rewrite for
// *.arc.bd hosts (see src/lib/supabase/middleware.ts). It is not linked from
// anywhere and is excluded from robots.txt. Always render dynamically so a
// response for one subdomain can never be cached and served for another.
export const dynamic = "force-dynamic";

interface SubdomainStatusPageProps {
  searchParams: Promise<{ slug?: string; status?: string }>;
}

export default async function SubdomainStatusPage({
  searchParams,
}: SubdomainStatusPageProps) {
  const { slug, status } = await searchParams;

  if (!slug || status !== "pending") {
    // Covers status=not_found and any malformed/unexpected input.
    notFound();
  }

  const fullDomain = getFullDomain(slug);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 text-center gap-5">
      <Link href="https://arc.bd" className="flex items-center gap-2.5 mb-2">
        <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
          <Image src="/ARC.webp" alt="ARC.BD Logo" width={32} height={32} className="size-7 object-contain" />
        </div>
        <span className="font-extrabold text-lg tracking-tight">
          ARC<span className="text-blue-400 font-mono">.BD</span>
        </span>
      </Link>

      <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Clock className="size-7 text-primary" />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">
        {fullDomain} is reserved
      </h1>
      <p className="text-muted-foreground max-w-md text-sm">
        This subdomain has already been claimed, but its owner hasn&apos;t
        pointed it anywhere yet. Check back soon.
      </p>

      <Link
        href="https://arc.bd"
        className="text-sm text-primary underline underline-offset-4"
      >
        Get your own free .arc.bd subdomain
      </Link>
    </main>
  );
}
