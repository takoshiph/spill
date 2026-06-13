-- ============================================================
-- Spill! — durable email collection (run in Supabase → SQL Editor → New query → Run)
-- A standalone list for future-release announcements. NOT linked to rooms, so
-- the 12-hour room cleanup never deletes these. Anyone can ADD their email;
-- nobody can read the list except you (via the Supabase dashboard / service role).
-- ============================================================
create table if not exists public.email_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text,
  consent     boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.email_signups enable row level security;

-- anon may INSERT (with basic validation) but has NO select/update/delete,
-- so the list can't be scraped, changed, or wiped with the public key.
drop policy if exists "email_signups_anon_insert" on public.email_signups;
create policy "email_signups_anon_insert" on public.email_signups
  for insert to anon with check (
    consent = true
    and char_length(email) between 3 and 254
    and char_length(coalesce(name, '')) <= 80
  );

-- To see your list: Supabase → Table Editor → email_signups, or:
--   select name, email, created_at from public.email_signups order by created_at desc;
