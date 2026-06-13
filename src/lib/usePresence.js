import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/**
 * Tracks who is *actually* online via Supabase Presence (a heartbeat).
 * Returns a Set of online playerIds. Unlike the DB `connected` flag, this
 * auto-expires players who close the tab or drop their connection, which is
 * what keeps the turn/ready logic from stalling on a ghost player.
 */
export function usePresence(roomId, playerId, name) {
  const [online, setOnline] = useState(() => new Set())

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
    return () => { supabase.removeChannel(channel) }
  }, [roomId, playerId, name])

  return online
}
