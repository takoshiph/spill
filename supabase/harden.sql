-- ============================================================
-- Spill! — RLS hardening  (run in Supabase → SQL Editor → New query → Run)
-- ------------------------------------------------------------
-- Honest scope: this is a no-login game, so the public anon key can do whatever
-- the app itself does. This reduces the blast radius (no deletes, enforced code
-- format, length caps, stale-room cleanup) but does NOT stop someone who has the
-- anon key + a room code from poking at that specific room. A full lockdown
-- needs real auth or server-side (edge function) validation — a bigger change.
-- ============================================================

-- 1) Replace the wide-open "all" policies with scoped ones (notably: no DELETE).
drop policy if exists "rooms_anon_all"   on public.rooms;
drop policy if exists "players_anon_all" on public.players;

create policy "rooms_anon_select" on public.rooms for select to anon using (true);
create policy "rooms_anon_insert" on public.rooms for insert to anon with check (true);
create policy "rooms_anon_update" on public.rooms for update to anon using (true) with check (true);

create policy "players_anon_select" on public.players for select to anon using (true);
create policy "players_anon_insert" on public.players for insert to anon with check (true);
create policy "players_anon_update" on public.players for update to anon using (true) with check (true);
-- (intentionally no DELETE policy → the anon key can no longer delete rows)

-- 2) Enforce 4-digit room codes.
alter table public.rooms drop constraint if exists rooms_code_format;
alter table public.rooms add  constraint rooms_code_format check (code ~ '^[0-9]{4}$');

-- 3) Defensive length caps on player input.
alter table public.players drop constraint if exists players_name_len;
alter table public.players add  constraint players_name_len  check (char_length(name) between 1 and 40);
alter table public.players drop constraint if exists players_email_len;
alter table public.players add  constraint players_email_len check (email is null or char_length(email) <= 254);

-- 4) Purge stale rooms (older than 12h). Run this anytime, or schedule it.
delete from public.rooms where created_at < now() - interval '12 hours';

-- Optional: auto-run hourly via pg_cron (enable the extension first under
-- Database → Extensions). Then:
--   select cron.schedule('spill-cleanup', '0 * * * *',
--     $$ delete from public.rooms where created_at < now() - interval '12 hours' $$);
