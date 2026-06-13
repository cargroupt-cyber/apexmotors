// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Gauge, Fuel,
  Settings, Zap, Check, CheckCircle, Heart, Share2,
  Phone, Mail, User, MessageSquare, Send, Clock,
  MapPin, Cog
} from 'lucide-react';
import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles';

const fallbackData: Record<string, Record<string, unknown>> = {
  '1': { power: '194 bhp', torque: '400 Nm', acceleration: '7.3', topSpeed: '145', mpg: '55.4', co2: '117', taxBand: 'C', length: '4,751 mm', width: '1,820 mm', height: '1,437 mm', bootCapacity: '455 L', gears: '9', drivetrain: 'RWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1 },
  '2': { power: '181 bhp', torque: '300 Nm', acceleration: '7.4', topSpeed: '149', mpg: '44.1', co2: '135', taxBand: 'E', length: '4,709 mm', width: '1,827 mm', height: '1,442 mm', bootCapacity: '480 L', gears: '8', drivetrain: 'RWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1 },
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
    engine_size: vehicle.engine_size || 'N/A', power: vehicle.power || 'See description',
    torque: vehicle.torque || 'See description', acceleration: vehicle.acceleration || 'N/A',
    topSpeed: vehicle.topSpeed || 'N/A', mpg: vehicle.mpg || 'N/A', co2: vehicle.co2 || 'N/A',
    taxBand: vehicle.taxBand || 'N/A', length: vehicle.length || 'N/A', width: vehicle.width || 'N/A',
    height: vehicle.height || 'N/A', bootCapacity: vehicle.bootCapacity || 'N/A', gears: vehicle.gears || 'Auto',
    drivetrain: vehicle.drivetrain || 'N/A', ncapRating: vehicle.ncapRating || '5 Star',
    condition: vehicle.condition || 'Excellent', owners: vehicle.owners ?? 1,
  };

  const depositAmount = vehicle ? Math.round(vehicle.price * (deposit / 100)) : 0;
  const amountFinanced = vehicle ? vehicle.price - depositAmount : 0;
  const apr = 9.9;
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment = amountFinanced > 0 ? Math.round((amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)) : 0;
  const totalPayable = monthlyPayment * term + depositAmount;

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <motion.img initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} src={v.images[activeImage] || '/vehicle-thumb-01.jpg'} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-[rgba(0,8,20,0.3)]" />
        </div>
        <div className="absolute bottom-8 left-0 right-0 z-10 px-[clamp(1.5rem,5vw,4rem)]">
          <div className="max-w-[1400px] mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-chrome mb-4">
              <Link to="/" className="text-frost hover:text-pure-white">Home</Link><span className="mx-2 text-slate">/</span>
              <Link to="/inventory" className="text-frost hover:text-pure-white">Inventory</Link><span className="mx-2 text-slate">/</span>
              <span>{v.make}</span>
            </motion.div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="font-display font-bold text-pure-white text-4xl">{v.make} {v.model}</motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-2 font-mono text-sm text-chrome">{v.year} &middot; {v.mileage.toLocaleString()} miles &middot; {v.transmission} &middot; {v.fuel_type}</motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex items-baseline gap-4 mt-4">
                  <span className="font-display font-bold text-3xl text-pure-white">&pound;{v.price.toLocaleString()}</span>
                  <span className="text-electric-blue">&pound;{v.monthly_payment}/month</span>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="flex flex-col gap-3">
                <button className="px-8 py-3 bg-electric-blue text-pure-white rounded-full hover:bg-blue-glow transition-all">Reserve This Car</button>
                <Link to="/contact" className="px-8 py-3 border-2 border-white/30 text-white rounded-full hover:bg-white/10 transition-all text-center">Book Test Drive</Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-midnight py-12">
        <div className="container-apex">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-center">
            {[{ icon: <Calendar size={28} />, label: 'Year', value: String(v.year) }, { icon: <Gauge size={28} />, label: 'Mileage', value: `${v.mileage.toLocaleString()} mi` }, { icon: <Fuel size={28} />, label: 'Fuel', value: v.fuel_type }, { icon: <Settings size={28} />, label: 'Trans', value: v.transmission }, { icon: <Cog size={28} />, label: 'Engine', value: v.engine_size }, { icon: <Zap size={28} />, label: 'Power', value: v.power }].map((item, i) => (
              <div key={i} className="flex flex-col items-center py-6 px-4 border-r border-slate/20 last:border-r-0"><span className="text-electric-blue mb-2">{item.icon}</span><span className="text-xs text-chrome uppercase">{item.label}</span><span className="font-semibold text-pure-white mt-1">{item.value}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-apex">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">About This Vehicle</h2>
              <p className="text-frost leading-relaxed mb-4">{v.description}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20"><CheckCircle size={16} className="text-success" /><span className="text-sm text-success">Condition: {v.condition}</span></div>
              <p className="mt-3 text-sm text-chrome">{v.owners} previous owner(s) &middot; Registration: {v.registration}</p>
            </div>
            <div className="lg:col-span-2">
              <h2 className="font-display font-semibold text-lg text-pure-white mb-4">Key Features</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {v.features.map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2"><Check size={16} className="text-success" /><span className="text-sm text-frost">{feature}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <div className="max-w-[1000px] mx-auto">
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-8">Full Specifications</h2>
            <div className="space-y-0">
              {[{ label: 'Make', value: v.make }, { label: 'Model', value: `${v.model} ${v.variant}` }, { label: 'Year', value: String(v.year) }, { label: 'Mileage', value: `${v.mileage.toLocaleString()} miles` }, { label: 'Registration', value: v.registration }, { label: 'Engine Size', value: v.engine_size }, { label: 'Fuel Type', value: v.fuel_type }, { label: 'Transmission', value: v.transmission }, { label: 'Power', value: v.power }].map((spec, i) => (
                <div key={i} className={`flex justify-between py-3.5 border-b border-slate/20 px-4 -mx-4 ${i % 2 === 0 ? 'bg-[rgba(0,8,20,0.3)]' : ''}`}><span className="text-sm text-chrome">{spec.label}</span><span className="text-sm text-pure-white">{spec.value}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-apex">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-3">Interested in This Car?</h2>
            <p className="text-frost mb-8">Send us an enquiry and our team will get back to you.</p>
            <button className="px-10 py-3.5 bg-electric-blue text-pure-white rounded-full hover:bg-blue-glow transition-all">Send Enquiry</button>
          </div>
        </div>
      </section>

      {similarVehicles.length > 0 && (
        <section className="py-24 bg-midnight">
          <div className="container-apex">
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-2">Similar Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {similarVehicles.map((sv) => (
                <Link key={sv.id} to={`/vehicle/${sv.id}`} className="block">
                  <div className="rounded-2xl overflow-hidden bg-[rgba(0,18,51,0.5)] border border-slate/25">
                    <img src={sv.images?.[0] || '/vehicle-thumb-01.jpg'} alt={`${sv.make} ${sv.model}`} className="w-full h-48 object-cover" />
                    <div className="p-5">
                      <h3 className="font-semibold text-pure-white">{sv.make} {sv.model}</h3>
                      <p className="font-mono text-electric-blue mt-1">&pound;{sv.price?.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
