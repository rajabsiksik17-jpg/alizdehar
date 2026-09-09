-- ============================================================================
-- Al-Izdehar Logistics — Migration 0007 (OTP challenge id)
-- Safe to run on an existing database. Uses IF NOT EXISTS.
-- Adds a per-login-attempt challenge id so OTP verification is bound to the
-- exact sign-in attempt, not just the user email/account.
-- ============================================================================

alter table public.admin_otp add column if not exists challenge_id text;
alter table public.admin_otp add column if not exists consumed boolean default false;
create index if not exists admin_otp_challenge_idx on public.admin_otp (challenge_id);
