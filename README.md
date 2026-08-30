# Al-Izdehar Logistics — Corporate Website

A premium, fully dynamic, bilingual (Arabic/English), SEO-first corporate website and
CMS platform for **Al-Izdehar Logistics** (founded 1982, customs clearance & integrated
logistics).

Built with **Next.js 16 (App Router, React 19) + TypeScript + Tailwind CSS v4 + Supabase**.

---

## Features

- **Bilingual & RTL-aware** — `/en` and `/ar` routes, automatic locale detection from the
  browser, `dir="rtl"` for Arabic, per-language SEO, `hreflang`, canonical URLs.
- **CMS-driven** — every heading, paragraph, image, button, service, page, section, menu,
  social link and SEO field is editable from Supabase (and the `/admin` dashboard), with a
  bundled seed fallback so the site renders fully even before the database is connected.
- **5 service pages** with real content from the source document (Sea, Land, Air, Customs
  Clearance, Integrated Logistics), each with its own SEO, FAQ schema, related services.
- **Section builder** — pages (Home, About, …) are ordered lists of sections
  (hero, services, features, timeline, process, statistics, FAQ, CTA, …).
- **SEO infrastructure** — sitemap.xml, robots.txt, JSON-LD (Organization, WebSite, Service,
  FAQPage, BreadcrumbList, BlogPosting), per-page meta/OG/Twitter, canonical + hreflang.
- **Lead capture** — Request a Quote, Contact and Newsletter forms stored to Supabase.
- **Admin dashboard** — auth via Supabase Auth, module navigation, ready for content managers.

---

## Tech stack

| Layer      | Choice                                          |
|------------|-------------------------------------------------|
| Framework  | Next.js 16 (App Router, Turbopack)              |
| Language   | TypeScript                                      |
| UI         | React 19, Tailwind CSS v4 (design tokens)       |
| Fonts      | Inter (Latin) + Cairo (Arabic)                  |
| Data/Auth  | Supabase (Postgres, Auth, Storage)              |
| Icons      | lucide-react + inline brand SVG icons           |

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/en` or `/ar` based on your browser.

### Environment variables (`.env.local`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical site URL (no trailing slash) |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | no | `en` (default) or `ar` |
| `NEXT_PUBLIC_SUPABASE_URL` | for CMS | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for CMS | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | for admin/seed | Supabase service-role key (server only) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | optional | Google Analytics 4 |
| `NEXT_PUBLIC_GTM_ID` | optional | Google Tag Manager |

> The site runs **without** Supabase using bundled seed content. Connect Supabase to make
> everything CMS-editable.

---

## Supabase setup

1. Create a project at https://supabase.com (or use an existing one).
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Copy the project **URL**, **anon key** and **service_role key** into `.env.local`.
4. (Optional) Push the bundled content into the database:

   ```bash
   npm run seed
   ```

Once connected, the site reads content from Supabase; edit rows (or use `/admin`) and the
changes appear immediately.

### Admin login

1. In Supabase **Authentication → Users**, create a user (email + password).
2. Visit `/admin`, sign in with those credentials.

> Phone, email, address and social URLs are intentionally empty in the seed (they are not in
> the source document). Set them under **Settings → General** in the admin or directly in the
> `settings` table. The UI hides empty contact details gracefully.

---

## Project structure

```
src/
  proxy.ts                    # locale detection & redirect (Next 16 "middleware")
  app/
    [lang]/                   # public site (root layout: html/body, header, footer)
      page.tsx                # home
      about/ services/ blog/ careers/ contact/ quote/ privacy/ terms/
      not-found.tsx
    admin/                    # admin dashboard (own root layout)
    api/                      # quote, contact, newsletter route handlers
    sitemap.ts robots.ts manifest.ts
  components/
    layout/ sections/ forms/  # header, footer, sections, forms, icons
  lib/
    i18n/ content.ts seo.ts   # localization, data layer, SEO helpers
    supabase/                 # browser/server/admin clients
  content/                    # bundled seed content (source: AI-Izdehar Website.docx)
  types/                      # shared domain types
supabase/schema.sql           # database schema + RLS + storage
scripts/seed.ts               # seed script (npm run seed)
```

### How content flows

`src/lib/content.ts` is the single data-access layer. Every query first tries Supabase
(`isSupabaseConfigured()`) and falls back to the bundled seed in `src/content/`. Components
never hardcode content — they read through this layer, so switching the data source (or
extending the admin) never touches the UI.

---

## SEO

- Clean localized URLs (`/en/services/sea-freight`, `/ar/services/...`).
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest`.
- `hreflang` + canonical on every page.
- Structured data via JSON-LD (Organization, WebSite, Service, FAQPage, BreadcrumbList,
  BlogPosting).
- Per-service and per-page SEO fields (title, description, focus keyword, OG/Twitter,
  canonical, `noindex`).

---

## Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Al-Izdehar Logistics corporate website"
git branch -M main
git remote add origin https://github.com/<your-user>/al-izdehar-logistics.git
git push -u origin main
```

> `.env.local` is git-ignored — never commit secrets. Use `.env.example` as the template.

### 2. Deploy to Hostinger

**Option A — Hostinger VPS (recommended for Next.js):**

```bash
# on the VPS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs nginx
git clone https://github.com/<your-user>/al-izdehar-logistics.git
cd al-izdehar-logistics
cp .env.example .env.local   # fill production values (NEXT_PUBLIC_SITE_URL = your domain)
npm ci
npm run build
npm install -g pm2
pm2 start npm --name izdehar -- start
pm2 save && pm2 startup
```

Nginx reverse proxy to `http://localhost:3000`:

```nginx
server {
  listen 80;
  server_name your-domain.com www.your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Then enable HTTPS (Let's Encrypt / Certbot) and point your domain to the VPS.

**Option B — Hostinger Node.js shared hosting:** upload the built app or use their Node.js
deployment, set `NEXT_PUBLIC_SITE_URL` to your domain, and run `npm run build && npm start`.

### 3. Point Supabase to production

Set the same Supabase env vars in the production `.env.local`, run `supabase/schema.sql`
against the production project (or use the same project), and optionally `npm run seed`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run seed` | Push bundled content into Supabase |

---

## Notes & scope

- The public site and the CMS data model are complete. Content managers for each table
  (Pages, Services, Blog, Leads, Media, Settings, …) are scaffolded in `/admin` and can be
  built out incrementally — the public site is already fully CMS-driven.
- No invented facts, figures, clients, testimonials, locations or awards are included. All
  content is from the provided source document and remains editable from the CMS.
