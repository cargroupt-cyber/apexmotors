import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  Search, ChevronDown, Star, Phone, Mail,
  MessageCircle, Shield, Clock, Handshake, Award, MapPin,
  Tag, Car, Fuel, Gauge, ChevronRight, Settings, Heart
} from 'lucide-react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles'

gsap.registerPlugin()

/* ═══════════════════════════════════════════
   PART 1: Particle Background (Three.js)
   ═══════════════════════════════════════════ */
function Particles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()
  const count = 3000

  const positions = useRef<Float32Array>(new Float32Array(count * 3))
  const velocities = useRef<Float32Array>(new Float32Array(count * 3))
  const phases = useRef<Float32Array>(new Float32Array(count))

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 20
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 10
      velocities.current[i * 3] = (Math.random() - 0.5) * 0.002
      velocities.current[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      velocities.current[i * 3 + 2] = 0
      phases.current[i] = Math.random() * Math.PI * 2
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const dummy = useRef(new THREE.Object3D())

  useFrame((_) => {
    if (!meshRef.current) return
    const mx = mouseRef.current.x * viewport.width * 0.5
    const my = mouseRef.current.y * viewport.height * 0.5

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      let px = positions.current[ix]
      let py = positions.current[ix + 1]

      const dx = px - mx
      const dy = py - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 1.5 && dist > 0.01) {
        const force = (1.5 - dist) * 0.02
        positions.current[ix] += (dx / dist) * force
        positions.current[ix + 1] += (dy / dist) * force
      }

      positions.current[ix] += velocities.current[ix] + Math.sin(Date.now() * 0.0005 + phases.current[i]) * 0.0002
      positions.current[ix + 1] += velocities.current[ix + 1] + Math.cos(Date.now() * 0.0005 + phases.current[i]) * 0.0002

      if (positions.current[ix] > 10) positions.current[ix] = -10
      if (positions.current[ix] < -10) positions.current[ix] = 10
      if (positions.current[ix + 1] > 10) positions.current[ix + 1] = -10
      if (positions.current[ix + 1] < -10) positions.current[ix + 1] = 10

      dummy.current.position.set(positions.current[ix], positions.current[ix + 1], positions.current[ix + 2])
      dummy.current.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.current.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <circleGeometry args={[0.02, 8]} />
      <meshBasicMaterial color="#0077B6" transparent opacity={0.5} />
    </instancedMesh>
  )
}

/* ═══════════════════════════════════════════
   PART 2: 3D Tilt Card Component
   ═══════════════════════════════════════════ */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [3, -3])
  const rotateY = useTransform(x, [-100, 100], [-3, 3])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set(e.clientX - cx)
    y.set(e.clientY - cy)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   PART 3: Vehicle Card — Uses Supabase field names
   ═══════════════════════════════════════════ */
function VehicleCard({ vehicle }: { vehicle: any }) {
  const vehicleName = `${vehicle.make} ${vehicle.model}`
  const vehicleImage = vehicle.images?.[0] || '/vehicle-thumb-01.jpg'
  const vehicleMileage = typeof vehicle.mileage === 'number' ? vehicle.mileage.toLocaleString() : vehicle.mileage
  const vehiclePrice = typeof vehicle.price === 'number' ? `£${vehicle.price.toLocaleString()}` : vehicle.price
  const vehicleMonthly = typeof vehicle.monthly_payment === 'number' ? `£${vehicle.monthly_payment}` : vehicle.monthly_payment
  const hasDiscount = (vehicle.discount_amount || 0) > 0
  const computedBadge = vehicle.badge || (hasDiscount ? 'SAVE' : null)
  const vehicleFeatures = Array.isArray(vehicle.features) ? vehicle.features : []

  return (
    <TiltCard className="perspective-1000">
      <motion.div
        className="relative rounded-2xl overflow-hidden group cursor-pointer bg-midnight/60"
        style={{
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(92, 103, 125, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
        whileHover={{
          y: -8,
          boxShadow: '0 16px 48px rgba(0, 119, 182, 0.15)',
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        {/* Image */}
        <div className="relative h-[210px] overflow-hidden">
          <img
            src={vehicleImage}
            alt={vehicleName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-transparent to-transparent" />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-md text-[0.6875rem] font-bold bg-error text-pure-white shadow-lg">
                SAVE £{vehicle.discount_amount?.toLocaleString()}
              </span>
            )}
            {computedBadge && computedBadge !== 'SAVE' && (
              <span className="px-2.5 py-1 rounded-md text-[0.6875rem] font-bold bg-success text-pure-white shadow-lg">
                {computedBadge}
              </span>
            )}
          </div>

          {/* Top-right wishlist */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-obsidian/60 backdrop-blur-sm flex items-center justify-center hover:bg-obsidian/80 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={14} className="text-pure-white" />
          </button>

          {/* Location badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-obsidian/60 backdrop-blur-sm">
            <MapPin size={10} className="text-blue-glow" />
            <span className="text-[0.6875rem] text-frost font-medium">{vehicle.location}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-pure-white text-[1.0625rem] truncate leading-tight">
            {vehicleName}
          </h3>
          <p className="mt-1.5 font-mono text-[0.6875rem] text-chrome tracking-wide">
            {vehicle.year} &nbsp;|&nbsp; {vehicleMileage} mi &nbsp;|&nbsp; {vehicle.fuel_type} &nbsp;|&nbsp; {vehicle.transmission}
          </p>

          {/* Feature tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vehicleFeatures.slice(0, 3).map((feat: string) => (
              <span
                key={feat}
                className="px-2 py-0.5 rounded text-[0.625rem] font-medium text-chrome bg-obsidian/60 border border-slate/20"
              >
                {feat}
              </span>
            ))}
          </div>

          {/* Price display */}
          <div className="mt-4 pt-4 border-t border-slate/20">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-mono text-lg font-semibold text-pure-white">{vehiclePrice}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[0.6875rem] text-chrome">from </span>
                <span className="font-mono text-base font-semibold text-electric-blue">{vehicleMonthly}/mo</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </TiltCard>
  )
}

/* ═══════════════════════════════════════════
   PART 4: Feature Data
   ═══════════════════════════════════════════ */
const features = [
  { icon: Tag, title: 'Best Price Guaranteed', desc: "Found the same car for less? We'll beat it — and give you an extra \u00a3100. Our price promise is rock solid." },
  { icon: Clock, title: 'Same Day Drive Away', desc: 'Complete your purchase in under 2 hours. No waiting, no delays \u2014 pick your car, sign, and drive.' },
  { icon: Handshake, title: 'Hassle & Haggle-Free', desc: 'Our lowest price, always. No negotiation needed, no hidden mark-ups, no pressure. Just fair, transparent pricing.' },
  { icon: Shield, title: '3-Month Warranty', desc: 'Every car comes with our comprehensive warranty \u2014 \u00a30 excess, covering all mechanical and electrical components.' },
  { icon: Award, title: 'RAC 200-Point Inspection', desc: 'Every vehicle undergoes a rigorous RAC-approved 200-point inspection before it reaches our forecourt.' },
  { icon: MapPin, title: '3 Locations Nationwide', desc: "With showrooms across the UK, there's a CarZee near you. Browse online, visit in person." },
]

/* ═══════════════════════════════════════════
   PART 5: FAQ Data
   ═══════════════════════════════════════════ */
const faqs = [
  { q: 'Can I reserve a car online?', a: 'Yes \u2014 you can reserve any vehicle with a fully refundable \u00a399 deposit. The car will be held for 48 hours, giving you time to arrange a viewing or purchase.' },
  { q: 'What does the warranty cover?', a: 'Our complimentary 3-month warranty covers all mechanical and electrical components with \u00a30 excess. You can also upgrade to 12, 24, or 36 months for complete peace of mind.' },
  { q: 'How does part exchange work?', a: 'Enter your registration and mileage for an instant valuation. Bring your car in for a quick inspection, and we\'ll apply the value directly to your new purchase.' },
  { q: 'Can I really drive away the same day?', a: 'Absolutely. If your finance is approved and the car is ready, you can complete everything and drive away within 2 hours of arriving at the showroom.' },
  { q: 'Do you offer home delivery?', a: 'Yes \u2014 we offer nationwide home delivery. Your car will arrive fully sanitised, with all paperwork completed digitally where possible.' },
  { q: 'What if I change my mind?', a: 'All our cars come with a 7-day money-back guarantee. If you\'re not completely satisfied, return the car for a full refund \u2014 no questions asked.' },
]

/* ═══════════════════════════════════════════
   PART 6: Body Type Data
   ═══════════════════════════════════════════ */
const bodyTypes = ['Hatchback', 'SUV', 'Saloon', 'Estate', 'Coupe', 'Convertible', 'MPV', '4x4']
const searchBodyTypes = ['Any Body', 'Hatchback', 'SUV', 'Saloon', 'Estate', 'Coupe', 'Convertible', 'MPV', '4x4']
const makes = ['Any Make', 'Mercedes-Benz', 'BMW', 'Audi', 'Range Rover', 'Land Rover', 'Porsche', 'Tesla', 'Jaguar', 'Lexus', 'Ford', 'Volkswagen', 'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Volvo', 'Mazda', 'Subaru', 'Mini', 'Peugeot', 'Renault', 'Citroën', 'Seat', 'Skoda', 'Vauxhall', 'Fiat', 'Abarth', 'Alfa Romeo', 'Aston Martin', 'Bentley', 'Maserati', 'McLaren', 'Rolls-Royce']
const priceRanges = ['Any Price', 'Under £20k', '£20k - £30k', '£30k - £40k', '£40k - £50k', '£50k+']
const fuelTypes = ['Any Fuel', 'Petrol', 'Diesel', 'Hybrid', 'Electric']

/* ═══════════════════════════════════════════
   SEARCH DROPDOWN COMPONENT
   ═══════════════════════════════════════════ */
function SearchDropdown({ label, options, value, onChange, icon: Icon }: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  icon?: React.ComponentType<{ size?: number; className?: string }>
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass-input rounded-xl px-4 py-3.5 flex items-center gap-2.5 cursor-pointer hover:border-slate/50 transition-colors w-full"
      >
        {Icon && <Icon size={16} className="text-slate shrink-0" />}
        <span className="text-[0.875rem] text-frost truncate">{value || label}</span>
        <ChevronDown size={14} className="text-slate ml-auto shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-40 rounded-xl overflow-hidden glass-dark shadow-2xl border border-slate/25 max-h-[240px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt === label ? '' : opt); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  value === opt
                    ? 'bg-electric-blue/20 text-electric-blue font-medium'
                    : 'text-frost hover:bg-obsidian/60'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   PART 7: Review Data
   ═══════════════════════════════════════════ */
const reviews = [
  { name: 'James Wilson', car: 'Mercedes C-Class', text: "Fantastic experience from start to finish. The team made everything so easy." },
  { name: 'Emma Thompson', car: 'Range Rover Sport', text: "Best car buying experience I've ever had. No pressure, great prices." },
  { name: 'David Chen', car: 'Tesla Model 3', text: "The RAC inspection gave me total confidence. Car was immaculate." },
  { name: 'Lisa Anderson', car: 'BMW 3 Series', text: "Part exchange was seamless. Got a great price for my old car too." },
  { name: 'Michael Brown', car: 'Audi A4', text: "Drove away the same day. Finance was sorted in under an hour." },
  { name: 'Rachel Green', car: 'Jaguar F-PACE', text: "Home delivery was perfect. Car arrived sparkling clean with a full tank." },
]

/* ═══════════════════════════════════════════
   MAIN: Home Page Component
   ═══════════════════════════════════════════ */
export default function Home() {
  const { vehicles: dbVehicles } = useSupabaseVehicles()
  const availableVehicles = dbVehicles.filter((v) => !v.status || v.status.toLowerCase() !== 'sold')
  const [activeBodyType, setActiveBodyType] = useState('SUV')
  const [monthlyPayment, setMonthlyPayment] = useState(350)
  const [deposit, setDeposit] = useState(2000)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchTab, setSearchTab] = useState<'buy' | 'exchange'>('buy')
  const [searchMake, setSearchMake] = useState('')
  const [searchPrice, setSearchPrice] = useState('')
  const [searchBody, setSearchBody] = useState('')
  const [searchFuel, setSearchFuel] = useState('')
  const navigate = useNavigate()

  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 })

  /* GSAP animated counters */
  useGSAP(() => {
    if (statsInView) {
      const counters = document.querySelectorAll('.stat-counter')
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-target') || '0', 10)
        gsap.fromTo(counter,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function () {
              const val = Math.round(Number((counter as HTMLElement).innerText))
              const suffix = counter.getAttribute('data-suffix') || ''
              ;(counter as HTMLElement).innerText = val.toLocaleString() + suffix
            },
          }
        )
      })
    }
  }, { dependencies: [statsInView] })

  /* Budget calculation */
  const estimatedBudget = Math.round((monthlyPayment * 48) + (deposit * 1.5))

  /* Hero entrance animation */
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  }

  const heroItem = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  }

  return (
    <div>
      {/* ═══════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center bg-obsidian"
      >
        {/* Full-screen Background Car Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute inset-0 z-[1]"
        >
          <img
            src="/luxury-sedan-hero.jpg"
            alt="Luxury sedan"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay - strong on left for text, lighter on right to show car */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(0,8,20,0.88) 0%, rgba(0,8,20,0.65) 40%, rgba(0,8,20,0.35) 65%, rgba(0,8,20,0.15) 100%)' }}
          />
          {/* Bottom fade to next section */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[120px]"
            style={{ background: 'linear-gradient(to top, #000814 0%, transparent 100%)' }}
          />
        </motion.div>

        {/* Three.js Particle Canvas (on top of image) */}
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
          <Canvas
            orthographic
            camera={{ zoom: 50, position: [0, 0, 10] }}
            style={{ width: '100%', height: '100%', opacity: 0.3 }}
          >
            <Particles />
          </Canvas>
        </div>

        {/* Content */}
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 container-apex max-w-[640px] py-32"
        >
          <motion.div
            variants={heroItem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/10 border border-electric-blue/20 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[0.8125rem] font-medium text-electric-blue tracking-wide">{availableVehicles.length > 0 ? `${availableVehicles.length.toLocaleString()}+` : '400+'} RAC-Approved Vehicles</span>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="font-display font-bold text-pure-white leading-[0.92] tracking-[-0.04em]"
            style={{
              fontSize: 'clamp(3.2rem, 8vw, 6.5rem)',
              textShadow: '0 4px 30px rgba(0,0,0,0.4)',
            }}
          >
            Find Your<br />Perfect Drive
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mt-7 text-lg text-frost/90 leading-relaxed max-w-[500px]"
          >
            Inspected, certified, and ready to drive away today. No haggling, no hidden fees — just unbeatable prices on premium vehicles.
          </motion.p>

          <motion.div variants={heroItem} className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/inventory"
              className="px-9 py-4 bg-electric-blue text-pure-white font-semibold text-[0.875rem] rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 tracking-[0.02em] inline-flex items-center gap-2"
            >
              <Search size={16} />
              Browse All Cars
            </Link>
            <Link
              to="/sell-your-car"
              className="px-9 py-4 bg-transparent text-pure-white font-semibold text-[0.875rem] rounded-full border-2 border-white/30 hover:bg-white/10 hover:border-electric-blue transition-all duration-300 tracking-[0.02em]"
            >
              Sell Your Car
            </Link>
          </motion.div>

          <motion.div variants={heroItem} className="mt-10 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-success" />
              <span className="text-sm font-medium text-chrome">RAC Approved</span>
            </div>
            <div className="w-px h-5 bg-slate/30" />
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, j) => (
                <Star key={j} size={14} className="text-warning fill-warning" />
              ))}
              <span className="ml-1 text-sm font-medium text-chrome">4.9/5</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown size={24} className="text-chrome animate-bounce-chevron" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: SEARCH WIDGET
          ═══════════════════════════════════════════ */}
      <section className="relative z-20 -mt-28 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="max-w-[1100px] mx-auto rounded-3xl p-6 md:p-8 glass-dark"
          style={{ boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(92, 103, 125, 0.15)' }}
        >
          {/* Tab Bar */}
          <div className="flex gap-1 mb-5 p-1 bg-obsidian/60 rounded-xl w-fit border border-slate/15">
            <button
              onClick={() => setSearchTab('buy')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                searchTab === 'buy'
                  ? 'bg-electric-blue text-pure-white shadow-lg shadow-electric-blue/20'
                  : 'text-chrome hover:text-frost'
              }`}
            >
              Buy a Car
            </button>
            <button
              onClick={() => setSearchTab('exchange')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                searchTab === 'exchange'
                  ? 'bg-electric-blue text-pure-white shadow-lg shadow-electric-blue/20'
                  : 'text-chrome hover:text-frost'
              }`}
            >
              Part Exchange
            </button>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <SearchDropdown label="Any Make" options={makes} value={searchMake} onChange={setSearchMake} icon={Car} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative"
            >
              <SearchDropdown label="Any Model" options={['Any Model']} value="" onChange={() => {}} icon={Settings} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <SearchDropdown label="Any Price" options={priceRanges} value={searchPrice} onChange={setSearchPrice} icon={Tag} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="relative"
            >
              <SearchDropdown label="Any Monthly" options={['Any Monthly']} value="" onChange={() => {}} icon={Gauge} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <SearchDropdown label="Any Body" options={searchBodyTypes} value={searchBody} onChange={setSearchBody} icon={Car} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="relative"
            >
              <SearchDropdown label="Any Fuel" options={fuelTypes} value={searchFuel} onChange={setSearchFuel} icon={Fuel} />
            </motion.div>
          </div>

          {/* Search Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => {
              const params = new URLSearchParams()
              if (searchMake && searchMake !== 'Any Make') params.set('make', searchMake)
              if (searchPrice && searchPrice !== 'Any Price') params.set('price', searchPrice)
              if (searchBody && searchBody !== 'Any Body') params.set('body', searchBody)
              if (searchFuel && searchFuel !== 'Any Fuel') params.set('fuel', searchFuel)
              navigate(`/inventory?${params.toString()}`)
            }}
            className="w-full mt-4 py-4 bg-electric-blue text-pure-white font-display font-semibold text-base rounded-xl flex items-center justify-center gap-3 hover:shadow-glow-lg hover:scale-[1.01] transition-all duration-300"
          >
            <Search size={20} />
            Search {availableVehicles.length > 0 ? `${availableVehicles.length.toLocaleString()}+` : '6,000+'} Cars
          </motion.button>

          {/* Quick Links */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { label: 'Finance Calculator', href: '/finance' },
              { label: 'Part Exchange Valuation', href: '/sell-your-car' },
              { label: 'Electric Cars', href: '/inventory' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-[0.8125rem] font-medium text-chrome hover:text-frost hover:underline underline-offset-4 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: WHY CHOOSE CarZee
          ═══════════════════════════════════════════ */}
      <section className="bg-midnight section-padding">
        <div className="container-apex">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-center max-w-[700px] mx-auto"
          >
            <h2
              className="font-display font-bold text-pure-white"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
            >
              Built Different.<br />Built for You.
            </h2>
            <p className="mt-5 text-lg text-frost leading-relaxed">
              Six reasons why thousands of drivers choose CarZee for their next car.
            </p>
          </motion.div>

          {/* Feature Grid - 3x2 */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="rounded-2xl p-8 glass hover:border-electric-blue/20 transition-all duration-400 group"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-electric-blue/10 border border-electric-blue/20 group-hover:bg-electric-blue/20 transition-colors">
                  <feature.icon size={26} className="text-electric-blue" />
                </div>
                <h3 className="mt-5 font-display font-semibold text-lg text-pure-white tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] text-chrome leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4: BUDGET CALCULATOR
          ═══════════════════════════════════════════ */}
      <section className="bg-obsidian section-padding">
        <div className="container-apex">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-[600px] mx-auto"
          >
            <h2
              className="font-display font-bold text-pure-white"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
            >
              What Can You Afford?
            </h2>
            <p className="mt-5 text-lg text-frost leading-relaxed">
              Set your budget and discover vehicles that match your monthly payment.
            </p>
          </motion.div>

          {/* Body Type Selector */}
          <div className="mt-14 flex flex-wrap justify-center gap-2.5">
            {bodyTypes.map((type, i) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                onClick={() => setActiveBodyType(type)}
                className={`px-5 py-3 rounded-xl text-sm font-medium border transition-all duration-300 ${
                  activeBodyType === type
                    ? 'bg-electric-blue border-electric-blue text-pure-white shadow-lg shadow-electric-blue/20'
                    : 'bg-obsidian/50 border-slate/25 text-frost hover:border-slate/50'
                }`}
              >
                <Car size={16} className="inline mr-2 -mt-0.5" />
                {type}
              </motion.button>
            ))}
          </div>

          {/* Budget Sliders */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[750px] mx-auto">
            {/* Monthly Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center p-6 rounded-2xl glass"
            >
              <p className="text-[0.8125rem] text-chrome uppercase tracking-[0.08em] font-medium">Max per month</p>
              <p className="mt-3 font-mono text-3xl text-pure-white font-semibold">&pound;{monthlyPayment}</p>
              <input
                type="range"
                min={100}
                max={1500}
                step={10}
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                className="w-full mt-5 h-2 bg-slate/30 rounded-full appearance-none cursor-pointer accent-electric-blue"
              />
              <div className="flex justify-between mt-3 text-xs text-chrome">
                <span>&pound;100</span>
                <span>&pound;1,500</span>
              </div>
            </motion.div>

            {/* Deposit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center p-6 rounded-2xl glass"
            >
              <p className="text-[0.8125rem] text-chrome uppercase tracking-[0.08em] font-medium">Your deposit</p>
              <p className="mt-3 font-mono text-3xl text-pure-white font-semibold">&pound;{deposit.toLocaleString()}</p>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full mt-5 h-2 bg-slate/30 rounded-full appearance-none cursor-pointer accent-electric-blue"
              />
              <div className="flex justify-between mt-3 text-xs text-chrome">
                <span>&pound;0</span>
                <span>&pound;10,000</span>
              </div>
            </motion.div>
          </div>

          {/* Budget Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-chrome">Your estimated budget</p>
            <p
              className="mt-3 font-display font-bold text-pure-white"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
            >
              &pound;{estimatedBudget.toLocaleString()}
            </p>
          </motion.div>

          {/* Search Button */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/inventory"
              className="px-10 py-4 bg-electric-blue text-pure-white font-display font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 inline-flex items-center gap-2"
            >
              Find My Car
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5: FEATURED VEHICLES (from Supabase)
          ═══════════════════════════════════════════ */}
      <section className="bg-midnight section-padding">
        <div className="container-apex">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <h2
                className="font-display font-bold text-pure-white"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
              >
                Featured Vehicles
              </h2>
              <p className="mt-3 text-base text-chrome">Handpicked deals updated weekly — don't miss out.</p>
            </div>
            <Link
              to="/inventory"
              className="group flex items-center gap-2 text-sm font-semibold text-electric-blue hover:text-blue-glow transition-colors shrink-0"
            >
              View All {availableVehicles.length > 0 ? availableVehicles.length.toLocaleString() : '6,000+'} Cars
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Vehicle Grid — from Supabase */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableVehicles.slice(0, 8).map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
              >
                <Link to={`/vehicle/${vehicle.id}`}>
                  <VehicleCard vehicle={vehicle} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6: TRUST & ACCREDITATION
          ═══════════════════════════════════════════ */}
      <section className="bg-obsidian section-padding" ref={statsRef}>
        <div className="container-apex max-w-[1100px]">
          {/* Accreditation Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-16 md:gap-24"
          >
            {[
              { icon: Shield, label: 'RAC Approved', sub: '200-Point Inspection' },
              { icon: Award, label: 'Motor Ombudsman', sub: 'Code of Practice' },
              { icon: Star, label: '5-Star Rated', sub: '800+ Reviews' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center">
                  <item.icon size={32} className="text-electric-blue" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-pure-white">{item.label}</p>
                  <p className="text-xs text-chrome mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="my-16 h-px bg-slate/20 max-w-[600px] mx-auto" />

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h2
              className="font-display font-bold text-pure-white"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              Trusted by Industry Leaders
            </h2>
            <p className="mt-4 text-base text-frost max-w-[600px] mx-auto leading-relaxed">
              CarZee is a fully accredited RAC Approved Dealer and a proud member of the Motor Ombudsman Code of Practice. Every car we sell meets the highest standards of quality, safety, and transparency.
            </p>
          </motion.div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { target: 978, suffix: '+', label: 'Vehicles sold since 2023', prefix: '' },
              { target: 974, suffix: '+', label: 'Five-star reviews', prefix: '' },
              { target: 3, suffix: '', label: 'Nationwide showrooms', prefix: '' },
              { target: 98, suffix: '%', label: 'Customer satisfaction', prefix: '' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="text-center"
              >
                <div className="h-0.5 w-12 bg-electric-blue mx-auto mb-5" />
                <p
                  className="stat-counter font-display font-bold text-pure-white"
                  data-target={stat.target}
                  data-suffix={stat.suffix}
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  0{stat.suffix}
                </p>
                <p className="mt-2 text-sm text-chrome">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7: TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <section className="bg-midnight section-padding">
        <div className="container-apex">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-[600px] mx-auto"
          >
            <h2
              className="font-display font-bold text-pure-white"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.0, letterSpacing: '-0.03em' }}
            >
              What Our Customers Say
            </h2>
            <p className="mt-4 text-base text-chrome">
              Join over 978 happy drivers who found their perfect car with CarZee.
            </p>
          </motion.div>

          {/* Featured Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="mt-14 max-w-[800px] mx-auto relative"
          >
            <div className="rounded-2xl p-8 md:p-10 glass">
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={18} className="text-warning fill-warning" />
                ))}
              </div>
              <p className="font-display text-lg md:text-xl text-pure-white leading-relaxed italic">
                "I was nervous about buying a used car online, but CarZee made the entire process effortless. The car arrived exactly as described — actually better than the photos. The RAC inspection gave me total confidence. I'll never buy a car anywhere else."
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                  <span className="font-display font-semibold text-pure-white">SM</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-pure-white">Sarah Mitchell</p>
                  <p className="text-xs text-chrome">Purchased BMW 3 Series · London</p>
                </div>
              </div>
            </div>
            {/* Car thumbnail */}
            <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2">
              <img
                src="/vehicle-thumb-02.jpg"
                alt="BMW 3 Series"
                className="w-[130px] rounded-xl border-2 border-chrome/20 rotate-3 shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Review Carousel */}
          <div className="mt-14 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="min-w-[320px] max-w-[320px] snap-start"
              >
                <div className="rounded-xl p-6 glass h-full">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="text-warning fill-warning" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-frost line-clamp-3 leading-relaxed">
                    "{review.text}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate/15">
                    <p className="text-sm font-semibold text-pure-white">{review.name}</p>
                    <p className="text-xs text-chrome">{review.car}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 8: FAQ
          ═══════════════════════════════════════════ */}
      <section className="bg-obsidian section-padding">
        <div className="container-apex max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2
              className="font-display font-bold text-pure-white"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
            >
              Common Questions
            </h2>
            <p className="mt-4 text-lg text-frost">
              Everything you need to know about buying with CarZee.
            </p>
          </motion.div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 rounded-xl glass hover:border-electric-blue/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-display font-semibold text-pure-white">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-chrome shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-sm text-chrome leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 9: CONTACT CTA
          ═══════════════════════════════════════════ */}
      <section className="bg-midnight section-padding">
        <div className="container-apex max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h2
              className="font-display font-bold text-pure-white"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.0, letterSpacing: '-0.03em' }}
            >
              Ready to Find Your Car?
            </h2>
            <p className="mt-4 text-lg text-frost max-w-[500px] mx-auto">
              Our team is here to help. Call us, email us, or visit your nearest showroom.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: Phone, label: 'Call Us', value: '07983183814' },
              { icon: Mail, label: 'Email Us', value: 'sales.carzee@gmail.com' },
              { icon: MessageCircle, label: 'Live Chat', value: 'Available 9am-6pm' },
            ].map((contact) => (
              <div
                key={contact.label}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl glass"
              >
                <div className="w-12 h-12 rounded-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center">
                  <contact.icon size={22} className="text-electric-blue" />
                </div>
                <p className="text-sm font-semibold text-pure-white">{contact.label}</p>
                <p className="text-xs text-chrome">{contact.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
