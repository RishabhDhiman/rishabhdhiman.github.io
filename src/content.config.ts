import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts live in src/content/writing/*.md. `draft: true` posts show up in
// `npm run dev` so you can preview them, but are left out of the production
// build, sitemap and RSS until you flip the flag.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string().max(80),
    // Shown in Google results and share cards: aim for 140–160 characters.
    description: z.string().max(180),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
