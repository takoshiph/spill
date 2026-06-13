-- ============================================================
-- Spill! Your Group Chat — Supabase schema
-- Run this in your Supabase project: SQL Editor -> New query -> paste -> Run.
-- ============================================================

-- Rooms hold the shared game state. Deck order is derived deterministically
-- on each client from (code + vibe), so we only store the current position.
create table if not exists public.rooms (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,                  -- 4-digit join code
  host_id       uuid not null,                         -- player id of the host
  vibe          text,                                  -- spicy | deep | chaotic | random
  status        text not null default 'lobby',         -- lobby | playing | ended
  phase         text not null default 'draw',          -- draw | answer
  card_index    int  not null default -1,              -- index of last drawn card (-1 = none)
  current_seat  int  not null default 0,               -- seat of the current drawer
  created_at    timestamptz not null default now()
);

create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms(id) on delete cascade,
  name        text not null,
  email       text,                                    -- optional, CASL-consented
  seat        int  not null,                           -- turn order, 0-based
  ready       boolean not null default false,          -- "Ready for next" gate
  connected   boolean not null default true,
  joined_at   timestamptz not null default now()
);

create index if not exists players_room_idx on public.players(room_id);
create index if not exists rooms_code_idx on public.rooms(code);

-- Realtime: broadcast row changes to subscribed clients.
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;

-- ------------------------------------------------------------
-- Row Level Security
-- This is an anonymous, no-login party game, so the anon key needs
-- read/write on these two tables. Policies below are intentionally open.
-- Hardening ideas (later): rate-limit room creation, validate code format,
-- restrict updates to a player's own row via a per-session claim.
-- ------------------------------------------------------------
alter table public.rooms   enable row level security;
alter table public.players enable row level security;

drop policy if exists "rooms_anon_all" on public.rooms;
create policy "rooms_anon_all" on public.rooms
  for all to anon using (true) with check (true);

drop policy if exists "players_anon_all" on public.players;
create policy "players_anon_all" on public.players
  for all to anon using (true) with check (true);

-- Optional: auto-purge stale rooms (older than 12h). Schedule via pg_cron if desired.
-- delete from public.rooms where created_at < now() - interval '12 hours';
