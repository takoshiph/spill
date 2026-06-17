import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Landing() {
  const nav = useNavigate()
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1300)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`screen center home ${shown ? 'is-home' : 'is-intro'}`}>
      <div className="home-aurora" aria-hidden="true"><span /><span /><span /></div>
      <div className="intro-veil" aria-hidden="true" />
      <div className="spacer" />

      <div className="hero-light">
        <span className="home-glow" aria-hidden="true" />
        <div className="logo-stage"><Logo size={250} /></div>
        <p className="tagline reveal-late d1">Every secret has a group chat.</p>
      </div>

      <p className="home-intro reveal-late blur d2">
        <b>Get your group past small talk.</b> A no-login party game that brings
        couples, friends, and total strangers closer in a single night.
      </p>

      <div className="home-steps reveal-late d3">
        <span>Pick a vibe</span><i>·</i><span>Draw a card</span><i>·</i><span>Spill the story</span>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <button className="btn btn-primary reveal-late d4" onClick={() => nav('/create')}>Host a game</button>
        <button className="btn btn-secondary reveal-late d5" onClick={() => nav('/join')}>Join with a code</button>
      </div>

      <div className="spacer" />
      <button className="link reveal-late d5" onClick={() => nav('/privacy')}>Privacy</button>
    </div>
  )
}
