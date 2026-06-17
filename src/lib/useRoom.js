import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from './supabase'
import { onResume } from './onResume'

export function useRoom(roomId) {
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!roomId || !supabase) return
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from('rooms').select('*').eq('id', roomId).maybeSingle(),
      supabase.from('players').select('*').eq('room_id', roomId).order('seat', { ascending: true }),
    ])
    setRoom(r || null)
    setPlayers(p || [])
    setLoading(false)
  }, [roomId])

  useEffect(() => {
    if (!roomId || !supabase) { setLoading(false); return }
    refetch()
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, refetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, refetch])

  // Re-sync when the app resumes (socket is suspended while backgrounded).
  useEffect(() => {
    if (!roomId || !supabase) return
    return onResume(refetch)
  }, [roomId, refetch])

  // Safety net: some phones (notably iOS Safari) silently drop the realtime
  // socket, so the screen can get stuck on stale state (e.g. a drawn card never
  // showing its question). Poll as a fallback so state always catches up.
  useEffect(() => {
    if (!roomId || !supabase) return
    const id = setInterval(refetch, 4000)
    return () => clearInterval(id)
  }, [roomId, refetch])

  return { room, players, loading, error, refetch }
}

export function useGameActions(room, livePlayers, deckLength, refetch) {
  const advancing = useRef(false)
  const sync = useCallback(() => { try { if (refetch) refetch() } catch {} }, [refetch])

  const setReady = useCallback(async (playerId, ready) => {
    if (!supabase || !room) return
    await supabase.from('players').update({ ready }).eq('id', playerId)
    sync()
  }, [room, sync])

  const draw = useCallback(async () => {
    if (!supabase || !room || room.phase !== 'draw') return
    const next = room.card_index + 1
    if (next >= deckLength) {
      await supabase.from('rooms').update({ status: 'ended' }).eq('id', room.id)
      sync(); return
    }
    await supabase.from('players').update({ ready: false }).eq('room_id', room.id)
    await supabase.from('rooms').update({ card_index: next, phase: 'answer' }).eq('id', room.id)
    sync()
  }, [room, deckLength, sync])

  const nextOnlineSeat = useCallback(() => {
    const seats = livePlayers.map((p) => p.seat).sort((a, b) => a - b)
    if (seats.length === 0) return null
    return seats.find((s) => s > room.current_seat) ?? seats[0]
  }, [livePlayers, room])

  const maybeAdvance = useCallback(async () => {
    if (!supabase || !room || advancing.current || room.phase !== 'answer') return
    if (livePlayers.length === 0) return
    if (!livePlayers.every((p) => p.ready)) return
    advancing.current = true
    try {
      if (room.card_index + 1 >= deckLength) {
        await supabase.from('rooms').update({ status: 'ended' }).eq('id', room.id)
        return
      }
      const nextSeat = nextOnlineSeat()
      if (nextSeat === null) return
      await supabase.from('rooms').update({ current_seat: nextSeat, phase: 'draw' }).eq('id', room.id)
      await supabase.from('players').update({ ready: false }).eq('room_id', room.id)
    } finally {
      advancing.current = false
      sync()
    }
  }, [room, livePlayers, deckLength, nextOnlineSeat, sync])

  const forceNext = useCallback(async () => {
    if (!supabase || !room) return
    const nextSeat = nextOnlineSeat()
    if (nextSeat === null) return
    if (room.phase === 'draw') {
      await supabase.from('rooms').update({ current_seat: nextSeat }).eq('id', room.id)
      sync(); return
    }
    if (room.card_index + 1 >= deckLength) {
      await supabase.from('rooms').update({ status: 'ended' }).eq('id', room.id)
      sync(); return
    }
    await supabase.from('rooms').update({ current_seat: nextSeat, phase: 'draw' }).eq('id', room.id)
    await supabase.from('players').update({ ready: false }).eq('room_id', room.id)
    sync()
  }, [room, deckLength, nextOnlineSeat, sync])

  const endGame = useCallback(async () => {
    if (!supabase || !room) return
    await supabase.from('rooms').update({ status: 'ended' }).eq('id', room.id)
    sync()
  }, [room, sync])

  return { setReady, draw, maybeAdvance, forceNext, endGame }
}
