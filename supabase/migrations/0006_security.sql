-- ============================================================================
-- Al-Izdehar Logistics — Migration 0006 (security, OTP, rate limiting, email)
-- Safe to run on an existing database. Uses IF NOT EXISTS.
-- ============================================================================

alter table public.leads add column if not exists pickup_location text;
alter table public.leads add column if not exists shipping_address text;

alter table public.email_settings add column if not exists notify_security boolean default true;
alter table public.email_settings add column if not exists notify_login boolean default true;
alter table public.email_settings add column if not exists admin_email text;
alter table public.email_settings add column if not exists smtp_status text;
alter table public.email_settings add column if not exists smtp_verified boolean default false;
alter table public.email_settings add column if not exists imap_status text;
alter table public.email_settings add column if not exists imap_verified boolean default false;

-- ── Security events (login / new device / etc.) ─────────────────────────────
create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text not null,
  ip text,
  browser text,
  os text,
  meta jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table public.security_events enable row level security;

-- ── Rate limiting (multi-signal, persistent) ────────────────────────────────
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,          -- e.g. 'form:contact', 'login'
  signal_key text not null,     -- hashed email / fingerprint / network key
  count integer default 0,
  window_start timestamptz default now(),
  blocked_until timestamptz,
  strikes integer default 0,
  updated_at timestamptz default now(),
  unique (scope, signal_key)
);
alter table public.rate_limits enable row level security;
create index if not exists rate_limits_lookup_idx on public.rate_limits (scope, signal_key);

-- ── Trusted devices (sessions) ──────────────────────────────────────────────
create table if not exists public.trusted_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  token_hash text not null,
  browser text,
  os text,
  verified_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  unique (user_id, token_hash)
);
alter table public.trusted_devices enable row level security;

-- ── Admin OTP (short-lived, hashed) ─────────────────────────────────────────
create table if not exists public.admin_otp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  code_hash text not null,
  purpose text not null default 'login',
  expires_at timestamptz not null,
  attempts integer default 0,
  created_at timestamptz default now()
);
alter table public.admin_otp enable row level security;
create index if not exists admin_otp_user_idx on public.admin_otp (user_id, created_at desc);
