import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Car } from 'lucide-react'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Sell Your Car', path: '/sell-your-car' },
  { label: 'Finance', path: '/finance' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu when the route changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(0, 8, 20, 0.95)'
            : 'rgba(0, 8, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(92, 103, 125, 0.2)',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        <div className="container-apex flex items-center justify-between h-[72px] md:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue via-blue-glow to-ice-blue shadow-lg shadow-electric-blue/20 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,transparent_50%)]" />
              <Car size={20} className="relative text-pure-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg md:text-xl font-bold tracking-[0.08em] text-pure-white uppercase group-hover:text-electric-blue transition-colors duration-300">
                CarZee
              </span>
              <span className="text-[0.55rem] md:text-[0.6rem] tracking-[0.22em] text-chrome uppercase mt-0.5">
                Premium Motors
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-3 py-2 text-[0.875rem] font-medium text-frost/80 hover:text-pure-white transition-colors duration-300 group"
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-3 right-3 h-[2px] bg-electric-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:07983183814"
              className="flex items-center gap-2 font-mono text-xs text-electric-blue hover:text-blue-glow transition-colors"
            >
              <Phone size={14} />
              07983183814
            </a>
            <Link
              to="/contact"
              className="px-6 py-2.5 bg-electric-blue text-pure-white text-[0.875rem] font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300"
            >
              Book Test Drive
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-pure-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-obsidian/98 backdrop-blur-xl lg:hidden"
            style={{ paddingTop: '72px' }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-6 pb-20">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.07,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-display font-semibold text-frost hover:text-pure-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  duration: 0.4,
                  delay: navLinks.length * 0.07,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="mt-4"
              >
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="px-8 py-3 bg-electric-blue text-pure-white text-base font-semibold rounded-full"
                >
                  Book Test Drive
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
