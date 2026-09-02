create table if not exists public.email_signatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled signature',
  template_id text not null default 'minimal',
  contact_details jsonb not null default '{}'::jsonb,
  visible_fields jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  branding jsonb not null default '{}'::jsonb,
  cta_settings jsonb not null default '{}'::jsonb,
  profile_image_url text,
  company_logo_url text,
  linked_business_card_id uuid references public.cards(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_signatures_user_id_idx on public.email_signatures using btree (user_id);
create index if not exists email_signatures_updated_at_idx on public.email_signatures using btree (user_id, updated_at desc);

alter table public.email_signatures enable row level security;

drop policy if exists "Owners can view their email signatures" on public.email_signatures;
create policy "Owners can view their email signatures" on public.email_signatures
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Owners can create email signatures" on public.email_signatures;
create policy "Owners can create email signatures" on public.email_signatures
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update email signatures" on public.email_signatures;
create policy "Owners can update email signatures" on public.email_signatures
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete email signatures" on public.email_signatures;
create policy "Owners can delete email signatures" on public.email_signatures
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.email_signatures to authenticated;
