import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/subdomain-status'],
      },
    ],
    sitemap: 'https://arc.bd/sitemap.xml',
  };
}
