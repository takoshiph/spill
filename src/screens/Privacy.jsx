import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const nav = useNavigate()
  return (
    <div className="screen" style={{ textAlign: 'left' }}>
      <div className="top-bar"><button className="link" onClick={() => nav(-1)}>← Back</button></div>
      <h1>Privacy &amp; Email Consent</h1>
      <p className="muted">Last updated: June 2026</p>

      <div className="stack" style={{ marginTop: 12, gap: 18 }}>
        <p>Spill! Your Group Chat (“Spill!”, “we”, “us”) respects your privacy. This notice explains what we collect and how we handle it, including our commitments under Canada’s Anti-Spam Legislation (CASL).</p>

        <div>
          <h2>What we collect</h2>
          <p className="dim">To join a room we ask for your <strong>name</strong> (required) so other players can see who’s answering, and your <strong>email</strong> (optional). Name is used only inside your game session. We do not record your answers.</p>
        </div>

        <div>
          <h2>Email &amp; express consent (CASL)</h2>
          <p className="dim">Providing your email is entirely optional. We only add you to our list if you actively check the consent box — that is your <strong>express consent</strong> to receive occasional commercial electronic messages from Spill! (updates, new question packs, and launches). We never pre-tick the box, and you can play fully without giving an email.</p>
        </div>

        <div>
          <h2>Every email includes</h2>
          <p className="dim">Our identity and contact information, and a working one-click <strong>unsubscribe</strong> that takes effect promptly. Withdrawing consent is free and easy at any time.</p>
        </div>

        <div>
          <h2>How it’s stored &amp; shared</h2>
          <p className="dim">Room data lives in our database (Supabase) and is used to run live sessions; stale rooms are purged automatically. Emails are managed by our email provider (Resend) solely to send the messages you consented to. We do not sell your data.</p>
        </div>

        <div>
          <h2>Your rights &amp; contact</h2>
          <p className="dim">You can ask us to access or delete your information, or withdraw email consent, by contacting <a href="mailto:privacy@spill.example">privacy@spill.example</a>. We’ll respond within a reasonable time.</p>
        </div>

        <p className="muted">Replace the contact address and provider details with your finalized information before launch.</p>
      </div>
      <div className="spacer" />
      <button className="btn btn-secondary" onClick={() => nav(-1)} style={{ marginTop: 16 }}>Back</button>
    </div>
  )
}
