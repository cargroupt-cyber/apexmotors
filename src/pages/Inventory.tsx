import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import {
  SlidersHorizontal, Grid3X3, List, ChevronDown,
  Heart, MapPin, Star, Fuel, Gauge, Settings, ArrowUpDown, Car
} from 'lucide-react'

/* ═══════════════════════════════════════════
   Vehicle Data
   ═══════════════════════════════════════════ */
const allVehicles = [
  { id: 1, image: '/vehicle-thumb-01.jpg', name: 'Mercedes-Benz C-Class', variant: 'C220d AMG Line Premium', year: 2023, mileage: '18,500', fuel: 'Diesel', trans: 'Auto', price: '£28,990', monthly: '£389', badge: 'NEW', discount: null, features: ['19" Alloys', 'Leather Seats', 'Nav', 'Camera', 'Heated Seats'], location: 'Birmingham', engine: '2.0L' },
  { id: 2, image: '/vehicle-thumb-02.jpg', name: 'BMW 3 Series M Sport', variant: '320i M Sport Pro', year: 2023, mileage: '12,200', fuel: 'Petrol', trans: 'Auto', price: '£32,490', monthly: '£435', badge: 'NEW', discount: null, features: ['18" Alloys', 'Heated Seats', 'Camera', 'Pro Nav'], location: 'Manchester', engine: '2.0L' },
  { id: 3, image: '/vehicle-thumb-03.jpg', name: 'Audi A4 S Line', variant: '35 TDI S Line Black Edition', year: 2023, mileage: '22,100', fuel: 'Diesel', trans: 'Auto', price: '£26,750', monthly: '£359', badge: 'NEW', discount: null, features: ['Virtual Cockpit', 'Cruise Ctrl', 'LED Matrix', 'Nav'], location: 'London', engine: '2.0L' },
  { id: 4, image: '/vehicle-thumb-04.jpg', name: 'Range Rover Sport', variant: 'D300 HSE Dynamic', year: 2023, mileage: '35,400', fuel: 'Diesel', trans: 'Auto', price: '£45,990', monthly: '£615', badge: 'NEW', discount: '£2,000 OFF', features: ['Pan Roof', 'Air Suspension', 'Meridian', 'Camera'], location: 'Leeds', engine: '3.0L' },
  { id: 5, image: '/vehicle-thumb-05.jpg', name: 'Porsche Cayenne', variant: 'Turbo GT Coupe', year: 2023, mileage: '19,800', fuel: 'Petrol', trans: 'Auto', price: '£54,490', monthly: '£729', badge: null, discount: '£3,500 OFF', features: ['Sports Chrono', 'Matrix LED', 'PASM', 'BOSE'], location: 'Bristol', engine: '4.0L' },
  { id: 6, image: '/vehicle-thumb-06.jpg', name: 'Tesla Model 3', variant: 'Long Range AWD', year: 2023, mileage: '8,500', fuel: 'Electric', trans: 'Auto', price: '£38,990', monthly: '£522', badge: null, discount: '£1,500 OFF', features: ['Autopilot', 'Glass Roof', 'Premium Audio'], location: 'Reading', engine: 'Dual Motor' },
  { id: 7, image: '/vehicle-thumb-07.jpg', name: 'Jaguar F-PACE', variant: 'R-Dynamic HSE', year: 2023, mileage: '28,600', fuel: 'Diesel', trans: 'Auto', price: '£31,490', monthly: '£422', badge: null, discount: '£1,200 OFF', features: ['Meridian Audio', 'AEB', 'Pan Roof', 'Nav'], location: 'Nottingham', engine: '3.0L' },
  { id: 8, image: '/vehicle-thumb-08.jpg', name: 'Lexus RX 450h', variant: 'F Sport Premium', year: 2023, mileage: '31,200', fuel: 'Hybrid', trans: 'Auto', price: '£36,990', monthly: '£495', badge: null, discount: '£1,800 OFF', features: ['Premium Nav', 'Mark Levinson', 'HUD', 'Camera'], location: 'Sheffield', engine: '3.5L' },
  { id: 9, image: '/vehicle-thumb-01.jpg', name: 'Mercedes-Benz C-Class', variant: 'C200 AMG Line Executive', year: 2023, mileage: '15,200', fuel: 'Petrol', trans: 'Auto', price: '£27,490', monthly: '£369', badge: null, discount: '£800 OFF', features: ['18" Alloys', 'Reversing Camera', 'Nav'], location: 'London', engine: '1.5L' },
  { id: 10, image: '/vehicle-thumb-02.jpg', name: 'BMW 3 Series', variant: '330e M Sport xDrive', year: 2023, mileage: '9,800', fuel: 'Hybrid', trans: 'Auto', price: '£34,990', monthly: '£468', badge: 'NEW', discount: null, features: ['19" Alloys', 'Harmon Kardon', 'Camera'], location: 'Birmingham', engine: '2.0L' },
  { id: 11, image: '/vehicle-thumb-03.jpg', name: 'Audi A4 S Line', variant: '40 TFSI S Line', year: 2023, mileage: '28,400', fuel: 'Petrol', trans: 'Auto', price: '£25,490', monthly: '£342', badge: null, discount: '£1,000 OFF', features: ['Tech Pack', 'Cruise Ctrl', 'LED'], location: 'Manchester', engine: '2.0L' },
  { id: 12, image: '/vehicle-thumb-04.jpg', name: 'Range Rover Sport', variant: 'P400 HSE', year: 2023, mileage: '42,100', fuel: 'Petrol', trans: 'Auto', price: '£48,990', monthly: '£655', badge: null, discount: '£2,500 OFF', features: ['Air Suspension', 'Pan Roof', 'Meridian'], location: 'London', engine: '3.0L' },
]

/* ═══════════════════════════════════════════
   Filter Options
   ═══════════════════════════════════════════ */
const makes = ['All Makes', 'Mercedes-Benz', 'BMW', 'Audi', 'Range Rover', 'Porsche', 'Tesla', 'Jaguar', 'Lexus']
const priceRanges = ['Any Price', 'Under £20k', '£20k - £30k', '£30k - £40k', '£40k - £50k', '£50k+']
const fuelTypes = ['Any Fuel', 'Petrol', 'Diesel', 'Hybrid', 'Electric']
const bodyTypes = ['Any Body', 'Hatchback', 'SUV', 'Saloon', 'Estate', 'Coupe', 'Convertible', 'MPV', '4x4']
const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Mileage: Low to High', 'Newest First']

/* ═══════════════════════════════════════════
   3D Tilt Card
   ═══════════════════════════════════════════ */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [3, -3])
  const rotateY = useTransform(x, [-100, 100], [-3, 3])

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        x.set(e.clientX - cx)
        y.set(e.clientY - cy)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Vehicle Card Component
   ═══════════════════════════════════════════ */
function VehicleCard({ vehicle, index }: { vehicle: typeof allVehicles[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{
        duration: 0.6,
        delay: (index % 4) * 0.08,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      <TiltCard className="perspective-1000">
        <motion.div
          className="relative rounded-2xl overflow-hidden group cursor-pointer bg-midnight/60"
          style={{
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(92, 103, 125, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
          whileHover={{
            y: -6,
            boxShadow: '0 16px 48px rgba(0, 119, 182, 0.15)',
          }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          {/* Image */}
          <div className="relative h-[200px] overflow-hidden">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent" />

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
            <h3 className="font-display font-semibold text-pure-white text-[1rem] truncate leading-tight">
              {vehicle.name}
            </h3>
            <p className="mt-1 text-[0.75rem] text-chrome truncate">{vehicle.variant}</p>

            {/* Specs row */}
            <div className="mt-3 flex items-center gap-3 text-[0.6875rem] text-chrome">
              <span className="flex items-center gap-1">
                <Gauge size={11} />
                {vehicle.mileage} mi
              </span>
              <span className="flex items-center gap-1">
                <Fuel size={11} />
                {vehicle.fuel}
              </span>
              <span className="flex items-center gap-1">
                <Settings size={11} />
                {vehicle.trans}
              </span>
            </div>

            {/* Feature tags */}
            <div className="mt-3 flex flex-wrap gap-1">
              {vehicle.features.slice(0, 3).map((feat) => (
                <span
                  key={feat}
                  className="px-1.5 py-0.5 rounded text-[0.625rem] font-medium text-chrome bg-obsidian/60 border border-slate/15"
                >
                  {feat}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="px-1.5 py-0.5 rounded text-[0.625rem] font-medium text-chrome">
                  +{vehicle.features.length - 3}
                </span>
              )}
            </div>

            {/* Price display */}
            <div className="mt-4 pt-4 border-t border-slate/15">
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
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Filter Bar Component
   ═══════════════════════════════════════════ */
function FilterDropdown({ label, options, value, onChange, icon: Icon }: {
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
        className="glass-input rounded-xl px-4 py-3 flex items-center gap-2.5 cursor-pointer hover:border-slate/50 transition-colors w-full"
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
                onClick={() => { onChange(opt); setOpen(false) }}
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
   Main Inventory Page
   ═══════════════════════════════════════════ */
export default function Inventory() {
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeMake, setActiveMake] = useState(searchParams.get('make') || 'All Makes')
  const [activePrice, setActivePrice] = useState(searchParams.get('price') || 'Any Price')
  const [activeFuel, setActiveFuel] = useState(searchParams.get('fuel') || 'Any Fuel')
  const [activeBody, setActiveBody] = useState(searchParams.get('body') || 'Any Body')
  const [activeSort, setActiveSort] = useState('Relevance')
  const [showFilters, setShowFilters] = useState(false)

  const getBodyType = (name: string) => {
    if (/Range Rover|Cayenne|F-PACE|RX/.test(name)) return 'SUV'
    return 'Saloon'
  }

  /* Filter logic */
  const filteredVehicles = allVehicles.filter((v) => {
    if (activeMake !== 'All Makes' && !v.name.includes(activeMake)) return false
    if (activeFuel !== 'Any Fuel' && v.fuel !== activeFuel) return false
    if (activeBody !== 'Any Body' && getBodyType(v.name) !== activeBody) return false

    /* Price filter */
    if (activePrice !== 'Any Price') {
      const priceNum = parseInt(v.price.replace(/[^0-9]/g, ''), 10)
      if (activePrice === 'Under £20k' && priceNum >= 20000) return false
      if (activePrice === '£20k - £30k' && (priceNum < 20000 || priceNum >= 30000)) return false
      if (activePrice === '£30k - £40k' && (priceNum < 30000 || priceNum >= 40000)) return false
      if (activePrice === '£40k - £50k' && (priceNum < 40000 || priceNum >= 50000)) return false
      if (activePrice === '£50k+' && priceNum < 50000) return false
    }
    return true
  })

  /* Active filter count */
  const activeFilterCount = [
    activeMake !== 'All Makes',
    activePrice !== 'Any Price',
    activeFuel !== 'Any Fuel',
    activeBody !== 'Any Body',
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-obsidian">
      {/* ═══════════════════════════════════════════
          HERO HEADER
          ═══════════════════════════════════════════ */}
      <section className="relative pt-28 pb-10 border-b border-slate/15 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/inventory-hero.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#000814]/95 via-[#000814]/80 to-[#000814]/60" />
        </div>

        <div className="container-apex relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <h1
              className="font-display font-bold text-pure-white"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.0, letterSpacing: '-0.03em' }}
            >
              Our Inventory
            </h1>
            <p className="mt-3 text-base text-chrome max-w-[500px]">
              Browse 6,000+ RAC-approved vehicles. All inspected, certified, and ready to drive away.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="mt-8 flex flex-wrap gap-4">
            {[
              { label: 'Vehicles', value: '6,240', icon: Gauge },
              { label: 'Locations', value: '15', icon: MapPin },
              { label: 'Avg. Rating', value: '4.9/5', icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian/50 border border-slate/15"
              >
                <stat.icon size={14} className="text-electric-blue" />
                <span className="text-sm font-semibold text-pure-white">{stat.value}</span>
                <span className="text-xs text-chrome">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FILTER BAR
          ═══════════════════════════════════════════ */}
      <section className="sticky top-[72px] z-30 bg-obsidian/95 backdrop-blur-md border-b border-slate/15 py-4">
        <div className="container-apex">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Filters Row */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <FilterDropdown
                label="All Makes"
                options={makes}
                value={activeMake}
                onChange={setActiveMake}
                icon={Settings}
              />
              <FilterDropdown
                label="Any Price"
                options={priceRanges}
                value={activePrice}
                onChange={setActivePrice}
                icon={Gauge}
              />
              <FilterDropdown
                label="Any Fuel"
                options={fuelTypes}
                value={activeFuel}
                onChange={setActiveFuel}
                icon={Fuel}
              />
              <FilterDropdown
                label="Any Body"
                options={bodyTypes}
                value={activeBody}
                onChange={setActiveBody}
                icon={Car}
              />
              <FilterDropdown
                label="Sort By"
                options={sortOptions}
                value={activeSort}
                onChange={setActiveSort}
                icon={ArrowUpDown}
              />
            </div>

            {/* Right side: view toggle + results count */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl glass-input text-sm font-medium text-frost"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-electric-blue text-pure-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="h-8 w-px bg-slate/20 hidden sm:block" />

              <div className="flex items-center rounded-xl overflow-hidden border border-slate/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-electric-blue text-pure-white' : 'text-chrome hover:text-frost'}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-electric-blue text-pure-white' : 'text-chrome hover:text-frost'}`}
                >
                  <List size={16} />
                </button>
              </div>

              <span className="text-sm text-chrome ml-1">
                <span className="font-semibold text-pure-white">{filteredVehicles.length}</span> cars
              </span>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-wrap gap-2 mt-3"
            >
              {activeMake !== 'All Makes' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                  {activeMake}
                  <button onClick={() => setActiveMake('All Makes')} className="hover:text-pure-white"><span className="sr-only">Remove</span>×</button>
                </span>
              )}
              {activePrice !== 'Any Price' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                  {activePrice}
                  <button onClick={() => setActivePrice('Any Price')} className="hover:text-pure-white"><span className="sr-only">Remove</span>×</button>
                </span>
              )}
              {activeFuel !== 'Any Fuel' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                  {activeFuel}
                  <button onClick={() => setActiveFuel('Any Fuel')} className="hover:text-pure-white"><span className="sr-only">Remove</span>×</button>
                </span>
              )}
              {activeBody !== 'Any Body' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                  {activeBody}
                  <button onClick={() => setActiveBody('Any Body')} className="hover:text-pure-white"><span className="sr-only">Remove</span>&times;</button>
                </span>
              )}
              <button
                onClick={() => { setActiveMake('All Makes'); setActivePrice('Any Price'); setActiveFuel('Any Fuel'); setActiveBody('Any Body') }}
                className="text-xs text-chrome hover:text-frost underline underline-offset-2"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VEHICLE GRID
          ═══════════════════════════════════════════ */}
      <section className="py-10">
        <div className="container-apex">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle, i) => (
                <Link key={vehicle.id} to={`/vehicle/${vehicle.id}`}>
                  <VehicleCard vehicle={vehicle} index={i} />
                </Link>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col gap-4">
              {filteredVehicles.map((vehicle, i) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 5) * 0.06 }}
                >
                  <Link to={`/vehicle/${vehicle.id}`}>
                    <div
                      className="flex flex-col sm:flex-row gap-5 rounded-2xl p-4 bg-midnight/60 border border-slate/20 hover:border-electric-blue/30 transition-all duration-300 group"
                      style={{ backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                    >
                      {/* Image */}
                      <div className="relative w-full sm:w-[240px] h-[160px] sm:h-[140px] rounded-xl overflow-hidden shrink-0">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight/50 to-transparent" />
                        {vehicle.discount && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[0.625rem] font-bold bg-error text-pure-white">
                            {vehicle.discount}
                          </span>
                        )}
                        {vehicle.badge && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[0.625rem] font-bold bg-success text-pure-white">
                            {vehicle.badge}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="font-display font-semibold text-pure-white text-[1.0625rem]">{vehicle.name}</h3>
                          <p className="text-[0.75rem] text-chrome">{vehicle.variant}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-chrome">
                            <span>{vehicle.year}</span>
                            <span className="w-1 h-1 rounded-full bg-slate" />
                            <span className="flex items-center gap-1"><Gauge size={11} />{vehicle.mileage} mi</span>
                            <span className="w-1 h-1 rounded-full bg-slate" />
                            <span className="flex items-center gap-1"><Fuel size={11} />{vehicle.fuel}</span>
                            <span className="w-1 h-1 rounded-full bg-slate" />
                            <span>{vehicle.trans}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {vehicle.features.slice(0, 4).map((f) => (
                              <span key={f} className="px-2 py-0.5 rounded text-[0.625rem] text-chrome bg-obsidian/60 border border-slate/15">{f}</span>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            <MapPin size={10} className="text-blue-glow" />
                            <span className="text-[0.6875rem] text-chrome">{vehicle.location}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="sm:text-right shrink-0">
                          <p className="font-mono text-xl font-semibold text-pure-white">{vehicle.price}</p>
                          <p className="font-mono text-sm text-electric-blue mt-0.5">{vehicle.monthly}/mo</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredVehicles.length === 0 && (
            <div className="text-center py-20">
              <Car size={48} className="text-slate/30 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-xl text-pure-white">No vehicles found</h3>
              <p className="mt-2 text-chrome">Try adjusting your filters to see more results.</p>
              <button
                onClick={() => { setActiveMake('All Makes'); setActivePrice('Any Price'); setActiveFuel('Any Fuel'); setActiveBody('Any Body') }}
                className="mt-6 px-6 py-3 bg-electric-blue text-pure-white rounded-full text-sm font-semibold hover:bg-blue-glow transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Load More */}
          {filteredVehicles.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-10 py-4 bg-transparent border-2 border-slate/30 text-frost rounded-full text-sm font-semibold hover:border-electric-blue hover:text-pure-white transition-all duration-300">
                Load More Vehicles
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
