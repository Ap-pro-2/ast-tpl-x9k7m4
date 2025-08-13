import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: string) => `User-agent: *
Allow: /

# Block API endpoints from being indexed
Disallow: /api/

Sitemap: ${sitemapURL}
`;

export const GET: APIRoute = ({ site, url }) => {
  // Use the actual request URL if site is not properly configured
  const baseURL = site || url.origin;
  const sitemapURL = new URL('sitemap-index.xml', baseURL).href;
  
  return new Response(getRobotsTxt(sitemapURL), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

