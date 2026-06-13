import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import {
  SlidersHorizontal, Grid3X3, List, ChevronDown,
  Heart, MapPin, Star, Fuel, Gauge, Settings, ArrowUpDown, Car
} from 'lucide-react'
import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles'

interface UnifiedVehicle {
  id: string
  images: string[]
  make: string
  model: string
  variant: string
  year: number
  mileage: number
  fuel_type: string
  transmission: string
  price: number
  monthly_payment: number
  badge?: string | null
  discount_amount: number
  features: string[]
  location: string
  engine_size: string
  body_type?: string
  colour?: string
  doors?: number
  seats?: number
  registration?: string
  status?: string
  featured?: boolean
  description?: string
  created_at?: string
}

const fallbackVehicles: UnifiedVehicle[] = [
  { id: '1', images: ['/vehicle-thumb-01.jpg'], make: 'Mercedes-Benz', model: 'C-Class', variant: 'C220d AMG Line Premium', year: 2023, mileage: 18500, fuel_type: 'Diesel', transmission: 'Auto', price: 28990, monthly_payment: 389, badge: 'NEW', discount_amount: 0, features: ['19" Alloys', 'Leather Seats', 'Nav', 'Camera', 'Heated Seats'], location: 'Birmingham', engine_size: '2.0L', body_type: 'Saloon', colour: 'Black', doors: 4, seats: 5, registration: 'OV23 ABC', status: 'available', featured: true, description: 'Stunning Mercedes C-Class in excellent condition with full service history.' },
  { id: '2', images: ['/vehicle-thumb-02.jpg'], make: 'BMW', model: '3 Series', variant: '320i M Sport Pro', year: 2023, mileage: 12200, fuel_type: 'Petrol', transmission: 'Auto', price: 32490, monthly_payment: 435, badge: 'NEW', discount_amount: 0, features: ['18" Alloys', 'Heated Seats', 'Camera', 'Pro Nav'], location: 'Manchester', engine_size: '2.0L', body_type: 'Saloon', colour: 'White', doors: 4, seats: 5, registration: 'ML23 XYZ', status: 'available', featured: true, description: 'Premium BMW 3 Series with M Sport Pro pack and low mileage.' },
  { id: '3', images: ['/vehicle-thumb-03.jpg'], make: 'Audi', model: 'A4', variant: '35 TDI S Line Black Edition', year: 2023, mileage: 22100, fuel_type: 'Diesel', transmission: 'Auto', price: 26750, monthly_payment: 359, badge: 'NEW', discount_amount: 0, features: ['Virtual Cockpit', 'Cruise Ctrl', 'LED Matrix', 'Nav'], location: 'London', engine_size: '2.0L', body_type: 'Saloon', colour: 'Grey', doors: 4, seats: 5, registration: 'LN23 DEF', status: 'available', featured: false, description: 'Stylish Audi A4 Black Edition with all the premium options.' },
  { id: '4', images: ['/vehicle-thumb-04.jpg'], make: 'Range Rover', model: 'Sport', variant: 'D300 HSE Dynamic', year: 2023, mileage: 35400, fuel_type: 'Diesel', transmission: 'Auto', price: 45990, monthly_payment: 615, badge: null, discount_amount: 2000, features: ['Pan Roof', 'Air Suspension', 'Meridian', 'Camera'], location: 'Leeds', engine_size: '3.0L', body_type: 'SUV', colour: 'Silver', doors: 5, seats: 5, registration: 'LS23 GHI', status: 'available', featured: true, description: 'Powerful Range Rover Sport with HSE Dynamic pack and air suspension.' },
  { id: '5', images: ['/vehicle-thumb-05.jpg'], make: 'Porsche', model: 'Cayenne', variant: 'Turbo GT Coupe', year: 2023, mileage: 19800, fuel_type: 'Petrol', transmission: 'Auto', price: 54490, monthly_payment: 729, badge: null, discount_amount: 3500, features: ['Sports Chrono', 'Matrix LED', 'PASM', 'BOSE'], location: 'Bristol', engine_size: '4.0L', body_type: 'SUV', colour: 'Red', doors: 5, seats: 4, registration: 'BR23 JKL', status: 'available', featured: false, description: 'High-performance Porsche Cayenne Turbo GT Coupe with sports chrono.' },
  { id: '6', images: ['/vehicle-thumb-06.jpg'], make: 'Tesla', model: 'Model 3', variant: 'Long Range AWD', year: 2023, mileage: 8500, fuel_type: 'Electric', transmission: 'Auto', price: 38990, monthly_payment: 522, badge: null, discount_amount: 1500, features: ['Autopilot', 'Glass Roof', 'Premium Audio'], location: 'Reading', engine_size: 'Dual Motor', body_type: 'Saloon', colour: 'White', doors: 4, seats: 5, registration: 'RD23 MNO', status: 'available', featured: true, description: 'Low mileage Tesla Model 3 Long Range with full self-driving capability.' },
  { id: '7', images: ['/vehicle-thumb-07.jpg'], make: 'Jaguar', model: 'F-PACE', variant: 'R-Dynamic HSE', year: 2023, mileage: 28600, fuel_type: 'Diesel', transmission: 'Auto', price: 31490, monthly_payment: 422, badge: null, discount_amount: 1200, features: ['Meridian Audio', 'AEB', 'Pan Roof', 'Nav'], location: 'Nottingham', engine_size: '3.0L', body_type: 'SUV', colour: 'Blue', doors: 5, seats: 5, registration: 'NT23 PQR', status: 'available', featured: false, description: 'Elegant Jaguar F-PACE R-Dynamic with HSE specification.' },
  { id: '8', images: ['/vehicle-thumb-08.jpg'], make: 'Lexus', model: 'RX 450h', variant: 'F Sport Premium', year: 2023, mileage: 31200, fuel_type: 'Hybrid', transmission: 'Auto', price: 36990, monthly_payment: 495, badge: null, discount_amount: 1800, features: ['Premium Nav', 'Mark Levinson', 'HUD', 'Camera'], location: 'Sheffield', engine_size: '3.5L', body_type: 'SUV', colour: 'Grey', doors: 5, seats: 5, registration: 'SF23 STU', status: 'available', featured: false, description: 'Luxurious Lexus RX 450h hybrid with Mark Levinson audio.' },
]

const makes = ['All Makes', 'Mercedes-Benz', 'BMW', 'Audi', 'Range Rover', 'Porsche', 'Tesla', 'Jaguar', 'Lexus']
const priceRanges = ['Any Price', 'Under £20k', '£20k - £30k', '£30k - £40k', '£40k - £50k', '£50k+']
const fuelTypes = ['Any Fuel', 'Petrol', 'Diesel', 'Hybrid', 'Electric']
const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Mileage: Low to High', 'Newest First']

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
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}

function VehicleCard({ vehicle, index }: { vehicle: UnifiedVehicle; index: number }) {
  const vehicleName = `${vehicle.make} ${vehicle.model}`
  const vehicleImage = vehicle.images?.[0] || '/vehicle-thumb-01.jpg'
  const vehicleMileage = typeof vehicle.mileage === 'number' ? vehicle.mileage.toLocaleString() : vehicle.mileage
  const vehiclePrice = typeof vehicle.price === 'number' ? `£${vehicle.price.toLocaleString()}` : vehicle.price
  const vehicleMonthly = typeof vehicle.monthly_payment === 'number' ? `£${vehicle.monthly_payment}` : vehicle.monthly_payment
  const hasDiscount = (vehicle.discount_amount || 0) > 0
  const computedBadge = vehicle.badge || (hasDiscount ? 'SALE' : null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      <TiltCard className="perspective-1000">
        <motion.div
          className="relative rounded-2xl overflow-hidden group cursor-pointer bg-midnight/60"
          style={{ backdropFilter: 'blur(16px)', border: '1px solid rgba(92, 103, 125, 0.25)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
          whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0, 119, 182, 0.15)' }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          <div className="relative h-[200px] overflow-hidden">
            <img src={vehicleImage} alt={vehicleName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {hasDiscount && (
                <span className="px-2.5 py-1 rounded-md text-[0.6875rem] font-bold bg-error text-pure-white shadow-lg">SAVE £{vehicle.discount_amount?.toLocaleString()}</span>
              )}
              {computedBadge && computedBadge !== 'SALE' && (
                <span className="px-2.5 py-1 rounded-md text-[0.6875rem] font-bold bg-success text-pure-white shadow-lg">{computedBadge}</span>
              )}
            </div>
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-obsidian/60 backdrop-blur-sm flex items-center justify-center hover:bg-obsidian/80 transition-colors" onClick={(e) => e.preventDefault()}>
              <Heart size={14} className="text-pure-white" />
            </button>
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-obsidian/60 backdrop-blur-sm">
              <MapPin size={10} className="text-blue-glow" />
              <span className="text-[0.6875rem] text-frost font-medium">{vehicle.location}</span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-display font-semibold text-pure-white text-[1rem] truncate leading-tight">{vehicleName}</h3>
            <p className="mt-1 text-[0.75rem] text-chrome truncate">{vehicle.variant}</p>
            <div className="mt-3 flex items-center gap-3 text-[0.6875rem] text-chrome">
              <span className="flex items-center gap-1"><Gauge size={11} />{vehicleMileage} mi</span>
              <span className="flex items-center gap-1"><Fuel size={11} />{vehicle.fuel_type}</span>
              <span className="flex items-center gap-1"><Settings size={11} />{vehicle.transmission}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {vehicle.features?.slice(0, 3).map((feat) => (
                <span key={feat} className="px-1.5 py-0.5 rounded text-[0.625rem] font-medium text-chrome bg-obsidian/60 border border-slate/15">{feat}</span>
              ))}
              {(vehicle.features?.length || 0) > 3 && (
                <span className="px-1.5 py-0.5 rounded text-[0.625rem] font-medium text-chrome">+{(vehicle.features?.length || 0) - 3}</span>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate/15">
              <div className="flex items-baseline justify-between">
                <div><span className="font-mono text-lg font-semibold text-pure-white">{vehiclePrice}</span></div>
                <div className="text-right">
                  <span className="font-mono text-[0.6875rem] text-chrome">from </span>
                  <span className="font-mono text-base font-semibold text-electric-blue">{vehicleMonthly}/mo</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </TiltCard>
    </motion.div>
  )
}

function FilterDropdown({ label, options, value, onChange, icon: Icon }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void
  icon?: React.ComponentType<{ size?: number; className?: string }>
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="glass-input rounded-xl px-4 py-3 flex items-center gap-2.5 cursor-pointer hover:border-slate/50 transition-colors w-full">
        {Icon && <Icon size={16} className="text-slate shrink-0" />}
        <span className="text-[0.875rem] text-frost truncate">{value || label}</span>
        <ChevronDown size={14} className="text-slate ml-auto shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-40 rounded-xl overflow-hidden glass-dark shadow-2xl border border-slate/25 max-h-[240px] overflow-y-auto">
            {options.map((opt) => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt ? 'bg-electric-blue/20 text-electric-blue font-medium' : 'text-frost hover:bg-obsidian/60'}`}>{opt}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Inventory() {
  const { vehicles: dbVehicles, loading } = useSupabaseVehicles()
  const allVehicles: UnifiedVehicle[] = dbVehicles.length > 0 ? dbVehicles as UnifiedVehicle[] : fallbackVehicles

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeMake, setActiveMake] = useState('All Makes')
  const [activePrice, setActivePrice] = useState('Any Price')
  const [activeFuel, setActiveFuel] = useState('Any Fuel')
  const [activeSort, setActiveSort] = useState('Relevance')

  const filteredVehicles = allVehicles.filter((v) => {
    const vehicleMakeModel = `${v.make} ${v.model}`
    if (activeMake !== 'All Makes' && !vehicleMakeModel.includes(activeMake)) return false
    if (activeFuel !== 'Any Fuel' && v.fuel_type !== activeFuel) return false
    if (activePrice !== 'Any Price') {
      if (activePrice === 'Under £20k' && v.price >= 20000) return false
      if (activePrice === '£20k - £30k' && (v.price < 20000 || v.price >= 30000)) return false
      if (activePrice === '£30k - £40k' && (v.price < 30000 || v.price >= 40000)) return false
      if (activePrice === '£40k - £50k' && (v.price < 40000 || v.price >= 50000)) return false
      if (activePrice === '£50k+' && v.price < 50000) return false
    }
    return true
  })

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (activeSort === 'Price: Low to High') return a.price - b.price
    if (activeSort === 'Price: High to Low') return b.price - a.price
    if (activeSort === 'Mileage: Low to High') return a.mileage - b.mileage
    if (activeSort === 'Newest First') return b.year - a.year
    return 0
  })

  const activeFilterCount = [activeMake !== 'All Makes', activePrice !== 'Any Price', activeFuel !== 'Any Fuel'].filter(Boolean).length
  const vehicleCount = allVehicles.length

  return (
    <div className="min-h-screen bg-obsidian">
      <section className="relative pt-28 pb-10 bg-midnight border-b border-slate/15">
        <div className="container-apex">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
            <h1 className="font-display font-bold text-pure-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.0, letterSpacing: '-0.03em' }}>Our Inventory</h1>
            <p className="mt-3 text-base text-chrome max-w-[500px]">Browse {vehicleCount.toLocaleString()}+ RAC-approved vehicles. All inspected, certified, and ready to drive away.</p>
          </motion.div>
          <div className="mt-8 flex flex-wrap gap-4">
            {[{ label: 'Vehicles', value: vehicleCount.toLocaleString(), icon: Gauge }, { label: 'Locations', value: '15', icon: MapPin }, { label: 'Avg. Rating', value: '4.9/5', icon: Star }].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian/50 border border-slate/15">
                <stat.icon size={14} className="text-electric-blue" />
                <span className="text-sm font-semibold text-pure-white">{stat.value}</span>
                <span className="text-xs text-chrome">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky top-[72px] z-30 bg-obsidian/95 backdrop-blur-md border-b border-slate/15 py-4">
        <div className="container-apex">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <FilterDropdown label="All Makes" options={makes} value={activeMake} onChange={setActiveMake} icon={Settings} />
              <FilterDropdown label="Any Price" options={priceRanges} value={activePrice} onChange={setActivePrice} icon={Gauge} />
              <FilterDropdown label="Any Fuel" options={fuelTypes} value={activeFuel} onChange={setActiveFuel} icon={Fuel} />
              <FilterDropdown label="Sort By" options={sortOptions} value={activeSort} onChange={setActiveSort} icon={ArrowUpDown} />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-8 w-px bg-slate/20 hidden sm:block" />
              <div className="flex items-center rounded-xl overflow-hidden border border-slate/20">
                <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-electric-blue text-pure-white' : 'text-chrome hover:text-frost'}`}><Grid3X3 size={16} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-electric-blue text-pure-white' : 'text-chrome hover:text-frost'}`}><List size={16} /></button>
              </div>
              <span className="text-sm text-chrome ml-1"><span className="font-semibold text-pure-white">{sortedVehicles.length}</span> cars</span>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-2 mt-3">
              {activeMake !== 'All Makes' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue border border-electric-blue/20">{activeMake} <button onClick={() => setActiveMake('All Makes')} className="hover:text-pure-white">&times;</button></span>}
              {activePrice !== 'Any Price' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue border border-electric-blue/20">{activePrice} <button onClick={() => setActivePrice('Any Price')} className="hover:text-pure-white">&times;</button></span>}
              {activeFuel !== 'Any Fuel' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue border border-electric-blue/20">{activeFuel} <button onClick={() => setActiveFuel('Any Fuel')} className="hover:text-pure-white">&times;</button></span>}
              <button onClick={() => { setActiveMake('All Makes'); setActivePrice('Any Price'); setActiveFuel('Any Fuel') }} className="text-xs text-chrome hover:text-frost underline underline-offset-2">Clear all</button>
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className="container-apex">
          {loading && dbVehicles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-chrome">Loading vehicles...</p>
            </div>
          )}
          {!loading || dbVehicles.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedVehicles.map((vehicle, i) => (
                    <Link key={vehicle.id} to={`/vehicle/${vehicle.id}`}><VehicleCard vehicle={vehicle} index={i} /></Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sortedVehicles.map((vehicle, i) => {
                    const vName = `${vehicle.make} ${vehicle.model}`
                    const vImage = vehicle.images?.[0] || '/vehicle-thumb-01.jpg'
                    const vMileage = typeof vehicle.mileage === 'number' ? vehicle.mileage.toLocaleString() : vehicle.mileage
                    const vPrice = typeof vehicle.price === 'number' ? `£${vehicle.price.toLocaleString()}` : vehicle.price
                    const vMonthly = typeof vehicle.monthly_payment === 'number' ? `£${vehicle.monthly_payment}` : vehicle.monthly_payment
                    const vHasDiscount = (vehicle.discount_amount || 0) > 0
                    return (
                      <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i % 5) * 0.06 }}>
                        <Link to={`/vehicle/${vehicle.id}`}>
                          <div className="flex flex-col sm:flex-row gap-5 rounded-2xl p-4 bg-midnight/60 border border-slate/20 hover:border-electric-blue/30 transition-all duration-300 group" style={{ backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                            <div className="relative w-full sm:w-[240px] h-[160px] sm:h-[140px] rounded-xl overflow-hidden shrink-0">
                              <img src={vImage} alt={vName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-midnight/50 to-transparent" />
                              {vHasDiscount && <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[0.625rem] font-bold bg-error text-pure-white">SAVE £{vehicle.discount_amount?.toLocaleString()}</span>}
                              {vehicle.badge && <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[0.625rem] font-bold bg-success text-pure-white">{vehicle.badge}</span>}
                            </div>
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                <h3 className="font-display font-semibold text-pure-white text-[1.0625rem]">{vName}</h3>
                                <p className="text-[0.75rem] text-chrome">{vehicle.variant}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-chrome">
                                  <span>{vehicle.year}</span><span className="w-1 h-1 rounded-full bg-slate" />
                                  <span className="flex items-center gap-1"><Gauge size={11} />{vMileage} mi</span><span className="w-1 h-1 rounded-full bg-slate" />
                                  <span className="flex items-center gap-1"><Fuel size={11} />{vehicle.fuel_type}</span><span className="w-1 h-1 rounded-full bg-slate" />
                                  <span>{vehicle.transmission}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {vehicle.features?.slice(0, 4).map((f) => <span key={f} className="px-2 py-0.5 rounded text-[0.625rem] text-chrome bg-obsidian/60 border border-slate/15">{f}</span>)}
                                </div>
                                <div className="mt-2 flex items-center gap-1"><MapPin size={10} className="text-blue-glow" /><span className="text-[0.6875rem] text-chrome">{vehicle.location}</span></div>
                              </div>
                              <div className="sm:text-right shrink-0">
                                <p className="font-mono text-xl font-semibold text-pure-white">{vPrice}</p>
                                <p className="font-mono text-sm text-electric-blue mt-0.5">{vMonthly}/mo</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}
              {sortedVehicles.length === 0 && (
                <div className="text-center py-20">
                  <Car size={48} className="text-slate/30 mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-xl text-pure-white">No vehicles found</h3>
                  <p className="mt-2 text-chrome">Try adjusting your filters to see more results.</p>
                  <button onClick={() => { setActiveMake('All Makes'); setActivePrice('Any Price'); setActiveFuel('Any Fuel') }} className="mt-6 px-6 py-3 bg-electric-blue text-pure-white rounded-full text-sm font-semibold hover:bg-blue-glow transition-colors">Clear All Filters</button>
                </div>
              )}
              {sortedVehicles.length > 0 && (
                <div className="mt-12 text-center"><button className="px-10 py-4 bg-transparent border-2 border-slate/30 text-frost rounded-full text-sm font-semibold hover:border-electric-blue hover:text-pure-white transition-all duration-300">Load More Vehicles</button></div>
              )}
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
