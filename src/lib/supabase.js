import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// isConfigured lets the UI show a friendly "add your keys" banner instead of
// crashing when env vars aren't set yet (e.g. first clone / local preview).
export const isConfigured = Boolean(url && anon && !url.includes('YOUR-PROJECT'))

export const supabase = isConfigured ? createClient(url, anon) : null

// Generate a unique 4-digit room code (retries on collision).
export async function createUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000))
    const { data } = await supabase.from('rooms').select('id').eq('code', code).maybeSingle()
    if (!data) return code
  }
  throw new Error('Could not allocate a room code, please try again.')
}
