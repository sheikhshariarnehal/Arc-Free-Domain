import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { SearchX } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  const headerList = await headers();
  const rootDomain = (process.env.NEXT_PUBLIC_DOMAIN || "arc.bd").toLowerCase();
  const host = (headerList.get("x-forwarded-host") || headerList.get("host") || "")
    .toLowerCase()
    .split(":")[0];

  const isUnclaimedSubdomain = host.endsWith(`.${rootDomain}`) && host !== `www.${rootDomain}`;

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

      <div className="size-14 rounded-full bg-muted flex items-center justify-center">
        <SearchX className="size-7 text-muted-foreground" />
      </div>

      {isUnclaimedSubdomain ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">
            {host} doesn&apos;t exist
          </h1>
          <p className="text-muted-foreground max-w-md text-sm">
            No one has claimed this subdomain yet. If it&apos;s yours, claim it
            in seconds &mdash; it&apos;s free.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">
            404 &mdash; Page not found
          </h1>
          <p className="text-muted-foreground max-w-md text-sm">
            The page you&apos;re looking for doesn&apos;t exist or may have
            been moved.
          </p>
        </>
      )}

      <Link
        href="https://arc.bd"
        className="text-sm text-primary underline underline-offset-4"
      >
        Go to arc.bd
      </Link>
    </main>
  );
}
