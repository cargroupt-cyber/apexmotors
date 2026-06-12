import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('james@apexautomotive.co.uk')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    // Mock login - any password works for demo
    if (email && password) {
      navigate('/admin')
    } else {
      setError('Please enter both email and password')
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#000814] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0077B6]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00B4D8]/5 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-dark rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-[#0077B6] flex items-center justify-center mb-4 shadow-lg shadow-[#0077B6]/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-white tracking-wide"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              APEX
              <span className="text-[#0077B6]"> Admin</span>
            </h1>
            <p className="text-sm text-[#5C677D] mt-1">Sign in to your admin dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#C8D3D9] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#001233] border border-[#33415C]/40 text-sm text-[#E5E5E5] placeholder:text-[#5C677D] focus:outline-none focus:border-[#0077B6]/50 focus:ring-1 focus:ring-[#0077B6]/20 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C8D3D9] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#001233] border border-[#33415C]/40 text-sm text-[#E5E5E5] placeholder:text-[#5C677D] focus:outline-none focus:border-[#0077B6]/50 focus:ring-1 focus:ring-[#0077B6]/20 transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[#FF4D6D] bg-[#FF4D6D]/10 px-3 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#0077B6] hover:bg-[#0077B6]/90 text-white text-sm font-medium transition-all shadow-lg shadow-[#0077B6]/20 mt-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-[#5C677D] mt-6">
            For demo purposes, any password will work.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
