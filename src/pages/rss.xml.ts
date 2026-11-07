import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { getPosts, postPath } from '../lib/posts';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  return rss({
    title: `${site.name}: writing`,
    description: `Notes on Android engineering, payments and building a career in tech, by ${site.name}.`,
    site: site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postPath(p),
      categories: p.data.tags,
      author: `${site.email} (${site.name})`,
    })),
    customData: '<language>en-in</language>',
  });
};
