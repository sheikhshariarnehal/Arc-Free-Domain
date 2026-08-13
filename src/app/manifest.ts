import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ARC.BD — Free Subdomain Platform',
    short_name: 'ARC.BD',
    description: 'Free .arc.bd subdomains for developers with instant Cloudflare DNS management.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/arc.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/arc.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
