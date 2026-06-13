import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Collects Name (required) + Email (optional, CASL-consented).
export default function JoinForm({ submitLabel, onSubmit, busy, extraTop }) {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [err, setErr] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setErr('')
    const trimmed = name.trim()
    if (!trimmed) return setErr('Please add your name.')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('That email looks off.')
    try {
      await onSubmit({ name: trimmed, email: email.trim() || null, consent })
    } catch (e2) {
      setErr(e2.message || 'Something went wrong.')
    }
  }

  return (
    <form className="stack" onSubmit={handle}>
      {extraTop}
      <div className="field">
        <label>Your name *</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="What should we call you?" maxLength={24} autoFocus />
      </div>
      <div className="field">
        <label>Email (optional)</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" />
      </div>
      {email && (
        <label className="row muted" style={{ alignItems: 'flex-start', gap: 8 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
          <span>
            I agree to receive occasional emails from Spill! and accept the{' '}
            <button type="button" className="link" onClick={() => nav('/privacy')}>privacy policy</button>.
            You can unsubscribe anytime.
          </span>
        </label>
      )}
      {err && <p className="muted" style={{ color: '#ffb4a0' }}>{err}</p>}
      <button className="btn btn-primary" disabled={busy || (email && !consent)}>
        {busy ? 'One sec…' : submitLabel}
      </button>
      {email && !consent && <p className="muted" style={{ textAlign: 'center' }}>Tick the box to share your email, or leave it blank.</p>}
    </form>
  )
}
