import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut(); setUser(null)
  }, [])

  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email?.includes('@apex') || false

  return { user, loading, isAdmin, login, logout }
}
