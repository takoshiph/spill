import { useEffect, useState } from 'react'

// A circular brand badge pops + bounces in on the dark splash, holds, then the
// whole splash dissolves — handing off to the bigger logo on the (light) home.
const HOLD = 1050 // pop + bounce + brief hold
const FADE = 500  // dissolve (keep in sync with .splash transition)

export default function Splash() {
  const [phase, setPhase] = useState('in') // 'in' -> 'out' -> 'gone'
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), HOLD)
    const t2 = setTimeout(() => setPhase('gone'), HOLD + FADE)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  if (phase === 'gone') return null
  return (
    <div className={`splash${phase === 'out' ? ' leaving' : ''}`}>
      <img className="splash-badge" src="/splash-badge.png" alt="Spill!" />
    </div>
  )
}
