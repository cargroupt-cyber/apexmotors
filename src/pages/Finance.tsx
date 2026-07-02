// @ts-nocheck
import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  Check,
  ChevronDown,
  Phone,
  Mail,
  Calculator,
  TrendingUp,
  ShieldCheck,
  X,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useSupabaseLeads } from '@/hooks/useSupabaseLeads'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import SEO from '@/components/SEO'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FinanceType = 'pcp' | 'hp'
type CreditRating = 'excellent' | 'good' | 'fair' | 'poor'

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                           */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    q: 'What documents do I need?',
    a: 'Proof of ID (passport/driving licence), proof of address (utility bill), and proof of income (payslips or bank statements).',
  },
  {
    q: 'How long does approval take?',
    a: 'Most applications receive a decision within minutes. Complex cases may take up to 24 hours.',
  },
  {
    q: 'Can I settle early?',
    a: 'Yes \u2014 with both PCP and HP, you can settle your agreement early. Contact us for a settlement figure.',
  },
  {
    q: 'What if I have bad credit?',
    a: 'We work with specialist lenders who consider all circumstances. Our 96% approval rate speaks for itself.',
  },
  {
    q: 'Is there a minimum deposit?',
    a: 'No \u2014 we offer zero-deposit options, though a deposit will reduce your monthly payments.',
  },
  {
    q: 'Can I part exchange?',
    a: 'Absolutely. Your part exchange value can be used as your deposit or returned to you as cash.',
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

function formatCurrency(n: number): string {
  return `\u00a3${Math.round(n).toLocaleString()}`
}

/* ---- APR lookup by credit rating ---- */
function getAPR(rating: CreditRating): number {
  switch (rating) {
    case 'excellent': return 7.9
    case 'good': return 9.9
    case 'fair': return 13.9
    case 'poor': return 19.9
  }
}

/* ---- PCP/HP calculation engine ---- */
interface CalcResult {
  monthlyPayment: number
  totalPayable: number
  totalInterest: number
  amountFinanced: number
  optionalFinalPayment: number
  apr: number
}

function calculateFinance(
  price: number,
  deposit: number,
  months: number,
  type: FinanceType,
  creditRating: CreditRating,
  _annualMileage: number,
): CalcResult {
  const apr = getAPR(creditRating)
  const monthlyRate = apr / 100 / 12
  const amountFinanced = Math.max(0, price - deposit)

  let monthlyPayment = 0
  let optionalFinalPayment = 0
  let totalPayable = 0

  if (type === 'pcp') {
    /* GFV: roughly depreciates ~12-18%/year depending on mileage */
    const years = months / 12
    const gfvRate = Math.max(0.25, 0.55 - years * 0.08)
    optionalFinalPayment = price * gfvRate
    const amountToFinance = amountFinanced - optionalFinalPayment

    if (monthlyRate === 0) {
      monthlyPayment = amountToFinance / months
    } else {
      monthlyPayment =
        (amountToFinance * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -months))
    }
    totalPayable = deposit + monthlyPayment * months + optionalFinalPayment
  } else {
    /* HP: simple amortised loan */
    if (monthlyRate === 0) {
      monthlyPayment = amountFinanced / months
    } else {
      monthlyPayment =
        (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
    }
    optionalFinalPayment = 0
    totalPayable = deposit + monthlyPayment * months
  }

  const totalInterest = totalPayable - price

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayable: Math.round(totalPayable),
    totalInterest: Math.round(totalInterest),
    amountFinanced: Math.round(amountFinanced),
    optionalFinalPayment: Math.round(optionalFinalPayment),
    apr,
  }
}

/* ------------------------------------------------------------------ */
/*  Accordion                                                          */
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
/*  Slider Component                                                   */
/* ------------------------------------------------------------------ */

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  displayValue,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  label: string
  displayValue: string
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-chrome">{label}</label>
        <span className="font-mono text-sm text-pure-white">{displayValue}</span>
      </div>
      <div className="relative h-2 bg-charcoal/40 rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-electric-blue rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-pure-white border-2 border-electric-blue shadow-md pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Finance() {
  /* ---- Calculator State ---- */
  const [financeType, setFinanceType] = useState<FinanceType>('pcp')
  const [vehiclePrice, setVehiclePrice] = useState(25000)
  const [deposit, setDeposit] = useState(2500)
  const [termMonths, setTermMonths] = useState(48)
  const [annualMileage, setAnnualMileage] = useState(10000)
  const [creditRating, setCreditRating] = useState<CreditRating>('good')

  /* ---- Eligibility State ---- */
  const [eligEmployment, setEligEmployment] = useState('')
  const [eligTenure, setEligTenure] = useState('')
  const [eligIncome, setEligIncome] = useState('')
  const [eligMissed, setEligMissed] = useState('')
  const [eligibilityResult, setEligibilityResult] = useState<'success' | 'caution' | null>(null)

  /* ---- Application Modal State ---- */
  const { addLead } = useSupabaseLeads()
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applyForm, setApplyForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employmentStatus: '',
    monthlyIncome: '',
    vehicleInterest: '',
    message: '',
    privacy: false,
  })
  const [applyErrors, setApplyErrors] = useState<Record<string, string>>({})
  const [applySubmitting, setApplySubmitting] = useState(false)
  const [applySubmitted, setApplySubmitted] = useState(false)

  const WEB3FORMS_KEY = '407a7337-aeca-42b8-9b02-afe80238f322'

  const validateApplyForm = (): boolean => {
    const e: Record<string, string> = {}
    if (!applyForm.firstName.trim()) e.firstName = 'First name is required'
    if (!applyForm.lastName.trim()) e.lastName = 'Last name is required'
    if (!applyForm.email.trim()) {
      e.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applyForm.email)) {
      e.email = 'Please enter a valid email'
    }
    if (!applyForm.phone.trim()) e.phone = 'Phone number is required'
    if (!applyForm.employmentStatus) e.employmentStatus = 'Employment status is required'
    if (!applyForm.monthlyIncome) e.monthlyIncome = 'Income range is required'
    if (!applyForm.privacy) e.privacy = 'You must agree to the privacy policy'
    setApplyErrors(e)
    return Object.keys(e).length === 0
  }

  const resetApplyForm = () => {
    setApplyForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employmentStatus: '',
      monthlyIncome: '',
      vehicleInterest: '',
      message: '',
      privacy: false,
    })
    setApplyErrors({})
    setApplySubmitted(false)
  }

  const handleApplySubmit = async (evt: React.FormEvent) => {
    evt.preventDefault()
    if (!validateApplyForm()) return

    setApplySubmitting(true)
    setApplyErrors({})

    const fullName = `${applyForm.firstName} ${applyForm.lastName}`
    const financeDetails = `Vehicle Price: ${formatCurrency(vehiclePrice)} | Deposit: ${formatCurrency(deposit)} | Term: ${termMonths} months | Finance Type: ${financeType.toUpperCase()} | Estimated Monthly: ${formatCurrency(result.monthlyPayment)} | APR: ${result.apr}%`

    try {
      // Send email via web3forms
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: fullName,
          subject: `New Finance Application - CarZee`,
          name: fullName,
          email: applyForm.email,
          phone: applyForm.phone,
          enquiry_type: 'Finance Application',
          employment_status: applyForm.employmentStatus,
          monthly_income: applyForm.monthlyIncome,
          vehicle_interest: applyForm.vehicleInterest || 'Not specified',
          finance_details: financeDetails,
          message: applyForm.message || 'No additional message',
          replyto: applyForm.email,
        }),
      })

      // Save lead to admin dashboard (Supabase if configured, otherwise localStorage)
      await addLead({
        name: fullName,
        email: applyForm.email,
        phone: applyForm.phone,
        vehicle_interest: applyForm.vehicleInterest || 'Not specified',
        status: 'new',
        source: 'Finance Page',
        date: new Date().toISOString(),
        notes: `Finance application. ${financeDetails}. Employment: ${applyForm.employmentStatus}, Income: ${applyForm.monthlyIncome}. ${applyForm.message || ''}`,
        type: 'finance',
        amount: result.amountFinanced,
        term: termMonths,
        employment_status: applyForm.employmentStatus,
        income: parseInt(applyForm.monthlyIncome.replace(/\D/g, ''), 10) || 0,
        credit_rating: creditRating,
      })

      setApplySubmitted(true)
    } catch {
      setApplyErrors({ submit: 'Something went wrong. Please try again or call us.' })
    } finally {
      setApplySubmitting(false)
    }
  }

  /* ---- Calculations ---- */
  const result = useMemo(
    () =>
      calculateFinance(
        vehiclePrice,
        deposit,
        termMonths,
        financeType,
        creditRating,
        annualMileage,
      ),
    [vehiclePrice, deposit, termMonths, financeType, creditRating, annualMileage],
  )

  /* ---- Pie chart segments ---- */
  const principalPct = (result.amountFinanced / result.totalPayable) * 100
  const interestPct = (result.totalInterest / result.totalPayable) * 100

  /* ---- deposit min/max for slider ---- */
  const depositMin = 0
  const depositMax = Math.floor(vehiclePrice * 0.5)

  /* ---- eligibility check ---- */
  const checkEligibility = useCallback(() => {
    let score = 0
    if (eligEmployment === 'employed' || eligEmployment === 'self-employed') score += 2
    if (eligEmployment === 'retired') score += 1
    if (eligTenure === '2-5yrs' || eligTenure === '5yrs+') score += 2
    if (eligTenure === '1-2yrs') score += 1
    if (eligIncome === '2500+' || eligIncome === '4000+') score += 2
    if (eligIncome === '1500-2500') score += 1
    if (eligMissed === 'no') score += 2

    if (score >= 5) setEligibilityResult('success')
    else setEligibilityResult('caution')
  }, [eligEmployment, eligTenure, eligIncome, eligMissed])

  return (
    <div className="min-h-[100dvh]">
      <SEO
        title="Car Finance | PCP & HP Car Finance at CarZee"
        description="Get approved for car finance at CarZee. PCP and HP options, competitive APR, zero deposit available, bad credit considered. Apply online in minutes."
        canonical="/finance"
      />
      {/* ============================================================ */}
      {/*  SECTION 1: Page Header                                       */}
      {/* ============================================================ */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '55vh' }}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/finance-showroom.jpg"
            alt="Finance showroom"
            className="w-full h-full object-cover opacity-35"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,8,20,0.5) 0%, #000814 100%)',
            }}
          />
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
            <span className="text-frost">Finance</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easeExpo }}
            className="font-display font-bold text-pure-white leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            Car Finance,<br />Made Simple
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeExpo }}
            className="mt-6 text-frost text-lg max-w-[560px] mx-auto leading-relaxed"
          >
            Competitive rates from 7.9% APR. Flexible terms. Instant decisions. Find a plan that fits your budget.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: easeExpo }}
            className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {[
              { value: '96%', label: 'Approval Rate' },
              { value: 'From 7.9%', label: 'Representative APR' },
              { value: 'Minutes', label: 'Decision Time' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-semibold text-xl text-pure-white">{stat.value}</p>
                <p className="text-xs text-chrome mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2: Finance Calculator                                  */}
      {/* ============================================================ */}
      <section className="section-padding bg-midnight">
        <div className="container-apex max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: easeExpo }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* ---- Left Column: Controls ---- */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Calculator size={22} className="text-electric-blue" />
                <h2
                  className="font-display font-semibold text-pure-white"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                >
                  Finance Calculator
                </h2>
              </div>

              {/* PCP / HP Tabs */}
              <div className="flex gap-2 mb-6">
                {([['pcp', 'PCP'], ['hp', 'Hire Purchase']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFinanceType(key)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      financeType === key
                        ? 'bg-electric-blue text-pure-white shadow-glow'
                        : 'bg-charcoal/30 text-chrome hover:bg-charcoal/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-5">
                {/* Vehicle Price */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-chrome">Vehicle Price</label>
                    <input
                      type="number"
                      value={vehiclePrice}
                      onChange={e => setVehiclePrice(Math.max(1000, Number(e.target.value)))}
                      className="w-28 px-3 py-1.5 text-right font-mono text-sm bg-[rgba(0,8,20,0.6)] border border-charcoal/40 rounded-lg text-pure-white outline-none focus:border-electric-blue"
                    />
                  </div>
                  <div className="relative h-2 bg-charcoal/40 rounded-full">
                    <div
                      className="absolute inset-y-0 left-0 bg-electric-blue rounded-full"
                      style={{ width: `${((vehiclePrice - 5000) / (80000 - 5000)) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={5000}
                      max={80000}
                      step={500}
                      value={vehiclePrice}
                      onChange={e => setVehiclePrice(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-pure-white border-2 border-electric-blue shadow-md pointer-events-none"
                      style={{ left: `calc(${((vehiclePrice - 5000) / (80000 - 5000)) * 100}% - 10px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate mt-1">
                    <span>&pound;5k</span>
                    <span>&pound;80k</span>
                  </div>
                </div>

                {/* Deposit */}
                <Slider
                  value={deposit}
                  min={depositMin}
                  max={depositMax}
                  step={100}
                  onChange={setDeposit}
                  label="Deposit"
                  displayValue={formatCurrency(deposit)}
                />
                <p className="text-xs text-chrome -mt-3">
                  {Math.round((deposit / vehiclePrice) * 100)}% of vehicle price
                </p>

                {/* Term */}
                <div>
                  <label className="text-sm text-chrome mb-2 block">Term</label>
                  <div className="flex flex-wrap gap-2">
                    {[24, 36, 48, 60].map(m => (
                      <button
                        key={m}
                        onClick={() => setTermMonths(m)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                          termMonths === m
                            ? 'border-electric-blue bg-electric-blue/10 text-pure-white'
                            : 'border-charcoal/30 text-chrome hover:border-slate/50'
                        }`}
                      >
                        {m} months
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual Mileage (PCP only) */}
                {financeType === 'pcp' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-sm text-chrome mb-2 block">Annual Mileage</label>
                    <select
                      value={annualMileage}
                      onChange={e => setAnnualMileage(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                    >
                      {[5000, 8000, 10000, 12000, 15000, 20000, 25000].map(m => (
                        <option key={m} value={m} className="bg-midnight">{m.toLocaleString()} miles</option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {/* Credit Rating */}
                <div>
                  <label className="text-sm text-chrome mb-2 block">Credit Rating</label>
                  <select
                    value={creditRating}
                    onChange={e => setCreditRating(e.target.value as CreditRating)}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                  >
                    <option value="excellent" className="bg-midnight">Excellent</option>
                    <option value="good" className="bg-midnight">Good</option>
                    <option value="fair" className="bg-midnight">Fair</option>
                    <option value="poor" className="bg-midnight">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ---- Right Column: Results ---- */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: easeExpo }}
            >
              <div className="glass rounded-3xl p-6 md:p-10 min-h-[400px] flex flex-col">
                {/* Monthly Payment */}
                <div className="text-center mb-8">
                  <p className="text-sm text-chrome mb-1">Your estimated monthly payment</p>
                  <p
                    className="font-display font-bold text-electric-blue leading-none"
                    style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
                  >
                    {formatCurrency(result.monthlyPayment)}
                  </p>
                  <p className="text-sm text-chrome mt-1">per month</p>
                </div>

                {/* Payment Breakdown */}
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Vehicle Price', value: formatCurrency(vehiclePrice) },
                    { label: 'Your Deposit', value: `-${formatCurrency(deposit)}`, accent: true },
                    { label: 'Amount Financed', value: formatCurrency(result.amountFinanced) },
                    { label: 'Term', value: `${termMonths} months` },
                    { label: 'Representative APR', value: `${result.apr}%` },
                    ...(financeType === 'pcp'
                      ? [{ label: 'Optional Final Payment', value: formatCurrency(result.optionalFinalPayment) }]
                      : []),
                    { label: 'Total Payable', value: formatCurrency(result.totalPayable), bold: true },
                    { label: 'Total Interest', value: formatCurrency(result.totalInterest), accent: true },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between py-2 border-b border-slate/10 ${row.bold ? 'border-t-2 border-t-slate/20 pt-3 mt-2' : ''}`}
                    >
                      <span className="text-sm text-chrome">{row.label}</span>
                      <span className={`font-mono text-sm ${row.bold ? 'text-pure-white font-semibold' : row.accent ? 'text-electric-blue' : 'text-pure-white'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Visual Breakdown Bar */}
                <div className="mt-6">
                  <div className="h-4 bg-charcoal/40 rounded-full overflow-hidden flex">
                    <div
                      className="bg-electric-blue h-full"
                      style={{ width: `${principalPct}%` }}
                    />
                    <div
                      className="bg-blue-glow h-full"
                      style={{ width: `${interestPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-electric-blue" />
                      <span className="text-xs text-chrome">Principal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-glow" />
                      <span className="text-xs text-chrome">Interest</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    resetApplyForm()
                    setShowApplyModal(true)
                  }}
                  className="w-full mt-6 py-4 bg-electric-blue text-pure-white font-semibold rounded-2xl hover:bg-blue-glow hover:shadow-glow transition-all duration-300"
                >
                  Apply Now
                </button>
                <p className="text-center text-xs text-slate mt-3">
                  Representative example. Actual rate depends on circumstances.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3: PCP vs HP                                          */}
      {/* ============================================================ */}
      <section className="bg-obsidian" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container-apex max-w-[1000px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeExpo }}
            className="font-display font-semibold text-pure-white text-center mb-12"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            Choose the Right Finance
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PCP Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeExpo }}
              className="glass rounded-3xl p-8"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-electric-blue/10 text-electric-blue text-xs font-semibold mb-4">
                Most Popular
              </span>
              <h3 className="font-display font-semibold text-xl text-pure-white">
                Personal Contract Purchase
              </h3>
              <p className="mt-2 text-frost text-sm leading-relaxed">
                Lower monthly payments with flexibility at the end of the term.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  'Lower monthly payments',
                  'Flexible end-of-term options',
                  'Upgrade to a new car easily',
                  'Optional final payment to own',
                ].map(pro => (
                  <li key={pro} className="flex items-center gap-2.5 text-sm text-frost">
                    <Check size={16} className="text-success shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm font-medium text-electric-blue">
                Best for: Drivers who want lower monthly costs and flexibility
              </p>
            </motion.div>

            {/* HP Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeExpo }}
              className="glass rounded-3xl p-8"
            >
              <h3 className="font-display font-semibold text-xl text-pure-white">
                Hire Purchase
              </h3>
              <p className="mt-2 text-frost text-sm leading-relaxed">
                Spread the full cost over fixed monthly payments. You own the car at the end.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  'No mileage restrictions',
                  'You own the car at the end',
                  'Simple and straightforward',
                  'Fixed monthly payments',
                ].map(pro => (
                  <li key={pro} className="flex items-center gap-2.5 text-sm text-frost">
                    <Check size={16} className="text-success shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm font-medium text-electric-blue">
                Best for: Drivers who want to own their car outright
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4: Eligibility Checker                                 */}
      {/* ============================================================ */}
      <section className="bg-midnight" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container-apex max-w-[700px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeExpo }}
          >
            <h2
              className="font-display font-semibold text-pure-white"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
            >
              Check Your Eligibility
            </h2>
            <p className="mt-3 text-frost text-sm leading-relaxed">
              Answer 4 quick questions &mdash; no impact on your credit score.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: easeExpo }}
            className="glass rounded-3xl p-6 md:p-10 mt-8 text-left"
          >
            {/* Q1 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-pure-white mb-3">
                What&apos;s your employment status?
              </label>
              <div className="flex flex-wrap gap-2">
                {['Employed', 'Self-Employed', 'Retired', 'Other'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setEligEmployment(opt.toLowerCase().replace('-', ''))}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                      eligEmployment === opt.toLowerCase().replace('-', '')
                        ? 'border-electric-blue bg-electric-blue/10 text-pure-white'
                        : 'border-charcoal/30 text-chrome hover:border-slate/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-pure-white mb-3">
                How long have you been in your current role?
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Less than 1yr', value: 'lt1' },
                  { label: '1-2 years', value: '1-2yrs' },
                  { label: '2-5 years', value: '2-5yrs' },
                  { label: '5+ years', value: '5yrs+' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEligTenure(opt.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                      eligTenure === opt.value
                        ? 'border-electric-blue bg-electric-blue/10 text-pure-white'
                        : 'border-charcoal/30 text-chrome hover:border-slate/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-pure-white mb-3">
                What&apos;s your approximate monthly income?
              </label>
              <select
                value={eligIncome}
                onChange={e => setEligIncome(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
              >
                <option value="" className="bg-midnight text-chrome">Select income range</option>
                <option value="lt1500" className="bg-midnight">Under &pound;1,500</option>
                <option value="1500-2500" className="bg-midnight">&pound;1,500 - &pound;2,500</option>
                <option value="2500-4000" className="bg-midnight">&pound;2,500 - &pound;4,000</option>
                <option value="4000+" className="bg-midnight">&pound;4,000+</option>
              </select>
            </div>

            {/* Q4 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-pure-white mb-3">
                Any missed payments in the last 12 months?
              </label>
              <div className="flex gap-3">
                {[
                  { label: 'No', value: 'no' },
                  { label: 'Yes', value: 'yes' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEligMissed(opt.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                      eligMissed === opt.value
                        ? 'border-electric-blue bg-electric-blue/10 text-pure-white'
                        : 'border-charcoal/30 text-chrome hover:border-slate/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={checkEligibility}
              disabled={!eligEmployment || !eligTenure || !eligIncome || !eligMissed}
              className="w-full py-4 bg-electric-blue text-pure-white font-semibold rounded-2xl hover:bg-blue-glow hover:shadow-glow transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-electric-blue disabled:hover:shadow-none"
            >
              Check Eligibility
            </button>

            {/* Result */}
            <AnimatePresence>
              {eligibilityResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: easeExpo }}
                  className="overflow-hidden"
                >
                  {eligibilityResult === 'success' ? (
                    <div className="glass rounded-2xl p-6 text-center border border-success/30">
                      <ShieldCheck size={32} className="text-success mx-auto mb-2" />
                      <p className="font-display font-semibold text-pure-white">
                        Great news! Based on your answers, you&apos;re likely to be approved.
                      </p>
                      <button
                        onClick={() => {
                          resetApplyForm()
                          setShowApplyModal(true)
                        }}
                        className="mt-4 px-8 py-3 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300"
                      >
                        Apply Now
                      </button>
                    </div>
                  ) : (
                    <div className="glass rounded-2xl p-6 text-center border border-warning/30">
                      <TrendingUp size={32} className="text-warning mx-auto mb-2" />
                      <p className="font-display font-semibold text-pure-white">
                        You may still be eligible. Speak to our team for a personalised assessment.
                      </p>
                      <Link
                        to="/contact"
                        className="mt-4 inline-block px-8 py-3 border-2 border-white/20 text-pure-white font-medium rounded-full hover:bg-white/5 hover:border-electric-blue transition-all duration-300"
                      >
                        Contact Us
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5: FAQ                                                 */}
      {/* ============================================================ */}
      <section className="bg-obsidian" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container-apex max-w-[800px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeExpo }}
            className="font-display font-semibold text-pure-white text-center mb-10"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            Finance FAQ
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

      {/* ============================================================ */}
      {/*  SECTION 6: CTA Section                                         */}
      {/* ============================================================ */}
      <section className="bg-midnight" style={{ padding: 'clamp(3rem, 6vw, 4rem) 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeExpo }}
          className="container-apex text-center"
        >
          <h2 className="font-display font-semibold text-2xl text-pure-white">
            Our Finance Team Is Here to Help
          </h2>
          <p className="mt-2 text-sm text-frost">
            Speak to a specialist &mdash; no obligation, no pressure.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:07983183814"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/20 text-pure-white font-medium rounded-full hover:bg-white/5 hover:border-electric-blue transition-all duration-300"
            >
              <Phone size={16} /> Call Us
            </a>
            <a
              href="mailto:sales.carzee@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-chrome font-medium rounded-full hover:text-pure-white hover:underline transition-all duration-300"
            >
              <Mail size={16} /> Email Us
            </a>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  Finance Application Modal                                      */}
      {/* ============================================================ */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="bg-midnight border-white/10 text-pure-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-pure-white">
              Apply for Finance
            </DialogTitle>
          </DialogHeader>

          {applySubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h3 className="font-display text-xl font-semibold text-pure-white mb-2">
                Application Submitted
              </h3>
              <p className="text-frost text-sm mb-6">
                Thank you, {applyForm.firstName}. Our finance team will review your
                application and contact you within 24 hours.
              </p>
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-8 py-3 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300"
              >
                Close
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleApplySubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-chrome mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={applyForm.firstName}
                    onChange={e => setApplyForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                    placeholder="John"
                  />
                  {applyErrors.firstName && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {applyErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-chrome mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={applyForm.lastName}
                    onChange={e => setApplyForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                    placeholder="Smith"
                  />
                  {applyErrors.lastName && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {applyErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-chrome mb-1.5">Email</label>
                <input
                  type="email"
                  value={applyForm.email}
                  onChange={e => setApplyForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                  placeholder="john@example.com"
                />
                {applyErrors.email && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {applyErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-chrome mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={applyForm.phone}
                  onChange={e => setApplyForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                  placeholder="07xxx xxxxxx"
                />
                {applyErrors.phone && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {applyErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-chrome mb-1.5">Employment Status</label>
                <select
                  value={applyForm.employmentStatus}
                  onChange={e => setApplyForm(prev => ({ ...prev, employmentStatus: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                >
                  <option value="" className="bg-midnight text-chrome">Select status</option>
                  <option value="employed" className="bg-midnight">Employed</option>
                  <option value="self-employed" className="bg-midnight">Self-Employed</option>
                  <option value="retired" className="bg-midnight">Retired</option>
                  <option value="other" className="bg-midnight">Other</option>
                </select>
                {applyErrors.employmentStatus && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {applyErrors.employmentStatus}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-chrome mb-1.5">Monthly Income</label>
                <select
                  value={applyForm.monthlyIncome}
                  onChange={e => setApplyForm(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                >
                  <option value="" className="bg-midnight text-chrome">Select income range</option>
                  <option value="Under £1,500" className="bg-midnight">Under £1,500</option>
                  <option value="£1,500 - £2,500" className="bg-midnight">£1,500 - £2,500</option>
                  <option value="£2,500 - £4,000" className="bg-midnight">£2,500 - £4,000</option>
                  <option value="£4,000+" className="bg-midnight">£4,000+</option>
                </select>
                {applyErrors.monthlyIncome && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {applyErrors.monthlyIncome}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-chrome mb-1.5">
                  Vehicle of Interest <span className="text-slate">(optional)</span>
                </label>
                <input
                  type="text"
                  value={applyForm.vehicleInterest}
                  onChange={e => setApplyForm(prev => ({ ...prev, vehicleInterest: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300"
                  placeholder="e.g. 2022 BMW M3"
                />
              </div>

              <div>
                <label className="block text-sm text-chrome mb-1.5">
                  Message <span className="text-slate">(optional)</span>
                </label>
                <textarea
                  value={applyForm.message}
                  onChange={e => setApplyForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-charcoal/40 text-pure-white outline-none focus:border-electric-blue transition-all duration-300 resize-none"
                  placeholder="Any additional details..."
                />
              </div>

              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setApplyForm(prev => ({ ...prev, privacy: !prev.privacy }))}
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    applyForm.privacy
                      ? 'bg-electric-blue border-electric-blue'
                      : 'border-charcoal/40 bg-transparent'
                  }`}
                >
                  {applyForm.privacy && <Check size={14} className="text-pure-white" />}
                </button>
                <span className="text-xs text-frost leading-relaxed">
                  I agree to the{' '}
                  <Link to="/about" className="text-electric-blue hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  and consent to CarZee contacting me regarding my finance application.
                </span>
              </div>
              {applyErrors.privacy && (
                <p className="text-xs text-error -mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {applyErrors.privacy}
                </p>
              )}

              {applyErrors.submit && (
                <p className="text-sm text-error text-center flex items-center justify-center gap-1">
                  <AlertCircle size={16} /> {applyErrors.submit}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-3 border border-white/20 text-pure-white font-medium rounded-xl hover:bg-white/5 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applySubmitting}
                  className="flex-1 py-3 bg-electric-blue text-pure-white font-semibold rounded-xl hover:bg-blue-glow hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {applySubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send size={16} /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
