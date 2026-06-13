// Lightweight local identity so a player keeps their seat across refresh/navigation.
// (This is a deployed web app, not a sandboxed artifact, so localStorage is fine.)
const KEY = 'spill.session'

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function setSession(patch) {
  const next = { ...getSession(), ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function clearSession() {
  localStorage.removeItem(KEY)
}
