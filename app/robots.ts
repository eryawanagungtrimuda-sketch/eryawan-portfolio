import type { MetadataRoute } from 'next';

const baseUrl = 'https://eryawanagung.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/karya', '/karya/', '/wawasan', '/wawasan/', '/blog', '/blog/'],
      disallow: ['/admin', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
