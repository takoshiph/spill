import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import JoinForm from '../components/JoinForm'
import { supabase, isConfigured } from '../lib/supabase'
import { setSession } from '../lib/session'
import { subscribeEmail } from '../lib/email'
import { uid } from '../lib/uid'

export default function JoinRoom() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [code, setCode] = useState((params.get('code') || '').slice(0, 4))
  const [busy, setBusy] = useState(false)

  const join = async ({ name, email, consent }) => {
    if (!isConfigured) throw new Error('Add your Supabase keys to .env first.')
    if (!/^\d{4}$/.test(code)) throw new Error('Enter the 4-digit room code.')
    setBusy(true)
    try {
      const { data: room } = await supabase.from('rooms').select('*').eq('code', code).maybeSingle()
      if (!room) throw new Error('No room with that code.')
      if (room.status === 'ended') throw new Error('That game has already ended.')

      const { data: existing } = await supabase.from('players').select('seat').eq('room_id', room.id)
      const nextSeat = existing && existing.length ? Math.max(...existing.map((p) => p.seat)) + 1 : 0

      const playerId = uid()
      const { error } = await supabase.from('players')
        .insert({ id: playerId, room_id: room.id, name, seat: nextSeat, connected: true })
      if (error) throw error

      setSession({ playerId, roomId: room.id, name })
      subscribeEmail({ email, name, consent })
      nav(`/room/${room.id}`)
    } finally {
      setBusy(false)
    }
  }

  const codeField = (
    <div className="field">
      <label>Room code</label>
      <input
        className="input code-input"
        inputMode="numeric"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="0000"
      />
    </div>
  )

  return (
    <div className="screen">
      <div className="top-bar"><button className="link" onClick={() => nav('/')}>← Back</button></div>
      <div className="center" style={{ flex: 'none', marginBottom: 22 }}>
        <h1>Join a game</h1>
      </div>
      <JoinForm submitLabel="Join room" onSubmit={join} busy={busy} extraTop={codeField} />
    </div>
  )
}
