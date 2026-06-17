import { useMemo } from 'react'

const REDUCED = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

const COLORS = ['#C75B2A', '#A0522D', '#BA7517', '#E08A4B', '#F5EFE6']

// Gentle, brand-colored confetti for the end screen. No dependency — just a
// handful of CSS-animated pieces that fall once and fade.
export default function Confetti({ count = 42 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.8 + Math.random() * 1.8,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 6,
    drift: `${(Math.random() - 0.5) * 90}px`,
    rot: `${(Math.random() * 4 - 2) * 180}deg`,
  })), [count])

  if (REDUCED) return null
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': p.drift,
            '--rot': p.rot,
          }}
        />
      ))}
    </div>
  )
}
