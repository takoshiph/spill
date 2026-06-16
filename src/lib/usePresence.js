import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import { onResume } from './onResume'

/**
 * Tracks who is *actually* online via Supabase Presence (a heartbeat).
 * Returns a Set of online playerIds. Unlike the DB `connected` flag, this
 * auto-expires players who close the tab or drop their connection, which is
 * what keeps the turn/ready logic from stalling on a ghost player.
 *
 * On mobile the socket is suspended in the background, so when the app resumes
 * we re-announce presence and refresh the online set.
 */
export function usePresence(roomId, playerId, name) {
  const [online, setOnline] = useState(() => new Set())
  const chanRef = useRef(null)

  useEffect(() => {
    if (!supabase || !roomId || !playerId) return
    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: playerId } },
    })
    const sync = () => setOnline(new Set(Object.keys(channel.presenceState())))
    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: name || '', at: Date.now() })
        }
      })
    chanRef.current = channel
    return () => { supabase.removeChannel(channel); chanRef.current = null }
  }, [roomId, playerId, name])

  // Re-announce presence when the app comes back from background/sleep.
  useEffect(() => {
    if (!supabase || !playerId) return
    return onResume(() => {
      const ch = chanRef.current
      if (!ch) return
      Promise.resolve(ch.track({ name: name || '', at: Date.now() }))
        .then(() => setOnline(new Set(Object.keys(ch.presenceState()))))
        .catch(() => {})
    })
  }, [playerId, name])

  return online
}
