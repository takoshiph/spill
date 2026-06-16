import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Landing() {
  const nav = useNavigate()
  const [shown, setShown] = useState(false)
  useEffect(() => {
    // hold the logo on the dark "splash", then glide it home and reveal the page
    const t = setTimeout(() => setShown(true), 1500)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`screen center home ${shown ? 'is-home' : 'is-intro'}`}>
      <div className="intro-veil" aria-hidden="true" />

      <div className="spacer" />

      <div className="hero-light">
        <span className="home-glow" aria-hidden="true" />
        <div className="logo-stage"><Logo size={300} /></div>
        <p className="tagline reveal-late d1">Every secret has a group chat.</p>
      </div>

      <p className="home-intro reveal-late d2">
        <b>Get your group past small talk.</b> A no-login party game that brings
        couples, friends, and total strangers closer in a single night.
      </p>

      <div className="home-steps reveal-late d3">
        <span>Pick a vibe</span><i>·</i><span>Draw a card</span><i>·</i><span>Spill the story</span>
      </div>

      <div className="stack reveal-late d3" style={{ marginTop: 18 }}>
        <button className="btn btn-primary" onClick={() => nav('/create')}>Host a game</button>
        <button className="btn btn-secondary" onClick={() => nav('/join')}>Join with a code</button>
      </div>

      <div className="spacer" />
      <button className="link reveal-late d4" onClick={() => nav('/privacy')}>Privacy</button>
    </div>
  )
}
