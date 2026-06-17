import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession } from '../lib/session'
import SplitText from '../components/SplitText'
import Confetti from '../components/Confetti'

const PARTING = [
  'Who in this room surprised you tonight, and will you tell them?',
  'What’s one thing you heard tonight that you don’t want to forget?',
  'The bravest thing here was honesty. Where else could you use a little more of it this week?',
  'You just learned something new about people you thought you knew. Imagine what’s still left to discover.',
  'Conversations like this don’t have to be rare. Who will you really talk to this week?',
  'Somebody opened up first so the rest of you could. Be that person more often.',
]

export default function EndGame({ players, online }) {
  const nav = useNavigate()
  const leave = () => { clearSession(); nav('/') }
  const parting = useMemo(() => PARTING[Math.floor(Math.random() * PARTING.length)], [])

  const count = (online && online.size)
    ? online.size
    : (players.filter((p) => p.connected).length || players.length)

  return (
    <div className="screen center endgame">
      <Confetti />
      <div className="endgame-photo">
        <img src="/group-photo.png" alt="Your group, a little closer than before" />
      </div>

      <h1 className="endgame-headline"><SplitText text="That was real." delay={950} stagger={120} /></h1>
      <p className="dim reveal d2">
        {count} of you showed up honestly tonight. That’s rarer than you think,
        and the room knows each other a little better for it.
      </p>

      <div className="parting reveal d3">
        <span className="parting-label">Before you go…</span>
        <p className="parting-q">{parting}</p>
      </div>

      <div className="spacer" />
      <button className="btn btn-primary reveal d4" onClick={leave}>Back to start</button>
      <p className="credit reveal d4">Built by someone who really wanted you to have nights like this. 🧡</p>
    </div>
  )
}
