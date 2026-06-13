import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useRoom } from '../lib/useRoom'
import { usePresence } from '../lib/usePresence'
import { supabase } from '../lib/supabase'
import { getSession } from '../lib/session'
import Lobby from './Lobby'
import Game from './Game'
import EndGame from './EndGame'

export default function Room() {
  const { roomId } = useParams()
  const { playerId } = getSession()
  const { room, players, loading } = useRoom(roomId)
  const me = players.find((p) => p.id === playerId)

  const online = usePresence(roomId, playerId, me?.name)

  useEffect(() => {
    if (!supabase || !playerId) return
    supabase.from('players').update({ connected: true }).eq('id', playerId)
    return () => { supabase.from('players').update({ connected: false }).eq('id', playerId) }
  }, [playerId, roomId])

  // Host migration: if the host goes offline, the lowest-seat online player
  // claims host so Start / Skip / End never get stranded.
  useEffect(() => {
    if (!supabase || !room || online.size === 0) return
    if (online.has(room.host_id)) return
    const onlinePlayers = players.filter((p) => online.has(p.id)).sort((a, b) => a.seat - b.seat)
    const newHost = onlinePlayers[0]
    if (newHost && newHost.id === playerId) {
      supabase.from('rooms').update({ host_id: newHost.id }).eq('id', room.id)
    }
  }, [room, players, online, playerId])

  if (loading) return (
    <div className="screen center">
      <div className="room-loader" aria-label="Loading room">
        <span className="room-spinner" />
        <p className="dim">Setting the table…</p>
      </div>
    </div>
  )
  if (!room) return <div className="screen center"><h2>Room not found</h2><a href="/">Back to start</a></div>

  const ctx = { room, players, me, isHost: room.host_id === playerId, playerId, online }

  if (room.status === 'ended') return <EndGame {...ctx} />
  if (room.status === 'playing') return <Game {...ctx} />
  return <Lobby {...ctx} />
}
