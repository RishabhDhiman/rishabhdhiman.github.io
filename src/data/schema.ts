// schema.org JSON-LD builders. One Person entity with a stable @id is
// referenced from every page, so Google consolidates all signals onto a single
// "Rishabh Dhiman" entity (the thing that powers a Knowledge Panel).
import { site, awards, type Project } from './site';

export const personId = `${site.url}/#person`;
export const websiteId = `${site.url}/#website`;

export function person() {
  return {
    '@type': 'Person',
    '@id': personId,
    name: site.name,
    alternateName: site.alternateNames,
    givenName: site.givenName,
    familyName: site.familyName,
    url: `${site.url}/`,
    ...(site.photo ? { image: new URL(site.photo, site.url).href } : {}),
    jobTitle: site.jobTitle,
    description: site.tagline,
    ...(site.email ? { email: `mailto:${site.email}` } : {}),
    worksFor: { '@type': 'Organization', name: site.worksFor.name, url: site.worksFor.url },
    address: { '@type': 'PostalAddress', addressCountry: site.location.country },
    nationality: { '@type': 'Country', name: 'India' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: site.alumniOf.name, url: site.alumniOf.url },
    award: awards.map((a) => `${a.title}, ${a.org} (${a.year})`),
    knowsAbout: site.knowsAbout,
    sameAs: site.profiles.map((p) => p.url),
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: `${site.url}/`,
    name: site.name,
    alternateName: ['Rishabh Dhiman Portfolio', 'rishabhdhiman.com'],
    inLanguage: 'en-IN',
    publisher: { '@id': personId },
  };
}

export function homeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      website(),
      person(),
      {
        // ProfilePage is Google's dedicated rich-result type for "about a person" pages.
        '@type': 'ProfilePage',
        '@id': `${site.url}/#profilepage`,
        url: `${site.url}/`,
        name: `${site.name} · ${site.jobTitle}`,
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
        dateModified: new Date().toISOString(),
        inLanguage: 'en-IN',
      },
    ],
  };
}

export function projectGraph(p: Project, path: string) {
  const url = new URL(path, site.url).href;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        name: p.name,
        headline: `${p.name}: case study`,
        description: p.summary,
        url,
        author: { '@id': personId },
        creator: { '@id': personId },
        keywords: p.stack.join(', '),
        inLanguage: 'en-IN',
        isPartOf: { '@id': websiteId },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${site.url}/#work` },
          { '@type': 'ListItem', position: 3, name: p.name, item: url },
        ],
      },
      person(),
    ],
  };
}
