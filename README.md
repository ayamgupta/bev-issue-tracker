# BEV Owners Issue Tracker

An independent, community-run issue tracker and analytics dashboard for Mahindra BE 6, XEV 9e and XEV 9S owners. Not affiliated with Mahindra & Mahindra Ltd.

Owners can log issues (major/minor), rate hardware, software, service and overall ownership satisfaction, and browse public analytics on the most common problems. Registration number, name and phone number are optional, never shown publicly, and are only used server-side to catch duplicate/fake submissions.

## Architecture

- **Frontend** — React + Vite + TypeScript + Tailwind v4, deployed as a static site to GitHub Pages via `.github/workflows/deploy.yml`.
- **Backend** — [Supabase](https://supabase.com) free tier (Postgres). See `supabase/migrations/0001_init.sql` for the schema.
- **Writes** go through a single Supabase Edge Function (`supabase/functions/submit-report`), never directly from the browser. It verifies a Cloudflare Turnstile token, rate-limits by hashed IP, flags likely duplicate registration numbers, and only then inserts using the service-role key. The browser's anon key has **no insert/update/delete grants at all** — it can only read the public, non-PII `reports` table and the `analytics_*` views.
- **PII isolation** — registration number, owner name and contact number live in `report_private`, a table with row-level security enabled and zero grants for anon/authenticated roles. It's structurally unreachable from the public REST/GraphQL API; only the service role (used inside the Edge Function, or an admin script) can read it.

## One-time setup

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`.
3. (Optional) Enable `pg_cron` and schedule `select public.auto_verify_reports();` to run daily, so reports auto-promote from `pending` to `verified` after 14 days without being flagged.
4. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then from the repo root:
   ```
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase functions deploy submit-report
   ```
5. Set the Edge Function secrets (never put these in the frontend `.env`):
   ```
   supabase secrets set TURNSTILE_SECRET_KEY=<from Cloudflare Turnstile dashboard>
   supabase secrets set IP_HASH_PEPPER=$(openssl rand -hex 32)
   supabase secrets set REG_HASH_PEPPER=$(openssl rand -hex 32)
   ```

### 2. Create a Cloudflare Turnstile widget

Create a widget at the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile). You'll get a **site key** (public, goes in the frontend env) and a **secret key** (goes only in the Supabase Edge Function secrets above).

### 3. Configure frontend environment variables

Copy `.env.example` to `.env.local` for local dev:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

### 4. Configure GitHub Pages deployment

1. Push this repo to GitHub.
2. In repo Settings → Pages, set the source to "GitHub Actions".
3. In repo Settings → Secrets and variables → Actions, add repository secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`.
4. Push to `main` — `.github/workflows/deploy.yml` builds and deploys to `https://<your-username>.github.io/<repo-name>/`.

### 5. Add product images

Drop official Mahindra BE 6 / XEV 9e / XEV 9S photos into `public/images/` — see `public/images/README.md` for exact filenames. Until then, the site shows clean gradient placeholders instead of broken images.

## Local development

```
npm install
npm run dev
```

## Moderation

Reports start as `pending` and are visible in analytics immediately (this is a "publish, then verify" model, not "hold for review", so the dashboard stays fresh). A report is auto-promoted to `verified` after 14 days if untouched. To hide a fake/duplicate entry, update its `status` to `flagged` or `removed` directly in the Supabase table editor — both are excluded from the public views.

## Anti-spam measures

- Cloudflare Turnstile on every submission (server-verified, not just client-side).
- Rate limit: one submission per hashed IP per 6 hours.
- Optional registration number is hashed (with a server-side pepper) and checked against prior submissions; matches are flagged `duplicate_suspected` for moderator review rather than silently blocked, since shared/company vehicles can legitimately have repeat owners reporting.
