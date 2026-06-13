import { supabase, isConfigured } from './supabase'

// Durable email collection for future releases. Consented sign-ups go into a
// dedicated Supabase table (email_signups) that the room cleanup never touches.
// Best-effort and non-blocking: gameplay never waits on this, and duplicates
// are ignored so the same address is only stored once.
export async function subscribeEmail({ email, name, consent }) {
  if (!isConfigured || !email || consent !== true) return
  try {
    await supabase
      .from('email_signups')
      .upsert(
        { email: email.toLowerCase().trim(), name: name || null, consent: true },
        { onConflict: 'email', ignoreDuplicates: true }
      )
  } catch {
    /* swallow — collecting the email is best-effort, never blocks the game */
  }
}
