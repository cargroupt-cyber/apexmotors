# Fix for SellYourCar.tsx

## Step 1: Go to GitHub
Open: https://github.com/cargroup-cyber/apexmotors/edit/main/src/pages/SellYourCar.tsx

## Step 2: Select all and delete

## Step 3: Paste this:

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Car, User, Send } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';

export default function SellYourCar() {
  const { addLead } = useLeads();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    registration: '', mileage: '', condition: 'good', make: '', model: '', year: '',
    firstName: '', lastName: '', email: '', phone: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = () => {
    addLead({
      type: 'sell_car',
      firstName: form.firstName,
      lastName: form.lastName,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      registration: form.registration,
      mileage: Number(form.mileage),
      condition: form.condition,
      vehicle: `${form.make} ${form.model} ${form.year}`,
      source: 'Sell Your Car',
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-obsidian pt-20">
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 via-transparent to-blue-glow/5" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-pure-white mb-4">Sell Your Car</h1>
            <p className="text-lg text-frost">Get a free, no-obligation valuation for your vehicle. We offer competitive prices and a hassle-free process.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 lg:px-8 pb-20">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Vehicle Details', 'Your Details', 'Valuation'].map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step > i + 1 ? 'bg-success text-pure-white' : step === i + 1 ? 'bg-electric-blue text-pure-white' : 'bg-midnight text-chrome border border-white/10'}`}>
                {step > i + 1 ? <Check size={18} /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? 'text-pure-white' : 'text-chrome'}`}>{s}</span>
              {i < 2 && <div className={`w-12 h-0.5 ${step > i + 1 ? 'bg-success' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-midnight/30 rounded-xl p-8 border border-white/5 text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-success" />
              </div>
              <h3 className="text-2xl font-bold text-pure-white mb-2">Valuation Request Sent!</h3>
              <p className="text-chrome mb-6">We have received your details. One of our specialists will contact you within 24 hours with a competitive offer.</p>
              <p className="text-sm text-chrome">Reference: {Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
            </motion.div>
          ) : (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-midnight/30 rounded-xl p-6 lg:p-8 border border-white/5">
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold text-pure-white mb-6 flex items-center gap-3"><Car size={24} className="text-electric-blue" /> Vehicle Details</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm text-chrome mb-2">Registration Number *</label>
                      <input type="text" required value={form.registration} onChange={e => update('registration', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none uppercase" placeholder="AB12 CDE" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-chrome mb-2">Make *</label>
                        <input type="text" required value={form.make} onChange={e => update('make', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="e.g. BMW" />
                      </div>
                      <div>
                        <label className="block text-sm text-chrome mb-2">Model *</label>
                        <input type="text" required value={form.model} onChange={e => update('model', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="e.g. 3 Series" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-chrome mb-2">Year *</label>
                        <input type="number" required value={form.year} onChange={e => update('year', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="2020" />
                      </div>
                      <div>
                        <label className="block text-sm text-chrome mb-2">Mileage *</label>
                        <input type="number" required value={form.mileage} onChange={e => update('mileage', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="45000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-chrome mb-2">Condition</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['excellent', 'good', 'fair', 'poor'].map(c => (
                          <button key={c} onClick={() => update('condition', c)} className={`py-3 px-4 rounded-lg border text-sm capitalize transition-colors ${form.condition === c ? 'border-electric-blue bg-electric-blue/10 text-electric-blue' : 'border-white/10 text-chrome hover:border-white/20'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} disabled={!form.registration || !form.make || !form.model || !form.year || !form.mileage} className="w-full bg-electric-blue text-pure-white py-3 rounded-lg hover:bg-blue-glow transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      Continue <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold text-pure-white mb-6 flex items-center gap-3"><User size={24} className="text-electric-blue" /> Your Details</h2>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-chrome mb-2">First Name *</label>
                        <input type="text" required value={form.firstName} onChange={e => update('firstName', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="John" />
                      </div>
                      <div>
                        <label className="block text-sm text-chrome mb-2">Last Name *</label>
                        <input type="text" required value={form.lastName} onChange={e => update('lastName', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="Smith" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-chrome mb-2">Email *</label>
                        <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="john@email.com" />
                      </div>
                      <div>
                        <label className="block text-sm text-chrome mb-2">Phone *</label>
                        <input type="tel" required value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="07700 123 456" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg border border-white/10 text-chrome hover:border-white/20 transition-colors">Back</button>
                      <button onClick={() => setStep(3)} disabled={!form.firstName || !form.lastName || !form.email || !form.phone} className="flex-1 bg-electric-blue text-pure-white py-3 rounded-lg hover:bg-blue-glow transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        Get Valuation <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold text-pure-white mb-6">Review & Submit</h2>
                  <div className="bg-obsidian rounded-lg p-5 space-y-3 mb-6">
                    <div className="flex justify-between"><span className="text-chrome">Vehicle</span><span className="text-pure-white">{form.year} {form.make} {form.model}</span></div>
                    <div className="flex justify-between"><span className="text-chrome">Registration</span><span className="text-pure-white font-mono">{form.registration.toUpperCase()}</span></div>
                    <div className="flex justify-between"><span className="text-chrome">Mileage</span><span className="text-pure-white">{Number(form.mileage).toLocaleString()} miles</span></div>
                    <div className="flex justify-between"><span className="text-chrome">Condition</span><span className="text-pure-white capitalize">{form.condition}</span></div>
                    <div className="border-t border-white/5 pt-3 flex justify-between"><span className="text-chrome">Contact</span><span className="text-pure-white">{form.firstName} {form.lastName}</span></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-lg border border-white/10 text-chrome hover:border-white/20 transition-colors">Back</button>
                    <button onClick={handleSubmit} className="flex-1 bg-electric-blue text-pure-white py-3 rounded-lg hover:bg-blue-glow transition-colors font-medium flex items-center justify-center gap-2">
                      <Send size={18} /> Submit Request
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[{ title: 'Best Price', desc: 'Guaranteed' }, { title: 'Free', desc: 'Collection' }, { title: 'Same Day', desc: 'Payment' }, { title: 'No Hidden', desc: 'Fees' }].map((t, i) => (
            <div key={i} className="text-center p-4 bg-midnight/20 rounded-lg border border-white/5">
              <div className="text-pure-white font-bold">{t.title}</div>
              <div className="text-chrome text-sm">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Step 4: Click "Commit changes"
