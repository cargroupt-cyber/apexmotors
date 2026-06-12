# Fix for Finance.tsx

## Step 1: Go to GitHub
Open: https://github.com/cargroup-cyber/apexmotors/edit/main/src/pages/Finance.tsx

## Step 2: Select all and delete

## Step 3: Paste this:

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Check, Send, Info } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';

export default function Finance() {
  const { addLead } = useLeads();
  const [price, setPrice] = useState(45000);
  const [deposit, setDeposit] = useState(4500);
  const [term, setTerm] = useState(48);
  const [type, setType] = useState<'pcp' | 'hp'>('pcp');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', employment: 'Employed', income: '' });
  const [submitted, setSubmitted] = useState(false);

  const rate = 0.079;
  const monthlyRate = rate / 12;
  const amountFinanced = price - deposit;
  const numPayments = term;
  const monthlyPayment = Math.round(amountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1));
  const totalPayable = monthlyPayment * term + deposit;
  const totalInterest = totalPayable - price;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      type: 'finance',
      firstName: form.firstName,
      lastName: form.lastName,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      employmentStatus: form.employment,
      annualIncome: Number(form.income),
      amount: price,
      term,
      source: 'Finance Application',
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-obsidian pt-20">
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 via-transparent to-blue-glow/5" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-pure-white mb-4">Car Finance</h1>
            <p className="text-lg text-frost">Explore our flexible finance options. We work with leading lenders to find the best deal for you.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Calculator */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-3 space-y-6">
            {/* Finance Type Toggle */}
            <div className="bg-midnight/30 rounded-xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-pure-white mb-4 flex items-center gap-3"><Calculator size={24} className="text-electric-blue" /> Finance Calculator</h2>
              <div className="flex gap-3 mb-6">
                {[{ key: 'pcp' as const, label: 'PCP', desc: 'Lower monthly payments' }, { key: 'hp' as const, label: 'Hire Purchase', desc: 'Own the car at the end' }].map(t => (
                  <button key={t.key} onClick={() => setType(t.key)} className={`flex-1 py-4 px-5 rounded-xl border text-left transition-colors ${type === t.key ? 'border-electric-blue bg-electric-blue/10' : 'border-white/10 hover:border-white/20'}`}>
                    <div className={`font-bold ${type === t.key ? 'text-electric-blue' : 'text-pure-white'}`}>{t.label}</div>
                    <div className="text-chrome text-sm">{t.desc}</div>
                  </button>
                ))}
              </div>

              {/* Vehicle Price */}
              <div className="mb-6">
                <div className="flex justify-between mb-2"><label className="text-sm text-chrome">Vehicle Price</label><span className="text-pure-white font-bold">£{price.toLocaleString()}</span></div>
                <input type="range" min="5000" max="150000" step="500" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full accent-electric-blue mb-2" />
                <div className="flex justify-between text-xs text-chrome"><span>£5,000</span><span>£150,000</span></div>
              </div>

              {/* Deposit */}
              <div className="mb-6">
                <div className="flex justify-between mb-2"><label className="text-sm text-chrome">Deposit</label><span className="text-pure-white font-bold">£{deposit.toLocaleString()}</span></div>
                <input type="range" min="0" max={price} step="100" value={deposit} onChange={e => setDeposit(Number(e.target.value))} className="w-full accent-electric-blue mb-2" />
                <div className="flex justify-between text-xs text-chrome"><span>£0</span><span>£{price.toLocaleString()}</span></div>
              </div>

              {/* Term */}
              <div className="mb-6">
                <label className="text-sm text-chrome mb-3 block">Term</label>
                <div className="flex gap-3 flex-wrap">
                  {[24, 36, 48, 60].map(t => (
                    <button key={t} onClick={() => setTerm(t)} className={`px-6 py-3 rounded-lg transition-colors ${term === t ? 'bg-electric-blue text-pure-white' : 'bg-obsidian text-frost hover:bg-midnight border border-white/10'}`}>{t} months</button>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="bg-obsidian rounded-xl p-6 border border-electric-blue/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-chrome mb-1">Monthly Payment</div>
                    <div className="text-3xl font-bold text-electric-blue">£{monthlyPayment.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-chrome mb-1">Total Interest</div>
                    <div className="text-xl font-bold text-pure-white">£{totalInterest.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-chrome mb-1">Total Payable</div>
                    <div className="text-xl font-bold text-pure-white">£{totalPayable.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-chrome"><Info size={14} /> Representative 7.9% APR. Subject to status.</div>
              </div>
            </div>

            {/* Finance Options Explained */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-midnight/30 rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-pure-white mb-3">PCP (Personal Contract Purchase)</h3>
                <ul className="space-y-2 text-frost text-sm">
                  {['Lower monthly payments', 'Flexible end-of-term options', 'Optional final payment to own', 'Good for changing cars regularly'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><Check size={16} className="text-success flex-shrink-0 mt-0.5" />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-midnight/30 rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-pure-white mb-3">Hire Purchase</h3>
                <ul className="space-y-2 text-frost text-sm">
                  {['Own the car at the end', 'No mileage restrictions', 'Fixed monthly payments', 'Good for keeping long-term'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><Check size={16} className="text-success flex-shrink-0 mt-0.5" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Application Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-2">
            <div className="bg-midnight/30 rounded-xl p-6 border border-white/5 sticky top-24">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-pure-white mb-2">Application Received</h3>
                  <p className="text-chrome text-sm">Our finance team will review your application and contact you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-pure-white mb-4">Apply for Finance</h3>
                  <form onSubmit={handleApply} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-chrome mb-1">First Name *</label>
                        <input type="text" required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2.5 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none text-sm" placeholder="John" />
                      </div>
                      <div>
                        <label className="block text-xs text-chrome mb-1">Last Name *</label>
                        <input type="text" required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2.5 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none text-sm" placeholder="Smith" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-chrome mb-1">Email *</label>
                      <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2.5 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none text-sm" placeholder="john@email.com" />
                    </div>
                    <div>
                      <label className="block text-xs text-chrome mb-1">Phone *</label>
                      <input type="tel" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2.5 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none text-sm" placeholder="07700 123 456" />
                    </div>
                    <div>
                      <label className="block text-xs text-chrome mb-1">Employment Status</label>
                      <select value={form.employment} onChange={e => setForm(p => ({ ...p, employment: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2.5 text-pure-white focus:border-electric-blue focus:outline-none text-sm">
                        {['Employed', 'Self-Employed', 'Retired', 'Student', 'Unemployed'].map(s => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-chrome mb-1">Annual Income (£)</label>
                      <input type="number" required value={form.income} onChange={e => setForm(p => ({ ...p, income: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2.5 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none text-sm" placeholder="35000" />
                    </div>
                    <button type="submit" className="w-full bg-electric-blue text-pure-white py-3 rounded-lg hover:bg-blue-glow transition-colors font-medium flex items-center justify-center gap-2">
                      <Send size={16} /> Apply Now
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

## Step 4: Click "Commit changes"
