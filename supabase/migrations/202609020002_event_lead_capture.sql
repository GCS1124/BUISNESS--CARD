create schema if not exists private;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  event_type text not null default 'custom',
  location text not null default '',
  city text not null default '',
  country text not null default '',
  start_date date,
  end_date date,
  timezone text not null default 'UTC',
  budget numeric,
  revenue_goal numeric,
  actual_revenue numeric,
  lead_goal integer,
  campaign_name text not null default '',
  event_owner_id uuid references auth.users(id) on delete set null,
  event_owner_name text not null default '',
  event_owner_name text not null default '',
  booth_number text not null default '',
  event_website text not null default '',
  internal_notes text not null default '',
  status text not null default 'draft' check (status in ('draft', 'upcoming', 'active', 'completed', 'archived')),
  public_form_enabled boolean not null default false,
  public_slug text not null unique,
  consent_text text not null default 'I agree to share my contact information with this event team.',
  linked_card_id uuid references public.cards(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null default '',
  email text not null default '',
  role text not null default 'sales_rep' check (role in ('event_admin', 'sales_rep', 'marketing_rep', 'viewer')),
  unique(event_id, email)
);

create table if not exists public.event_tags (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  color text not null default '#2b8068',
  unique(event_id, name)
);

create table if not exists public.event_qualifiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  label text not null,
  type text not null default 'text' check (type in ('text', 'dropdown', 'multi_select', 'radio', 'checkbox', 'number')),
  options jsonb not null default '[]'::jsonb,
  required boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.event_leads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  organization_id uuid not null references auth.users(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete set null,
  captured_by_user_id uuid references auth.users(id) on delete set null,
  first_name text not null default '',
  last_name text not null default '',
  company text not null default '',
  job_title text not null default '',
  email text not null default '',
  phone text not null default '',
  website text not null default '',
  linkedin_url text not null default '',
  address text not null default '',
  capture_method text not null default 'manual' check (capture_method in ('qr', 'badge', 'business_card', 'manual', 'digital_business_card', 'event_form')),
  lead_temperature text not null default 'cold' check (lead_temperature in ('cold', 'warm', 'hot')),
  qualifier_answers jsonb not null default '{}'::jsonb,
  transcript text not null default '',
  summary text not null default '',
  next_steps text not null default '',
  sync_status text not null default 'not_connected' check (sync_status in ('not_connected', 'pending', 'synced', 'failed')),
  sync_error text not null default '',
  offline_status text not null default 'synced' check (offline_status in ('synced', 'pending', 'failed')),
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_lead_tags (
  lead_id uuid not null references public.event_leads(id) on delete cascade,
  tag_id uuid not null references public.event_tags(id) on delete cascade,
  primary key (lead_id, tag_id)
);

create table if not exists public.event_lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.event_leads(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.event_assets (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.event_leads(id) on delete cascade,
  kind text not null check (kind in ('voice_note', 'business_card_image', 'badge_image')),
  url text not null,
  name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.crm_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  status text not null default 'not_connected',
  settings jsonb not null default '{}'::jsonb,
  field_mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, provider)
);

create table if not exists public.crm_sync_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.event_leads(id) on delete set null,
  integration_id uuid references public.crm_integrations(id) on delete set null,
  status text not null,
  message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists events_organization_id_idx on public.events using btree (organization_id);
create index if not exists events_dates_idx on public.events using btree (start_date, end_date);
create index if not exists events_public_slug_idx on public.events using btree (public_slug);
create index if not exists event_members_event_id_idx on public.event_members using btree (event_id);
create index if not exists event_tags_event_id_idx on public.event_tags using btree (event_id);
create index if not exists event_qualifiers_event_id_idx on public.event_qualifiers using btree (event_id, sort_order);
create index if not exists event_leads_event_id_captured_at_idx on public.event_leads using btree (event_id, captured_at desc);
create index if not exists event_leads_organization_id_idx on public.event_leads using btree (organization_id);
create index if not exists event_lead_notes_lead_id_idx on public.event_lead_notes using btree (lead_id, created_at desc);

create or replace function private.user_can_access_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event_id and (
      e.created_by = (select auth.uid())
      or exists (select 1 from public.event_members m where m.event_id = e.id and m.user_id = (select auth.uid()))
    )
  );
$$;

create or replace function private.user_can_manage_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event_id and (
      e.created_by = (select auth.uid())
      or exists (select 1 from public.event_members m where m.event_id = e.id and m.user_id = (select auth.uid()) and m.role = 'event_admin')
    )
  );
$$;

create or replace function private.user_can_access_lead(target_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.event_leads l
    where l.id = target_lead_id and private.user_can_access_event(l.event_id)
  );
$$;

alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.event_tags enable row level security;
alter table public.event_qualifiers enable row level security;
alter table public.event_leads enable row level security;
alter table public.event_lead_tags enable row level security;
alter table public.event_lead_notes enable row level security;
alter table public.event_assets enable row level security;
alter table public.crm_integrations enable row level security;
alter table public.crm_sync_logs enable row level security;

drop policy if exists "Event members can view accessible events" on public.events;
create policy "Event members can view accessible events" on public.events for select to authenticated using (private.user_can_access_event(id));
drop policy if exists "Public event forms are readable" on public.events;
create policy "Public event forms are readable" on public.events for select to anon using (public_form_enabled = true and status in ('upcoming', 'active'));
drop policy if exists "Users can create their own events" on public.events;
create policy "Users can create their own events" on public.events for insert to authenticated with check (created_by = (select auth.uid()) and organization_id = (select auth.uid()));
drop policy if exists "Event owners can update events" on public.events;
create policy "Event owners can update events" on public.events for update to authenticated using (private.user_can_manage_event(id)) with check (private.user_can_manage_event(id));
drop policy if exists "Event owners can delete events" on public.events;
create policy "Event owners can delete events" on public.events for delete to authenticated using (created_by = (select auth.uid()));

drop policy if exists "Members can view event members" on public.event_members;
create policy "Members can view event members" on public.event_members for select to authenticated using (private.user_can_access_event(event_id));
drop policy if exists "Managers can add event members" on public.event_members;
create policy "Managers can add event members" on public.event_members for insert to authenticated with check (private.user_can_manage_event(event_id));
drop policy if exists "Managers can update event members" on public.event_members;
create policy "Managers can update event members" on public.event_members for update to authenticated using (private.user_can_manage_event(event_id)) with check (private.user_can_manage_event(event_id));
drop policy if exists "Managers can remove event members" on public.event_members;
create policy "Managers can remove event members" on public.event_members for delete to authenticated using (private.user_can_manage_event(event_id));

drop policy if exists "Members can view event tags" on public.event_tags;
create policy "Members can view event tags" on public.event_tags for select to authenticated using (private.user_can_access_event(event_id));
drop policy if exists "Managers can create event tags" on public.event_tags;
create policy "Managers can create event tags" on public.event_tags for all to authenticated using (private.user_can_manage_event(event_id)) with check (private.user_can_manage_event(event_id));

drop policy if exists "Members can view event qualifiers" on public.event_qualifiers;
create policy "Members can view event qualifiers" on public.event_qualifiers for select to authenticated using (private.user_can_access_event(event_id));
drop policy if exists "Public forms can view event qualifiers" on public.event_qualifiers;
create policy "Public forms can view event qualifiers" on public.event_qualifiers for select to anon using (exists (select 1 from public.events e where e.id = event_qualifiers.event_id and e.public_form_enabled = true and e.status in ('upcoming', 'active')));
drop policy if exists "Managers can manage event qualifiers" on public.event_qualifiers;
create policy "Managers can manage event qualifiers" on public.event_qualifiers for all to authenticated using (private.user_can_manage_event(event_id)) with check (private.user_can_manage_event(event_id));

drop policy if exists "Members can view event leads" on public.event_leads;
create policy "Members can view event leads" on public.event_leads for select to authenticated using (private.user_can_access_event(event_id));
drop policy if exists "Members can create event leads" on public.event_leads;
create policy "Members can create event leads" on public.event_leads for insert to authenticated with check (private.user_can_access_event(event_id) and organization_id = (select e.organization_id from public.events e where e.id = event_id));
drop policy if exists "Public forms can create event leads" on public.event_leads;
create policy "Public forms can create event leads" on public.event_leads for insert to anon with check (exists (select 1 from public.events e where e.id = event_leads.event_id and e.organization_id = event_leads.organization_id and e.public_form_enabled = true and e.status in ('upcoming', 'active')));
drop policy if exists "Members can update event leads" on public.event_leads;
create policy "Members can update event leads" on public.event_leads for update to authenticated using (private.user_can_access_event(event_id)) with check (private.user_can_access_event(event_id));
drop policy if exists "Managers can delete event leads" on public.event_leads;
create policy "Managers can delete event leads" on public.event_leads for delete to authenticated using (private.user_can_manage_event(event_id));

drop policy if exists "Members can view lead tags" on public.event_lead_tags;
create policy "Members can view lead tags" on public.event_lead_tags for select to authenticated using (private.user_can_access_lead(lead_id));
drop policy if exists "Members can manage lead tags" on public.event_lead_tags;
create policy "Members can manage lead tags" on public.event_lead_tags for all to authenticated using (private.user_can_access_lead(lead_id)) with check (private.user_can_access_lead(lead_id));

drop policy if exists "Members can view lead notes" on public.event_lead_notes;
create policy "Members can view lead notes" on public.event_lead_notes for select to authenticated using (private.user_can_access_lead(lead_id));
drop policy if exists "Members can create lead notes" on public.event_lead_notes;
create policy "Members can create lead notes" on public.event_lead_notes for insert to authenticated with check (private.user_can_access_lead(lead_id) and created_by = (select auth.uid()));
drop policy if exists "Members can manage lead assets" on public.event_assets;
create policy "Members can manage lead assets" on public.event_assets for all to authenticated using (private.user_can_access_lead(lead_id)) with check (private.user_can_access_lead(lead_id));
drop policy if exists "Members can view lead assets" on public.event_assets;
create policy "Members can view lead assets" on public.event_assets for select to authenticated using (private.user_can_access_lead(lead_id));

drop policy if exists "Users can manage their CRM integrations" on public.crm_integrations;
create policy "Users can manage their CRM integrations" on public.crm_integrations for all to authenticated using (organization_id = (select auth.uid())) with check (organization_id = (select auth.uid()));
drop policy if exists "Users can view their CRM sync logs" on public.crm_sync_logs;
create policy "Users can view their CRM sync logs" on public.crm_sync_logs for select to authenticated using (organization_id = (select auth.uid()));

grant select on public.events to anon;
grant select on public.event_qualifiers to anon;
grant insert on public.event_leads to anon;
grant select, insert, update, delete on public.events, public.event_members, public.event_tags, public.event_qualifiers, public.event_leads, public.event_lead_tags, public.event_lead_notes, public.event_assets, public.crm_integrations, public.crm_sync_logs to authenticated;
