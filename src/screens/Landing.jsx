import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const HEAD = 'Get your group past small talk.'
const REST = ' A no-login party game that brings couples, friends, and total strangers closer in a single night.'
const FULL = HEAD + REST
const REDUCED = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

export default function Landing() {
  const nav = useNavigate()
  const [shown, setShown] = useState(false)        // dark splash -> home
  const [typed, setTyped] = useState('')           // typewriter progress
  const [showButtons, setShowButtons] = useState(false)
  const ivRef = useRef(null)
  const typingDone = typed.length >= FULL.length

  // hold the logo on the splash, then glide it home
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1100)
    return () => clearTimeout(t)
  }, [])

  // typewriter the whole line — ONE shot (keyed only on `shown`, which flips once)
  useEffect(() => {
    if (!shown) return
    if (REDUCED) { setTyped(FULL); return }
    let i = 0
    const start = setTimeout(() => {
      ivRef.current = setInterval(() => {
        i += 1
        setTyped(FULL.slice(0, i))
        if (i >= FULL.length) clearInterval(ivRef.current)
      }, 22)
    }, 320)
    return () => { clearTimeout(start); clearInterval(ivRef.current) }
  }, [shown])

  // reveal the buttons a beat after the text finishes
  useEffect(() => {
    if (!typingDone) return
    const t = setTimeout(() => setShowButtons(true), 350)
    return () => clearTimeout(t)
  }, [typingDone])

  const bold = typed.slice(0, HEAD.length)
  const rest = typed.slice(HEAD.length)

  return (
    <div className={`screen center home ${shown ? 'is-home' : 'is-intro'}`}>
      <div className="home-aurora" aria-hidden="true"><span /><span /><span /></div>
      <div className="intro-veil" aria-hidden="true" />
      <div className="spacer" />

      <div className="hero-light">
        <span className="home-glow" aria-hidden="true" />
        <div className="logo-stage"><Logo size={250} /></div>
        <p className={`tagline seq ${shown ? 'seq-in' : ''}`}>Every secret has a group chat.</p>
      </div>

      <div className={`typer seq ${shown ? 'seq-in' : ''}`}>
        <p className="typer-ghost" aria-hidden="true"><b>{HEAD}</b>{REST}</p>
        <p className="typer-live"><b>{bold}</b>{rest}<span className={`caret ${typingDone ? 'gone' : ''}`} /></p>
      </div>

      <div className="home-steps">
        <span className={`step-pop ${typingDone ? 'pop-in' : ''}`} style={{ animationDelay: '0ms' }}>Pick a vibe</span>
        <i className={`step-pop ${typingDone ? 'pop-in' : ''}`} style={{ animationDelay: '0ms' }}>·</i>
        <span className={`step-pop ${typingDone ? 'pop-in' : ''}`} style={{ animationDelay: '320ms' }}>Draw a card</span>
        <i className={`step-pop ${typingDone ? 'pop-in' : ''}`} style={{ animationDelay: '320ms' }}>·</i>
        <span className={`step-pop ${typingDone ? 'pop-in' : ''}`} style={{ animationDelay: '640ms' }}>Spill the story</span>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <button className={`btn btn-primary seq-drop ${showButtons ? 'drop-in' : ''}`} onClick={() => nav('/create')}>Host a game</button>
        <button className={`btn btn-secondary seq-drop ${showButtons ? 'drop-in' : ''}`} style={{ animationDelay: '170ms' }} onClick={() => nav('/join')}>Join with a code</button>
      </div>

      <div className="spacer" />
      <button className={`link seq ${showButtons ? 'seq-in' : ''}`} style={{ animationDelay: '300ms' }} onClick={() => nav('/privacy')}>Privacy</button>
    </div>
  )
}
