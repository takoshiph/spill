import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const HYPE = 'Get your group past small talk.'
const REDUCED = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

export default function Landing() {
  const nav = useNavigate()
  const [shown, setShown] = useState(false)
  const [typed, setTyped] = useState('')
  const typingDone = typed.length >= HYPE.length

  // hold the huge logo on the dark splash, then glide it home + reveal the page
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1300)
    return () => clearTimeout(t)
  }, [])

  // typewriter the hype line once the home is revealed
  useEffect(() => {
    if (!shown) return
    if (REDUCED) { setTyped(HYPE); return }
    let i = 0
    let iv
    const start = setTimeout(() => {
      iv = setInterval(() => {
        i += 1
        setTyped(HYPE.slice(0, i))
        if (i >= HYPE.length) clearInterval(iv)
      }, 42)
    }, 500)
    return () => { clearTimeout(start); clearInterval(iv) }
  }, [shown])

  return (
    <div className={`screen center home ${shown ? 'is-home' : 'is-intro'}`}>
      <div className="intro-veil" aria-hidden="true" />
      <div className="spacer" />

      <div className="hero-light">
        <span className="home-glow" aria-hidden="true" />
        <div className="logo-stage"><Logo size={330} /></div>
        <p className="tagline reveal-late d1">Every secret has a group chat.</p>
      </div>

      <p className="home-intro">
        <b className={`type${typingDone ? ' done' : ''}`}>{typed}<span className="caret" /></b>
        <span className={`intro-rest${typingDone ? ' show' : ''}`}> A no-login party game that brings couples, friends, and total strangers closer in a single night.</span>
      </p>

      <div className="home-steps">
        <span className="pop s1">Pick a vibe</span><i className="pop s1">·</i>
        <span className="pop s2">Draw a card</span><i className="pop s2">·</i>
        <span className="pop s3">Spill the story</span>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <button className="btn btn-primary drop-in b1" onClick={() => nav('/create')}>Host a game</button>
        <button className="btn btn-secondary drop-in b2" onClick={() => nav('/join')}>Join with a code</button>
      </div>

      <div className="spacer" />
      <button className="link reveal-late d4" onClick={() => nav('/privacy')}>Privacy</button>
    </div>
  )
}
