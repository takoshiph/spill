// Cloudflare Pages Function — POST /api/subscribe
// Captures a CASL-consented email via Resend. Server-side only; the Resend
// API key never reaches the browser.
//
// Required environment variables (set in Cloudflare Pages → Settings → Environment variables):
//   RESEND_API_KEY       e.g. re_xxxxxxxx
//   RESEND_AUDIENCE_ID   (optional) a Resend Audience id to add the contact to
//
// If RESEND_API_KEY is not set, the function accepts the request and no-ops,
// so the app keeps working in environments without email configured.

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400)
  }

  const { email, name, consent } = body || {}
  const emailOk = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk || consent !== true) {
    return json({ ok: false, error: 'Email and express consent are required.' }, 400)
  }

  if (!env.RESEND_API_KEY) {
    // Not configured yet — accept gracefully so gameplay isn't blocked.
    return json({ ok: true, stored: false, note: 'Email provider not configured.' })
  }

  // Add the contact to a Resend Audience (requires RESEND_AUDIENCE_ID).
  if (env.RESEND_AUDIENCE_ID) {
    const res = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: (name || '').slice(0, 60),
        unsubscribed: false,
      }),
    })
    if (!res.ok && res.status !== 409 /* already exists */) {
      const text = await res.text()
      return json({ ok: false, error: 'Resend error', detail: text }, 502)
    }
  }

  return json({ ok: true, stored: true })
}

// Reject non-POST methods cleanly.
export const onRequestGet = () => new Response('Method Not Allowed', { status: 405 })

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
