# Cardly

Cardly is a responsive digital business card builder with a live phone preview, field library, design presets, public card routes, QR sharing, vCard export, and optional Supabase persistence.

## White-label branding

Open `/branding` from the signed-in workspace to configure the product name, short mark, tagline, public-link label, hosted logo, favicon, and interface colors. Changes are saved in the current browser and apply immediately to the workspace, authentication screen, builder, public card shell, and email-signature tools.

For deployment-wide defaults, set the optional Vite variables before building: `VITE_BRAND_NAME`, `VITE_BRAND_SHORT_NAME`, `VITE_BRAND_TAGLINE`, `VITE_BRAND_LOGO_URL`, `VITE_BRAND_FAVICON_URL`, `VITE_PUBLIC_DOMAIN`, `VITE_BRAND_PRIMARY_COLOR`, `VITE_BRAND_PRIMARY_DARK_COLOR`, `VITE_BRAND_ACCENT_COLOR`, `VITE_BRAND_SURFACE_COLOR`, and `VITE_SHOW_POWERED_BY=true`.

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
- `/branding` — authenticated white-label configuration

## Verification

```bash
npm run lint
npm run build
```
