// Fires `cb` when the app likely just came back to life: the tab becomes
// visible again, the window regains focus, or the network reconnects.
// Mobile browsers suspend the realtime websocket while backgrounded, so these
// are exactly the moments we need to re-sync state and re-announce presence.
export function onResume(cb) {
  const onVis = () => { if (document.visibilityState === 'visible') cb() }
  document.addEventListener('visibilitychange', onVis)
  window.addEventListener('online', cb)
  window.addEventListener('focus', cb)
  return () => {
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('online', cb)
    window.removeEventListener('focus', cb)
  }
}
