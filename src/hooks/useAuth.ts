import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  // Check if user has admin role (stored in user_metadata)
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email?.includes('@apex') || false

  return {
    user,
    loading,
    isAdmin,
    login,
    logout,
  }
}
