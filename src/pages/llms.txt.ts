import type { APIRoute } from 'astro';
import { site, about, experience, projects } from '../data/site';

// llms.txt (llmstxt.org): a plain-text summary that LLM-based search tools can
// read without parsing HTML. Generated from the same data as the pages.
export const GET: APIRoute = () => {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.name} (also ${site.alternateNames.join(', ')}) is a ${site.jobTitle} based in India. ${site.tagline}`,
    '',
    ...about,
    '',
    '## Experience',
    ...experience.map((e) => `- ${e.role} at ${e.company}${e.url ? ` (${e.url})` : ''}`),
    '',
    '## Case studies',
    ...projects.map((p) => `- [${p.name}](${site.url}/projects/${p.slug}/): ${p.summary}`),
    '',
    '## Profiles',
    ...site.profiles.map((p) => `- [${p.label}](${p.url})`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
