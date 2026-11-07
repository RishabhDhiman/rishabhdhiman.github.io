// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// While every post is still a draft, /writing/ is an empty, noindexed page;
// keep it out of the sitemap so Search Console doesn't flag the mismatch.
const postsDir = './src/content/writing';
const hasPublishedPosts = readdirSync(postsDir).some(
  (f) => f.endsWith('.md') && !/^draft:\s*true/m.test(readFileSync(`${postsDir}/${f}`, 'utf8')),
);

// rishabhdhiman.com is the single canonical host (served by GitHub Pages). rishabhdhiman.in and
// www.* are 301-redirected to it at the Cloudflare edge (see DEPLOY.md), so
// every URL Google sees resolves to exactly one address.
export default defineConfig({
  site: 'https://rishabhdhiman.com',
  // GitHub Pages serves /foo/index.html at /foo/ and redirects /foo -> /foo/.
  // Matching that here keeps canonical URLs, sitemap entries and internal
  // links identical to the URL that actually returns 200.
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && (hasPublishedPosts || !page.endsWith('/writing/')),
      changefreq: 'monthly',
      lastmod: new Date(),
    }),
  ],
});
