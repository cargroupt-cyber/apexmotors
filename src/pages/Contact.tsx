// @ts-nocheck
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Navigation,
  ChevronDown,
} from 'lucide-react'

/* ───────────────────── animation helpers ───────────────────── */

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeExpo },
  },
}

const staggerFast = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
}

/* ───────────────────── data ───────────────────── */

const contactMethods = [
  {
    icon: Phone,
    title: 'Call Us',
    detail: '07983183814',
    meta: 'Mon – Sat: 9am – 7pm',
    action: 'Call Now',
    href: 'tel:07983183814',
  },
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'sales.carzee@gmail.com',
    meta: 'We reply within 30 minutes',
    action: 'Send Email',
    href: 'mailto:sales.carzee@gmail.com',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    detail: 'Available 9am – 7pm daily',
    meta: 'Typically replies instantly',
    action: 'Start Chat',
    href: '#',
  },
]

const openingHours = [
  { day: 'Monday – Friday', hours: '9:00 AM – 7:00 PM' },
  { day: 'Saturday', hours: '9:00 AM – 6:00 PM' },
  { day: 'Sunday', hours: '10:30 AM – 4:00 PM' },
  { day: 'Bank Holidays', hours: '10:00 AM – 4:00 PM' },
]

const locations = [
  {
    name: 'CarZee London',
    address: 'Based In London',
    phone: '07983183814',
    hours: 'Mon – Sat: 9am – 7pm',
    mapColor: 'from-electric-blue/20 to-blue-glow/10',
  },
  {
    name: 'CarZee Birmingham',
    address: '456 Carriageway Rd, B1 1AA',
    phone: '07983183814',
    hours: 'Mon – Sat: 9am – 7pm',
    mapColor: 'from-blue-glow/20 to-ice-blue/10',
  },
  {
    name: 'CarZee Manchester',
    address: '789 Autobahn St, M1 1AA',
    phone: '07983183814',
    hours: 'Mon – Sat: 9am – 6pm',
    mapColor: 'from-ice-blue/20 to-electric-blue/10',
  },
]

const subjectOptions = [
  'General Enquiry',
  'Sales',
  'Finance',
  'Service',
  'Complaint',
]

/* ───────────────────── helpers ───────────────────── */

function getCurrentDayIndex(): number {
  const d = new Date().getDay()
  // 0=Sun, 1=Mon, ... 6=Sat
  if (d === 0) return 2 // Sunday
  if (d === 6) return 1 // Saturday
  return 0 // Mon-Fri
}

function isCurrentlyOpen(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  if (day === 0) return hour >= 10 && hour < 16 // Sunday
  if (day === 6) return hour >= 9 && hour < 18 // Saturday
  return hour >= 9 && hour < 19 // Mon-Fri
}

/* ───────────────────── component ───────────────────── */

export default function Contact() {
  const heroRef = useRef(null)
  const methodsRef = useRef(null)
  const formSectionRef = useRef(null)
  const hoursRef = useRef(null)
  const locationsRef = useRef(null)
  const mapRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true })
  const methodsInView = useInView(methodsRef, { once: true, amount: 0.2 })
  const formInView = useInView(formSectionRef, { once: true, amount: 0.15 })
  const hoursInView = useInView(hoursRef, { once: true, amount: 0.3 })
  const locationsInView = useInView(locationsRef, { once: true, amount: 0.15 })
  const mapInView = useInView(mapRef, { once: true, amount: 0.2 })

  /* Form state */
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacy: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!formData.firstName.trim()) e.firstName = 'First name is required'
    if (!formData.lastName.trim()) e.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      e.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Please enter a valid email'
    }
    if (!formData.subject) e.subject = 'Please select a subject'
    if (!formData.message.trim()) e.message = 'Message is required'
    if (!formData.privacy) e.privacy = 'You must agree to our privacy policy'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const WEB3FORMS_KEY = '407a7337-aeca-42b8-9b02-afe80238f322'

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: `${formData.firstName} ${formData.lastName}`,
          subject: `New Enquiry: ${formData.subject} - CarZee`,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || 'Not provided',
          enquiry_type: formData.subject,
          message: formData.message,
          replyto: formData.email,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setErrors({ submit: 'Something went wrong. Please try again or call us.' })
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again or call us directly.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const openNow = isCurrentlyOpen()
  const currentDayIndex = getCurrentDayIndex()

  return (
    <div>
      {/* ═══════════════════ SECTION 1: HERO ═══════════════════ */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #000814 0%, #001233 50%, #33415C 100%)',
          }}
        />
        <div ref={heroRef} className="relative z-10 container-apex text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easeExpo }}
            className="text-[0.8125rem] text-chrome font-body"
          >
            <Link to="/" className="hover:text-frost transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-frost">Contact</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: easeExpo }}
            className="mt-6 font-display font-bold text-pure-white leading-[0.95]"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            Get in Touch
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: easeExpo }}
            className="mt-5 text-[1.125rem] text-frost font-body max-w-[540px] mx-auto leading-relaxed"
          >
            Our team is here to help. Whether you're buying, selling, or just
            have a question — we'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════ SECTION 2: CONTACT METHODS ═══════════════════ */}
      <section
        ref={methodsRef}
        className="bg-midnight"
        style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}
      >
        <div className="container-apex max-w-[1200px]">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={methodsInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <motion.div
                  key={method.title}
                  variants={staggerItem}
                  className="glass rounded-[20px] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow/20"
                >
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-electric-blue/10">
                    <Icon size={32} className="text-electric-blue" />
                  </div>
                  <h3 className="mt-5 font-display font-semibold text-pure-white text-[1.25rem]">
                    {method.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] text-frost">
                    {method.detail}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-chrome">
                    {method.meta}
                  </p>
                  <a
                    href={method.href}
                    className="inline-block mt-4 text-[0.875rem] font-medium text-electric-blue hover:underline"
                  >
                    {method.action}
                  </a>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3: CONTACT FORM ═══════════════════ */}
      <section ref={formSectionRef} className="bg-obsidian section-padding">
        <div className="container-apex max-w-[900px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: easeExpo }}
            className="text-center"
          >
            <h2
              className="font-display font-semibold text-pure-white"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                letterSpacing: '-0.02em',
              }}
            >
              Send Us a Message
            </h2>
            <p className="mt-3 text-frost font-body">
              Fill in the form below and we'll respond within 30 minutes during
              opening hours.
            </p>
          </motion.div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeExpo }}
              className="mt-12 glass rounded-[20px] p-12 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h3 className="mt-6 font-display font-semibold text-pure-white text-xl">
                Message Sent!
              </h3>
              <p className="mt-2 text-frost">
                Thank you for getting in touch. Our team will get back to you
                shortly.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: '',
                    privacy: false,
                  })
                }}
                className="mt-6 px-6 py-2.5 text-[0.875rem] font-medium text-electric-blue border border-electric-blue/30 rounded-full hover:bg-electric-blue/10 transition-colors"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <motion.form
              variants={staggerFast}
              initial="hidden"
              animate={formInView ? 'visible' : 'hidden'}
              onSubmit={handleSubmit}
              className="mt-12 glass rounded-[20px] p-8 md:p-10"
              noValidate
            >
              {/* Name row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={staggerItem}>
                  <label className="block text-[0.8125rem] font-medium text-frost mb-1.5">
                    First Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={`w-full glass-input rounded-xl px-4 py-3.5 text-pure-white font-body placeholder:text-slate/60 focus:ring-2 focus:ring-electric-blue/30 ${
                      errors.firstName ? 'border-error' : ''
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-[0.75rem] text-error flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.firstName}
                    </p>
                  )}
                </motion.div>
                <motion.div variants={staggerItem}>
                  <label className="block text-[0.8125rem] font-medium text-frost mb-1.5">
                    Last Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={`w-full glass-input rounded-xl px-4 py-3.5 text-pure-white font-body placeholder:text-slate/60 ${
                      errors.lastName ? 'border-error' : ''
                    }`}
                    placeholder="Smith"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-[0.75rem] text-error flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.lastName}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Email */}
              <motion.div variants={staggerItem} className="mt-4">
                <label className="block text-[0.8125rem] font-medium text-frost mb-1.5">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full glass-input rounded-xl px-4 py-3.5 text-pure-white font-body placeholder:text-slate/60 ${
                    errors.email ? 'border-error' : ''
                  }`}
                  placeholder="john.smith@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-[0.75rem] text-error flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.email}
                  </p>
                )}
              </motion.div>

              {/* Phone */}
              <motion.div variants={staggerItem} className="mt-4">
                <label className="block text-[0.8125rem] font-medium text-frost mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3.5 text-pure-white font-body placeholder:text-slate/60"
                  placeholder="07983183814"
                />
              </motion.div>

              {/* Subject dropdown */}
              <motion.div variants={staggerItem} className="mt-4 relative">
                <label className="block text-[0.8125rem] font-medium text-frost mb-1.5">
                  Subject <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className={`w-full glass-input rounded-xl px-4 py-3.5 text-pure-white font-body appearance-none cursor-pointer ${
                      errors.subject ? 'border-error' : ''
                    } ${!formData.subject ? 'text-slate/60' : ''}`}
                  >
                    <option value="" disabled>
                      Select a subject...
                    </option>
                    {subjectOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-midnight text-pure-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-chrome pointer-events-none"
                  />
                </div>
                {errors.subject && (
                  <p className="mt-1 text-[0.75rem] text-error flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.subject}
                  </p>
                )}
              </motion.div>

              {/* Message */}
              <motion.div variants={staggerItem} className="mt-4">
                <label className="block text-[0.8125rem] font-medium text-frost mb-1.5">
                  Message <span className="text-error">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={5}
                  className={`w-full glass-input rounded-xl px-4 py-3.5 text-pure-white font-body placeholder:text-slate/60 resize-none ${
                    errors.message ? 'border-error' : ''
                  }`}
                  placeholder="How can we help you?"
                />
                {errors.message && (
                  <p className="mt-1 text-[0.75rem] text-error flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.message}
                  </p>
                )}
              </motion.div>

              {/* Privacy consent */}
              <motion.div variants={staggerItem} className="mt-5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.privacy}
                      onChange={(e) =>
                        handleChange('privacy', e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        formData.privacy
                          ? 'bg-electric-blue border-electric-blue'
                          : errors.privacy
                          ? 'border-error'
                          : 'border-slate/50 group-hover:border-electric-blue/60'
                      }`}
                    >
                      {formData.privacy && (
                        <CheckCircle size={14} className="text-pure-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-[0.8125rem] text-frost leading-relaxed">
                    I agree to the{' '}
                    <span className="text-electric-blue hover:underline cursor-pointer">
                      Privacy Policy
                    </span>{' '}
                    and consent to CarZee contacting me regarding my
                    enquiry.
                  </span>
                </label>
                {errors.privacy && (
                  <p className="mt-1 text-[0.75rem] text-error flex items-center gap-1 ml-8">
                    <AlertCircle size={12} />
                    {errors.privacy}
                  </p>
                )}
              </motion.div>

              {/* Submit error */}
              {errors.submit && (
                <motion.div variants={staggerItem} className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-[0.8125rem] text-error">
                  <AlertCircle size={16} />
                  {errors.submit}
                </motion.div>
              )}

              {/* Submit */}
              <motion.div variants={staggerItem} className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </motion.div>
            </motion.form>
          )}
        </div>
      </section>

      {/* ═══════════════════ SECTION 4: OPENING HOURS ═══════════════════ */}
      <section ref={hoursRef} className="bg-midnight" style={{ padding: 'clamp(3rem, 6vw, 4rem) 0' }}>
        <div className="container-apex max-w-[600px]">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={hoursInView ? 'visible' : 'hidden'}
          >
            <motion.h3
              variants={staggerItem}
              className="text-center font-display font-semibold text-pure-white text-[1.25rem]"
            >
              Opening Hours
            </motion.h3>

            {/* Status badge */}
            <motion.div
              variants={staggerItem}
              className="mt-4 flex justify-center"
            >
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.8125rem] font-medium ${
                  openNow
                    ? 'bg-success/15 text-success'
                    : 'bg-error/15 text-error'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    openNow ? 'bg-success animate-pulse' : 'bg-error'
                  }`}
                />
                {openNow ? 'Open Now' : 'Closed'}
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="mt-6">
              {openingHours.map((row, i) => (
                <div
                  key={row.day}
                  className={`flex items-center justify-between py-3 border-b border-slate/10 ${
                    i === currentDayIndex
                      ? 'px-3 -mx-3 rounded-lg bg-electric-blue/10'
                      : ''
                  }`}
                >
                  <span
                    className={`text-[0.9375rem] font-medium ${
                      i === currentDayIndex
                        ? 'text-electric-blue'
                        : 'text-chrome'
                    }`}
                  >
                    {row.day}
                  </span>
                  <span className="text-[0.9375rem] text-pure-white">
                    {row.hours}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 5: LOCATIONS ═══════════════════ */}
      <section
        ref={locationsRef}
        className="bg-obsidian"
        style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}
      >
        <div className="container-apex max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={locationsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: easeExpo }}
          >
            <h2
              className="font-display font-semibold text-pure-white"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                letterSpacing: '-0.02em',
              }}
            >
              Our Locations
            </h2>
            <p className="mt-2 text-[0.9375rem] text-chrome">
              3 showrooms across the UK
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={locationsInView ? 'visible' : 'hidden'}
            className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {locations.map((loc) => (
              <motion.div
                key={loc.name}
                variants={staggerItem}
                className="glass rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow/20"
              >
                {/* Map placeholder */}
                <div
                  className={`h-[140px] bg-gradient-to-br ${loc.mapColor} relative flex items-center justify-center`}
                >
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern
                          id={`grid-${loc.name}`}
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="0.5"
                          />
                        </pattern>
                      </defs>
                      <rect
                        width="100%"
                        height="100%"
                        fill={`url(#grid-${loc.name})`}
                      />
                    </svg>
                  </div>
                  <MapPin
                    size={32}
                    className="text-electric-blue relative z-10"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4 className="font-display font-semibold text-pure-white text-[1.125rem]">
                    {loc.name}
                  </h4>
                  <p className="mt-1 text-[0.875rem] text-chrome">
                    {loc.address}
                  </p>
                  <p className="mt-2 font-mono text-[0.8125rem] text-electric-blue">
                    {loc.phone}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-chrome">
                    <Clock size={14} className="text-electric-blue" />
                    {loc.hours}
                  </div>
                  <a
                    href="#"
                    className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-electric-blue hover:underline"
                  >
                    <Navigation size={14} />
                    Get Directions
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 6: MAP ═══════════════════ */}
      <section ref={mapRef} className="relative bg-obsidian pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={mapInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: easeExpo }}
          className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-none"
        >
          {/* Dark themed map placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-midnight to-obsidian" />
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="map-grid"
                  width="30"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 30 0 L 0 0 0 30"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)" />
            </svg>
          </div>
          {/* Gradient overlays */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 40%, rgba(0,119,182,0.15) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 70% 60%, rgba(0,180,216,0.1) 0%, transparent 50%)',
            }}
          />

          {/* Location pins */}
          {[
            { left: '25%', top: '55%' },
            { left: '42%', top: '48%' },
            { left: '48%', top: '35%' },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center"
              style={{ left: pos.left, top: pos.top }}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-electric-blue/30 flex items-center justify-center animate-pulse">
                  <MapPin size={16} className="text-electric-blue" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-electric-blue" />
              </div>
            </div>
          ))}

          {/* Overlay label */}
          <div className="absolute top-6 left-6 z-10">
            <div className="glass px-5 py-2.5 rounded-full flex items-center gap-2">
              <MapPin size={16} className="text-electric-blue" />
              <span className="text-[0.875rem] font-medium text-pure-white">
                3 Locations Nationwide
              </span>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{
              background:
                'linear-gradient(to top, #000814, transparent)',
            }}
          />
        </motion.div>

        {/* Emergency/After Hours note */}
        <div className="container-apex max-w-[900px] mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mapInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: easeExpo }}
            className="glass rounded-[16px] p-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-warning" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-pure-white">
                Emergency & After Hours
              </h4>
              <p className="mt-1 text-[0.875rem] text-frost leading-relaxed">
                For breakdown assistance and emergencies outside of opening
                hours, please call our 24/7 support line on{' '}
                <a
                  href="tel:07983183814"
                  className="text-electric-blue hover:underline font-mono"
                >
                  07983183814
                </a>
                . For all other enquiries, we'll respond first thing the next
                business day.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
