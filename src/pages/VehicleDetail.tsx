// @ts-nocheck
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Gauge, Fuel,
  Settings, Zap, Check, CheckCircle, Heart, Share2,
  Phone, Mail, User, MessageSquare, Send, Clock,
  MapPin, Cog, ArrowRight
} from 'lucide-react';
import { vehicles } from '../data/vehicles';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicle = vehicles.find(v => v.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [deposit, setDeposit] = useState(10);
  const [term, setTerm] = useState(48);
  const [enquiryForm, setEnquiryForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [testDriveForm, setTestDriveForm] = useState({ date: '', time: '', location: '' });

  // Similar vehicles: same make or similar price range
  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    return vehicles
      .filter(v => v.id !== vehicle.id && (v.make === vehicle.make || Math.abs(v.price - vehicle.price) < 15000))
      .slice(0, 3);
  }, [vehicle]);

  // Finance calculations
  const depositAmount = vehicle ? Math.round(vehicle.price * (deposit / 100)) : 0;
  const amountFinanced = vehicle ? vehicle.price - depositAmount : 0;
  const apr = 9.9;
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment = amountFinanced > 0
    ? Math.round((amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1))
    : 0;
  const totalPayable = monthlyPayment * term + depositAmount;

  if (!vehicle) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-pure-white mb-4">Vehicle Not Found</h1>
          <p className="text-chrome mb-6">The vehicle you are looking for does not exist.</p>
          <Link to="/inventory" className="px-8 py-3 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow transition-all">
            Browse All Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };
  const staggerContainer = { initial: {}, whileInView: { transition: { staggerChildren: 0.06 } } };
  const staggerItem = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      {/* ============ HERO GALLERY ============ */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            src={vehicle.images[activeImage]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-[rgba(0,8,20,0.3)]" />
        </div>

        {/* Navigation Arrows */}
        <div className="absolute bottom-8 right-8 flex items-center gap-2 z-10">
          <button
            onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : vehicle.images.length - 1)}
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-pure-white hover:bg-pure-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-mono text-sm text-frost px-2">
            {activeImage + 1} / {vehicle.images.length}
          </span>
          <button
            onClick={() => setActiveImage(prev => prev < vehicle.images.length - 1 ? prev + 1 : 0)}
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-pure-white hover:bg-pure-white/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {vehicle.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? 'border-electric-blue opacity-100' : 'border-transparent opacity-60 hover:opacity-80'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-24 left-0 right-0 z-10 px-[clamp(1.5rem,5vw,4rem)]">
          <div className="max-w-[1400px] mx-auto">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-chrome mb-4"
            >
              <Link to="/" className="text-frost hover:text-pure-white transition-colors">Home</Link>
              <span className="mx-2 text-slate">/</span>
              <Link to="/inventory" className="text-frost hover:text-pure-white transition-colors">Inventory</Link>
              <span className="mx-2 text-slate">/</span>
              <span>{vehicle.make}</span>
              <span className="mx-2 text-slate">/</span>
              <span>{vehicle.model}</span>
            </motion.div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
                  className="font-display font-bold text-pure-white"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
                >
                  {vehicle.make} {vehicle.model} {vehicle.variant}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="mt-2 font-mono text-sm text-chrome"
                >
                  {vehicle.year} &middot; {vehicle.mileage.toLocaleString()} miles &middot; {vehicle.transmission} &middot; {vehicle.fuelType}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="flex items-baseline gap-4 mt-4"
                >
                  <span className="font-display font-bold text-3xl text-pure-white">£{vehicle.price.toLocaleString()}</span>
                  <span className="text-base text-electric-blue">or £{vehicle.monthlyPayment}/month</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">PCP</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="flex flex-wrap gap-2 mt-3"
                >
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">RAC Approved</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">200-Point Inspected</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">3-Month Warranty</span>
                </motion.div>
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-col items-start lg:items-end gap-3"
              >
                <button className="px-8 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 text-center">
                  Reserve This Car — £99
                </button>
                <Link
                  to="/contact"
                  className="px-8 py-3 border-2 border-pure-white/30 text-pure-white font-semibold rounded-full hover:bg-pure-white/10 hover:border-electric-blue transition-all duration-300 text-center"
                >
                  Book Test Drive
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-frost hover:text-pure-white transition-colors"
                  >
                    <Heart size={16} className={isWishlisted ? 'fill-error text-error' : ''} />
                    {isWishlisted ? 'Saved' : 'Save'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-frost hover:text-pure-white transition-colors">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ KEY HIGHLIGHTS ============ */}
      <section className="bg-midnight py-12">
        <div className="container-apex">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          >
            {[
              { icon: <Calendar size={28} />, label: 'Year', value: String(vehicle.year) },
              { icon: <Gauge size={28} />, label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} miles` },
              { icon: <Fuel size={28} />, label: 'Fuel Type', value: vehicle.fuelType },
              { icon: <Settings size={28} />, label: 'Transmission', value: vehicle.transmission },
              { icon: <Cog size={28} />, label: 'Engine Size', value: vehicle.engineSize },
              { icon: <Zap size={28} />, label: 'Power', value: vehicle.power },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="flex flex-col items-center text-center py-6 px-4 border-r border-slate/20 last:border-r-0"
              >
                <span className="text-electric-blue mb-2">{item.icon}</span>
                <span className="text-[0.75rem] font-medium text-chrome uppercase tracking-[0.06em]">{item.label}</span>
                <span className="font-display font-semibold text-base text-pure-white mt-1">{item.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ DESCRIPTION & FEATURES ============ */}
      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left - Description */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="lg:col-span-3"
            >
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">About This Vehicle</h2>
              <p className="text-frost leading-relaxed mb-4">{vehicle.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                <CheckCircle size={16} className="text-success" />
                <span className="text-sm text-success font-medium">Condition: {vehicle.condition}</span>
              </div>
              <p className="mt-3 text-sm text-chrome">{vehicle.owners} previous owner{vehicle.owners !== 1 ? 's' : ''} &middot; Registration: {vehicle.registration}</p>
            </motion.div>

            {/* Right - Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="lg:col-span-2"
            >
              <h2 className="font-display font-semibold text-lg text-pure-white mb-4">Key Features</h2>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-2.5"
              >
                {vehicle.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className="flex items-center gap-2"
                  >
                    <Check size={16} className="text-success shrink-0" />
                    <span className="text-sm text-frost">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FULL SPECIFICATIONS ============ */}
      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div
            {...fadeUp}
            className="max-w-[1000px] mx-auto"
          >
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-8">Full Specifications</h2>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="space-y-0"
            >
              {[
                { label: 'Make', value: vehicle.make },
                { label: 'Model', value: `${vehicle.model} ${vehicle.variant}` },
                { label: 'Year', value: String(vehicle.year) },
                { label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} miles` },
                { label: 'Registration', value: vehicle.registration },
                { label: 'Previous Owners', value: String(vehicle.owners) },
                { label: 'Engine Size', value: vehicle.engineSize },
                { label: 'Power', value: vehicle.power },
                { label: 'Torque', value: vehicle.torque },
                { label: 'Acceleration (0-60)', value: `${vehicle.acceleration}s` },
                { label: 'Top Speed', value: `${vehicle.topSpeed} mph` },
                { label: 'Fuel Type', value: vehicle.fuelType },
                { label: 'MPG (Combined)', value: vehicle.mpg === 'N/A' ? 'N/A' : `${vehicle.mpg} mpg` },
                { label: 'CO2 Emissions', value: `${vehicle.co2} g/km` },
                { label: 'Tax Band', value: vehicle.taxBand },
                { label: 'Length', value: vehicle.length },
                { label: 'Width', value: vehicle.width },
                { label: 'Height', value: vehicle.height },
                { label: 'Boot Capacity', value: vehicle.bootCapacity },
                { label: 'Transmission', value: vehicle.transmission },
                { label: 'Gears', value: vehicle.gears },
                { label: 'Drivetrain', value: vehicle.drivetrain },
                { label: 'NCAP Rating', value: vehicle.ncapRating },
              ].map((spec, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className={`flex items-center justify-between py-3.5 border-b border-slate/20 ${i % 2 === 0 ? 'bg-[rgba(0,8,20,0.3)]' : ''} px-4 -mx-4`}
                >
                  <span className="text-sm font-medium text-chrome">{spec.label}</span>
                  <span className="text-sm text-pure-white">{spec.value}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ FINANCE CALCULATOR ============ */}
      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Calculator */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-6">Finance Calculator</h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {['PCP', 'HP', 'Cash'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === 'PCP' ? 'bg-electric-blue text-pure-white' : 'bg-slate/20 text-chrome hover:text-frost'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                {/* Vehicle Price */}
                <div>
                  <label className="block text-sm text-chrome mb-2">Vehicle Price</label>
                  <div className="px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-pure-white font-mono">
                    £{vehicle.price.toLocaleString()}
                  </div>
                </div>

                {/* Deposit Slider */}
                <div>
                  <label className="flex justify-between text-sm text-chrome mb-2">
                    <span>Deposit ({deposit}%)</span>
                    <span className="text-pure-white font-mono">£{depositAmount.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    className="w-full h-2 bg-slate/30 rounded-full appearance-none cursor-pointer accent-electric-blue"
                  />
                  <div className="flex justify-between text-xs text-slate mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Term */}
                <div>
                  <label className="block text-sm text-chrome mb-2">Term</label>
                  <div className="flex gap-2">
                    {[24, 36, 48, 60].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTerm(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${term === t ? 'bg-electric-blue text-pure-white' : 'bg-[rgba(0,8,20,0.6)] border border-slate/30 text-frost hover:border-electric-blue'}`}
                      >
                        {t} mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* Credit Rating */}
                <div>
                  <label className="block text-sm text-chrome mb-2">Credit Rating</label>
                  <select className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue">
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Right - Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex items-center"
            >
              <div className="w-full glass rounded-2xl p-8">
                <p className="font-mono text-sm text-chrome mb-1">Monthly Payment</p>
                <p className="font-display font-bold text-electric-blue" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                  £{monthlyPayment.toLocaleString()}
                </p>
                <p className="text-sm text-chrome mb-6">per month</p>

                <div className="border-t border-slate/30 my-5" />

                <div className="space-y-3">
                  {[
                    { label: 'Vehicle Price', value: `£${vehicle.price.toLocaleString()}` },
                    { label: 'Deposit', value: `-£${depositAmount.toLocaleString()}` },
                    { label: 'Term', value: `${term} months` },
                    { label: 'Total Payable', value: `£${totalPayable.toLocaleString()}` },
                    { label: 'Representative APR', value: `${apr}%` },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-sm text-chrome">{row.label}</span>
                      <span className="text-sm font-mono text-pure-white">{row.value}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">
                  Apply for Finance
                </button>
                <p className="text-xs text-slate text-center mt-3">
                  Representative example. Subject to status and affordability checks.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ ENQUIRY FORM ============ */}
      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-[800px] mx-auto text-center"
          >
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-3">Interested in This Car?</h2>
            <p className="text-frost mb-8">Send us an enquiry and our team will get back to you within 30 minutes during opening hours.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-sm text-chrome mb-2">First Name</label>
                <input
                  type="text"
                  value={enquiryForm.firstName}
                  onChange={e => setEnquiryForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all"
                />
              </div>
              <div className="text-left">
                <label className="block text-sm text-chrome mb-2">Last Name</label>
                <input
                  type="text"
                  value={enquiryForm.lastName}
                  onChange={e => setEnquiryForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Smith"
                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all"
                />
              </div>
              <div className="text-left sm:col-span-2">
                <label className="block text-sm text-chrome mb-2">Email Address</label>
                <input
                  type="email"
                  value={enquiryForm.email}
                  onChange={e => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all"
                />
              </div>
              <div className="text-left sm:col-span-2">
                <label className="block text-sm text-chrome mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={enquiryForm.phone}
                  onChange={e => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="07XXX XXXXXX"
                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all"
                />
              </div>
              <div className="text-left sm:col-span-2">
                <label className="block text-sm text-chrome mb-2">Your Message</label>
                <textarea
                  value={enquiryForm.message}
                  onChange={e => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="I'd like to know more about this vehicle..."
                  rows={4}
                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all resize-none"
                />
              </div>
            </div>

            <button className="mt-6 w-full sm:w-auto px-10 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all flex items-center justify-center gap-2 mx-auto">
              <Send size={16} /> Send Enquiry
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============ TEST DRIVE ============ */}
      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">Book a Test Drive</h2>
              <p className="text-frost leading-relaxed mb-6">
                Nothing compares to getting behind the wheel. Book a test drive at your nearest showroom and experience this vehicle firsthand.
              </p>
              <ul className="space-y-3">
                {[
                  'No obligation or pressure',
                  'Available 7 days a week',
                  'Bring your part exchange for valuation',
                  'Finance pre-approval available',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-success shrink-0" />
                    <span className="text-sm text-frost">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass rounded-2xl p-8"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-chrome mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={testDriveForm.date}
                    onChange={e => setTestDriveForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white outline-none focus:border-electric-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm text-chrome mb-2">Preferred Time</label>
                  <select
                    value={testDriveForm.time}
                    onChange={e => setTestDriveForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue"
                  >
                    <option value="">Select time</option>
                    <option>Morning (9am - 12pm)</option>
                    <option>Afternoon (12pm - 5pm)</option>
                    <option>Evening (5pm - 7pm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-chrome mb-2">Showroom Location</label>
                  <select
                    value={testDriveForm.location}
                    onChange={e => setTestDriveForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue"
                  >
                    <option value="">Select location</option>
                    <option>London</option>
                    <option>Manchester</option>
                    <option>Birmingham</option>
                    <option>Edinburgh</option>
                  </select>
                </div>
                <button className="w-full mt-4 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">
                  Book Test Drive
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ SIMILAR VEHICLES ============ */}
      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-2">Similar Vehicles</h2>
            <p className="text-chrome mb-8">More cars you might love</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarVehicles.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.1 }}
              >
                <Link to={`/vehicle/${v.id}`} className="block group">
                  <div className="rounded-2xl overflow-hidden bg-[rgba(0,18,51,0.5)] backdrop-blur-16 border border-slate/25 shadow-card transition-all duration-400 group-hover:shadow-card-hover group-hover:-translate-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={v.image} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-base text-pure-white">{v.make} {v.model}</h3>
                      <p className="text-xs text-chrome mt-1">{v.variant}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-chrome">
                        <span>{v.year}</span><span>|</span><span>{v.mileage.toLocaleString()} mi</span><span>|</span><span>{v.fuelType}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate/20">
                        <p className="font-mono text-lg text-pure-white">£{v.price.toLocaleString()}</p>
                        <p className="font-mono text-xs text-electric-blue">£{v.monthlyPayment}/mo</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="py-16 bg-gradient-to-r from-obsidian to-midnight">
        <div className="container-apex">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-[800px] mx-auto text-center"
          >
            <h2 className="font-display font-bold text-pure-white mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              Love This Car?
            </h2>
            <p className="text-frost mb-6">
              Reserve it now with a fully refundable £99 deposit. Do not miss out — popular cars go fast.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-10 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">
                Reserve Now — £99
              </button>
              <a
                href="tel:08001234567"
                className="flex items-center gap-2 px-8 py-3.5 border-2 border-pure-white/30 text-pure-white font-semibold rounded-full hover:bg-pure-white/10 hover:border-electric-blue transition-all"
              >
                <Phone size={16} /> Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
