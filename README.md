# Spill! Your Group Chat — Web App

A room-code party game (PWA + website) for getting people closer. Players join with a 4-digit code, the host picks a vibe, and an escalating deck of question cards guides the conversation. No login.

> Tagline: *Every secret has a group chat.*

## Stack

- **Vite + React** front end (PWA via `vite-plugin-pwa`)
- **Supabase** Postgres + Realtime for live room sessions
- **Cloudflare Pages** hosting + Pages Functions (`/functions/api/subscribe.js`)
- **Resend** for CASL-consented email capture

## Project layout

```
app/
├─ index.html
├─ vite.config.js          # PWA manifest + theme colors
├─ .env.example            # copy to .env and fill in
├─ public/                 # logo, card back, icons, splash (from /assets)
├─ supabase/schema.sql     # run this in your Supabase project
├─ functions/api/subscribe.js   # Cloudflare Pages Function → Resend
└─ src/
   ├─ data/questions.json  # question bank (vibe / tier / theme / target_type)
   ├─ lib/                 # supabase client, deck logic, realtime hook, session
   ├─ components/          # Card, ReadyBar, PlayerList, JoinForm, Logo
   └─ screens/             # Landing, Create, Join, Room→(Lobby/Game/EndGame), Privacy
```

## Run it locally

```bash
cd app
npm install
cp .env.example .env        # then add your Supabase URL + anon key
npm run dev
```

Open the printed localhost URL. Without Supabase keys the UI still loads, but rooms won’t sync (you’ll see a banner).

## Go live — what you need to provide

1. **Supabase**
   - Create / open your project, then **SQL Editor → run** `supabase/schema.sql`.
   - Settings → API: copy the **Project URL** and **anon public key** into `.env`:
     ```
     VITE_SUPABASE_URL=...
     VITE_SUPABASE_ANON_KEY=...
     ```
   - Realtime is enabled by the schema (it adds both tables to the `supabase_realtime` publication).

2. **Cloudflare Pages**
   - Connect this repo (or the `app/` folder) as a Pages project.
   - Build command: `npm run build` · Output directory: `dist` · Root: `app`.
   - Add the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as build env vars.

3. **Resend (email capture — optional)**
   - In Cloudflare Pages → Settings → Environment variables, add:
     - `RESEND_API_KEY` (server-side; never in the front-end)
     - `RESEND_AUDIENCE_ID` (the audience to add contacts to)
   - If unset, email signups are accepted but not stored, so the game still works.

## How a turn works (logic reference)

- The deck is **derived deterministically** from `(room code + vibe)` on every device (see `src/lib/deck.js`), so all players see the same order without storing the deck server-side.
- Cards escalate **Warm-up → Open up → Deep**.
- Room state is two phases: `draw` (current drawer flips the top card) → `answer` (everyone discusses, then taps **Ready**). When all connected players are ready, the deck passes to the next seat. Most cards are **Self** (drawer answers); shuffled-in **“Spill to the group”** wildcards make everyone answer.

## Not in this scaffold (next steps)

- Expand the question bank (currently ~30 cards per vibe; aim for 50+).
- Reconnect/disconnect edge cases and host migration if the host leaves.
- Tighten Supabase RLS (current policies are open for anonymous play — see comments in `schema.sql`).
- Optional: typed answers + shared-screen reveal, emoji reactions (see `../GAME_DESIGN.md` §11).
