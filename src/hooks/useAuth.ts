import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Signups are disabled in Supabase, so every account that can sign in is an admin.
// Real Supabase sessions only: the old env-var fallback login had no session, so database writes were rejected.
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) return { error: result.error }
    setUser(result.data.user)
    return { error: null }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return { user, loading, isAdmin: !!user, login, logout }
}
