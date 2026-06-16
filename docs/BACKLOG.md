# Spill! — Backlog / Deferred changes

Running list of things intentionally deferred, so we don't lose them.

## Gameplay / deck
- [x] **Tier-cap pacing.** (2026-06-12) `buildDeck` now ramps (2 warm-up + 1 open) then cycles (deep, open, warm-up) — depth lands by ~card 4 and tiers stay mixed, so short sessions reach the deep cards.
- [x] **Tier labels hidden from players.** (Resolved 2026-06-11 in the premium redesign.) The card now shows the vibe name (or "To the group" for wildcards), not the tier — players feel the escalation without seeing "Warm-up/Deep".

## Design polish (web-designer review — 2026-06-13)
- [x] **Splash→landing handoff.** Splash timing centralized in `Splash.jsx` (single source); fades + subtle zoom into a `landing-enter` rise so the brand no longer "plays twice" as a hard cut.
- [x] **Shuffle→draw seam.** Shuffle stack lifts toward the deck slot (`.shuffle.lift`) and the draw deck fades in (`.soft-in`) — no more teleport.
- [x] **Reduced-motion.** `@media (prefers-reduced-motion: reduce)` now disables shuffle/glow/arrow/nudge/bubble/spinner motion (opacity fades kept).
- [x] **Asset re-homing.** `empty-state.png` moved to its proper home (lonely lobby); EndGame now closes on the logo brand-mark; vibe icons shown as rounded squares (was a circle that clipped the full-bleed art).
- [x] **Dead code removed.** Deleted unused `Card.jsx`, `ReadyBar.jsx`, and dead CSS (`.vibe-grid`, `.vibe-peek`, `.vibe-arrows`, `.turn-label`, `.fan`, `.flip`/`dealAndFlip`). Two card-flip implementations collapsed to one.
- [x] **PWA + polish.** Added `apple-touch-icon` (iOS home-screen); branded room-loading state; unified logo width; `--plate` color token.
- [ ] Light card-back variant from the brand kit isn't in the build (only `card-back.png` ships) — needs the asset exported before it can be wired in.
- [x] Combined vibe icons (`vibe-spicy-deep.png`, `vibe-chaotic-random.png`) — confirmed these are the two-up SOURCE sheets the four individual crops were cut from. Intentional; kept in `assets/`. (Note: copies also sit in `app/public/icons/` + `app/dist/` and ship unused — harmless few-KB leftover, remove only if you want it spotless.)

## Premium motion (Framer Motion — decided 2026-06-11)
- [x] **Waiting-room nudge.** Players nudge host (or host nudges everyone) via ephemeral Supabase broadcast → vibrate (Android only; iOS Safari blocks Vibration API) + screen pulse + sound chime. Done.
- [x] **Draw interaction (centerpiece).** Built 2026-06-11 with `framer-motion`. Deck peeks from top (`.peek-wrap`), drawer drags top card down (drag y, dragSnapToOrigin, threshold 120px / velocity 650 → `draw()`); answer card deals from top + flips (AnimatePresence, spring); exit = casino fling in a deterministic card-index-seeded direction. prefers-reduced-motion respected. NEEDS `npm install` (framer-motion added to package.json) + live tuning of thresholds/spring.
- [x] **Swipeable vibe picker.** Built 2026-06-11 (`app/src/components/VibePicker.jsx`). Big card stack with a peek behind; drag/swipe (Framer spring) to cycle the 4 vibes, tap card to choose, dots + arrows. Replaced the 2x2 deal grid.
- [x] **Listener vs sharer split + reactions + exclusive follow-up.** Only the sharer sees the question; listeners get a calm "listening" screen; reactions float as bubbles on all screens; the assigned follow-up is shown to that ONE person with a personal, role-exclusive prompt. "Choosing a vibe…" shown to waiting players.

## Content / story-first questions (decided 2026-06-11)
- [x] **Story-first reframing + gentle follow-up mechanic.** Questions reframed as "tell us about a time…" story prompts. A few seconds into a share, 1–2 universal supportive follow-ups (`app/src/lib/followups.js`) are deterministically assigned to random non-sharers ("Maya could ask: how did that feel?"). Piloted on the **Deep** vibe.
- [x] **Story-first rewrite rolled to Spicy + Chaotic** (2026-06-11). Follow-ups are now tone-matched per vibe (`POOLS` in `app/src/lib/followups.js`): playful for chaotic, flirty/curious for spicy, warm for deep — and open-ended so they never presume an arc (fixed the "camera roll → what would you change?" clash).
- [x] **Question bank expanded to 50/vibe** (2026-06-13) for Spicy/Deep/Chaotic (~55 new Qs). Balanced split 14 warm-up / 19 open / 17 deep + 5 wildcards each (~28/38/34%, mirrors prior feel). Interleaved deck kept; deep still lands ~card 4. Random auto-mixes the three → ~150-card pool. No em-dashes; straight apostrophes to match bank.

## Robustness (game-dev review 2026-06-12)
- [x] **Presence-based liveness.** `app/src/lib/usePresence.js` (Supabase Presence heartbeat) drives the ready-gate and turn logic via `livePlayers` instead of the stale DB `connected` flag — fixes stalls when someone background-closes a tab or drops Wi-Fi.
- [x] **Auto-recover a stuck drawer.** If the current drawer goes offline during the draw phase, the lowest-seat online player hands the deck to the next online person (`forceNext`).
- [x] **Host skip / force-advance.** Host menu → "Skip to next player" advances regardless of phase/ready.
- [x] **Wildcards visible to everyone.** "Spill to the group" cards now show to all players with "Everyone answers" labeling (was: only the drawer saw them).
- [x] **Host migration.** (2026-06-12) `Room.jsx` reassigns `host_id` to the lowest-seat online player when the current host goes offline, so Start/Skip/End never get stranded.
- [ ] **Per-card skip/pass for the drawer.** Let the sharer gracefully redraw a prompt that doesn't fit them.
- [ ] **Server-authoritative advance.** `maybeAdvance` is guarded by a per-client ref; move to a Supabase RPC (or host-only) to fully remove the double-advance race.

## Security / infra
- [~] Tighten Supabase RLS — `app/supabase/harden.sql` written (2026-06-12): scopes anon policies (no DELETE), enforces 4-digit codes, length caps, purges stale rooms. **USER must run it in Supabase SQL editor.** Note: a no-login game can't be fully locked down via RLS; full lockdown needs auth/edge functions.
- [ ] Auto-purge stale rooms (pg_cron job; stub SQL in schema).
- [ ] Handle host leaving / disconnect edge cases (host migration).

## Email collection (simplified to Supabase-only — 2026-06-13)
- [x] **Dropped Resend from the flow.** Goal is just to COLLECT emails for future releases, not send yet — so no third-party sender needed. Retired `functions/api/subscribe.js`.
- [x] **Durable `email_signups` table.** New standalone table (not linked to rooms) so the 12h cleanup never deletes signups. RLS: anon INSERT-only (validated), no select/update/delete → list can't be scraped or tampered with via the public key. **USER must run `app/supabase/email-signups.sql`.**
- [x] **Email no longer written to `players`.** Removed from the CreateRoom/JoinRoom inserts; consented emails now live only in `email_signups` (privacy-minimizing + durable).
- [x] **Privacy copy updated** to describe Supabase-only storage (Resend mention removed).
- [ ] When ready to SEND: export `email_signups` into Resend/Mailchimp/etc. (collect now, send later).

## Mobile review — deferred for later (saved 2026-06-13)
Most users are on mobile. Prioritized improvements (NOT yet implemented; user said save for now):
- [x] **HIGH — Poppins font loaded** (2026-06-13): index.html preconnect + Google Fonts <link> (display=swap), cached in the service worker (runtimeCaching) for offline/instant. Was: CSS references 'Poppins' but no <link>/@font-face/@import anywhere → every device falls back to system font. Self-host Poppins (offline-friendly for PWA) or Google Fonts preconnect + font-display:swap.
- [x] **HIGH — Resync on resume done** (2026-06-13): new src/lib/onResume.js (visibilitychange/focus/online) → useRoom re-fetches room+players, usePresence re-tracks. Was: usePresence/useRoom subscribe once; iOS suspends WebSocket on background. On return, presence may have dropped (ready-gate stalls) + missed room updates (stale screen). Add visibilitychange/online listener → refetch room+players and re-subscribe/re-track.
- [ ] **MED — Pinch-zoom disabled** (maximum-scale=1.0, user-scalable=no) → accessibility regression; consider removing.
- [ ] **MED — Low contrast** `--text-dim #8a7765` on cream ≈3.3:1 (<AA 4.5:1) for .dim/.muted. Darken ~#6f5c4a.
- [ ] **MED — Tap target** `.game-menu-btn` 40×40 < 44×44 recommended.
- [ ] **MED — Animated blur(10px)** on `.card-glow` loop is GPU/battery heavy on low-end phones; prefer static pre-blurred glow.
- [ ] **LOW — No "Add to Home Screen" nudge** (PWA exists; install gives fullscreen + kills pull-to-refresh conflict).
- [ ] **LOW — Long-press callout/selection** on game surface; add -webkit-touch-callout:none + user-select:none on cards/text.
- [ ] **LOW — Input hints:** autocomplete="name"/autocapitalize="words" on name, autocomplete="email" on email. (Note: input font-size ≈16px already prevents iOS focus-zoom — good.)
- Already correct: position:fixed game screen (no 100vh bug), touch-action:none on draggables, overscroll-behavior:none, safe-area insets, numeric code keypad, reduced-motion.
