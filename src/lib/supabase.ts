import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let client: SupabaseClient

if (supabaseUrl && supabaseKey) {
  client = createClient(supabaseUrl, supabaseKey)
} else {
  // Mock client for when env vars are not set — prevents runtime crash
  const mockChain = {
    select: () => mockChain,
    insert: () => mockChain,
    update: () => mockChain,
    delete: () => mockChain,
    upsert: () => mockChain,
    eq: () => mockChain,
    in: () => mockChain,
    or: () => mockChain,
    order: () => mockChain,
    limit: () => mockChain,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (cb: any) => Promise.resolve(cb({ data: [], error: null })),
  }
  client = {
    from: () => mockChain,
    storage: { from: () => ({ upload: () => Promise.resolve({ data: null, error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
    auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), getSession: () => Promise.resolve({ data: { session: null }, error: null }) },
  } as any
}

export const supabase = client
