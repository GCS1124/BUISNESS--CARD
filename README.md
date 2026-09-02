# Cardly

Cardly is a responsive digital business card builder with a live phone preview, field library, design presets, public card routes, QR sharing, vCard export, optional Supabase persistence, email signatures, and event lead capture.

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

## Event lead capture

Event Lead Capture is a separate product workspace for event campaigns, team roles, QR/vCard parsing, manual lead capture, badge and business-card image review, public attendee forms, qualification, offline-safe storage, lead exports, analytics, reports, and CRM integration setup.

Apply [`supabase/migrations/202609020002_event_lead_capture.sql`](./supabase/migrations/202609020002_event_lead_capture.sql) after the Cardly schema when Supabase persistence is enabled. The event workspace remains usable in local demo mode with IndexedDB and falls back to local storage when needed. OCR, transcription, and CRM sync are exposed as explicit service/integration points and are not simulated.

## Available routes

- `/` — dashboard
- `/builder/:cardId` — authenticated card builder
- `/card/:slug` — public, login-free card page
- `/branding` — authenticated white-label configuration
- `/event-lead-capture` — authenticated event lead capture dashboard
- `/events/new` — create an event campaign
- `/events/:eventId/:view` — event editor, capture, leads, analytics, report, or integrations
- `/events/:publicSlug/connect` — public, login-free attendee connection form

## Verification

```bash
npm run lint
npm run build
```
