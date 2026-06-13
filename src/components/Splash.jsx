import { useEffect, useState } from 'react'

// Brand splash on cold load. Timing lives HERE (single source of truth);
// the CSS only defines the fade itself, not when it happens.
const HOLD = 1250 // how long the full logo holds before it lifts
const FADE = 520  // fade-out duration (keep in sync with .splash transition)

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
      <img src="/splash.png" alt="Spill! Your Group Chat" />
    </div>
  )
}
