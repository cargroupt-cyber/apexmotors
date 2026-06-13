import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

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
      setError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : 'Login failed. Please try again.'
      )
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
          <h1 className="text-2xl font-bold text-pure-white">APEX Admin</h1>
          <p className="text-chrome mt-1">Sign in to manage your inventory</p>
        </div>

        <div className="bg-midnight/50 rounded-2xl p-8 border border-white/5">
          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg bg-error/10 border border-error/20">
              <AlertCircle size={18} className="text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
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
