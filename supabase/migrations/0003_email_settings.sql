-- ============================================================================
-- Al-Izdehar Logistics — Migration 0003 (email settings)
-- Safe to run on an existing database. Uses IF NOT EXISTS.
-- ============================================================================

create table if not exists public.email_settings (
  id integer primary key default 1 check (id = 1),
  smtp_host text,
  smtp_port integer,
  smtp_secure boolean default true,
  smtp_user text,
  smtp_pass text,
  from_name text,
  from_email text,
  reply_to text,
  imap_host text,
  imap_port integer,
  imap_secure boolean default true,
  imap_user text,
  imap_pass text,
  notify_quote boolean default true,
  notify_contact boolean default true,
  notify_application boolean default true,
  auto_reply boolean default true,
  updated_at timestamptz default now()
);

alter table public.email_settings enable row level security;
