// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Gauge, Fuel,
  Settings, Zap, Check, CheckCircle, Heart, Share2,
  Phone, Mail, User, MessageSquare, Send, Clock,
  MapPin, Cog, ArrowRight
} from 'lucide-react';
import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles';

const fallbackData: Record<string, Record<string, unknown>> = {
  '1': { power: '194 bhp', torque: '400 Nm', acceleration: '7.3', topSpeed: '145', mpg: '55.4', co2: '117', taxBand: 'C', length: '4,751 mm', width: '1,820 mm', height: '1,437 mm', bootCapacity: '455 L', gears: '9', drivetrain: 'RWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Stunning Mercedes C-Class in excellent condition with full service history. Recently serviced and ready to drive away.' },
  '2': { power: '181 bhp', torque: '300 Nm', acceleration: '7.4', topSpeed: '149', mpg: '44.1', co2: '135', taxBand: 'E', length: '4,709 mm', width: '1,827 mm', height: '1,442 mm', bootCapacity: '480 L', gears: '8', drivetrain: 'RWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Premium BMW 3 Series with M Sport Pro pack. Low mileage and in pristine condition throughout.' },
  '3': { power: '161 bhp', torque: '370 Nm', acceleration: '8.2', topSpeed: '142', mpg: '58.9', co2: '108', taxBand: 'B', length: '4,762 mm', width: '1,847 mm', height: '1,429 mm', bootCapacity: '460 L', gears: '7', drivetrain: 'FWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Stylish Audi A4 Black Edition with all premium options. Virtual cockpit and LED matrix headlights.' },
  '4': { power: '296 bhp', torque: '650 Nm', acceleration: '6.6', topSpeed: '140', mpg: '32.5', co2: '189', taxBand: 'J', length: '4,877 mm', width: '2,073 mm', height: '1,803 mm', bootCapacity: '780 L', gears: '8', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Powerful Range Rover Sport with HSE Dynamic pack and air suspension. Perfect for family adventures.' },
  '5': { power: '631 bhp', torque: '850 Nm', acceleration: '3.3', topSpeed: '186', mpg: '20.4', co2: '268', taxBand: 'M', length: '4,936 mm', width: '1,995 mm', height: '1,636 mm', bootCapacity: '549 L', gears: '8', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'High-performance Porsche Cayenne Turbo GT Coupe with sports chrono package. Ultimate driving machine.' },
  '6': { power: '434 bhp', torque: '493 Nm', acceleration: '4.2', topSpeed: '145', mpg: 'N/A', co2: '0', taxBand: 'A', length: '4,694 mm', width: '1,850 mm', height: '1,443 mm', bootCapacity: '425 L', gears: '1', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Low mileage Tesla Model 3 Long Range with full self-driving capability. Autopilot and glass roof.' },
  '7': { power: '296 bhp', torque: '650 Nm', acceleration: '6.4', topSpeed: '145', mpg: '36.7', co2: '164', taxBand: 'I', length: '4,737 mm', width: '2,175 mm', height: '1,653 mm', bootCapacity: '508 L', gears: '8', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Elegant Jaguar F-PACE R-Dynamic with HSE specification. Meridian audio and panoramic roof.' },
  '8': { power: '308 bhp', torque: '335 Nm', acceleration: '7.7', topSpeed: '124', mpg: '34.4', co2: '121', taxBand: 'D', length: '4,890 mm', width: '1,895 mm', height: '1,690 mm', bootCapacity: '461 L', gears: 'CVT', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Luxurious Lexus RX 450h hybrid with Mark Levinson audio. Premium navigation and heads-up display.' },
};

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { getVehicleById, vehicles: allVehicles, loading: hookLoading } = useSupabaseVehicles();

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [deposit, setDeposit] = useState(10);
  const [term, setTerm] = useState(48);
  const [enquiryForm, setEnquiryForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [testDriveForm, setTestDriveForm] = useState({ date: '', time: '', location: '' });

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveImage(prev => prev > 0 ? prev - 1 : (vehicle?.images?.length || 1) - 1);
      } else if (e.key === 'ArrowRight') {
        setActiveImage(prev => prev < (vehicle?.images?.length || 1) - 1 ? prev + 1 : 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vehicle?.images?.length]);

  useEffect(() => {
    let cancelled = false;
    const fetchVehicle = async () => {
      if (!id || id === 'undefined') { setVehicle(null); setLoading(false); return; }
      setLoading(true);
      try {
        const data = await getVehicleById(id);
        if (!cancelled) { setVehicle(data); setLoading(false); }
      } catch {
        if (!cancelled) { setVehicle(null); setLoading(false); }
      }
    };
    fetchVehicle();
    return () => { cancelled = true; };
  }, [id, getVehicleById]);

  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    return allVehicles.filter(v => v.id !== vehicle.id && (v.make === vehicle.make || Math.abs(v.price - vehicle.price) < 15000)).slice(0, 3);
  }, [vehicle, allVehicles]);

  const depositAmount = vehicle ? Math.round(vehicle.price * (deposit / 100)) : 0;
  const amountFinanced = vehicle ? vehicle.price - depositAmount : 0;
  const apr = 9.9;
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment = amountFinanced > 0 ? Math.round((amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)) : 0;
  const totalPayable = monthlyPayment * term + depositAmount;

  if (loading || hookLoading) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-chrome">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-pure-white mb-4">Vehicle Not Found</h1>
          <p className="text-chrome mb-6">The vehicle you are looking for does not exist.</p>
          <Link to="/inventory" className="px-8 py-3 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow transition-all">Browse All Vehicles</Link>
        </div>
      </div>
    );
  }

  const v = {
    make: vehicle.make || '', model: vehicle.model || '', variant: vehicle.variant || '',
    year: vehicle.year || 0, mileage: vehicle.mileage || 0, transmission: vehicle.transmission || 'Auto',
    fuel_type: vehicle.fuel_type || '', price: vehicle.price || 0, monthly_payment: vehicle.monthly_payment || 0,
    description: vehicle.description || 'No description available.', features: vehicle.features || [],
    images: vehicle.images || [], registration: vehicle.registration || 'N/A',
    engine_size: vehicle.engine_size || vehicle.engineSize || 'N/A', power: vehicle.power || 'See description',
    torque: vehicle.torque || 'See description', acceleration: vehicle.acceleration || 'N/A',
    topSpeed: vehicle.topSpeed || 'N/A', mpg: vehicle.mpg || 'N/A', co2: vehicle.co2 || 'N/A',
    taxBand: vehicle.taxBand || 'N/A', length: vehicle.length || 'N/A', width: vehicle.width || 'N/A',
    height: vehicle.height || 'N/A', bootCapacity: vehicle.bootCapacity || 'N/A', gears: vehicle.gears || 'Auto',
    drivetrain: vehicle.drivetrain || 'N/A', ncapRating: vehicle.ncapRating || '5 Star',
    condition: vehicle.condition || 'Excellent', owners: vehicle.owners ?? 1,
  };

  const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };
  const staggerContainer = { initial: {}, whileInView: { transition: { staggerChildren: 0.06 } } };
  const staggerItem = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      {/* ============ HERO GALLERY WITH SLIDER ============ */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden group/gallery">
        {/* Background Image with smooth transition */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              src={v.images[activeImage] || '/vehicle-thumb-01.jpg'}
              alt={`${v.make} ${v.model}`}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-[rgba(0,8,20,0.3)]" />
        </div>

        {/* SIDE Navigation Arrows */}
        {v.images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : v.images.length - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-obsidian/60 backdrop-blur-sm border border-slate/30 flex items-center justify-center text-pure-white hover:bg-electric-blue hover:border-electric-blue transition-all duration-300"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => setActiveImage(prev => prev < v.images.length - 1 ? prev + 1 : 0)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-obsidian/60 backdrop-blur-sm border border-slate/30 flex items-center justify-center text-pure-white hover:bg-electric-blue hover:border-electric-blue transition-all duration-300"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        {/* Image Counter — top right */}
        {v.images.length > 1 && (
          <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full bg-obsidian/70 backdrop-blur-sm border border-slate/30">
            <span className="font-mono text-sm text-frost">{activeImage + 1} / {v.images.length}</span>
          </div>
        )}

        {/* Thumbnail Strip — bottom center */}
        {v.images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 max-w-[80%] overflow-x-auto pb-2 px-2">
            {v.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${i === activeImage ? 'border-electric-blue ring-2 ring-electric-blue/30' : 'border-transparent opacity-50 hover:opacity-80'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-24 left-0 right-0 z-10 px-[clamp(1.5rem,5vw,4rem)]">
          <div className="max-w-[1400px] mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-chrome mb-4">
              <Link to="/" className="text-frost hover:text-pure-white transition-colors">Home</Link><span className="mx-2 text-slate">/</span>
              <Link to="/inventory" className="text-frost hover:text-pure-white transition-colors">Inventory</Link><span className="mx-2 text-slate">/</span>
              <span>{v.make}</span>
            </motion.div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }} className="font-display font-bold text-pure-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>{v.make} {v.model} {v.variant}</motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-2 font-mono text-sm text-chrome">{v.year} &middot; {v.mileage.toLocaleString()} miles &middot; {v.transmission} &middot; {v.fuel_type}</motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex items-baseline gap-4 mt-4">
                  <span className="font-display font-bold text-3xl text-pure-white">&pound;{v.price.toLocaleString()}</span>
                  <span className="text-base text-electric-blue">or &pound;{v.monthly_payment}/month</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">PCP</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">RAC Approved</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">200-Point Inspected</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">3-Month Warranty</span>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="flex flex-col items-start lg:items-end gap-3">
                <button className="px-8 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 text-center">Reserve This Car — &pound;99</button>
                <Link to="/contact" className="px-8 py-3 border-2 border-pure-white/30 text-pure-white font-semibold rounded-full hover:bg-pure-white/10 hover:border-electric-blue transition-all duration-300 text-center">Book Test Drive</Link>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsWishlisted(!isWishlisted)} className="flex items-center gap-2 px-4 py-2 text-sm text-frost hover:text-pure-white transition-colors"><Heart size={16} className={isWishlisted ? 'fill-error text-error' : ''} />{isWishlisted ? 'Saved' : 'Save'}</button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-frost hover:text-pure-white transition-colors"><Share2 size={16} /> Share</button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-midnight py-12">
        <div className="container-apex">
          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[{ icon: <Calendar size={28} />, label: 'Year', value: String(v.year) }, { icon: <Gauge size={28} />, label: 'Mileage', value: `${v.mileage.toLocaleString()} miles` }, { icon: <Fuel size={28} />, label: 'Fuel Type', value: v.fuel_type }, { icon: <Settings size={28} />, label: 'Transmission', value: v.transmission }, { icon: <Cog size={28} />, label: 'Engine Size', value: v.engine_size }, { icon: <Zap size={28} />, label: 'Power', value: v.power }].map((item, i) => (
              <motion.div key={i} variants={staggerItem} className="flex flex-col items-center text-center py-6 px-4 border-r border-slate/20 last:border-r-0">
                <span className="text-electric-blue mb-2">{item.icon}</span>
                <span className="text-[0.75rem] font-medium text-chrome uppercase tracking-[0.06em]">{item.label}</span>
                <span className="font-display font-semibold text-base text-pure-white mt-1">{item.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }} className="lg:col-span-3">
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">About This Vehicle</h2>
              <p className="text-frost leading-relaxed mb-4">{v.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20"><CheckCircle size={16} className="text-success" /><span className="text-sm text-success font-medium">Condition: {v.condition}</span></div>
              <p className="mt-3 text-sm text-chrome">{v.owners} previous owner{v.owners !== 1 ? 's' : ''} &middot; Registration: {v.registration}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }} className="lg:col-span-2">
              <h2 className="font-display font-semibold text-lg text-pure-white mb-4">Key Features</h2>
              <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid grid-cols-2 gap-2.5">
                {v.features.map((feature: string, i: number) => (
                  <motion.div key={i} variants={staggerItem} className="flex items-center gap-2"><Check size={16} className="text-success shrink-0" /><span className="text-sm text-frost">{feature}</span></motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div {...fadeUp} className="max-w-[1000px] mx-auto">
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-8">Full Specifications</h2>
            <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="space-y-0">
              {[{ label: 'Make', value: v.make }, { label: 'Model', value: `${v.model} ${v.variant}` }, { label: 'Year', value: String(v.year) }, { label: 'Mileage', value: `${v.mileage.toLocaleString()} miles` }, { label: 'Registration', value: v.registration }, { label: 'Previous Owners', value: String(v.owners) }, { label: 'Engine Size', value: v.engine_size }, { label: 'Power', value: v.power }, { label: 'Torque', value: v.torque }, { label: 'Acceleration (0-60)', value: `${v.acceleration}s` }, { label: 'Top Speed', value: `${v.topSpeed} mph` }, { label: 'Fuel Type', value: v.fuel_type }, { label: 'MPG (Combined)', value: v.mpg === 'N/A' ? 'N/A' : `${v.mpg} mpg` }, { label: 'CO2 Emissions', value: `${v.co2} g/km` }, { label: 'Tax Band', value: v.taxBand }, { label: 'Length', value: v.length }, { label: 'Width', value: v.width }, { label: 'Height', value: v.height }, { label: 'Boot Capacity', value: v.bootCapacity }, { label: 'Transmission', value: v.transmission }, { label: 'Gears', value: v.gears }, { label: 'Drivetrain', value: v.drivetrain }, { label: 'NCAP Rating', value: v.ncapRating }].map((spec, i) => (
                <motion.div key={i} variants={staggerItem} className={`flex items-center justify-between py-3.5 border-b border-slate/20 ${i % 2 === 0 ? 'bg-[rgba(0,8,20,0.3)]' : ''} px-4 -mx-4`}>
                  <span className="text-sm font-medium text-chrome">{spec.label}</span>
                  <span className="text-sm text-pure-white">{spec.value}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-6">Finance Calculator</h2>
              <div className="flex gap-2 mb-6">
                {['PCP', 'HP', 'Cash'].map((tab) => <button key={tab} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === 'PCP' ? 'bg-electric-blue text-pure-white' : 'bg-slate/20 text-chrome hover:text-frost'}`}>{tab}</button>)}
              </div>
              <div className="space-y-5">
                <div><label className="block text-sm text-chrome mb-2">Vehicle Price</label><div className="px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-pure-white font-mono">&pound;{v.price.toLocaleString()}</div></div>
                <div>
                  <label className="flex justify-between text-sm text-chrome mb-2"><span>Deposit ({deposit}%)</span><span className="text-pure-white font-mono">&pound;{depositAmount.toLocaleString()}</span></label>
                  <input type="range" min="0" max="50" value={deposit} onChange={e => setDeposit(Number(e.target.value))} className="w-full h-2 bg-slate/30 rounded-full appearance-none cursor-pointer accent-electric-blue" />
                  <div className="flex justify-between text-xs text-slate mt-1"><span>0%</span><span>25%</span><span>50%</span></div>
                </div>
                <div><label className="block text-sm text-chrome mb-2">Term</label><div className="flex gap-2">{[24, 36, 48, 60].map((t) => <button key={t} onClick={() => setTerm(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${term === t ? 'bg-electric-blue text-pure-white' : 'bg-[rgba(0,8,20,0.6)] border border-slate/30 text-frost hover:border-electric-blue'}`}>{t} mo</button>)}</div></div>
                <div><label className="block text-sm text-chrome mb-2">Credit Rating</label><select className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue"><option>Excellent</option><option>Good</option><option>Fair</option></select></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }} className="flex items-center">
              <div className="w-full glass rounded-2xl p-8">
                <p className="font-mono text-sm text-chrome mb-1">Monthly Payment</p>
                <p className="font-display font-bold text-electric-blue" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>&pound;{monthlyPayment.toLocaleString()}</p>
                <p className="text-sm text-chrome mb-6">per month</p>
                <div className="border-t border-slate/30 my-5" />
                <div className="space-y-3">
                  {[{ label: 'Vehicle Price', value: `&pound;${v.price.toLocaleString()}` }, { label: 'Deposit', value: `-&pound;${depositAmount.toLocaleString()}` }, { label: 'Term', value: `${term} months` }, { label: 'Total Payable', value: `&pound;${totalPayable.toLocaleString()}` }, { label: 'Representative APR', value: `${apr}%` }].map((row, i) => (
                    <div key={i} className="flex justify-between"><span className="text-sm text-chrome">{row.label}</span><span className="text-sm font-mono text-pure-white">{row.value}</span></div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">Apply for Finance</button>
                <p className="text-xs text-slate text-center mt-3">Representative example. Subject to status and affordability checks.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[800px] mx-auto text-center">
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-3">Interested in This Car?</h2>
            <p className="text-frost mb-8">Send us an enquiry and our team will get back to you within 30 minutes during opening hours.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-left"><label className="block text-sm text-chrome mb-2">First Name</label><input type="text" value={enquiryForm.firstName} onChange={e => setEnquiryForm(prev => ({ ...prev, firstName: e.target.value }))} placeholder="John" className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all" /></div>
              <div className="text-left"><label className="block text-sm text-chrome mb-2">Last Name</label><input type="text" value={enquiryForm.lastName} onChange={e => setEnquiryForm(prev => ({ ...prev, lastName: e.target.value }))} placeholder="Smith" className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all" /></div>
              <div className="text-left sm:col-span-2"><label className="block text-sm text-chrome mb-2">Email Address</label><input type="email" value={enquiryForm.email} onChange={e => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))} placeholder="john@example.com" className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all" /></div>
              <div className="text-left sm:col-span-2"><label className="block text-sm text-chrome mb-2">Phone Number</label><input type="tel" value={enquiryForm.phone} onChange={e => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="07XXX XXXXXX" className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all" /></div>
              <div className="text-left sm:col-span-2"><label className="block text-sm text-chrome mb-2">Your Message</label><textarea value={enquiryForm.message} onChange={e => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))} placeholder="I'd like to know more about this vehicle..." rows={4} className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all resize-none" /></div>
            </div>
            <button className="mt-6 w-full sm:w-auto px-10 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all flex items-center justify-center gap-2 mx-auto"><Send size={16} /> Send Enquiry</button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">Book a Test Drive</h2>
              <p className="text-frost leading-relaxed mb-6">Nothing compares to getting behind the wheel. Book a test drive at your nearest showroom and experience this vehicle firsthand.</p>
              <ul className="space-y-3">
                {['No obligation or pressure', 'Available 7 days a week', 'Bring your part exchange for valuation', 'Finance pre-approval available'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3"><CheckCircle size={18} className="text-success shrink-0" /><span className="text-sm text-frost">{item}</span></li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }} className="glass rounded-2xl p-8">
              <div className="space-y-4">
                <div><label className="block text-sm text-chrome mb-2">Preferred Date</label><input type="date" value={testDriveForm.date} onChange={e => setTestDriveForm(prev => ({ ...prev, date: e.target.value }))} className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white outline-none focus:border-electric-blue" /></div>
                <div><label className="block text-sm text-chrome mb-2">Preferred Time</label><select value={testDriveForm.time} onChange={e => setTestDriveForm(prev => ({ ...prev, time: e.target.value }))} className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue"><option value="">Select time</option><option>Morning (9am - 12pm)</option><option>Afternoon (12pm - 5pm)</option><option>Evening (5pm - 7pm)</option></select></div>
                <div><label className="block text-sm text-chrome mb-2">Showroom Location</label><select value={testDriveForm.location} onChange={e => setTestDriveForm(prev => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue"><option value="">Select location</option><option>London</option><option>Manchester</option><option>Birmingham</option><option>Edinburgh</option></select></div>
                <button className="w-full mt-4 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">Book Test Drive</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-2">Similar Vehicles</h2>
            <p className="text-chrome mb-8">More cars you might love</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarVehicles.map((sv, i) => (
              <motion.div key={sv.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.1 }}>
                <Link to={`/vehicle/${sv.id}`} className="block group">
                  <div className="rounded-2xl overflow-hidden bg-[rgba(0,18,51,0.5)] backdrop-blur-16 border border-slate/25 shadow-card transition-all duration-400 group-hover:shadow-card-hover group-hover:-translate-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={sv.images?.[0] || '/vehicle-thumb-01.jpg'} alt={`${sv.make} ${sv.model}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-base text-pure-white">{sv.make} {sv.model}</h3>
                      <p className="text-xs text-chrome mt-1">{sv.variant}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-chrome"><span>{sv.year}</span><span>|</span><span>{sv.mileage.toLocaleString()} mi</span><span>|</span><span>{sv.fuel_type}</span></div>
                      <div className="mt-3 pt-3 border-t border-slate/20">
                        <p className="font-mono text-lg text-pure-white">&pound;{sv.price.toLocaleString()}</p>
                        <p className="font-mono text-xs text-electric-blue">&pound;{sv.monthly_payment}/mo</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-obsidian to-midnight">
        <div className="container-apex">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[800px] mx-auto text-center">
            <h2 className="font-display font-bold text-pure-white mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>Love This Car?</h2>
            <p className="text-frost mb-6">Reserve it now with a fully refundable &pound;99 deposit. Do not miss out — popular cars go fast.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-10 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">Reserve Now — &pound;99</button>
              <a href="tel:08001234567" className="flex items-center gap-2 px-8 py-3.5 border-2 border-pure-white/30 text-pure-white font-semibold rounded-full hover:bg-pure-white/10 hover:border-electric-blue transition-all"><Phone size={16} /> Call Us</a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
