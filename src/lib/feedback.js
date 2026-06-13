// Cross-platform "nudge" feedback. Vibration only works on Android browsers
// (iOS Safari blocks the Vibration API), so we always pair it with a sound +
// on-screen pulse handled in the UI, so the nudge lands on every device.

export function vibrate(pattern = [0, 40, 60, 40]) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
  } catch {
    /* ignore */
  }
}

let audioCtx
export function playBlip() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    audioCtx = audioCtx || new Ctx()
    const now = audioCtx.currentTime
    // a soft two-note "knock-knock" chime
    ;[660, 880].forEach((freq, i) => {
      const o = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      o.connect(g); g.connect(audioCtx.destination)
      o.type = 'sine'
      o.frequency.value = freq
      const t = now + i * 0.13
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
      o.start(t); o.stop(t + 0.22)
    })
  } catch {
    /* audio may be blocked until a user gesture; ignore */
  }
}

export function nudgeFeedback() {
  vibrate()
  playBlip()
}
