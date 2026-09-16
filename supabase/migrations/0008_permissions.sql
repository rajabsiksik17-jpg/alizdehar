-- ============================================================================
-- Al-Izdehar Logistics — Migration 0008 (granular permissions & roles)
-- Safe to run on an existing database. Uses IF NOT EXISTS.
-- ============================================================================

alter table public.profiles add column if not exists permissions jsonb;
alter table public.profiles add column if not exists active boolean default true;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  description jsonb,
  permissions jsonb default '{}',
  is_builtin boolean default false,
  created_at timestamptz default now()
);
alter table public.roles enable row level security;

-- Make roles readable by anon so the app can resolve role -> permissions
-- server-side (using the service/anon client). No sensitive data lives here.
create policy "public read roles" on public.roles for select using (true);
