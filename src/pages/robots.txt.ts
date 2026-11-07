import type { APIRoute } from 'astro';

// Open to every crawler, including AI search engines (ChatGPT search,
// Perplexity, Google AI Overviews). For a personal portfolio, being cited by
// them is free reach; there is nothing here to protect.
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', site).href}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
