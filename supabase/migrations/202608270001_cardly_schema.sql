create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_name text not null default 'Untitled card',
  slug text not null unique,
  profile_image_url text,
  cover_image_url text,
  company_logo_url text,
  theme text not null default 'Professional',
  background_color text not null default '#ffffff',
  header_color text not null default '#cde7e0',
  accent_color text not null default '#165c51',
  text_color text not null default '#14221f',
  font_family text not null default 'Manrope',
  button_style text not null default 'solid',
  border_radius integer not null default 26,
  mode text not null default 'light',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.card_fields (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  field_type text not null,
  category text not null,
  label text not null default '',
  value text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  icon text not null default 'link',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cards_user_id_idx on public.cards using btree (user_id);
create index if not exists cards_slug_idx on public.cards using btree (slug);
create index if not exists card_fields_card_id_sort_idx on public.card_fields using btree (card_id, sort_order);

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.card_fields enable row level security;

drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Published cards are public" on public.cards;
create policy "Published cards are public" on public.cards
  for select to anon using (is_published = true);
drop policy if exists "Owners can view their cards" on public.cards;
create policy "Owners can view their cards" on public.cards
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Owners can create cards" on public.cards;
create policy "Owners can create cards" on public.cards
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Owners can update cards" on public.cards;
create policy "Owners can update cards" on public.cards
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Owners can delete cards" on public.cards;
create policy "Owners can delete cards" on public.cards
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Published card fields are public" on public.card_fields;
create policy "Published card fields are public" on public.card_fields
  for select to anon using (exists (select 1 from public.cards c where c.id = card_fields.card_id and c.is_published = true));
drop policy if exists "Owners can view card fields" on public.card_fields;
create policy "Owners can view card fields" on public.card_fields
  for select to authenticated using (exists (select 1 from public.cards c where c.id = card_fields.card_id and c.user_id = (select auth.uid())));
drop policy if exists "Owners can create card fields" on public.card_fields;
create policy "Owners can create card fields" on public.card_fields
  for insert to authenticated with check (exists (select 1 from public.cards c where c.id = card_fields.card_id and c.user_id = (select auth.uid())));
drop policy if exists "Owners can update card fields" on public.card_fields;
create policy "Owners can update card fields" on public.card_fields
  for update to authenticated using (exists (select 1 from public.cards c where c.id = card_fields.card_id and c.user_id = (select auth.uid()))) with check (exists (select 1 from public.cards c where c.id = card_fields.card_id and c.user_id = (select auth.uid())));
drop policy if exists "Owners can delete card fields" on public.card_fields;
create policy "Owners can delete card fields" on public.card_fields
  for delete to authenticated using (exists (select 1 from public.cards c where c.id = card_fields.card_id and c.user_id = (select auth.uid())));

grant select on public.cards to anon;
grant select, insert, update, delete on public.cards to authenticated;
grant select on public.card_fields to anon;
grant select, insert, update, delete on public.card_fields to authenticated;
grant select, insert, update on public.profiles to authenticated;

insert into storage.buckets (id, name, public)
values ('card-assets', 'card-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public card assets are readable" on storage.objects;
create policy "Public card assets are readable" on storage.objects
  for select to anon, authenticated using (bucket_id = 'card-assets');
drop policy if exists "Users can upload their card assets" on storage.objects;
create policy "Users can upload their card assets" on storage.objects
  for insert to authenticated with check (bucket_id = 'card-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users can update their card assets" on storage.objects;
create policy "Users can update their card assets" on storage.objects
  for update to authenticated using (bucket_id = 'card-assets' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'card-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users can delete their card assets" on storage.objects;
create policy "Users can delete their card assets" on storage.objects
  for delete to authenticated using (bucket_id = 'card-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
