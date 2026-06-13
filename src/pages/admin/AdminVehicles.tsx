// @ts-nocheck
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Pencil, Trash2, X, Upload, Car, Check, Image as ImageIcon
} from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles'

const BODY_TYPES = ['Hatchback', 'Saloon', 'Estate', 'SUV', 'Coupe', 'Convertible', 'MPV', 'Pickup', '4x4']
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']
const TRANSMISSIONS = ['Manual', 'Automatic', 'Semi-Automatic']
const STATUSES = ['available', 'reserved', 'sold', 'coming_soon', 'in_preparation']
const FEATURES_LIST = [
  'Leather Seats', 'Heated Seats', 'Electric Seats', 'Panoramic Roof', 'Sunroof',
  'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Sat Nav', 'DAB Radio',
  'Premium Sound System', 'Reversing Camera', '360 Camera', 'Parking Sensors',
  'Cruise Control', 'Adaptive Cruise Control', 'Lane Assist', 'Blind Spot Assist',
  'Keyless Entry', 'Push Button Start', 'Climate Control', 'Dual Zone Climate',
  'Ambient Lighting', 'LED Headlights', 'Xenon Headlights', 'Daytime Running Lights',
  'Fog Lights', 'Electric Mirrors', 'Auto Dimming Mirrors', 'Rain Sensing Wipers',
  'Auto Lights', 'Start/Stop System', 'Alloy Wheels', '19" Alloys', '20" Alloys',
  'Tow Bar', 'Roof Rails', 'Privacy Glass', 'Electric Tailgate', 'Power Folding Mirrors'
]

const emptyVehicle = {
  make: '', model: '', variant: '', year: new Date().getFullYear(),
  price: 0, monthly_payment: 0, mileage: 0,
  fuel_type: 'Petrol', transmission: 'Automatic', engine_size: '',
  body_type: 'Saloon', colour: '', doors: 5, seats: 5,
  registration: '', status: 'available', featured: false,
  description: '', features: [], images: [], location: '', discount_amount: 0,
}

export default function AdminVehicles() {
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle, uploadImage } = useSupabaseVehicles()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyVehicle })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = vehicles.filter(v =>
    !search || `${v.make} ${v.model} ${v.registration}`.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors = {
    available: 'bg-emerald-500/20 text-emerald-400',
    reserved: 'bg-amber-500/20 text-amber-400',
    sold: 'bg-red-500/20 text-red-400',
    coming_soon: 'bg-sky-500/20 text-sky-400',
    in_preparation: 'bg-slate-500/20 text-slate-400',
  }

  function openAdd() { setForm({ ...emptyVehicle }); setEditingId(null); setShowForm(true) }
  function openEdit(v) { setForm({ ...v }); setEditingId(v.id); setShowForm(true) }

  async function handleSave() {
    setSaving(true)
    if (editingId) { await updateVehicle(editingId, form) }
    else { await addVehicle(form) }
    setSaving(false); setShowForm(false)
  }

  async function handleDelete(id) {
    if (confirm('Are you sure?')) await deleteVehicle(id)
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const url = await uploadImage(file, `${Date.now()}-${file.name}`)
    if (url) setForm(p => ({ ...p, images: [...p.images, url] }))
    setUploading(false)
  }

  function toggleFeature(feat) {
    setForm(p => ({ ...p, features: p.features.includes(feat) ? p.features.filter(f => f !== feat) : [...p.features, feat] }))
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Car size={24} className="text-blue-500" />
              Vehicle Management
            </h1>
            <p className="text-slate-400 mt-1">{vehicles.length} vehicles in inventory</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm w-[200px]" />
            </div>
            <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <Plus size={16} /> Add Vehicle
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Car size={48} className="mx-auto mb-4" />
            <p>No vehicles found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="text-left py-3 px-4">Vehicle</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Details</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-b border-slate-800/50 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden">
                        {v.images?.[0] ? <img src={v.images[0]} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-slate-600 m-3" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{v.make} {v.model}</p>
                        <p className="text-slate-500 text-xs">{v.registration} · {v.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-white font-semibold">£{v.price?.toLocaleString()}</p>
                    <p className="text-slate-500 text-xs">£{v.monthly_payment}/mo</p>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs hidden md:table-cell">
                    {v.mileage?.toLocaleString()} mi · {v.fuel_type} · {v.transmission}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColors[v.status] || ''}`}>
                      {v.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => openEdit(v)} className="p-2 hover:bg-white/10 rounded-lg mr-1">
                      <Pencil size={14} className="text-slate-400" />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-2 hover:bg-red-500/20 rounded-lg">
                      <Trash2 size={14} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal - SOLID BACKGROUND, NO TRANSPARENCY */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto"
            style={{ backgroundColor: '#000814' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-[800px] rounded-2xl my-8 shadow-2xl"
              style={{ backgroundColor: '#0a1628', border: '1px solid #1a2744' }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">{editingId ? 'Edit' : 'Add'} Vehicle</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase">Basic Info</h3></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Make *</label>
                    <input value={form.make} onChange={e => setForm(p => ({ ...p, make: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Model *</label>
                    <input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Variant</label>
                    <input value={form.variant} onChange={e => setForm(p => ({ ...p, variant: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Year *</label>
                    <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Registration</label>
                    <input value={form.registration} onChange={e => setForm(p => ({ ...p, registration: e.target.value.toUpperCase() }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 uppercase" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Colour</label>
                    <input value={form.colour} onChange={e => setForm(p => ({ ...p, colour: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>

                  <div className="md:col-span-2 mt-2"><h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase">Specs</h3></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Body Type</label>
                    <select value={form.body_type} onChange={e => setForm(p => ({ ...p, body_type: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm">{BODY_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Fuel</label>
                    <select value={form.fuel_type} onChange={e => setForm(p => ({ ...p, fuel_type: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm">{FUEL_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Transmission</label>
                    <select value={form.transmission} onChange={e => setForm(p => ({ ...p, transmission: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm">{TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Engine</label>
                    <input value={form.engine_size} onChange={e => setForm(p => ({ ...p, engine_size: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Mileage</label>
                    <input type="number" value={form.mileage} onChange={e => setForm(p => ({ ...p, mileage: Number(e.target.value) }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div className="flex gap-3">
                    <div className="flex-1"><label className="block text-xs text-slate-400 mb-1">Doors</label>
                      <input type="number" value={form.doors} onChange={e => setForm(p => ({ ...p, doors: Number(e.target.value) }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                    <div className="flex-1"><label className="block text-xs text-slate-400 mb-1">Seats</label>
                      <input type="number" value={form.seats} onChange={e => setForm(p => ({ ...p, seats: Number(e.target.value) }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  </div>

                  <div className="md:col-span-2 mt-2"><h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase">Pricing</h3></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Price (£) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Monthly (£)</label>
                    <input type="number" value={form.monthly_payment} onChange={e => setForm(p => ({ ...p, monthly_payment: Number(e.target.value) }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Discount (£)</label>
                    <input type="number" value={form.discount_amount} onChange={e => setForm(p => ({ ...p, discount_amount: Number(e.target.value) }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Location</label>
                    <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" /></div>

                  <div className="md:col-span-2 flex gap-4 mt-2">
                    <div className="flex-1"><label className="block text-xs text-slate-400 mb-1">Status</label>
                      <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></div>
                    <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-5 h-5 rounded accent-blue-600" />
                      <span className="text-sm text-white">Featured</span></label></div>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase">Description</h3>
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                      className="w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm resize-none placeholder-slate-500" />
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase">Images</h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-800">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                            <X size={12} className="text-white" /></button>
                        </div>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-600 flex flex-col items-center justify-center">
                        <Upload size={20} className="text-slate-500" /><span className="text-xs text-slate-500 mt-1">{uploading ? '...' : 'Upload'}</span></button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                    <p className="text-xs text-slate-500">Or paste image URL:</p>
                    <input onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const url = e.currentTarget.value.trim()
                        if (url) { setForm(p => ({ ...p, images: [...p.images, url] })); e.currentTarget.value = '' }
                      }
                    }} className="mt-1 w-full bg-[#0d1d35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500" placeholder="Paste URL and press Enter" />
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {FEATURES_LIST.map(feat => (
                        <button key={feat} onClick={() => toggleFeature(feat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.features.includes(feat) ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-[#0d1d35] text-slate-400 border-[#1e3a5f]'}`}>
                          {form.features.includes(feat) && <Check size={10} className="inline mr-1" />}{feat}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.make || !form.model || !form.price}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update' : 'Add'} Vehicle</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
