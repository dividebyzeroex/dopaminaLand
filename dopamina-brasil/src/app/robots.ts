import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/rastreamento/'],
      },
    ],
    sitemap: 'https://dopaminado.com.br/sitemap.xml',
  };
}
