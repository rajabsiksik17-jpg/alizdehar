-- ============================================================================
-- Al-Izdehar Logistics — Migration 0001 (refinements)
-- Safe to run on an existing database created by supabase/schema.sql.
-- Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS to preserve data.
-- ============================================================================

-- ── Admin profiles (roles) ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'editor',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Leads: structured quote fields ────────────────────────────────────────
alter table public.leads add column if not exists phone_country text;
alter table public.leads add column if not exists phone_dial_code text;
alter table public.leads add column if not exists phone_e164 text;
alter table public.leads add column if not exists service_slug text;
alter table public.leads add column if not exists cargo_type text;
alter table public.leads add column if not exists cargo_description text;
alter table public.leads add column if not exists shipment_size text;
alter table public.leads add column if not exists urgency text;
alter table public.leads add column if not exists origin text;
alter table public.leads add column if not exists destination text;
alter table public.leads add column if not exists weight numeric;
alter table public.leads add column if not exists weight_unit text;
alter table public.leads add column if not exists dimensions jsonb;
alter table public.leads add column if not exists shipping_date date;
alter table public.leads add column if not exists locale text;
alter table public.leads add column if not exists source_page text;

create index if not exists leads_type_idx on public.leads (type, created_at desc);
create index if not exists leads_phone_e164_idx on public.leads (phone_e164);

-- ── Careers: preferred qualifications + demo flag ─────────────────────────
alter table public.careers add column if not exists preferred jsonb;
alter table public.careers add column if not exists demo boolean default false;

-- ── Pages: per-page hero background override ──────────────────────────────
alter table public.pages add column if not exists background jsonb;

-- ── Settings: global default page background ──────────────────────────────
alter table public.settings add column if not exists page_background jsonb;

-- ── Cargo types (CMS-controlled taxonomy) ─────────────────────────────────
create table if not exists public.cargo_types (
  id uuid primary key default gen_random_uuid(),
  label jsonb not null,
  sort_order integer default 0
);
alter table public.cargo_types enable row level security;
drop policy if exists "public read cargo_types" on public.cargo_types;
create policy "public read cargo_types" on public.cargo_types
  for select using (true);

-- ── Forms (dynamic form builder) ──────────────────────────────────────────
create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  description jsonb,
  enabled boolean default true,
  settings jsonb default '{}',
  created_at timestamptz default now()
);
alter table public.forms enable row level security;

create table if not exists public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references public.forms(id) on delete cascade,
  name text not null,
  type text not null default 'text',
  label jsonb,
  placeholder jsonb,
  help_text jsonb,
  required boolean default false,
  options jsonb default '[]',
  default_value text,
  validation jsonb default '{}',
  sort_order integer default 0
);
alter table public.form_fields enable row level security;

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references public.forms(id) on delete cascade,
  data jsonb default '{}',
  name text,
  email text,
  phone text,
  status text default 'new',
  created_at timestamptz default now()
);
alter table public.form_submissions enable row level security;
create index if not exists form_submissions_form_idx on public.form_submissions (form_id, created_at desc);

-- ── Storage: private applications bucket (CVs) ────────────────────────────
insert into storage.buckets (id, name, public)
values ('applications', 'applications', false)
on conflict (id) do nothing;

-- CVs are private — no public read policy. The service role handles access.
