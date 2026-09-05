-- ============================================================================
-- Al-Izdehar Logistics — Migration 0005 (job application forms)
-- Safe to run on an existing database. Uses IF NOT EXISTS.
-- ============================================================================

alter table public.forms add column if not exists is_default boolean default false;
alter table public.forms add column if not exists entity text default 'application';

alter table public.careers add column if not exists application_form_id uuid references public.forms(id) on delete set null;
