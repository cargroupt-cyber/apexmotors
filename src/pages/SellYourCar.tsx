// @ts-nocheck
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Star,
  ThumbsUp,
  AlertCircle,
  Wrench,
  Camera,
  ChevronRight,
  ChevronLeft,
  Shield,
  Clock,
  Truck,
  FileCheck,
  Ban,
  Headphones,
  ChevronDown,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { useSupabaseLeads } from '@/hooks/useSupabaseLeads'
import SEO from '@/components/SEO'
import { FAQPageSchema } from '@/components/SchemaMarkup'
import {
  VEHICLE_DATABASE,
  MAKES,
  YEARS,
} from '@/data/vehicleMakesModels'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WizardData {
  reg: string
  make: string
  model: string
  year: string
  variant: string
  mileage: string
  condition: string
  serviceHistory: string
  additionalDetails: string
  features: string[]
  photos: string[]
  firstName: string
  lastName: string
  email: string
  phone: string
  postcode: string
  sellType: 'outright' | 'part-exchange'
  interestedVehicle: string
  consent: boolean
}

/* ------------------------------------------------------------------ */
/*  Mock vehicle lookup database                                       */
/* ------------------------------------------------------------------ */

/* helpers for cascading make / model / variant selects */
const getModels = (make: string): string[] => {
  if (!make || !VEHICLE_DATABASE[make]) return []
  return Object.keys(VEHICLE_DATABASE[make]).sort()
}

const getVariants = (make: string, model: string): string[] => {
  if (!make || !model || !VEHICLE_DATABASE[make] || !VEHICLE_DATABASE[make][model]) return []
  return VEHICLE_DATABASE[make][model].variants
}

const mockVehicleDB: Record<string, { make: string; model: string; year: string; variant: string }> = {
  'AB12 CDE': { make: 'BMW', model: '3 Series', year: '2021', variant: 'M Sport' },
  'FG34 HIJ': { make: 'Mercedes-Benz', model: 'C-Class', year: '2022', variant: 'AMG Line' },
  'KL56 MNO': { make: 'Audi', model: 'A4', year: '2020', variant: 'S Line' },
  'PQ78 RST': { make: 'Porsche', model: 'Cayenne', year: '2023', variant: 'S' },
  'UV90 WXY': { make: 'Land Rover', model: 'Range Rover Sport', year: '2022', variant: 'HSE' },
  'YD23 ABC': { make: 'Ford', model: 'Focus', year: '2023', variant: 'ST-Line' },
  'LM19 XYZ': { make: 'Volkswagen', model: 'Golf', year: '2019', variant: 'GTI' },
  'NA69 DEF': { make: 'Toyota', model: 'Yaris', year: '2019', variant: 'Hybrid' },
}

const FEATURES_LIST = [
  'Satellite Navigation',
  'Leather Seats',
  'Panoramic Roof',
  'Heated Seats',
  'Reversing Camera',
  'Bluetooth',
  'Cruise Control',
  'Parking Sensors',
  'Keyless Entry',
  'Upgraded Sound System',
]

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                           */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    q: 'How is my valuation calculated?',
    a: 'We use real-time market data from thousands of transactions, combined with your vehicle\'s age, mileage, condition, and specification.',
  },
  {
    q: 'What do I need to bring?',
    a: 'Your V5C logbook, MOT certificate, service history, both sets of keys, and a form of ID.',
  },
  {
    q: 'Can I sell a car with outstanding finance?',
    a: 'Yes \u2014 we\'ll work with your finance company to settle the balance as part of the sale.',
  },
  {
    q: 'How long does the process take?',
    a: 'From valuation to payment, the entire process can be completed in as little as 24 hours.',
  },
  {
    q: 'Do you buy cars with damage?',
    a: 'We buy cars in all conditions. Simply be honest about the condition and we\'ll adjust our valuation fairly.',
  },
]

/* ------------------------------------------------------------------ */
/*  Easing helpers                                                     */
/* ------------------------------------------------------------------ */

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ------------------------------------------------------------------ */
/*  Accordion Component                                                */
/* ------------------------------------------------------------------ */

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className="glass rounded-2xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left"
            >
              <span className="font-display font-semibold text-pure-white text-[1rem] pr-4">
                {item.q}
              </span>
              <ChevronDown
                size={20}
                className={`text-chrome shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: easeExpo }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm text-frost leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const initialData: WizardData = {
  reg: '', make: '', model: '', year: '', variant: '',
  mileage: '', condition: '', serviceHistory: '', additionalDetails: '',
  features: [], photos: [],
  firstName: '', lastName: '', email: '', phone: '', postcode: '',
  sellType: 'outright', interestedVehicle: '', consent: false,
}

export default function SellYourCar() {
  const { addLead } = useSupabaseLeads()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [animatedPrice, setAnimatedPrice] = useState(0)
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerSubmitted, setOfferSubmitted] = useState(false)
  const [offerError, setOfferError] = useState('')

  const WEB3FORMS_KEY = '407a7337-aeca-42b8-9b02-afe80238f322'

  /* ---- helpers ---- */
  const update = useCallback((patch: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...patch }))
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }, [])

  const validateStep = useCallback((s: number): boolean => {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!data.reg.trim() && !data.make) e.reg = 'Enter registration or select make/model'
      if (!data.make) e.make = 'Select make'
      if (!data.model) e.model = 'Enter model'
      if (!data.year) e.year = 'Select year'
    }
    if (s === 2) {
      if (!data.mileage || Number(data.mileage) <= 0) e.mileage = 'Enter valid mileage'
      if (!data.condition) e.condition = 'Select condition'
      if (!data.serviceHistory) e.serviceHistory = 'Select service history'
    }
    if (s === 4) {
      if (!data.firstName.trim()) e.firstName = 'Enter first name'
      if (!data.lastName.trim()) e.lastName = 'Enter last name'
      if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'Enter valid email'
      if (!data.phone.trim()) e.phone = 'Enter phone number'
      if (!data.consent) e.consent = 'You must agree to be contacted'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [data])

  const lookupReg = useCallback(() => {
    const key = data.reg.trim().toUpperCase()
    const found = mockVehicleDB[key]
    if (found) {
      setData(prev => ({ ...prev, ...found }))
      setErrors(prev => { const n = { ...prev }; delete n.reg; return n })
    } else {
      setErrors(prev => ({ ...prev, reg: 'Registration not found. Enter details manually.' }))
    }
  }, [data.reg])

  const nextStep = useCallback(() => {
    if (!validateStep(step)) return
    if (step < 4) setStep(s => s + 1)
    else {
      setShowResult(true)
      setTimeout(() => setAnimatedPrice(18750), 300)
    }
  }, [step, validateStep])

  const prevStep = useCallback(() => setStep(s => s - 1), [])

  const valuationAmount = 18750
  const valuationLow = 16000
  const valuationHigh = 21000

  const handleAcceptOffer = useCallback(async () => {
    if (!data.email || !data.phone || !data.firstName || !data.lastName) {
      setOfferError('Please complete your contact details before accepting the offer.')
      return
    }
    if (!data.consent) {
      setOfferError('You must agree to be contacted to accept the offer.')
      return
    }

    setOfferSubmitting(true)
    setOfferError('')

    const fullName = `${data.firstName} ${data.lastName}`
    const vehicleDesc = `${data.year} ${data.make} ${data.model} ${data.variant}`

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: fullName,
          subject: `Sell My Car Offer Accepted - CarZee`,
          name: fullName,
          email: data.email,
          phone: data.phone,
          postcode: data.postcode || 'Not provided',
          enquiry_type: data.sellType === 'part-exchange' ? 'Part Exchange' : 'Sell Outright',
          vehicle: vehicleDesc,
          registration: data.reg || 'Not provided',
          mileage: data.mileage,
          condition: data.condition,
          service_history: data.serviceHistory,
          features: data.features.join(', '),
          estimated_value: `£${valuationAmount.toLocaleString()}`,
          interested_vehicle: data.interestedVehicle || 'N/A',
          message: data.additionalDetails || 'No additional details',
          replyto: data.email,
        }),
      })

      await addLead({
        name: fullName,
        email: data.email,
        phone: data.phone,
        vehicle_interest: vehicleDesc,
        status: 'new',
        source: 'Sell Your Car',
        date: new Date().toISOString(),
        notes: `Offer accepted. Valuation: £${valuationAmount.toLocaleString()}. Reg: ${data.reg || 'N/A'}. Mileage: ${data.mileage}. Condition: ${data.condition}. Service history: ${data.serviceHistory}. ${data.additionalDetails || ''}`,
        type: data.sellType === 'part-exchange' ? 'part-exchange' : 'sell-my-car',
        registration: data.reg,
        mileage: Number(data.mileage) || 0,
        condition: data.condition,
        estimated_value: valuationAmount,
      })

      setOfferSubmitted(true)
    } catch {
      setOfferError('Something went wrong. Please call us or try again.')
    } finally {
      setOfferSubmitting(false)
    }
  }, [data, addLead])

  /* ---- derived photo slots ---- */
  const photoSlots = Array.from({ length: 6 }, (_, i) => data.photos[i] || null)

  return (
    <div className="min-h-[100dvh]">
      <SEO
        title="Sell Your Car | Free Instant Valuation | CarZee"
        description="Sell your car the CarZee way. Get a free instant valuation, best price guarantee and same-day payment. Part exchange also available."
        canonical="/sell-your-car"
        schema={FAQPageSchema({ faqs: faqs.map(f => ({ question: f.q, answer: f.a })), render: false })}
      />
      {/* ============================================================ */}
      {/*  SECTION 1: Page Header                                       */}
      {/* ============================================================ */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '50vh' }}>
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/sellcar-hero.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#000814]/95 via-[#000814]/80 to-[#000814]/60" />
        </div>
        {/* Floating decorative shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-electric-blue/5 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-60 h-60 rounded-full bg-blue-glow/5 blur-3xl animate-pulse" style={{ animationDelay: '0.75s' }} />
        </div>

        <div className="container-apex relative z-10 text-center pt-[120px] pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeExpo }}
            className="flex items-center justify-center gap-2 text-sm text-chrome mb-6"
          >
            <Link to="/" className="hover:text-frost transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-frost">Sell Your Car</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easeExpo }}
            className="font-display font-bold text-pure-white leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
          >
            Sell Your Car<br />the CarZee Way
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeExpo }}
            className="mt-6 text-frost text-lg max-w-[560px] mx-auto leading-relaxed"
          >
            Free instant valuation. We&apos;ll beat any written quote. Same-day payment available.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-frost/80"
          >
            {['Free Valuation', 'Best Price Guaranteed', 'Same-Day Payment'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-success" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2: Valuation Wizard                                    */}
      {/* ============================================================ */}
      {!showResult && (
        <section className="section-padding bg-midnight">
          <div className="max-w-[800px] mx-auto" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 4rem)', paddingRight: 'clamp(1.5rem, 5vw, 4rem)' }}>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {/* Connecting line background */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate/30 -z-0" />
                {/* Completed line */}
                <div
                  className="absolute top-4 left-4 h-0.5 bg-electric-blue -z-0 transition-all duration-500"
                  style={{ width: `calc(${Math.min(step - 1, 3) * 33.333}% )` }}
                />
                {[1, 2, 3, 4].map(s => {
                  const completed = step > s
                  const active = step === s
                  return (
                    <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                          completed
                            ? 'bg-success text-obsidian'
                            : active
                              ? 'bg-electric-blue text-pure-white shadow-glow'
                              : 'bg-charcoal/50 text-chrome'
                        }`}
                      >
                        {completed ? <Check size={16} /> : s}
                      </div>
                      <span className={`text-xs font-medium ${active ? 'text-pure-white' : 'text-chrome'}`}>
                        {s === 1 && 'Vehicle'}
                        {s === 2 && 'Condition'}
                        {s === 3 && 'Photos'}
                        {s === 4 && 'Details'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Wizard Card */}
            <div className="glass rounded-3xl p-6 md:p-10">
              <AnimatePresence mode="wait">
                {/* ---- Step 1 ---- */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: easeExpo }}
                  >
                    <h3 className="font-display font-semibold text-xl text-pure-white mb-6">
                      Tell Us About Your Car
                    </h3>

                    {/* Registration lookup */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Enter your reg (e.g., AB12 CDE)"
                          value={data.reg}
                          onChange={e => { update({ reg: e.target.value }); clearError('reg') }}
                          className={`w-full font-mono text-lg px-5 py-4 rounded-2xl bg-[rgba(0,8,20,0.6)] border-2 text-pure-white placeholder-slate outline-none transition-all duration-300 ${
                            errors.reg ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                          }`}
                        />
                        {errors.reg && <p className="mt-1.5 text-xs text-error">{errors.reg}</p>}
                      </div>
                      <button
                        onClick={lookupReg}
                        className="px-8 py-4 bg-electric-blue text-pure-white font-semibold rounded-2xl hover:bg-blue-glow hover:shadow-glow transition-all duration-300 shrink-0"
                      >
                        Look Up
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-slate/20" />
                      <span className="text-sm text-chrome">or enter details manually</span>
                      <div className="flex-1 h-px bg-slate/20" />
                    </div>

                    {/* Manual fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-chrome mb-1.5">Make</label>
                        <select
                          value={data.make}
                          onChange={e => { update({ make: e.target.value, model: '', variant: '' }); clearError('make') }}
                          className={`w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border text-pure-white outline-none transition-all duration-300 ${
                            errors.make ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                          }`}
                        >
                          <option value="" className="bg-midnight">Select make</option>
                          {MAKES.map(m => <option key={m} value={m} className="bg-midnight">{m}</option>)}
                        </select>
                        {errors.make && <p className="mt-1 text-xs text-error">{errors.make}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-chrome mb-1.5">Model</label>
                        <select
                          value={data.model}
                          onChange={e => { update({ model: e.target.value, variant: '' }); clearError('model') }}
                          disabled={!data.make}
                          className={`w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border text-pure-white outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors.model ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                          }`}
                        >
                          <option value="" className="bg-midnight">
                            {data.make ? 'Select model' : 'Select make first'}
                          </option>
                          {getModels(data.make).map(m => (
                            <option key={m} value={m} className="bg-midnight">{m}</option>
                          ))}
                        </select>
                        {errors.model && <p className="mt-1 text-xs text-error">{errors.model}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-chrome mb-1.5">Year</label>
                        <select
                          value={data.year}
                          onChange={e => { update({ year: e.target.value }); clearError('year') }}
                          className={`w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border text-pure-white outline-none transition-all duration-300 ${
                            errors.year ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                          }`}
                        >
                          <option value="" className="bg-midnight">Select year</option>
                          {YEARS.map(y => <option key={y} value={y} className="bg-midnight">{y}</option>)}
                        </select>
                        {errors.year && <p className="mt-1 text-xs text-error">{errors.year}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-chrome mb-1.5">Variant</label>
                        <select
                          value={data.variant}
                          onChange={e => update({ variant: e.target.value })}
                          disabled={!data.model}
                          className="w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="" className="bg-midnight">
                            {data.model ? 'Select variant' : 'Select model first'}
                          </option>
                          {getVariants(data.make, data.model).map(v => (
                            <option key={v} value={v} className="bg-midnight">{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={nextStep}
                      className="w-full mt-6 py-4 bg-electric-blue text-pure-white font-semibold rounded-2xl hover:bg-blue-glow hover:shadow-glow transition-all duration-300"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {/* ---- Step 2 ---- */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: easeExpo }}
                  >
                    <h3 className="font-display font-semibold text-xl text-pure-white mb-6">
                      Condition &amp; Mileage
                    </h3>

                    {/* Mileage */}
                    <div className="mb-5">
                      <label className="block text-sm text-chrome mb-1.5">Current Mileage</label>
                      <input
                        type="number"
                        placeholder="e.g., 25000"
                        value={data.mileage}
                        onChange={e => { update({ mileage: e.target.value }); clearError('mileage') }}
                        className={`w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border text-pure-white placeholder-slate outline-none transition-all duration-300 ${
                          errors.mileage ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                        }`}
                      />
                      {errors.mileage && <p className="mt-1 text-xs text-error">{errors.mileage}</p>}
                    </div>

                    {/* Condition selector */}
                    <div className="mb-5">
                      <label className="block text-sm text-chrome mb-3">Condition</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'excellent', icon: Star, label: 'Excellent', desc: 'Like new. No marks, full service history.' },
                          { key: 'good', icon: ThumbsUp, label: 'Good', desc: 'Minor wear expected for age. Well maintained.' },
                          { key: 'fair', icon: AlertCircle, label: 'Fair', desc: 'Some cosmetic marks. Mechanically sound.' },
                          { key: 'poor', icon: Wrench, label: 'Poor', desc: 'Significant wear. May need attention.' },
                        ].map(({ key, icon: Icon, label, desc }) => {
                          const selected = data.condition === key
                          return (
                            <button
                              key={key}
                              onClick={() => { update({ condition: key }); clearError('condition') }}
                              className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                                selected
                                  ? 'border-electric-blue bg-electric-blue/10'
                                  : 'border-charcoal/30 hover:border-slate/50'
                              }`}
                            >
                              <Icon size={20} className={selected ? 'text-electric-blue' : 'text-chrome'} />
                              <span className="mt-2 font-display font-semibold text-pure-white text-sm">{label}</span>
                              <span className="text-xs text-chrome mt-0.5 leading-relaxed">{desc}</span>
                            </button>
                          )
                        })}
                      </div>
                      {errors.condition && <p className="mt-2 text-xs text-error">{errors.condition}</p>}
                    </div>

                    {/* Service History */}
                    <div className="mb-5">
                      <label className="block text-sm text-chrome mb-3">Service History</label>
                      <div className="flex flex-wrap gap-2">
                        {['Full Main Dealer', 'Full Independent', 'Part History', 'No History'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => { update({ serviceHistory: opt }); clearError('serviceHistory') }}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                              data.serviceHistory === opt
                                ? 'border-electric-blue bg-electric-blue/10 text-pure-white'
                                : 'border-charcoal/30 text-chrome hover:border-slate/50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {errors.serviceHistory && <p className="mt-2 text-xs text-error">{errors.serviceHistory}</p>}
                    </div>

                    {/* Additional details */}
                    <div className="mb-5">
                      <label className="block text-sm text-chrome mb-1.5">Additional Details (optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Any modifications, damage, or other details..."
                        value={data.additionalDetails}
                        onChange={e => update({ additionalDetails: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white placeholder-slate outline-none focus:border-electric-blue transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <label className="block text-sm text-chrome mb-3">Features</label>
                      <div className="flex flex-wrap gap-2">
                        {FEATURES_LIST.map(f => {
                          const selected = data.features.includes(f)
                          return (
                            <button
                              key={f}
                              onClick={() => {
                                const next = selected
                                  ? data.features.filter(x => x !== f)
                                  : [...data.features, f]
                                update({ features: next })
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-200 ${
                                selected
                                  ? 'border-electric-blue bg-electric-blue/10 text-pure-white'
                                  : 'border-charcoal/30 text-chrome hover:border-slate/50'
                              }`}
                            >
                              {selected && <Check size={10} className="inline mr-1" />}
                              {f}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={prevStep}
                        className="px-6 py-3.5 border-2 border-white/20 text-pure-white font-medium rounded-2xl hover:bg-white/5 hover:border-electric-blue transition-all duration-300"
                      >
                        <ChevronLeft size={18} className="inline mr-1" /> Back
                      </button>
                      <button
                        onClick={nextStep}
                        className="flex-1 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-2xl hover:bg-blue-glow hover:shadow-glow transition-all duration-300"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---- Step 3 ---- */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: easeExpo }}
                  >
                    <h3 className="font-display font-semibold text-xl text-pure-white mb-2">
                      Add Photos (Optional)
                    </h3>
                    <p className="text-sm text-frost mb-6">
                      Photos can increase your valuation by up to 5%. Upload up to 6 images.
                    </p>

                    {/* Upload area */}
                    <div className="border-2 border-dashed border-charcoal/40 rounded-2xl p-12 flex flex-col items-center justify-center text-center mb-6 hover:border-electric-blue hover:bg-electric-blue/5 transition-all duration-300 cursor-pointer">
                      <Camera size={40} className="text-chrome mb-3" />
                      <p className="text-sm text-chrome">Drag &amp; drop or click to upload</p>
                      <p className="text-xs text-slate mt-1">JPG, PNG up to 10MB each</p>
                    </div>

                    {/* Photo slots */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                      {photoSlots.map((p, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                            p
                              ? 'border-electric-blue bg-electric-blue/10'
                              : 'border-charcoal/30 bg-[rgba(0,8,20,0.4)]'
                          }`}
                        >
                          {p ? (
                            <Check size={20} className="text-success" />
                          ) : (
                            <Camera size={18} className="text-slate/50" />
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-chrome mb-6 bg-midnight/50 p-3 rounded-xl">
                      You can also bring your car to any CarZee showroom for professional photography during your inspection.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={prevStep}
                        className="px-6 py-3.5 border-2 border-white/20 text-pure-white font-medium rounded-2xl hover:bg-white/5 hover:border-electric-blue transition-all duration-300"
                      >
                        <ChevronLeft size={18} className="inline mr-1" /> Back
                      </button>
                      <button
                        onClick={() => setStep(4)}
                        className="flex-1 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-2xl hover:bg-blue-glow hover:shadow-glow transition-all duration-300"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---- Step 4 ---- */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: easeExpo }}
                  >
                    <h3 className="font-display font-semibold text-xl text-pure-white mb-6">
                      Your Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-chrome mb-1.5">First Name</label>
                        <input
                          type="text"
                          value={data.firstName}
                          onChange={e => { update({ firstName: e.target.value }); clearError('firstName') }}
                          className={`w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border text-pure-white outline-none transition-all duration-300 ${
                            errors.firstName ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                          }`}
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-error">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-chrome mb-1.5">Last Name</label>
                        <input
                          type="text"
                          value={data.lastName}
                          onChange={e => { update({ lastName: e.target.value }); clearError('lastName') }}
                          className={`w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border text-pure-white outline-none transition-all duration-300 ${
                            errors.lastName ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                          }`}
                        />
                        {errors.lastName && <p className="mt-1 text-xs text-error">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-chrome mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={data.email}
                        onChange={e => { update({ email: e.target.value }); clearError('email') }}
                        className={`w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border text-pure-white placeholder-slate outline-none transition-all duration-300 ${
                          errors.email ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-chrome mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={data.phone}
                        onChange={e => { update({ phone: e.target.value }); clearError('phone') }}
                        className={`w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border text-pure-white placeholder-slate outline-none transition-all duration-300 ${
                          errors.phone ? 'border-error/60' : 'border-charcoal/40 focus:border-electric-blue'
                        }`}
                        placeholder="07xxx xxxxxx"
                      />
                      {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-chrome mb-1.5">Postcode</label>
                      <input
                        type="text"
                        value={data.postcode}
                        onChange={e => update({ postcode: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white placeholder-slate outline-none focus:border-electric-blue transition-all duration-300"
                        placeholder="For collection / delivery estimate"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-chrome mb-3">How would you like to sell?</label>
                      <div className="flex flex-wrap gap-3">
                        {['Sell Outright', 'Part Exchange'].map(opt => {
                          const key = opt.toLowerCase().replace(' ', '-') as 'outright' | 'part-exchange'
                          const selected = data.sellType === key
                          return (
                            <button
                              key={opt}
                              onClick={() => update({ sellType: key })}
                              className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                                selected
                                  ? 'border-electric-blue bg-electric-blue/10 text-pure-white'
                                  : 'border-charcoal/30 text-chrome hover:border-slate/50'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {data.sellType === 'part-exchange' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4"
                      >
                        <label className="block text-sm text-chrome mb-1.5">Vehicle you&apos;re interested in</label>
                        <input
                          type="text"
                          value={data.interestedVehicle}
                          onChange={e => update({ interestedVehicle: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white placeholder-slate outline-none focus:border-electric-blue transition-all duration-300"
                          placeholder="e.g. BMW 5 Series"
                        />
                      </motion.div>
                    )}

                    <div className="mb-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.consent}
                          onChange={e => { update({ consent: e.target.checked }); clearError('consent') }}
                          className="mt-1 w-4 h-4 accent-electric-blue"
                        />
                        <span className="text-sm text-frost">
                          I agree to be contacted about my valuation
                        </span>
                      </label>
                      {errors.consent && <p className="mt-1 text-xs text-error ml-7">{errors.consent}</p>}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={prevStep}
                        className="px-6 py-3.5 border-2 border-white/20 text-pure-white font-medium rounded-2xl hover:bg-white/5 hover:border-electric-blue transition-all duration-300"
                      >
                        <ChevronLeft size={18} className="inline mr-1" /> Back
                      </button>
                      <button
                        onClick={nextStep}
                        className="flex-1 py-4 bg-electric-blue text-pure-white font-semibold rounded-2xl hover:bg-blue-glow hover:shadow-glow transition-all duration-300 text-base"
                      >
                        Get My Valuation
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  SECTION 3: Valuation Result                                    */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showResult && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="section-padding bg-obsidian"
          >
            <div className="max-w-[700px] mx-auto" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 4rem)', paddingRight: 'clamp(1.5rem, 5vw, 4rem)' }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
                className="glass rounded-3xl p-8 md:p-12 text-center"
              >
                {/* Vehicle summary */}
                <p className="font-mono text-sm text-chrome">
                  {data.year} {data.make} {data.model} {data.variant} &middot; {Number(data.mileage).toLocaleString()} miles
                </p>

                {/* Valuation */}
                <motion.p
                  className="mt-6 font-display font-bold text-pure-white leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
                >
                  &pound;{animatedPrice.toLocaleString()}
                </motion.p>
                <p className="mt-2 text-sm text-frost">Our guaranteed purchase price</p>

                {/* Best price badge */}
                <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success/10 border border-success/30">
                  <Check size={14} className="text-success" />
                  <span className="text-xs font-medium text-success">
                    We&apos;ll beat any written quote by &pound;100
                  </span>
                </div>

                {/* Range indicator */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs text-chrome mb-2">
                    <span>Market Low: &pound;{(valuationLow / 1000).toFixed(0)}k</span>
                    <span>Market High: &pound;{(valuationHigh / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="relative h-3 bg-charcoal/40 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-charcoal via-success to-electric-blue rounded-full"
                      style={{ width: '100%' }}
                    />
                    {/* Marker for our offer */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-success rounded-full border-2 border-pure-white shadow-lg"
                      style={{ left: `${((valuationAmount - valuationLow) / (valuationHigh - valuationLow)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                  <p className="text-xs text-success mt-2 font-medium">
                    CarZee Offer &middot; Valid for 7 days
                  </p>
                </div>

                {/* CTA Row */}
                {offerSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 glass rounded-2xl p-6 border border-success/30"
                  >
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={24} className="text-success" />
                    </div>
                    <h3 className="font-display font-semibold text-pure-white mb-1">
                      Offer Accepted
                    </h3>
                    <p className="text-sm text-frost">
                      Thank you. We&apos;ve received your details and will contact you within 24 hours to arrange collection.
                    </p>
                  </motion.div>
                ) : (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleAcceptOffer}
                      disabled={offerSubmitting}
                      className="px-8 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {offerSubmitting ? 'Submitting...' : <><Send size={16} /> Accept Offer</>}
                    </button>
                    <button
                      onClick={() => {
                        update({ sellType: 'part-exchange' })
                        setShowResult(false)
                        setStep(4)
                        setAnimatedPrice(0)
                      }}
                      className="px-8 py-3.5 border-2 border-white/20 text-pure-white font-medium rounded-full hover:bg-white/5 hover:border-electric-blue transition-all duration-300"
                    >
                      Part Exchange
                    </button>
                    <button
                      onClick={() => { setShowResult(false); setStep(1); setAnimatedPrice(0) }}
                      className="px-6 py-3.5 text-chrome font-medium rounded-full hover:text-pure-white transition-colors duration-300"
                    >
                      Reassess
                    </button>
                  </div>
                )}

                {offerError && (
                  <p className="mt-4 text-sm text-error flex items-center justify-center gap-1">
                    <AlertCircle size={16} /> {offerError}
                  </p>
                )}
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/*  SECTION 4: How It Works                                      */}
      {/* ============================================================ */}
      <section className="bg-midnight" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container-apex">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeExpo }}
            className="font-display font-semibold text-pure-white text-center mb-12"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1000px] mx-auto">
            {[
              { num: '01', title: 'Get Your Valuation', desc: 'Enter your registration for an instant, data-driven valuation based on market trends.' },
              { num: '02', title: 'Book an Appointment', desc: 'Bring your car to any CarZee showroom for a free, no-obligation inspection.' },
              { num: '03', title: 'Final Offer', desc: 'After inspection, we confirm our offer. No haggling, no hidden deductions.' },
              { num: '04', title: 'Get Paid', desc: 'Accept our offer and receive same-day payment directly to your bank account.' },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: easeExpo }}
              >
                <span className="font-display font-bold text-5xl text-electric-blue/30">{s.num}</span>
                <h4 className="mt-2 font-display font-semibold text-pure-white text-lg">{s.title}</h4>
                <p className="mt-2 text-sm text-chrome leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5: Trust Signals                                     */}
      {/* ============================================================ */}
      <section className="bg-obsidian" style={{ padding: 'clamp(3rem, 6vw, 4rem) 0' }}>
        <div className="container-apex">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
            {[
              { icon: Shield, title: 'Price Promise', desc: "We'll beat any written quote from a competitor by \u00a3100. Guaranteed." },
              { icon: Clock, title: 'Same-Day Payment', desc: 'No waiting for funds. Payment sent the moment you accept our offer.' },
              { icon: Truck, title: 'Free Collection', desc: "Can't come to us? We'll collect your car from your home or workplace, free of charge." },
              { icon: FileCheck, title: 'No Admin Fees', desc: "We don't charge any admin or transaction fees. The price we quote is the price you get." },
              { icon: Ban, title: 'No Obligation', desc: 'Our valuation is completely free with no obligation to sell. Walk away anytime.' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'A dedicated account manager handles your sale from start to finish.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: easeExpo }}
                className="flex gap-4"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center">
                  <Icon size={22} className="text-electric-blue" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-pure-white">{title}</h4>
                  <p className="mt-1 text-sm text-chrome leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 6: FAQ                                               */}
      {/* ============================================================ */}
      <section className="bg-midnight" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container-apex max-w-[800px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeExpo }}
            className="font-display font-semibold text-pure-white text-center mb-10"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            Selling Your Car: Common Questions
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: easeExpo }}
          >
            <Accordion items={faqs} />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
