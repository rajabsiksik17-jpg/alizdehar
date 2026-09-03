-- ============================================================================
-- Al-Izdehar Logistics — Migration 0004 (notifications)
-- Safe to run on an existing database. Uses IF NOT EXISTS.
-- Adds a read flag to leads so the admin dashboard can show an unread badge.
-- ============================================================================

alter table public.leads add column if not exists is_read boolean default false;

create index if not exists leads_unread_idx on public.leads (is_read, created_at desc);
