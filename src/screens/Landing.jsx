import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const HYPE = 'Get your group past small talk.'
const REDUCED = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

export default function Landing() {
  const nav = useNavigate()
  const [shown, setShown] = useState(false) // dark splash -> home
  const [step, setStep] = useState(0)       // strict reveal order
  const [typed, setTyped] = useState('')
  const typingDone = typed.length >= HYPE.length

  // hold the logo on the splash, then glide it home
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1300)
    return () => clearTimeout(t)
  }, [])

  // sequenced reveal: nothing appears before its step
  useEffect(() => {
    if (!shown) return
    if (REDUCED) { setStep(5); setTyped(HYPE); return }
    const ts = [
      setTimeout(() => setStep(1), 200),   // tagline
      setTimeout(() => setStep(2), 550),   // hype (starts typing)
      setTimeout(() => setStep(3), 1850),  // steps 1-2-3
      setTimeout(() => setStep(4), 2450),  // Host drops in
      setTimeout(() => setStep(5), 2750),  // Join + privacy
    ]
    return () => ts.forEach(clearTimeout)
  }, [shown])

  // typewriter — runs ONCE when the hype's step fires (one-shot flag, so later
  // steps advancing never restart it)
  const typeOn = shown && step >= 2 && !REDUCED
  useEffect(() => {
    if (!typeOn) return
    let i = 0
    const iv = setInterval(() => {
      i += 1
      setTyped(HYPE.slice(0, i))
      if (i >= HYPE.length) clearInterval(iv)
    }, 40)
    return () => clearInterval(iv)
  }, [typeOn])

  return (
    <div className={`screen center home ${shown ? 'is-home' : 'is-intro'}`}>
      <div className="home-aurora" aria-hidden="true"><span /><span /><span /></div>
      <div className="intro-veil" aria-hidden="true" />
      <div className="spacer" />

      <div className="hero-light">
        <span className="home-glow" aria-hidden="true" />
        <div className="logo-stage"><Logo size={250} /></div>
        <p className={`tagline seq ${step >= 1 ? 'seq-in' : ''}`}>Every secret has a group chat.</p>
      </div>

      <p className={`home-intro seq ${step >= 2 ? 'seq-in' : ''}`}>
        <b>{typed}<span className={`caret ${typingDone ? 'gone' : ''}`} /></b>
        <span className={`intro-rest ${typingDone ? 'show' : ''}`}> A no-login party game that brings couples, friends, and total strangers closer in a single night.</span>
      </p>

      <div className="home-steps">
        <span className={`step-pop ${step >= 3 ? 'pop-in' : ''}`} style={{ animationDelay: '0ms' }}>Pick a vibe</span>
        <i className={`step-pop ${step >= 3 ? 'pop-in' : ''}`} style={{ animationDelay: '0ms' }}>·</i>
        <span className={`step-pop ${step >= 3 ? 'pop-in' : ''}`} style={{ animationDelay: '150ms' }}>Draw a card</span>
        <i className={`step-pop ${step >= 3 ? 'pop-in' : ''}`} style={{ animationDelay: '150ms' }}>·</i>
        <span className={`step-pop ${step >= 3 ? 'pop-in' : ''}`} style={{ animationDelay: '300ms' }}>Spill the story</span>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <button className={`btn btn-primary seq-drop ${step >= 4 ? 'drop-in' : ''}`} onClick={() => nav('/create')}>Host a game</button>
        <button className={`btn btn-secondary seq-drop ${step >= 5 ? 'drop-in' : ''}`} onClick={() => nav('/join')}>Join with a code</button>
      </div>

      <div className="spacer" />
      <button className={`link seq ${step >= 5 ? 'seq-in' : ''}`} onClick={() => nav('/privacy')}>Privacy</button>
    </div>
  )
}
