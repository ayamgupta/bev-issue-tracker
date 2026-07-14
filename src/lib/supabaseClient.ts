import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase env vars are missing. Copy .env.example to .env.local and fill in your project URL/anon key.',
  )
}

// Fall back to a syntactically valid placeholder URL so createClient doesn't
// throw and crash the whole app before the UI can render — every real call
// will fail cleanly instead, which callers already handle.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key')
