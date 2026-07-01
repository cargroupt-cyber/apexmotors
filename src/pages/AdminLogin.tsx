import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const hasFallbackAdmin = !!(import.meta.env.VITE_ADMIN_EMAIL && import.meta.env.VITE_ADMIN_PASSWORD)

function getLoginErrorMessage(error: any): string {
  if (!error) return 'Login failed. Please try again.'
  const msg = error.message || String(error)
  if (msg.includes('Invalid login credentials')) return 'Invalid email or password.'
  if (msg.includes('Email not confirmed')) return 'Email not confirmed. Please check your inbox.'
  if (msg.includes('network') || msg.includes('fetch')) return 'Network error. Please check your internet connection.'
  return msg
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, isAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAdmin) {
    navigate('/admin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await login(email, password)

    if (error) {
      setError(getLoginErrorMessage(error))
      setLoading(false)
      return
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-electric-blue" />
          </div>
          <h1 className="text-2xl font-bold text-pure-white">CarZee Admin</h1>
          <p className="text-chrome mt-1">Sign in to manage your inventory</p>
        </div>

        <div className="bg-midnight/50 rounded-2xl p-8 border border-white/5">
          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg bg-error/10 border border-error/20">
              <AlertCircle size={18} className="text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {!supabaseUrl && !hasFallbackAdmin && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-500">
                Supabase is not configured. Add <code className="bg-amber-500/20 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-500/20 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> environment variables, or set <code className="bg-amber-500/20 px-1 rounded">VITE_ADMIN_EMAIL</code> and <code className="bg-amber-500/20 px-1 rounded">VITE_ADMIN_PASSWORD</code> for fallback login.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-chrome mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none"
                placeholder="admin@apexautomotive.co.uk"
              />
            </div>

            <div>
              <label className="block text-sm text-chrome mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electric-blue text-pure-white py-3.5 rounded-lg hover:bg-blue-glow transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-chrome">
          <a href="/" className="text-electric-blue hover:underline">Back to website</a>
        </p>
      </motion.div>
    </div>
  )
}
