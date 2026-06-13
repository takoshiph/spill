// Fire-and-forget email capture. Posts to the Cloudflare Pages Function,
// which talks to Resend server-side. Never blocks gameplay.
export async function subscribeEmail({ email, name, consent }) {
  if (!email || !consent) return
  try {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, consent }),
    })
  } catch {
    /* swallow — collecting the email is best-effort */
  }
}
