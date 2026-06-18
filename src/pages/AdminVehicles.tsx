// @ts-nocheck
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Eye, Edit2, Trash2, X, Car, Fuel, Gauge,
  ChevronDown, CheckCircle, AlertCircle, Star, Tag
} from 'lucide-react'
import { useSupabaseVehicles, type Vehicle } from '@/hooks/useSupabaseVehicles'
import { supabase } from '@/lib/supabase'

/* ───────────────────── STATUS BADGES ───────────────────── */

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  reserved: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  sold: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  coming_soon: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  in_preparation: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
}

const BADGE_STYLES: Record<string, string> = {
  'Best Price': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Great Price': 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  'Good Price': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'Fair Price': 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  Featured: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  '': '',
}

/* ───────────────────── MODAL COMPONENT ───────────────────── */

function VehicleModal({
  vehicle,
  onClose,
  onSaved,
}: {
  vehicle?: Vehicle | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Partial<Vehicle>>({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    variant: vehicle?.variant || '',
    year: vehicle?.year || new Date().getFullYear(),
    price: vehicle?.price || 0,
    mileage: vehicle?.mileage || 0,
    fuel_type: vehicle?.fuel_type || 'Petrol',
    transmission: vehicle?.transmission || 'Automatic',
    body_type: vehicle?.body_type || 'Sedan',
    colour: vehicle?.colour || '',
    doors: vehicle?.doors || 5,
    seats: vehicle?.seats || 5,
    engine_size: vehicle?.engine_size || '',
    registration: vehicle?.registration || '',
    description: vehicle?.description || '',
    status: vehicle?.status || 'available',
    badge: vehicle?.badge || '',
    location: vehicle?.location || 'London',
    images: vehicle?.images || [],
    features: vehicle?.features || [],
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      images: form.images || [],
      features: form.features || [],
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      doors: Number(form.doors),
      seats: Number(form.seats),
    }

    if (vehicle?.id) {
      const { error } = await supabase.from('vehicles').update(payload).eq('id', vehicle.id)
      if (error) console.error('Update error:', error)
    } else {
      const { error } = await supabase.from('vehicles').insert([payload])
      if (error) console.error('Insert error:', error)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,8,20,0.85)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6"
        style={{ backgroundColor: '#001233', borderColor: 'rgba(0,119,182,0.2)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Make</label>
              <input value={form.make || ''} onChange={e => update('make', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
                placeholder="e.g. Mercedes-Benz" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Model</label>
              <input value={form.model || ''} onChange={e => update('model', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
                placeholder="e.g. C-Class" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Variant</label>
              <input value={form.variant || ''} onChange={e => update('variant', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
                placeholder="e.g. AMG Line" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Year</label>
              <input type="number" value={form.year || ''} onChange={e => update('year', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
                required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Price (£)</label>
              <input type="number" value={form.price || ''} onChange={e => update('price', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
                required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mileage</label>
              <input type="number" value={form.mileage || ''} onChange={e => update('mileage', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
                required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Fuel Type</label>
              <select value={form.fuel_type || ''} onChange={e => update('fuel_type', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Transmission</label>
              <select value={form.transmission || ''} onChange={e => update('transmission', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Body Type</label>
              <select value={form.body_type || ''} onChange={e => update('body_type', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Estate">Estate</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="MPV">MPV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Colour</label>
              <input value={form.colour || ''} onChange={e => update('colour', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
                placeholder="e.g. Obsidian Black" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Registration</label>
              <input value={form.registration || ''} onChange={e => update('registration', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
                placeholder="e.g. AB71 CDE" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select value={form.status || ''} onChange={e => update('status', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-white text-sm"
                style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="in_preparation">In Preparation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea value={form.description || ''} onChange={e => update('description', e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-white text-sm"
              style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
              placeholder="Vehicle description..." />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Image URLs (comma separated)</label>
            <input value={(form.images || []).join(', ')} onChange={e => update('images', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full rounded-lg border px-3 py-2 text-white text-sm"
              style={{ backgroundColor: '#000814', borderColor: 'rgba(0,119,182,0.3)' }}
              placeholder="https://..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#0077B6' }}>
              {saving ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
            <button type="button" onClick={onClose}
              className="rounded-lg border px-6 py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/* ───────────────────── MAIN PAGE ───────────────────── */

export default function AdminVehicles() {
  const { vehicles, loading, error, refresh } = useSupabaseVehicles()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [showModal, setShowModal] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)

  /* ── filters ── */
  const filtered = useMemo(() => {
    let result = [...vehicles]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(v =>
        `${v.make} ${v.model} ${v.variant}`.toLowerCase().includes(q) ||
        v.registration?.toLowerCase().includes(q) ||
        v.colour?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(v => v.status === statusFilter)
    }

    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)
    if (sortBy === 'newest') result.sort((a, b) => (b.year || 0) - (a.year || 0))

    return result
  }, [vehicles, search, statusFilter, sortBy])

  /* ── delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) console.error('Delete error:', error)
    refresh()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000814' }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b px-6 py-4" style={{ backgroundColor: 'rgba(0,8,20,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Vehicle Management</h1>
            <p className="text-sm mt-0.5" style={{ color: '#8B9EB3' }}>
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in inventory
            </p>
          </div>
          <button onClick={() => { setEditVehicle(null); setShowModal(true) }}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#0077B6' }}>
            <Plus size={18} /> Add Vehicle
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8B9EB3' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles..."
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm text-white"
              style={{ backgroundColor: '#001233', borderColor: 'rgba(255,255,255,0.1)' }} />
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm text-white"
            style={{ backgroundColor: '#001233', borderColor: 'rgba(255,255,255,0.1)' }}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="in_preparation">In Preparation</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="rounded-lg border px-3 py-2 text-sm text-white"
            style={{ backgroundColor: '#001233', borderColor: 'rgba(255,255,255,0.1)' }}>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: '#0077B6' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle size={40} style={{ color: '#FF4D6D' }} />
            <p className="text-white">{error}</p>
            <button onClick={refresh} className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: '#0077B6', color: 'white' }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Car size={48} style={{ color: '#8B9EB3' }} />
            <p className="text-lg font-medium text-white">No vehicles found</p>
            <p className="text-sm" style={{ color: '#8B9EB3' }}>
              {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first vehicle to get started'}
            </p>
            {!search && statusFilter === 'all' && (
              <button onClick={() => { setEditVehicle(null); setShowModal(true) }}
                className="mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white"
                style={{ backgroundColor: '#0077B6' }}>
                <Plus size={16} /> Add Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle}
                  onEdit={() => { setEditVehicle(vehicle); setShowModal(true) }}
                  onDelete={() => handleDelete(vehicle.id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <VehicleModal
            vehicle={editVehicle}
            onClose={() => setShowModal(false)}
            onSaved={refresh}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────────────────── VEHICLE CARD ───────────────────── */

function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle
  onEdit: () => void
  onDelete: () => void
}) {
  const primaryImage = vehicle.images?.[0] || '/vehicle-thumb-01.jpg'
  const statusStyle = STATUS_STYLES[vehicle.status || 'available'] || STATUS_STYLES.available
  const badgeStyle = BADGE_STYLES[vehicle.badge || ''] || ''

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group rounded-xl border overflow-hidden transition-all duration-300 hover:border-[#0077B6]/40"
      style={{ backgroundColor: '#001233', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img src={primaryImage} alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001233] via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle}`}>
            {(vehicle.status || 'available').replace('_', ' ')}
          </span>
          {vehicle.badge && badgeStyle && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badgeStyle}`}>
              {vehicle.badge}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="text-lg font-bold text-white">&pound;{vehicle.price?.toLocaleString()}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{vehicle.make} {vehicle.model}</h3>
        <p className="text-sm truncate" style={{ color: '#8B9EB3' }}>{vehicle.variant || ''} &middot; {vehicle.year}</p>

        <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: '#8B9EB3' }}>
          <span className="flex items-center gap-1">
            <Gauge size={13} /> {vehicle.mileage?.toLocaleString()} mi
          </span>
          <span className="flex items-center gap-1">
            <Fuel size={13} /> {vehicle.fuel_type}
          </span>
          <span className="flex items-center gap-1">
            <Car size={13} /> {vehicle.transmission}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link to={`/vehicle/${vehicle.id}`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#0077B6' }}>
            <Eye size={13} /> View
          </Link>
          <button onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#8B9EB3' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8B9EB3')}>
            <Edit2 size={13} /> Edit
          </button>
          <button onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors"
            style={{ borderColor: 'rgba(255,77,109,0.25)', color: '#FF4D6D' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,77,109,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </motion.div>
  )
}
