import questions from '../data/questions.json'

export const VIBES = {
  spicy:   { name: 'Spicy',   emoji: '🌶️', icon: '/icons/vibe-spicy.png',   desc: 'Bold, flirty, revealing' },
  deep:    { name: 'Deep',    emoji: '🌊', icon: '/icons/vibe-deep.png',    desc: 'Slow, vulnerable, real' },
  chaotic: { name: 'Chaotic', emoji: '🎲', icon: '/icons/vibe-chaotic.png', desc: 'Fast, silly, unhinged' },
  random:  { name: 'Random',  emoji: '🔀', icon: '/icons/vibe-random.png',  desc: 'A mix of everything' }
}

function shuffle(arr, rand = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Deterministic PRNG so every device in a room builds the identical deck from one seed.
export function mulberry32(seed) {
  let t = seed >>> 0
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromCode(code) {
  let h = 2166136261
  for (const ch of String(code)) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function poolForVibe(vibe) {
  if (vibe === 'random') {
    return [...questions.spicy, ...questions.deep, ...questions.chaotic].map((q) => ({ ...q, vibe: 'random' }))
  }
  return (questions[vibe] || []).map((q) => ({ ...q, vibe }))
}

/**
 * Build an ordered deck that ramps gently, then escalates in cycles so even a
 * short session reaches the deep cards (instead of spending the whole night in
 * warm-up). Each tier is shuffled with a code-seeded PRNG, so every device in
 * the room builds the identical order. Pacing: 2 warm-up + 1 open to ease in,
 * then repeating (deep, open, warm-up) cycles — depth lands by ~card 4.
 */
export function buildDeck(vibe, code) {
  const rand = mulberry32(seedFromCode(code) ^ seedFromCode(vibe))
  const pool = poolForVibe(vibe)
  const byTier = { warmup: [], open: [], deep: [] }
  for (const q of pool) (byTier[q.tier] || byTier.open).push(q)

  const warmup = shuffle(byTier.warmup, rand)
  const open = shuffle(byTier.open, rand)
  const deep = shuffle(byTier.deep, rand)

  const ordered = []
  const take = (bucket, n) => { for (let i = 0; i < n && bucket.length; i++) ordered.push(bucket.shift()) }

  take(warmup, 2)
  take(open, 1)
  while (warmup.length || open.length || deep.length) {
    take(deep, 1)
    take(open, 1)
    take(warmup, 1)
  }

  return ordered.map((card, i) => ({
    ...card,
    target_type: card.target_type || 'self',
    wildcard: !!card.wildcard,
    index: i,
    id: `${vibe}_${i}`,
  }))
}

export function tierLabel(tier) {
  return { warmup: 'Warm-up', open: 'Open up', deep: 'Deep' }[tier] || ''
}
