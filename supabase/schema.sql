-- ============================================================================
-- Al-Izdehar Logistics — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Localized text fields use JSONB: { "en": "...", "ar": "..." }
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────────────────
create type public.content_status as enum ('draft', 'published');
create type public.lead_status as enum ('new', 'contacted', 'in_progress', 'quoted', 'won', 'lost', 'archived');
create type public.lead_type as enum ('quote', 'contact', 'career');

-- ── Settings ───────────────────────────────────────────────────────────────
create table public.settings (
  id integer primary key default 1 check (id = 1),
  site_name jsonb not null default '{"en":"Al-Izdehar Logistics","ar":"الإزدهار للوجستيات"}',
  site_description jsonb,
  tagline jsonb,
  logo text,
  favicon text,
  default_og_image text,
  phone text,
  email text,
  whatsapp text,
  address jsonb,
  working_hours jsonb,
  map_embed text,
  ga_measurement_id text,
  gtm_id text,
  meta_pixel_id text,
  google_site_verification text,
  bing_site_verification text,
  design_tokens jsonb,
  updated_at timestamptz default now()
);

-- ── Social links ───────────────────────────────────────────────────────────
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text,
  url text,
  icon text,
  enabled boolean default true,
  sort_order integer default 0
);

-- ── Navigation ─────────────────────────────────────────────────────────────
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.menu_items(id) on delete cascade,
  label jsonb not null,
  url text,
  page text,
  external boolean default false,
  enabled boolean default true,
  sort_order integer default 0
);

-- ── Services ───────────────────────────────────────────────────────────────
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  short_description jsonb,
  content jsonb,
  hero_image text,
  thumbnail text,
  gallery jsonb default '[]',
  icon text,
  cta jsonb,
  features jsonb default '[]',
  what_we_offer jsonb default '[]',
  how_it_works jsonb default '[]',
  faq jsonb default '[]',
  related_services text[] default '{}',
  sort_order integer default 0,
  status public.content_status default 'published',
  seo jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Pages (section-builder driven) ─────────────────────────────────────────
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  menu_title jsonb,
  status public.content_status default 'draft',
  seo jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade,
  type text not null,
  title jsonb,
  subtitle jsonb,
  body jsonb,
  image text,
  items jsonb default '[]',
  settings jsonb default '{}',
  hidden boolean default false,
  sort_order integer default 0
);

-- ── Global reusable blocks ─────────────────────────────────────────────────
create table public.why_us (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,
  description jsonb,
  icon text,
  sort_order integer default 0,
  enabled boolean default true
);

create table public.statistics (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label jsonb not null,
  suffix text,
  sort_order integer default 0,
  enabled boolean default true
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name jsonb not null,
  company jsonb,
  position jsonb,
  quote jsonb,
  photo text,
  rating integer default 5,
  country jsonb,
  service text,
  enabled boolean default true,
  sort_order integer default 0
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  logo text,
  enabled boolean default true,
  sort_order integer default 0
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt jsonb,
  category text,
  sort_order integer default 0
);

-- ── Blog ───────────────────────────────────────────────────────────────────
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  excerpt jsonb,
  content jsonb,
  cover_image text,
  category text,
  tags text[] default '{}',
  author jsonb,
  published_at timestamptz,
  reading_time integer default 1,
  status public.content_status default 'draft',
  seo jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Careers ────────────────────────────────────────────────────────────────
create table public.careers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  department jsonb,
  location jsonb,
  employment_type jsonb,
  description jsonb,
  requirements jsonb,
  responsibilities jsonb,
  benefits jsonb,
  deadline date,
  status public.content_status default 'published',
  created_at timestamptz default now()
);

-- ── Leads / forms ──────────────────────────────────────────────────────────
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  type public.lead_type default 'contact',
  name text not null,
  email text not null,
  phone text,
  company text,
  service text,
  message text,
  payload jsonb default '{}',
  status public.lead_status default 'new',
  assigned_to uuid,
  created_at timestamptz default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text,
  created_at timestamptz default now()
);

-- ── Media ──────────────────────────────────────────────────────────────────
create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt jsonb,
  title jsonb,
  caption jsonb,
  mime_type text,
  size integer,
  created_at timestamptz default now()
);

-- ── SEO / redirects / audit ────────────────────────────────────────────────
create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  status integer default 301
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

create table public.revisions (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  entity_id text not null,
  data jsonb,
  user_id uuid,
  created_at timestamptz default now()
);

-- ============================================================================
-- Row Level Security
-- Public content is readable by anon. Writes happen via the service-role
-- (admin) client which bypasses RLS. Leads are inserted server-side.
-- ============================================================================

alter table public.settings enable row level security;
alter table public.social_links enable row level security;
alter table public.menu_items enable row level security;
alter table public.services enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.why_us enable row level security;
alter table public.statistics enable row level security;
alter table public.testimonials enable row level security;
alter table public.clients enable row level security;
alter table public.gallery enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.careers enable row level security;
alter table public.leads enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.media enable row level security;
alter table public.redirects enable row level security;

create policy "public read settings" on public.settings for select using (true);
create policy "public read social_links" on public.social_links for select using (true);
create policy "public read menu_items" on public.menu_items for select using (true);
create policy "public read services" on public.services for select using (true);
create policy "public read pages" on public.pages for select using (true);
create policy "public read page_sections" on public.page_sections for select using (true);
create policy "public read why_us" on public.why_us for select using (true);
create policy "public read statistics" on public.statistics for select using (true);
create policy "public read testimonials" on public.testimonials for select using (true);
create policy "public read clients" on public.clients for select using (true);
create policy "public read gallery" on public.gallery for select using (true);
create policy "public read blog_categories" on public.blog_categories for select using (true);
create policy "public read blog_posts" on public.blog_posts for select using (true);
create policy "public read careers" on public.careers for select using (true);
create policy "public read media" on public.media for select using (true);
create policy "public read redirects" on public.redirects for select using (true);

-- ============================================================================
-- Indexes
-- ============================================================================
create index if not exists services_status_idx on public.services (status, sort_order);
create index if not exists pages_status_idx on public.pages (status);
create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists page_sections_page_idx on public.page_sections (page_id, sort_order);

-- ============================================================================
-- Storage: public media bucket
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

-- ============================================================================
-- Refinements (added in migration 0001 — kept inline for fresh installs)
-- ============================================================================

-- Admin profiles + roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'editor',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leads: structured quote fields
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

alter table public.careers add column if not exists preferred jsonb;
alter table public.careers add column if not exists demo boolean default false;
alter table public.pages add column if not exists background jsonb;
alter table public.settings add column if not exists page_background jsonb;
alter table public.settings add column if not exists maintenance_mode boolean default false;

-- Cargo types
create table if not exists public.cargo_types (
  id uuid primary key default gen_random_uuid(),
  label jsonb not null,
  sort_order integer default 0
);
alter table public.cargo_types enable row level security;
create policy "public read cargo_types" on public.cargo_types
  for select using (true);

-- Forms (dynamic form builder)
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

-- Storage: private applications bucket (CVs)
insert into storage.buckets (id, name, public)
values ('applications', 'applications', false)
on conflict (id) do nothing;
