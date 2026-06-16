# Spill! Your Group Chat — Game Design

*Every secret has a group chat.*

This document defines the gameplay for Spill! and is the source of truth the build works from. Brand, palette, and assets are locked separately in the project brief.

---

## 1. Concept & goal

Spill! is a room-code party game for getting people to know each other in a deep, honest way. Players join a shared room from their phones, the host picks a vibe, and a shared deck of question cards is drawn one player at a time. Each card prompts a personal answer, spoken out loud to the group.

The goal is connection, not winning. There is no score and no winner. The game succeeds when the table opens up and barriers come down.

**The problem Spill! solves.** It's inspired by couples card games (e.g. Tales of Us), where each card asks a question *about your partner*. Those games are great two-up but break in a mixed group, because "what does your partner think?" doesn't land for a single person. Spill! fixes this: **every default card is answered about yourself, as an individual.** Couples and singles play side by side with no awkwardness, because no card assumes you have a partner.

---

## 2. Players & join flow

- **No login.** Players join by entering a **4-digit room code** (Kahoot-style).
- **On join, each player provides:** Name (required), Email (optional).
- **Host** creates the room and controls vibe selection and game start.
- Recommended group size: 3–8 players (works down to 2, scales up but pacing slows).

Email is collected for the mailing list via Resend and is always optional. A CASL-compliant privacy notice must appear at the join screen (see brief — separate task).

---

## 3. Vibes

After everyone has joined, the host picks one vibe from a **2×2 panel**:

| | |
|---|---|
| 🌶️ **Spicy** | 🌊 **Deep** |
| 🎲 **Chaotic** | 🔀 **Random** |

The vibe determines **which question pool the deck draws from** and **how often wildcards appear**. It does **not** change the rules — same engine, four feels. This keeps the build simple.

- **Spicy** — bold, flirty, revealing. Higher heat, still answered about yourself.
- **Deep** — slow, vulnerable, meaningful. Fewer wildcards; more reflective prompts.
- **Chaotic** — fast, silly, unpredictable. More wildcards and group rounds.
- **Random** — shuffles all three pools together for a mixed bag.

---

## 4. Core gameplay loop

1. **Host picks a vibe.** The deck is built from that vibe's pool.
2. **The app locks a turn order** (the "lock mechanism") — a fixed seat order set at game start. The deck is shared and visible to everyone, but only the **current drawer** can flip the top card.
3. **The current drawer draws the top card.**
4. **The card resolves by its type:**
   - **Self card** (default) → the drawer answers the question out loud about themselves.
   - **Everyone card / "SPILL TO THE GROUP" wildcard** → the whole group answers the same prompt, going around the circle out loud.
5. **The group talks.** Reactions and follow-ups happen naturally, face to face.
6. **Everyone taps "Ready for next."** The deck stays locked until **all connected players** have tapped Ready — this enforces the "we move on when everyone agrees" rule.
7. **The lock passes to the next player** in turn order, and the loop repeats from step 3.
8. The session ends when the deck is exhausted, or the host ends the game (see §8).

Answers are always **spoken out loud**; phones are the controller (draw, lock, tap Ready). There is no typing of answers in this version.

---

## 5. Card system

Every card has a **`target_type`**, which is the only field that changes how a turn plays out.

### Self (default, the majority of every deck)
The drawer answers about themselves; the group listens and reacts. This is the heart of Spill! and the reason it works for any mix of singles and couples.

> *Example (Deep): "What's something you're still trying to forgive yourself for?"*

### Everyone — "SPILL TO THE GROUP" wildcard
A small number of special wildcard cards are shuffled into the deck. Drawing one flips that round into a group round: **everyone answers the same prompt**, one by one around the circle. These are visually distinct (a "SPILL TO THE GROUP" banner) so flipping one feels like an event.

> *Example (Chaotic): "SPILL TO THE GROUP — Everyone: what's the most unhinged thing in your search history right now?"*

Wildcard frequency is tuned per vibe (more in Chaotic, fewer in Deep). A practical default is roughly **1 in every 6–8 cards**, adjustable later.

### The depth ramp (escalation)

Closeness research (Aron's "36 Questions") and the market leader (We're Not Really Strangers) both build intimacy the same way: **escalating, reciprocal self-disclosure** — start light, get progressively deeper so people warm up and match each other's vulnerability. Spill! bakes this in.

Every card has a **`tier`**:

- **Warm-up** — easy, fun, low-stakes. Gets people talking and laughing.
- **Open up** — personal but safe. Real answers, not raw nerve.
- **Deep** — vulnerable, meaningful. The payoff, once the table is warm.

The deck **deals in escalating order**: a stretch of Warm-up cards first, then Open up, then Deep, rather than a flat shuffle. Players don't see tier labels — they just feel the conversation naturally deepen. (Implementation: bucket the shuffled deck by tier and draw from Warm-up until ~⅓ played, then Open up, then Deep; tune thresholds later.)

### Themes (authoring tool, not player-facing)

To keep every deck well-rounded, questions are authored across six relationship-building **themes**: **Roots** (where you came from), **Dreams & goals**, **Struggles & growth**, **Love & connection**, **Values**, and **Joy & identity**. Players never select a theme — it's just a checklist so a deck isn't lopsided. Each card carries an optional `theme` tag for balancing and future filtering.

### Card schema (for the build)

```json
{
  "id": "deep_017",
  "vibe": "deep",            // spicy | deep | chaotic | random-pool
  "tier": "deep",            // warmup | open | deep  (depth ramp)
  "theme": "struggles",      // roots | dreams | struggles | love | values | joy
  "target_type": "self",     // self | everyone
  "text": "What's a fear you've never said out loud?",
  "is_wildcard": false        // true for "SPILL TO THE GROUP" cards
}
```

`Random` is not its own authored pool — it draws from the combined spicy + deep + chaotic sets, keeping the same depth ramp.

---

## 6. Turn / lock mechanism & pacing

- **Turn order ("the lock").** On game start the app fixes an order from the joined players. Play rotates through it. Only the current drawer can flip the top card; for everyone else the deck is locked.
- **Advancing ("everyone agrees").** After a card is answered and discussed, each player taps **"Ready for next."** The next draw unlocks only once **all currently-connected players** have tapped Ready. A live count ("3 / 5 ready") shows progress.
- **Drop handling.** If a player disconnects, they're removed from the Ready count and skipped in the turn order so the game never stalls (build detail).

---

## 7. Starter question bank

A first draft of questions per vibe is in **[`questions/`](./questions/)** (see §9 files). These are a starting point for you to edit, cut, and expand — treat them as raw material, not final copy. Each file lists Self cards plus a handful of "SPILL TO THE GROUP" wildcards.

---

## 8. Session end

There's no win condition. The game ends when:

- the deck runs out, or
- the host taps **End game**.

The closing screen thanks players, reinforces the tagline, and (if email was given and not yet confirmed) can offer a gentle opt-in. Optional future touch: a "favorite moment" recap.

---

## 9. Files

- `GAME_DESIGN.md` — this document.
- `questions/spicy.md`, `questions/deep.md`, `questions/chaotic.md` — starter question banks (Random pulls from all three).

---

## 10. Data model implications (bridge to build)

The loop above implies this minimal real-time state in Supabase. Not final schema — a sketch so design and build stay aligned.

- **rooms** — `id`, `code` (4-digit), `host_player_id`, `vibe`, `status` (lobby | playing | ended), `created_at`.
- **players** — `id`, `room_id`, `name`, `email` (nullable), `seat_order`, `is_connected`, `joined_at`.
- **deck_state** — `room_id`, current `card_index` / shuffled card id list, `current_drawer_seat`.
- **round_state** — `room_id`, `current_card_id`, set of `ready_player_ids` for the "everyone taps Ready" gate.

Real-time channels (Supabase Realtime) broadcast: player joins/leaves, vibe chosen, card drawn, ready-count changes, turn advance, game end.

---

## 11. Deferred / future ideas (not in v1)

Captured so we don't lose them, explicitly **out of scope** for the first build:

- Typed answers + shared-screen reveal (would enable remote / video-call play).
- Emoji reactions to answers from phones.
- Light points or playful badges (e.g. "most vulnerable answer").
- Per-player "single / with [name]" tagging for smart-routed special cards.
- Card targeting toward a specific other player (considered, then cut for v1 simplicity).
- Couple/solo custom deck mixes.

---

*Status: design locked for v1. Next step: review/expand the question bank, then build.*
