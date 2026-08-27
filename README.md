# Cardly

Cardly is a responsive digital business card builder with a live phone preview, field library, design presets, public card routes, QR sharing, vCard export, and optional Supabase persistence.

## Run locally

```bash
npm install
npm run dev
```

Without environment variables, the app runs in local demo mode and stores cards in `localStorage`. To enable Supabase Auth, PostgreSQL persistence, public cards, and Storage uploads, copy `.env.example` to `.env.local` and set:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

Apply [`supabase/migrations/202608270001_cardly_schema.sql`](./supabase/migrations/202608270001_cardly_schema.sql) in the Supabase SQL editor or through your migration workflow. Configure email/password auth and your local/production redirect URLs in Supabase Auth settings.

## Available routes

- `/` — dashboard
- `/builder/:cardId` — authenticated card builder
- `/card/:slug` — public, login-free card page

## Verification

```bash
npm run lint
npm run build
```
