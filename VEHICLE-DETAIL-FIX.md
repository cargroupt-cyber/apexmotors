# Fix for VehicleDetail.tsx

## Step 1: Go to GitHub
Open: https://github.com/cargroup-cyber/apexmotors/edit/main/src/pages/VehicleDetail.tsx

## Step 2: Select all and delete the current content

## Step 3: Paste this new content:

```tsx
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Gauge, Fuel, Settings, Zap, Check, Heart, Share2, Phone, Send, Cog } from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find(v => v.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [deposit, setDeposit] = useState(10);
  const [term, setTerm] = useState(48);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    return vehicles.filter(v => v.id !== vehicle.id && (v.make === vehicle.make || v.bodyType === vehicle.bodyType)).slice(0, 3);
  }, [vehicle, vehicles]);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-pure-white mb-4">Vehicle Not Found</h1>
          <p className="text-frost mb-8">The vehicle you are looking for does not exist.</p>
          <Link to="/inventory" className="inline-flex items-center gap-2 bg-electric-blue text-pure-white px-6 py-3 rounded-lg hover:bg-blue-glow transition-colors">
            Browse Inventory
          </Link>
        </div>
      </div>
    );
  }

  const depositAmount = Math.round(vehicle.price * (deposit / 100));
  const amountFinanced = vehicle.price - depositAmount;
  const monthlyRate = 0.079 / 12;
  const numPayments = term;
  const monthlyPayment = Math.round(amountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1));

  const images = vehicle.images?.length ? vehicle.images : ['/vehicle-thumb-01.jpg'];

  return (
    <div className="min-h-screen bg-obsidian pt-20">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-chrome">
          <Link to="/" className="hover:text-electric-blue transition-colors">Home</Link>
          <span>/</span>
          <Link to="/inventory" className="hover:text-electric-blue transition-colors">Inventory</Link>
          <span>/</span>
          <span className="text-pure-white">{vehicle.make} {vehicle.model}</span>
        </div>
      </div>

      {/* Gallery + Key Info */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-midnight">
              <img src={images[activeImage]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(p => p > 0 ? p - 1 : images.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-obsidian/80 text-pure-white flex items-center justify-center hover:bg-electric-blue transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setActiveImage(p => p < images.length - 1 ? p + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-obsidian/80 text-pure-white flex items-center justify-center hover:bg-electric-blue transition-colors">
                    <ChevronRight size={20} />
                  </button>
                  <span className="absolute bottom-4 right-4 bg-obsidian/80 text-pure-white px-3 py-1 rounded-full text-sm">{activeImage + 1} / {images.length}</span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-electric-blue' : 'border-transparent hover:border-chrome/30'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Key Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-electric-blue text-sm font-medium">{vehicle.make}</span>
              <span className="text-chrome">/</span>
              <span className="text-chrome text-sm">{vehicle.model}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-pure-white mb-3">{vehicle.make} {vehicle.model} {vehicle.variant}</h1>
            <div className="flex flex-wrap items-center gap-3 text-chrome mb-6">
              <span>{vehicle.year}</span>
              <span>·</span>
              <span>{vehicle.mileage?.toLocaleString()} miles</span>
              <span>·</span>
              <span>{vehicle.transmission}</span>
              <span>·</span>
              <span>{vehicle.fuelType}</span>
            </div>

            <div className="bg-midnight/50 rounded-xl p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-pure-white">£{vehicle.price?.toLocaleString()}</span>
                {vehicle.monthlyPayment && <span className="text-electric-blue">or £{vehicle.monthlyPayment}/month</span>}
              </div>
              {vehicle.discountAmount ? <span className="inline-block bg-success/10 text-success px-3 py-1 rounded-full text-sm">£{vehicle.discountAmount?.toLocaleString()} off</span> : null}
            </div>

            {/* Quick specs grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[{ icon: <Calendar size={20} />, label: 'Year', value: String(vehicle.year) }, { icon: <Gauge size={20} />, label: 'Mileage', value: `${vehicle.mileage?.toLocaleString()} mi` }, { icon: <Fuel size={20} />, label: 'Fuel', value: vehicle.fuelType }, { icon: <Settings size={20} />, label: 'Gearbox', value: vehicle.transmission }, { icon: <Cog size={20} />, label: 'Engine', value: vehicle.engineSize }, { icon: <Zap size={20} />, label: 'Status', value: vehicle.status }].map((s, i) => (
                <div key={i} className="bg-midnight/30 rounded-lg p-4 text-center">
                  <div className="text-electric-blue mb-2 flex justify-center">{s.icon}</div>
                  <div className="text-xs text-chrome uppercase tracking-wider">{s.label}</div>
                  <div className="text-pure-white font-medium">{s.value}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <a href="tel:08001234567" className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-electric-blue text-pure-white px-6 py-3 rounded-lg hover:bg-blue-glow transition-colors font-medium">
                <Phone size={18} /> Call Us
              </a>
              <Link to="/finance" className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 border border-electric-blue text-electric-blue px-6 py-3 rounded-lg hover:bg-electric-blue hover:text-pure-white transition-colors font-medium">
                Finance Options
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Description */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-pure-white mb-4">Description</h2>
            <p className="text-frost leading-relaxed mb-6">{vehicle.description || `Stunning ${vehicle.make} ${vehicle.model} in excellent condition. RAC approved and ready to drive away today.`}</p>

            {/* Features */}
            {vehicle.features?.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-pure-white mb-4">Features & Equipment</h3>
                <div className="grid grid-cols-2 gap-3">
                  {vehicle.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-frost">
                      <Check size={16} className="text-success flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Full Specs Table */}
            <h3 className="text-xl font-bold text-pure-white mb-4 mt-8">Full Specifications</h3>
            <div className="bg-midnight/30 rounded-xl overflow-hidden">
              {[{ label: 'Make', value: vehicle.make }, { label: 'Model', value: `${vehicle.model} ${vehicle.variant || ''}` }, { label: 'Year', value: String(vehicle.year) }, { label: 'Mileage', value: `${vehicle.mileage?.toLocaleString()} miles` }, { label: 'Registration', value: vehicle.registration || 'N/A' }, { label: 'Body Type', value: vehicle.bodyType }, { label: 'Fuel Type', value: vehicle.fuelType }, { label: 'Transmission', value: vehicle.transmission }, { label: 'Engine Size', value: vehicle.engineSize }, { label: 'Colour', value: vehicle.colour }, { label: 'Doors', value: String(vehicle.doors) }, { label: 'Seats', value: String(vehicle.seats) }].map((s, i, arr) => (
                <div key={i} className={`flex justify-between px-6 py-3 ${i !== arr.length - 1 ? 'border-b border-white/5' : ''} ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <span className="text-chrome">{s.label}</span>
                  <span className="text-pure-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Finance Calculator + Enquiry */}
          <div className="space-y-6">
            {/* Finance Calculator */}
            <div className="bg-midnight/50 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-pure-white mb-4">Finance Calculator</h3>
              <div className="mb-4">
                <label className="text-sm text-chrome mb-2 block">Vehicle Price</label>
                <div className="text-2xl font-bold text-pure-white">£{vehicle.price?.toLocaleString()}</div>
              </div>
              <div className="mb-4">
                <label className="text-sm text-chrome mb-2 block">Deposit ({deposit}%)</label>
                <input type="range" min="0" max="50" value={deposit} onChange={e => setDeposit(Number(e.target.value))} className="w-full accent-electric-blue" />
                <div className="text-pure-white font-medium">£{depositAmount.toLocaleString()}</div>
              </div>
              <div className="mb-4">
                <label className="text-sm text-chrome mb-2 block">Term (months)</label>
                <div className="flex gap-2 flex-wrap">
                  {[24, 36, 48, 60].map(t => (
                    <button key={t} onClick={() => setTerm(t)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${term === t ? 'bg-electric-blue text-pure-white' : 'bg-obsidian text-frost hover:bg-midnight'}`}>{t} mo</button>
                  ))}
                </div>
              </div>
              <div className="bg-obsidian rounded-lg p-4 text-center">
                <div className="text-sm text-chrome mb-1">Estimated Monthly Payment</div>
                <div className="text-3xl font-bold text-electric-blue">£{monthlyPayment.toLocaleString()}</div>
                <div className="text-xs text-chrome mt-2">Representative 7.9% APR</div>
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="bg-midnight/50 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-pure-white mb-4">Make an Enquiry</h3>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-success" />
                  </div>
                  <h4 className="text-pure-white font-bold mb-2">Thank You!</h4>
                  <p className="text-chrome text-sm">We will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                  <input type="text" placeholder="Your Name" value={enquiryForm.name} onChange={e => setEnquiryForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" required />
                  <input type="email" placeholder="Email Address" value={enquiryForm.email} onChange={e => setEnquiryForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" required />
                  <input type="tel" placeholder="Phone Number" value={enquiryForm.phone} onChange={e => setEnquiryForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" />
                  <textarea placeholder="Your Message" value={enquiryForm.message} onChange={e => setEnquiryForm(p => ({ ...p, message: e.target.value }))} rows={4} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none resize-none" />
                  <button type="submit" className="w-full bg-electric-blue text-pure-white py-3 rounded-lg hover:bg-blue-glow transition-colors font-medium flex items-center justify-center gap-2">
                    <Send size={18} /> Send Enquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Similar Vehicles */}
        {similarVehicles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-pure-white mb-6">Similar Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarVehicles.map(v => (
                <Link key={v.id} to={`/vehicle/${v.id}`} className="group bg-midnight/30 rounded-xl overflow-hidden border border-white/5 hover:border-electric-blue/50 transition-all">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={v.images?.[0] || '/vehicle-thumb-01.jpg'} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-pure-white font-bold group-hover:text-electric-blue transition-colors">{v.make} {v.model}</h3>
                    <p className="text-chrome text-sm">{v.year} · {v.mileage?.toLocaleString()} mi · {v.fuelType}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-electric-blue font-bold">£{v.price?.toLocaleString()}</span>
                      {v.monthlyPayment && <span className="text-chrome text-sm">£{v.monthlyPayment}/mo</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Step 4: Commit the change
Click "Commit changes" at the bottom of the page.
