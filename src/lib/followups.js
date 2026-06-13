import { mulberry32, seedFromCode } from './deck'

// Warm, rotating invitations to ask a question of one's own — tied to the
// card's theme so they connect to what was just shared. {name} = the sharer.
const INVITES = {
  generic: [
    '{name} just opened up. Ask one question that shows you were really listening.',
    'There’s more to this. Gently ask {name} to take you a little deeper.',
    'Show {name} it landed. Ask one thoughtful question of your own.',
    'Curiosity is a kindness. Give {name} one good question.',
    'You’re the only one who can do this. Ask {name} something real.',
  ],
  struggles: [
    'That wasn’t easy to share. Ask {name} one gentle question to honour it.',
    '{name} trusted the room. Meet them there. Ask one caring question.',
  ],
  dreams: [
    'There’s a dream in there. Ask {name} what it would really mean to them.',
    'Ask {name} the question that helps that dream breathe a little.',
  ],
  love: [
    'Ask {name} one question that helps you understand their heart a bit more.',
    'There’s tenderness here. Ask {name} something that goes a layer deeper.',
  ],
  roots: [
    'Ask {name} one question about where this all began.',
    'There’s a whole history here. Ask {name} to take you further back.',
  ],
  joy: [
    'That’s a good story. Ask {name} for the part they left out.',
    'Keep the spark going. Ask {name} one more curious question.',
  ],
  values: [
    'Ask {name} the question that reveals what really matters to them.',
    'There’s a belief underneath this. Ask {name} where it comes from.',
  ],
}

export function inviteFor(card, room) {
  if (!card) return ''
  const pool = (INVITES[card.theme] || []).concat(INVITES.generic)
  const rng = mulberry32((seedFromCode(room.code) ^ ((card.index + 7) * 0x85ebca6b)) >>> 0)
  return pool[Math.floor(rng() * pool.length)]
}

export function assignFollowups(card, room, players, drawerId) {
  if (!card) return []
  const others = players
    .filter((p) => p.id !== drawerId)
    .sort((a, b) => a.seat - b.seat)
  if (others.length === 0) return []

  const rng = mulberry32((seedFromCode(room.code) ^ ((card.index + 1) * 0x9e3779b1)) >>> 0)
  const count = rng() < 0.4 ? 2 : 1

  const used = new Set()
  const out = []
  for (let i = 0; i < count; i++) {
    let asker = others[Math.floor(rng() * others.length)]
    let guard = 0
    while (others.length > 1 && used.has(asker.id) && guard++ < others.length) {
      asker = others[Math.floor(rng() * others.length)]
    }
    used.add(asker.id)
    out.push({ askerId: asker.id, askerName: asker.name })
  }
  return out
}
