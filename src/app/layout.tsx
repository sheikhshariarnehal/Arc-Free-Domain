import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARC.BD | Free Subdomain Platform",
  description: "Free .arc.bd subdomains with instant Cloudflare DNS. Connect your project to Vercel, Netlify, GitHub Pages, or any server.",
  keywords: ["arc.bd", "free subdomain", "bangladesh domain", "developer tools"],
  icons: {
    icon: "/arc.png",
    shortcut: "/arc.png",
    apple: "/arc.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
