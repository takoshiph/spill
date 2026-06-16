import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Landing() {
  const nav = useNavigate()
  return (
    <div className="screen center">
      <div className="spacer" />
      <div className="hero-light landing-enter">
        <Logo size={264} />
        <p className="tagline">Every secret has a group chat.</p>
      </div>
      <div className="stack landing-enter delay-1" style={{ marginTop: 22 }}>
        <button className="btn btn-primary" onClick={() => nav('/create')}>Host a game</button>
        <button className="btn btn-secondary" onClick={() => nav('/join')}>Join with a code</button>
      </div>
      <div className="spacer" />
      <button className="link landing-enter delay-2" onClick={() => nav('/privacy')}>Privacy</button>
    </div>
  )
}
