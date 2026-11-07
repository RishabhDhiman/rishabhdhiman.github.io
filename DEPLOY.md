# Deploy + SEO launch checklist

Stack: Astro (static HTML, ~zero JS) → **GitHub Pages** from the
`RishabhDhiman/rishabhdhiman.github.io` repo. Every push to `main` runs
`.github/workflows/deploy.yml`, which builds and publishes the site.

Canonical host is **https://rishabhdhiman.com**. Once the custom domain is set,
GitHub automatically redirects `rishabhdhiman.github.io` → `rishabhdhiman.com`.
`rishabhdhiman.in` and `www.*` also redirect to it.

## 0. Before going live

- [x] Content filled from the resume (Nov 2026).
- [x] Headshot added (`node scripts/make-headshot.mjs "<photo>"` to redo it).
- [ ] Review the drafts in `src/content/writing/` and publish at least one (`draft: false`).
- [ ] After changing the name, title or a post title: `npm run og`, then commit the new images.

## 1. DNS for rishabhdhiman.com (at Cloudflare or your registrar)

Cloudflare is recommended because it also handles the `.in` redirect for free.
Add the domain to Cloudflare (Free plan) and switch the registrar's nameservers
to Cloudflare's. Then add these records with the proxy set to **DNS only (grey cloud)**.
GitHub needs to see its own IPs to issue the HTTPS certificate.

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

## 2. Connect the domain in GitHub

1. **Verify the domain first** (stops anyone else from claiming it on Pages):
   GitHub → your avatar → **Settings → Pages → Add a domain** → `rishabhdhiman.com` → add the TXT record it shows → **Verify**.
2. Repo **rishabhdhiman.github.io → Settings → Pages**:
   - Source: **GitHub Actions** (already switched)
   - Custom domain: `rishabhdhiman.com` → **Save**. Wait for the DNS check to pass.
   - Tick **Enforce HTTPS** once it becomes available (can take up to an hour).

> Set the custom domain only **after** the DNS records exist. Otherwise
> rishabhdhiman.github.io starts redirecting to a domain that doesn't resolve yet.

## 3. Redirect rishabhdhiman.in → rishabhdhiman.com

In Cloudflare, on the **rishabhdhiman.in** zone:

1. DNS → add `A @ 192.0.2.1` and `A www 192.0.2.1`, both **Proxied** (orange cloud). The IP is a placeholder; Cloudflare answers before it is used.
2. **Rules → Redirect Rules → Create rule**:
   - When: Hostname *is in* `rishabhdhiman.in`, `www.rishabhdhiman.in`
   - Then: Dynamic → `concat("https://rishabhdhiman.com", http.request.uri.path)`, status **301**, preserve query string ✅
3. SSL/TLS → **Always Use HTTPS** on.

GitHub Pages already redirects `www.rishabhdhiman.com` → `rishabhdhiman.com` because of the `www` CNAME.

Check: `curl -sI https://rishabhdhiman.in/projects/nike-india-android-app/` should return `301` with
`location: https://rishabhdhiman.com/projects/nike-india-android-app/`.

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
