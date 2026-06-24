// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '447XXXXXXXXXX' // ← CHANGE THIS TO YOUR REAL UK NUMBER (e.g., 447712345678)
const WHATSAPP_MESSAGE = 'Hi, I\'m interested in a car on your website. Can you help me?'

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Show tooltip after 3 seconds on first visit
    const timer = setTimeout(() => {
      const hasSeen = sessionStorage.getItem('whatsapp_tooltip_seen')
      if (!hasSeen) {
        setShowTooltip(true)
        sessionStorage.setItem('whatsapp_tooltip_seen', 'true')
        // Hide tooltip after 5 seconds
        setTimeout(() => setShowTooltip(false), 5000)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <>
      {/* Tooltip Popup */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 max-w-[260px]"
          >
            <div
              className="rounded-2xl p-4 shadow-xl border relative"
              style={{ backgroundColor: '#001233', borderColor: 'rgba(0,180,72,0.3)' }}
            >
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute top-2 right-2 text-[#5C677D] hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
              <p className="text-sm text-white font-medium">Need help finding a car?</p>
              <p className="text-xs mt-1" style={{ color: '#8B9EB3' }}>
                Message us on WhatsApp and we'll get back to you quickly.
              </p>
              {/* Arrow pointing down to button */}
              <div
                className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 border-r border-b"
                style={{ backgroundColor: '#001233', borderColor: 'rgba(0,180,72,0.3)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[320px] rounded-2xl shadow-2xl border overflow-hidden"
            style={{ backgroundColor: '#001233', borderColor: 'rgba(0,180,72,0.3)' }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: '#00B450' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">The UK Cars Group</p>
                  <p className="text-xs text-white/70">Typically replies within minutes</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4" style={{ backgroundColor: '#000814' }}>
              <div className="flex gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#00B450' }}
                >
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[220px]"
                  style={{ backgroundColor: '#001233', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-sm text-white">
                    Hi there! 👋 Welcome to The UK Cars Group. How can we help you today?
                  </p>
                  <p className="text-[10px] mt-1.5" style={{ color: '#5C677D' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Start Chat Button */}
            <div className="px-4 pb-4" style={{ backgroundColor: '#000814' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#00B450' }}
              >
                <MessageCircle size={18} />
                Start Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 1 }}
        onClick={() => {
          setIsOpen(!isOpen)
          setShowTooltip(false)
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: '#00B450' }}
        aria-label="Chat on WhatsApp"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring animation */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#00B450' }} />
        )}
      </motion.button>
    </>
  )
}
