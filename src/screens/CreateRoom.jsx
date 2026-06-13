import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JoinForm from '../components/JoinForm'
import { supabase, isConfigured, createUniqueCode } from '../lib/supabase'
import { setSession } from '../lib/session'
import { subscribeEmail } from '../lib/email'
import { uid } from '../lib/uid'

export default function CreateRoom() {
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)

  const create = async ({ name, email, consent }) => {
    if (!isConfigured) throw new Error('Add your Supabase keys to .env first.')
    setBusy(true)
    try {
      const hostId = uid()
      const code = await createUniqueCode()
      const { data: room, error: rErr } = await supabase.from('rooms')
        .insert({ code, host_id: hostId, status: 'lobby', card_index: -1, current_seat: 0 })
        .select().single()
      if (rErr) throw rErr
      const { error: pErr } = await supabase.from('players')
        .insert({ id: hostId, room_id: room.id, name, email, seat: 0, connected: true })
      if (pErr) throw pErr
      setSession({ playerId: hostId, roomId: room.id, name })
      subscribeEmail({ email, name, consent })
      nav(`/room/${room.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <div className="top-bar"><button className="link" onClick={() => nav('/')}>← Back</button></div>
      <div className="center" style={{ flex: 'none', marginBottom: 22 }}>
        <h1>Host a game</h1>
        <p className="dim">You’ll get a code to share with your group.</p>
      </div>
      <JoinForm submitLabel="Create room" onSubmit={create} busy={busy} />
    </div>
  )
}
