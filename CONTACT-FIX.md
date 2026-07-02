# Fix for Contact.tsx

## Step 1: Go to GitHub
Open: https://github.com/cargroup-cyber/apexmotors/edit/main/src/pages/Contact.tsx

## Step 2: Select all and delete

## Step 3: Paste this:

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageSquare, MapPin, Clock, Check, Send } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';

export default function Contact() {
  const { addLead } = useLeads();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      type: 'contact',
      firstName: form.firstName,
      lastName: form.lastName,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
      source: 'Contact Form',
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-obsidian pt-20">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 via-transparent to-blue-glow/5" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-pure-white mb-4">Get in Touch</h1>
            <p className="text-lg text-frost">We would love to hear from you. Whether you have a question about a vehicle, finance, or anything else, our team is ready to help.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-4">
            {[{ icon: <Phone size={24} />, title: 'Phone', lines: ['0800 123 4567', 'Mon-Sat 9am-6pm'], action: 'tel:08001234567', actionText: 'Call Now' }, { icon: <Mail size={24} />, title: 'Email', lines: ['info@apexautomotive.co.uk', 'We reply within 24 hours'], action: 'mailto:info@apexautomotive.co.uk', actionText: 'Send Email' }, { icon: <MessageSquare size={24} />, title: 'Live Chat', lines: ['Available during opening hours', 'Instant responses'], action: null, actionText: 'Start Chat' }, { icon: <MapPin size={24} />, title: 'Visit Us', lines: ['123 Motor Way, London', 'EC1A 1BB'], action: null, actionText: 'Get Directions' }].map((c, i) => (
              <div key={i} className="bg-midnight/30 rounded-xl p-5 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-blue flex-shrink-0">{c.icon}</div>
                  <div>
                    <h3 className="text-pure-white font-bold mb-1">{c.title}</h3>
                    {c.lines.map((l, j) => <p key={j} className="text-chrome text-sm">{l}</p>)}
                    {c.action && <a href={c.action} className="text-electric-blue text-sm hover:underline mt-2 inline-block">{c.actionText}</a>}
                  </div>
                </div>
              </div>
            ))}

            {/* Opening Hours */}
            <div className="bg-midnight/30 rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={20} className="text-electric-blue" />
                <h3 className="text-pure-white font-bold">Opening Hours</h3>
              </div>
              {[{ day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' }, { day: 'Saturday', hours: '9:00 AM - 5:00 PM' }, { day: 'Sunday', hours: 'Closed' }].map((h, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-chrome text-sm">{h.day}</span>
                  <span className="text-pure-white text-sm">{h.hours}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-2">
            <div className="bg-midnight/30 rounded-xl p-6 lg:p-8 border border-white/5">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-pure-white mb-2">Thank You!</h3>
                  <p className="text-chrome">Your message has been sent. We will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-chrome mb-2">First Name *</label>
                      <input type="text" required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm text-chrome mb-2">Last Name *</label>
                      <input type="text" required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="Smith" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-chrome mb-2">Email *</label>
                      <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="john@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm text-chrome mb-2">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none" placeholder="07700 123 456" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-chrome mb-2">Subject</label>
                    <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white focus:border-electric-blue focus:outline-none">
                      {['General Enquiry', 'Vehicle Inquiry', 'Finance Question', 'Part Exchange', 'Test Drive', 'Complaint'].map(s => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-chrome mb-2">Message *</label>
                    <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={5} className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-pure-white placeholder-chrome focus:border-electric-blue focus:outline-none resize-none" placeholder="How can we help you?" />
                  </div>
                  <button type="submit" className="w-full md:w-auto bg-electric-blue text-pure-white px-8 py-3 rounded-lg hover:bg-blue-glow transition-colors font-medium flex items-center justify-center gap-2">
                    <Send size={18} /> Send Message
                  </button>
                </form>
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
