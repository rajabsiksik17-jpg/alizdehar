-- ============================================================================
-- Al-Izdehar Logistics — Migration 0002 (maintenance mode)
-- Safe to run on an existing database. Uses IF NOT EXISTS.
-- ============================================================================

alter table public.settings add column if not exists maintenance_mode boolean default false;
