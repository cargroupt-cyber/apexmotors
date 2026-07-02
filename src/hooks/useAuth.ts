import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const FALLBACK_ADMIN_KEY = 'carzee_admin_session'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        return
      }

      // Restore fallback admin session if present
      const fallback = localStorage.getItem(FALLBACK_ADMIN_KEY)
      if (fallback) {
        try {
          setUser(JSON.parse(fallback))
        } catch {
          localStorage.removeItem(FALLBACK_ADMIN_KEY)
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Try Supabase Auth first
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (!result.error) {
      setUser(result.data.user)
      localStorage.removeItem(FALLBACK_ADMIN_KEY)
      return { error: null }
    }

    // Fallback admin login via env vars (works even when Supabase Auth is not set up)
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || ''
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || ''
    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      const fallbackUser = {
        id: 'fallback-admin',
        email: adminEmail,
        user_metadata: { role: 'admin' },
      }
      localStorage.setItem(FALLBACK_ADMIN_KEY, JSON.stringify(fallbackUser))
      setUser(fallbackUser)
      return { error: null }
    }

    return { error: result.error }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    localStorage.removeItem(FALLBACK_ADMIN_KEY)
    setUser(null)
  }, [])

  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email?.includes('@apex') || false

  return { user, loading, isAdmin, login, logout }
}
