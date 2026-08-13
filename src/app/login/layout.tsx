import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In or Create an Account",
  description:
    "Log in or register to claim and manage your free .arc.bd subdomains with full DNS record control.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
