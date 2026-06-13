import { useState, useEffect, useRef } from 'react'
import PlayerList from '../components/PlayerList'
import VibePicker from '../components/VibePicker'
import { supabase } from '../lib/supabase'
import { nudgeFeedback } from '../lib/feedback'

export default function Lobby({ room, players, isHost, me, playerId }) {
  const [picking, setPicking] = useState(false)
  const [starting, setStarting] = useState(false)
  const [nudgeFrom, setNudgeFrom] = useState(null)
  const [hostPicking, setHostPicking] = useState(false)
  const chanRef = useRef(null)

  useEffect(() => {
    if (!supabase || !room?.id) return
    const channel = supabase.channel(`nudge:${room.id}`, { config: { broadcast: { self: false } } })
    channel.on('broadcast', { event: 'nudge' }, ({ payload }) => {
      if (payload.target === 'all' || payload.target === playerId) {
        nudgeFeedback()
        setNudgeFrom(payload.fromName || 'Someone')
      }
    })
    channel.on('broadcast', { event: 'pick' }, ({ payload }) => {
      setHostPicking(!!payload.on)
    })
    channel.subscribe()
    chanRef.current = channel
    return () => { supabase.removeChannel(channel); chanRef.current = null }
  }, [room?.id, playerId])

  useEffect(() => {
    if (!nudgeFrom) return
    const t = setTimeout(() => setNudgeFrom(null), 2200)
    return () => clearTimeout(t)
  }, [nudgeFrom])

  const sendNudge = (target) => {
    chanRef.current?.send({
      type: 'broadcast',
      event: 'nudge',
      payload: { target, fromId: playerId, fromName: me?.name || 'Someone' },
    })
  }

  const broadcastPick = (on) => {
    chanRef.current?.send({ type: 'broadcast', event: 'pick', payload: { on } })
  }

  const openPicker = () => { setPicking(true); broadcastPick(true) }
  const closePicker = () => { setPicking(false); broadcastPick(false) }

  const startWithVibe = async (vibe) => {
    setStarting(true)
    try {
      await supabase.from('players').update({ ready: false }).eq('room_id', room.id)
      await supabase.from('rooms')
        .update({ vibe, status: 'playing', card_index: -1, current_seat: 0 })
        .eq('id', room.id)
    } finally {
      setStarting(false)
    }
  }

  if (picking && isHost) {
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="link" onClick={closePicker}>← Back</button>
          <span className="muted">Pick a vibe</span>
        </div>
        <h1 style={{ marginBottom: 6 }}>What’s the vibe tonight?</h1>
        <VibePicker onChoose={startWithVibe} busy={starting} />
      </div>
    )
  }

  return (
    <div className="screen">
      {nudgeFrom && <div className="nudge-flash" />}
      {nudgeFrom && <div className="nudge-toast">👋 {nudgeFrom} nudged you</div>}

      <div className="center" style={{ flex: 'none', marginBottom: 18 }}>
        <p className="muted">Share this code</p>
        <span className="badge-code">{room.code}</span>
        <p className="dim">{players.length} {players.length === 1 ? 'player' : 'players'} in the room</p>
      </div>

      {players.length < 2 ? (
        <div className="lobby-empty">
          <img className="empty-img" src="/empty-state.png" alt="" />
          <p className="dim">Nobody’s here yet — share the code above to fill the room.</p>
        </div>
      ) : (
        <PlayerList players={players} hostId={room.host_id} />
      )}

      <div className="spacer" />
      {isHost ? (
        <div className="stack">
          {players.length > 1 && (
            <button className="btn btn-ghost" onClick={() => sendNudge('all')}>👋 Nudge everyone</button>
          )}
          <button className="btn btn-primary" disabled={players.length < 2} onClick={openPicker}>
            {players.length < 2 ? 'Waiting for players…' : 'Start the game'}
          </button>
        </div>
      ) : (
        <div className="stack">
          <p className="dim" style={{ textAlign: 'center' }}>
            {hostPicking ? 'Choosing a vibe…' : 'Waiting for the host to start…'}
          </p>
          <button className="btn btn-secondary" onClick={() => sendNudge(room.host_id)}>👋 Nudge host</button>
        </div>
      )}
    </div>
  )
}
