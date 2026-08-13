import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://arc.bd"),
  title: {
    default: "ARC.BD — Free Subdomain Platform for Developers",
    template: "%s | ARC.BD",
  },
  description:
    "Claim your free .arc.bd subdomain in seconds with automated Cloudflare DNS. Connect directly to Vercel, Netlify, GitHub Pages, or any VPS.",
  keywords: [
    "arc.bd",
    "free subdomain",
    "free domain bangladesh",
    "developer subdomains",
    "free dns",
    "vercel custom domain",
    "github pages free domain",
    "cloudflare dns",
  ],
  authors: [{ name: "ARC.BD Team", url: "https://arc.bd" }],
  creator: "ARC.BD",
  publisher: "ARC.BD",
  applicationName: "ARC.BD",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://arc.bd",
    siteName: "ARC.BD",
    title: "ARC.BD — Free Subdomain Platform for Developers",
    description:
      "Claim your free .arc.bd subdomain in seconds with automated Cloudflare DNS. Connect directly to Vercel, Netlify, GitHub Pages, or any VPS.",
    images: [
      {
        url: "/arc.png",
        width: 512,
        height: 512,
        alt: "ARC.BD Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ARC.BD — Free Subdomain Platform for Developers",
    description:
      "Claim your free .arc.bd subdomain with instant Cloudflare DNS. Connect to Vercel, Netlify, GitHub Pages, or any VPS.",
    images: ["/arc.png"],
  },
  icons: {
    icon: "/arc.png",
    shortcut: "/arc.png",
    apple: "/arc.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://arc.bd/#organization",
      "name": "ARC.BD",
      "url": "https://arc.bd",
      "logo": "https://arc.bd/arc.png",
      "description": "Free .arc.bd subdomains for developers and creators with automated Cloudflare DNS management.",
      "sameAs": ["https://github.com/sheikhshariarnehal/Arc-Free-Domain"]
    },
    {
      "@type": "WebSite",
      "@id": "https://arc.bd/#website",
      "url": "https://arc.bd",
      "name": "ARC.BD",
      "description": "Free .arc.bd subdomain registration and instant DNS management.",
      "publisher": {
        "@id": "https://arc.bd/#organization"
      }
    },
    {
      "@type": "WebApplication",
      "@id": "https://arc.bd/#webapp",
      "name": "ARC.BD Subdomain Provisioner",
      "url": "https://arc.bd",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
