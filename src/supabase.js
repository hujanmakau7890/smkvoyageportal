import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://api.voyageportal.my.id'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Guard: jangan throw Global Error kalau ENV belum ter-set di Vercel Preview
let supabase
try {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing VITE_SUPABASE env - set in Vercel Dashboard')
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} catch (e) {
  console.warn('[supabase] ENV kosong, app jalan tanpa auth:', e.message)
  // dummy client agar tidak crash - semua call akan return error tapi tidak throw global
  supabase = {
    auth: { getUser: async () => ({ data: { user: null } }), getSession: async () => ({ data: { session: null } }), signInWithPassword: async () => ({ error: e }), signOut: async () => ({}), onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: e }) }), data: null, error: e }), insert: async () => ({ error: e }), update: async () => ({ error: e }), delete: async () => ({ error: e }) }),
    storage: { from: () => ({ upload: async () => ({ error: e }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  }
}
export { supabase }
window.supabaseClient = supabase;
