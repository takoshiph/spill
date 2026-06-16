import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Landing() {
  const nav = useNavigate()
  return (
    <div className="screen center">
      <div className="spacer" />

      <div className="hero-light logo-enter">
        <span className="home-glow" aria-hidden="true" />
        <Logo size={300} />
        <p className="tagline">Every secret has a group chat.</p>
      </div>

      <p className="home-intro landing-enter delay-1">
        <b>Get your group past small talk.</b> A no-login party game that brings
        couples, friends, and total strangers closer in a single night.
      </p>

      <div className="home-steps landing-enter delay-2">
        <span>Pick a vibe</span><i>·</i><span>Draw a card</span><i>·</i><span>Spill the story</span>
      </div>

      <div className="stack landing-enter delay-3" style={{ marginTop: 18 }}>
        <button className="btn btn-primary" onClick={() => nav('/create')}>Host a game</button>
        <button className="btn btn-secondary" onClick={() => nav('/join')}>Join with a code</button>
      </div>

      <div className="spacer" />
      <button className="link landing-enter delay-4" onClick={() => nav('/privacy')}>Privacy</button>
    </div>
  )
}
