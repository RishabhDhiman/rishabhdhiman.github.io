# Deploy + SEO launch checklist

Stack: Astro (static HTML, ~zero JS) → **GitHub Pages** from the
`RishabhDhiman/rishabhdhiman.github.io` repo. Every push to `main` runs
`.github/workflows/deploy.yml`, which builds and publishes the site.

Canonical host is **https://rishabhdhiman.com**. Once the custom domain is set,
GitHub automatically redirects `rishabhdhiman.github.io` → `rishabhdhiman.com`.
`rishabhdhiman.in` and `www.*` also redirect to it. Both domains are at **GoDaddy** (expire 2027-10-22, keep auto-renew on).

## 0. Before going live

- [x] Content filled from the resume (Nov 2026).
- [x] Headshot added (`node scripts/make-headshot.mjs "<photo>"` to redo it).
- [ ] Review the drafts in `src/content/writing/` and publish at least one (`draft: false`).
- [ ] After changing the name, title or a post title: `npm run og`, then commit the new images.

## 1. Verify the domain on GitHub (do this first)

Stops anyone else from claiming rishabhdhiman.com on GitHub Pages.

1. https://github.com/settings/pages → **Add a domain** → `rishabhdhiman.com` → **Add domain**.
2. GitHub shows a TXT record (name like `_github-pages-challenge-RishabhDhiman`, plus a code).
3. In GoDaddy (step 2 screen) → **Add New Record** → Type **TXT**, Name = that name (without `.rishabhdhiman.com`), Value = the code → Save.
4. Back on GitHub → **Verify** (can take a few minutes).

## 2. DNS for rishabhdhiman.com (GoDaddy)

Both domains are registered at GoDaddy and use GoDaddy DNS, so everything happens there.

GoDaddy → **My Products** → rishabhdhiman.com → **DNS** (Manage DNS).

1. If the domain has **Forwarding** turned on (Forwarding tab), delete it.
2. **Delete** the existing `A  @` record (it points to GoDaddy parking, e.g. `Parked` / 3.33.130.190).
3. Add these records (TTL: 1 hour is fine):

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | rishabhdhiman.github.io |

The `www` CNAME usually already exists pointing to `@`. **Edit** it to `rishabhdhiman.github.io` instead of adding a second one.
Leave NS, SOA and any MX/TXT (email) records alone.

Check: `nslookup rishabhdhiman.com 1.1.1.1` should list the four 185.199.x.153 addresses.

## 3. Connect the domain in GitHub

Repo **rishabhdhiman.github.io → Settings → Pages**:
- Source: **GitHub Actions** (already switched)
- Custom domain: `rishabhdhiman.com` → **Save**. Wait for the DNS check to pass.
- Tick **Enforce HTTPS** once it becomes available (certificate can take up to an hour).

> Set the custom domain only **after** step 2 resolves. Otherwise
> rishabhdhiman.github.io starts redirecting to a domain that doesn't resolve yet.

After this, `rishabhdhiman.github.io` and `www.rishabhdhiman.com` both redirect to `https://rishabhdhiman.com`.

## 3b. Redirect rishabhdhiman.in → rishabhdhiman.com (GoDaddy)

GoDaddy → **My Products** → rishabhdhiman.in → **DNS** → **Forwarding** tab → **Add Forwarding** (Domain):
- Destination: `https` :// `rishabhdhiman.com`
- Forward type: **Permanent (301)**
- Settings: **Forward only** (not "Forward with masking", which hides the URL and hurts SEO)
- Keep "Update my nameservers and DNS settings to support this change" ticked → **Save**.

Check: `curl -sI http://rishabhdhiman.in` should return `301` with `location: https://rishabhdhiman.com`.
(GoDaddy forwarding is HTTP-only for the `.in` itself. That's fine because the domain never had content.
If you later want `https://rishabhdhiman.in` with paths preserved, move its DNS to Cloudflare and use a Redirect Rule.)

## 4. Google Search Console

1. https://search.google.com/search-console → **Add property → Domain** → `rishabhdhiman.com`. Add the TXT record in DNS.
2. **Sitemaps** → submit `sitemap-index.xml`.
3. **URL inspection** → `https://rishabhdhiman.com/` → **Request indexing**. Repeat for each case study and published post.
4. Add `rishabhdhiman.in` as a Domain property too, to confirm it redirects cleanly.

## 5. Bing (also feeds ChatGPT search, DuckDuckGo, Yahoo)

https://www.bing.com/webmasters → **Import from Google Search Console**. Done.

## 6. Validate

- Rich Results Test: https://search.google.com/test/rich-results (expect *Profile page* + *Breadcrumbs*)
- Schema validator: https://validator.schema.org
- PageSpeed Insights: https://pagespeed.web.dev
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector (refreshes the share card cache)

## 7. Off-site signals (the biggest lever for ranking #1 on your name)

Google ranks a personal site for a name when many trusted profiles point to it
with the same name, photo and title. Put `https://rishabhdhiman.com` in:

- [ ] GitHub profile → *Website* (and the profile README)
- [ ] LinkedIn → *Contact info → Website* and the *Featured* section
- [ ] Instagram bio
- [ ] Stack Overflow, Medium, dev.to, Hashnode profiles
- [ ] Any conference/meetup speaker pages

Use the same photo and the same "Senior Android Engineer" title everywhere, and
list each profile in `profiles` in `src/data/site.ts` so the JSON-LD `sameAs` matches.

## Updating the resume

Replace `public/rishabh-dhiman-resume.pdf` and push. The site's Resume buttons point to it.
