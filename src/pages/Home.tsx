import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  Search, ChevronDown, CheckCircle, Star, Phone, Mail,
  MessageCircle, Shield, Clock, Handshake, Award, MapPin,
  Tag, Car, Fuel, Gauge, ChevronRight, Settings, Heart
} from 'lucide-react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

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
   PART 3: Vehicle Data
   ═══════════════════════════════════════════ */
const vehicles = [
  { id: 1, image: '/vehicle-thumb-01.jpg', name: 'Mercedes-Benz C-Class', year: 2023, mileage: '18,500', fuel: 'Diesel', trans: 'Auto', price: '£28,990', monthly: '£389', badge: 'NEW', discount: null, features: ['19" Alloys', 'Leather Seats', 'Nav'], location: 'Birmingham' },
  { id: 2, image: '/vehicle-thumb-02.jpg', name: 'BMW 3 Series M Sport', year: 2023, mileage: '12,200', fuel: 'Petrol', trans: 'Auto', price: '£32,490', monthly: '£435', badge: 'NEW', discount: null, features: ['18" Alloys', 'Heated Seats', 'Camera'], location: 'Manchester' },
  { id: 3, image: '/vehicle-thumb-03.jpg', name: 'Audi A4 S Line', year: 2023, mileage: '22,100', fuel: 'Diesel', trans: 'Auto', price: '£26,750', monthly: '£359', badge: 'NEW', discount: null, features: ['Virtual Cockpit', 'Cruise Ctrl'], location: 'London' },
  { id: 4, image: '/vehicle-thumb-04.jpg', name: 'Range Rover Sport', year: 2023, mileage: '35,400', fuel: 'Diesel', trans: 'Auto', price: '£45,990', monthly: '£615', badge: 'NEW', discount: '£2,000 OFF', features: ['Pan Roof', 'Air Suspension'], location: 'Leeds' },
  { id: 5, image: '/vehicle-thumb-05.jpg', name: 'Porsche Cayenne', year: 2023, mileage: '19,800', fuel: 'Petrol', trans: 'Auto', price: '£54,490', monthly: '£729', badge: null, discount: '£3,500 OFF', features: ['Sports Chrono', 'Matrix LED'], location: 'Bristol' },
  { id: 6, image: '/vehicle-thumb-06.jpg', name: 'Tesla Model 3', year: 2023, mileage: '8,500', fuel: 'Electric', trans: 'Auto', price: '£38,990', monthly: '£522', badge: null, discount: '£1,500 OFF', features: ['Autopilot', 'Glass Roof'], location: 'Reading' },
  { id: 7, image: '/vehicle-thumb-07.jpg', name: 'Jaguar F-PACE', year: 2023, mileage: '28,600', fuel: 'Diesel', trans: 'Auto', price: '£31,490', monthly: '£422', badge: null, discount: '£1,200 OFF', features: ['Meridian Audio', 'AEB'], location: 'Nottingham' },
  { id: 8, image: '/vehicle-thumb-08.jpg', name: 'Lexus RX 450h', year: 2023, mileage: '31,200', fuel: 'Hybrid', trans: 'Auto', price: '£36,990', monthly: '£495', badge: null, discount: '£1,800 OFF', features: ['Premium Nav', 'Mark Levinson'], location: 'Sheffield' },
]

/* ═══════════════════════════════════════════
   PART 4: Vehicle Card Component
   ═══════════════════════════════════════════ */
function VehicleCard({ vehicle }: { vehicle: typeof vehicles[0] }) {
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
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-transparent to-transparent" />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {vehicle.discount && (
              <span className="px-2.5 py-1 rounded-md text-[0.6875rem] font-bold bg-error text-pure-white shadow-lg">
                {vehicle.discount}
              </span>
            )}
            {vehicle.badge && (
              <span className="px-2.5 py-1 rounded-md text-[0.6875rem] font-bold bg-success text-pure-white shadow-lg">
                {vehicle.badge}
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
            {vehicle.name}
          </h3>
          <p className="mt-1.5 font-mono text-[0.6875rem] text-chrome tracking-wide">
            {vehicle.year} &nbsp;|&nbsp; {vehicle.mileage} mi &nbsp;|&nbsp; {vehicle.fuel} &nbsp;|&nbsp; {vehicle.trans}
          </p>

          {/* Feature tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vehicle.features.map((feat) => (
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
                <span className="font-mono text-lg font-semibold text-pure-white">{vehicle.price}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[0.6875rem] text-chrome">from </span>
                <span className="font-mono text-base font-semibold text-electric-blue">{vehicle.monthly}/mo</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </TiltCard>
  )
}

/* ═══════════════════════════════════════════
   PART 5: Feature Data
   ═══════════════════════════════════════════ */
const features = [
  { icon: Tag, title: 'Best Price Guaranteed', desc: "Found the same car for less? We'll beat it — and give you an extra \u00a3100. Our price promise is rock solid." },
  { icon: Clock, title: 'Same Day Drive Away', desc: 'Complete your purchase in under 2 hours. No waiting, no delays \u2014 pick your car, sign, and drive.' },
  { icon: Handshake, title: 'Hassle & Haggle-Free', desc: 'Our lowest price, always. No negotiation needed, no hidden mark-ups, no pressure. Just fair, transparent pricing.' },
  { icon: Shield, title: '3-Month Warranty', desc: 'Every car comes with our comprehensive warranty \u2014 \u00a30 excess, covering all mechanical and electrical components.' },
  { icon: Award, title: 'RAC 200-Point Inspection', desc: 'Every vehicle undergoes a rigorous RAC-approved 200-point inspection before it reaches our forecourt.' },
  { icon: MapPin, title: '15 Locations Nationwide', desc: "With showrooms across the UK, there's an APEX near you. Browse online, visit in person." },
]

/* ═══════════════════════════════════════════
   PART 6: FAQ Data
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
   PART 7: Body Type Data
   ═══════════════════════════════════════════ */
const bodyTypes = ['Hatchback', 'SUV', 'Saloon', 'Estate', 'Coupe', 'Convertible', 'MPV', '4x4']

/* ═══════════════════════════════════════════
   PART 8: Review Data
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
  const [activeBodyType, setActiveBodyType] = useState('SUV')
  const [monthlyPayment, setMonthlyPayment] = useState(350)
  const [deposit, setDeposit] = useState(2000)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchTab, setSearchTab] = useState<'buy' | 'exchange'>('buy')

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
        {/* Three.js Particle Canvas */}
        <div className="absolute inset-0 z-[1] overflow-hidden">
          <Canvas
            orthographic
            camera={{ zoom: 50, position: [0, 0, 10] }}
            style={{ width: '100%', height: '100%', opacity: 0.4 }}
          >
            <Particles />
          </Canvas>
        </div>

        {/* Hero Car Image */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
          className="absolute z-[2] right-0 bottom-0 w-[55%] max-w-[900px] hidden md:block"
        >
          <div className="relative">
            <img
              src="/luxury-sedan-hero.jpg"
              alt="Luxury sedan"
              className="w-full h-auto object-contain"
            />
            {/* Subtle gradient overlay on car for better blending */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to left, transparent 60%, #000814 100%)' }}
            />
          </div>
        </motion.div>

        {/* Main gradient overlay for text readability */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{ background: 'linear-gradient(to right, #000814 0%, #000814 25%, rgba(0,8,20,0.7) 45%, transparent 65%)' }}
        />

        {/* Bottom gradient for smooth transition */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[200px] z-[3] pointer-events-none"
          style={{ background: 'linear-gradient(to top, #000814 0%, transparent 100%)' }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #000814 100%)' }}
        />

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
            <span className="text-[0.8125rem] font-medium text-electric-blue tracking-wide">6,000+ RAC-Approved Vehicles</span>
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
            {[
              { label: 'Any Make', icon: Car },
              { label: 'Any Model', icon: Settings },
              { label: 'Max Price', icon: Tag },
              { label: 'Monthly', icon: Gauge },
              { label: 'Body Type', icon: Car },
              { label: 'Fuel Type', icon: Fuel },
            ].map((field, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className="relative"
              >
                <div className="glass-input rounded-xl px-4 py-3.5 flex items-center gap-2.5 cursor-pointer hover:border-slate/50 transition-colors">
                  <field.icon size={16} className="text-slate shrink-0" />
                  <span className="text-[0.875rem] text-slate truncate">{field.label}</span>
                  <ChevronDown size={14} className="text-slate ml-auto shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full mt-4 py-4 bg-electric-blue text-pure-white font-display font-semibold text-base rounded-xl flex items-center justify-center gap-3 hover:shadow-glow-lg hover:scale-[1.01] transition-all duration-300"
          >
            <Search size={20} />
            Search 6,000+ Cars
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
          SECTION 3: WHY CHOOSE APEX
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
              Six reasons why thousands of drivers choose APEX for their next car.
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
          SECTION 5: FEATURED VEHICLES
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
              View All 6,000+ Cars
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Vehicle Grid */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle, i) => (
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
              { icon: Star, label: '5-Star Rated', sub: '38,000+ Reviews' },
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
              APEX is a fully accredited RAC Approved Dealer and a proud member of the Motor Ombudsman Code of Practice. Every car we sell meets the highest standards of quality, safety, and transparency.
            </p>
          </motion.div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { target: 45000, suffix: '+', label: 'Vehicles sold since 2010', prefix: '' },
              { target: 38000, suffix: '+', label: 'Five-star reviews', prefix: '' },
              { target: 15, suffix: '', label: 'Nationwide showrooms', prefix: '' },
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
              Join over 45,000 happy drivers who found their perfect car with APEX.
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
                "I was nervous about buying a used car online, but APEX made the entire process effortless. The car arrived exactly as described — actually better than the photos. The RAC inspection gave me total confidence. I'll never buy a car anywhere else."
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
              Everything you need to know about buying with APEX.
            </p>
          </motion.div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(0, 8, 20, 0.5)', border: '1px solid rgba(92, 103, 125, 0.25)' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-obsidian/40 transition-colors"
                >
                  <span className="text-[0.9375rem] font-medium text-pure-white pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ChevronDown size={20} className="text-chrome shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-[0.9375rem] text-frost leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 9: TRUST BADGES ROW
          ═══════════════════════════════════════════ */}
      <section className="bg-midnight py-10 border-y border-slate/10">
        <div className="container-apex">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-14"
          >
            {[
              { icon: Shield, text: 'RAC Approved Dealer', color: 'text-success' },
              { icon: Award, text: 'Motor Ombudsman', color: 'text-electric-blue' },
              { icon: Star, text: '5-Star Trustpilot Rating', color: 'text-warning' },
              { icon: CheckCircle, text: '7-Day Money Back', color: 'text-success' },
              { icon: Clock, text: 'Same-Day Driveaway', color: 'text-blue-glow' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2.5">
                <badge.icon size={18} className={badge.color} />
                <span className="text-sm font-medium text-frost">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 10: CONTACT CTA
          ═══════════════════════════════════════════ */}
      <section
        className="section-padding"
        style={{ background: 'linear-gradient(180deg, #000814 0%, #001233 100%)' }}
      >
        <div className="container-apex max-w-[700px]">
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
              Start Your Journey Today
            </h2>
            <p className="mt-5 text-lg text-frost leading-relaxed">
              Visit one of our 15 nationwide showrooms, browse online, or speak to our team. Your perfect car is waiting.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/inventory"
                className="px-8 py-4 bg-electric-blue text-pure-white font-semibold text-sm rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 inline-flex items-center gap-2"
              >
                <Search size={16} />
                Browse All Cars
              </Link>
              <a
                href="tel:08001234567"
                className="px-8 py-4 bg-transparent text-pure-white font-semibold text-sm rounded-full border-2 border-white/30 hover:bg-white/10 hover:border-electric-blue transition-all duration-300 flex items-center gap-2"
              >
                <Phone size={16} />
                Call Us Now
              </a>
            </div>
          </motion.div>

          {/* Contact Cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Phone, label: 'Call Us', detail: '0800 123 4567' },
              { icon: Mail, label: 'Email Us', detail: 'hello@apexautomotive.co.uk' },
              { icon: MessageCircle, label: 'Live Chat', detail: 'Available 9am–7pm' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="text-center rounded-2xl p-6 glass hover:border-electric-blue/20 transition-colors"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-electric-blue/10 mx-auto">
                  <item.icon size={24} className="text-electric-blue" />
                </div>
                <p className="mt-3 font-semibold text-[0.9375rem] text-pure-white">{item.label}</p>
                <p className="mt-1 text-sm text-chrome">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
