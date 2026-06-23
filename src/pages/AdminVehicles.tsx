// @ts-nocheck
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  Check,
  Upload,
  GripVertical,
  AlertTriangle,
  Save,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Car,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles'
import { FEATURES_LIST } from '@/lib/constants'

/* ─── Types ─── */
type VehicleStatus = 'Available' | 'Reserved' | 'Sold' | 'Coming Soon' | 'In Preparation'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  variant: string
  bodyType: string
  fuelType: string
  transmission: string
  engineSize: string
  doors: number
  seats: number
  colour: string
  registration: string
  cashPrice: number
  financePrice: number
  monthlyPayment: number
  deposit: number
  apr: number
  mileage: number
  condition: string
  features: string[]
  description: string
  status: VehicleStatus
  images: string[]
  metaTitle: string
  metaDescription: string
  dateAdded: string
}

/* ─── Constants ─── */
const bodyTypes = ['Saloon', 'Sedan', 'Coupe', 'Estate', 'SUV', 'Hatchback', 'Convertible', 'Pickup']
const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid']
const transmissionTypes = ['Manual', 'Automatic', 'Semi-Auto', 'PDK', 'CVT']
const conditions = ['New', 'Nearly New', 'Approved Used', 'Used']

const emptyVehicle: Vehicle = {
  id: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  variant: '',
  bodyType: '',
  fuelType: '',
  transmission: '',
  engineSize: '',
  doors: 5,
  seats: 5,
  colour: '',
  registration: '',
  cashPrice: 0,
  financePrice: 0,
  monthlyPayment: 0,
  deposit: 0,
  apr: 0,
  mileage: 0,
  condition: 'Used',
  features: [],
  description: '',
  status: 'Available',
  images: [],
  metaTitle: '',
  metaDescription: '',
  dateAdded: new Date().toISOString().split('T')[0],
}

const statusColors: Record<VehicleStatus, string> = {
  Available: 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/30',
  Reserved: 'bg-[#FFB703]/15 text-[#FFB703] border-[#FFB703]/30',
  Sold: 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/30',
  'Coming Soon': 'bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30',
  'In Preparation': 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/30',
}

/* ─── Status Mapping ─── */
const statusToSupabase: Record<VehicleStatus, string> = {
  Available: 'available',
  Reserved: 'reserved',
  Sold: 'sold',
  'Coming Soon': 'coming_soon',
  'In Preparation': 'in_preparation',
}

const statusFromSupabase: Record<string, VehicleStatus> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  coming_soon: 'Coming Soon',
  in_preparation: 'In Preparation',
}

/* ─── Conversion: Internal -> Supabase ─── */
function toSupabase(v: Vehicle): any {
  return {
    id: v.id || undefined,
    make: v.make,
    model: v.model,
    variant: v.variant || undefined,
    year: v.year,
    price: v.cashPrice,
    mileage: v.mileage,
    fuel_type: v.fuelType,
    transmission: v.transmission,
    body_type: v.bodyType || undefined,
    engine_size: v.engineSize || undefined,
    colour: v.colour || undefined,
    doors: v.doors || undefined,
    seats: v.seats || undefined,
    registration: v.registration || undefined,
    description: v.description || undefined,
    status: statusToSupabase[v.status] || 'available',
    images: v.images,
    features: v.features,
    monthly_payment: v.monthlyPayment || undefined,
  }
}

/* ─── Conversion: Supabase -> Internal ─── */
function fromSupabase(v: any): Vehicle {
  const parseArr = (val: any): string[] => {
    if (!val) return []
    if (Array.isArray(val)) return val.filter((x) => typeof x === 'string')
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return trimmed
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    }
    return []
  }

  return {
    id: v.id ?? '',
    make: v.make ?? '',
    model: v.model ?? '',
    year: v.year ?? new Date().getFullYear(),
    variant: v.variant ?? '',
    bodyType: v.body_type ?? '',
    fuelType: v.fuel_type ?? '',
    transmission: v.transmission ?? '',
    engineSize: v.engine_size ?? '',
    doors: v.doors ?? 5,
    seats: v.seats ?? 5,
    colour: v.colour ?? '',
    registration: v.registration ?? '',
    cashPrice: v.price ?? 0,
    financePrice: 0,
    monthlyPayment: v.monthly_payment ?? 0,
    deposit: 0,
    apr: 0,
    mileage: v.mileage ?? 0,
    condition: 'Used',
    features: parseArr(v.features),
    description: v.description ?? '',
    status: statusFromSupabase[v.status] || 'Available',
    images: parseArr(v.images),
    metaTitle: '',
    metaDescription: '',
    dateAdded: v.created_at ?? new Date().toISOString().split('T')[0],
  }
}

/* ─── Sort helpers ─── */
type SortDir = 'asc' | 'desc' | ''

/* ─── Helper: Form Field ─── */
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

/* ─── Helper: Sort Icon ─── */
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') return <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
  if (dir === 'desc') return <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
  return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AdminVehicles() {
  /* ─── Data ─── */
  const { vehicles: rawVehicles, loading, error, refresh } = useSupabaseVehicles()
  const vehicles = useMemo(() => rawVehicles.map(fromSupabase), [rawVehicles])

  /* ─── CRUD ─── */
  async function addVehicle(v: Vehicle) {
    const payload = toSupabase(v)
    delete payload.id
    await supabase.from('vehicles').insert([payload])
    refresh()
  }

  async function updateVehicle(id: string, v: Vehicle) {
    const payload = toSupabase(v)
    await supabase.from('vehicles').update(payload).eq('id', id)
    refresh()
  }

  async function deleteVehicle(id: string) {
    await supabase.from('vehicles').delete().eq('id', id)
    refresh()
  }

  async function bulkDelete(ids: string[]) {
    await supabase.from('vehicles').delete().in('id', ids)
    refresh()
  }

  async function bulkUpdateStatus(ids: string[], status: VehicleStatus) {
    const dbStatus = statusToSupabase[status]
    await supabase.from('vehicles').update({ status: dbStatus }).in('id', ids)
    refresh()
  }

  /* ─── Local state ─── */
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortCol, setSortCol] = useState<string>('')
  const [sortDir, setSortDir] = useState<SortDir>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add')
  const [activeTab, setActiveTab] = useState('details')
  const [form, setForm] = useState<Vehicle>({ ...emptyVehicle })
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [featureSearch, setFeatureSearch] = useState('')

  /* ─── Derived: filtered + sorted + paginated ─── */
  const filtered = useMemo(() => {
    let data = [...vehicles]

    if (statusFilter !== 'All') {
      data = data.filter((v) => v.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.registration.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      )
    }

    if (sortCol && sortDir) {
      data.sort((a, b) => {
        let av: any = (a as any)[sortCol]
        let bv: any = (b as any)[sortCol]
        if (typeof av === 'string') {
          av = av.toLowerCase()
          bv = (bv ?? '').toLowerCase()
        }
        if (av === bv) return 0
        if (sortDir === 'asc') return av > bv ? 1 : -1
        return av < bv ? 1 : -1
      })
    }

    return data
  }, [vehicles, search, statusFilter, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  /* ─── Selection helpers ─── */
  const allSelected = paginated.length > 0 && paginated.every((v) => selectedIds.has(v.id))
  const someSelected = paginated.some((v) => selectedIds.has(v.id)) && !allSelected

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        paginated.forEach((v) => next.delete(v.id))
      } else {
        paginated.forEach((v) => next.add(v.id))
      }
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  /* ─── Sort handler ─── */
  function toggleSort(col: string) {
    setSortDir((prevDir) => {
      const nextDir: SortDir = sortCol === col ? (prevDir === 'asc' ? 'desc' : 'asc') : 'asc'
      setSortCol(col)
      return nextDir
    })
  }

  /* ─── Form helpers ─── */
  function openAdd() {
    setForm({ ...emptyVehicle, id: crypto.randomUUID() })
    setModalMode('add')
    setActiveTab('details')
    setModalOpen(true)
  }

  function openEdit(v: Vehicle) {
    setForm({ ...v })
    setModalMode('edit')
    setActiveTab('details')
    setModalOpen(true)
  }

  function openDuplicate(v: Vehicle) {
    setForm({ ...v, id: crypto.randomUUID(), status: 'Available', dateAdded: new Date().toISOString().split('T')[0] })
    setModalMode('duplicate')
    setActiveTab('details')
    setModalOpen(true)
  }

  function updateForm(partial: Partial<Vehicle>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (modalMode === 'add' || modalMode === 'duplicate') {
        await addVehicle(form)
      } else {
        await updateVehicle(form.id, form)
      }
      setModalOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await deleteVehicle(deleteTarget.id)
    setDeleteTarget(null)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(deleteTarget.id)
      return next
    })
  }

  /* ─── Feature helpers ─── */
  const filteredFeatures = useMemo(() => {
    if (!featureSearch.trim()) return FEATURES_LIST
    return FEATURES_LIST.filter((f) => f.toLowerCase().includes(featureSearch.toLowerCase()))
  }, [featureSearch])

  function toggleFeature(feature: string) {
    setForm((prev) => {
      const has = prev.features.includes(feature)
      return {
        ...prev,
        features: has ? prev.features.filter((f) => f !== feature) : [...prev.features, feature],
      }
    })
  }

  /* ─── Image helpers ─── */
  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  function addImageUrl() {
    const url = window.prompt('Enter image URL:')
    if (url && url.trim()) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, url.trim()],
      }))
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          if (result) {
            setForm((prev) => ({ ...prev, images: [...prev.images, result] }))
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        if (result) {
          setForm((prev) => ({ ...prev, images: [...prev.images, result] }))
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  /* ─── JSX ─── */
  return (
    <div className="admin-vehicles-page p-6 max-w-[1600px] mx-auto space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-7 h-7 text-blue-600" />
            Vehicle Management
          </h1>
          <p className="text-slate-500 mt-1">Manage your vehicle inventory</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search make, model, reg, ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-admin pl-10 w-full"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-admin py-1.5"
          >
            <option value="All">All Statuses</option>
            {Object.keys(statusColors).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== BULK ACTIONS ===== */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">{selectedIds.size} selected</span>
            <button
              onClick={() => {
                const ids = Array.from(selectedIds)
                bulkUpdateStatus(ids, 'Sold')
                clearSelection()
              }}
              className="text-xs px-3 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition"
            >
              Mark as Sold
            </button>
            <button
              onClick={() => {
                const ids = Array.from(selectedIds)
                if (window.confirm(`Delete ${ids.length} vehicles? This cannot be undone.`)) {
                  bulkDelete(ids)
                  clearSelection()
                }
              }}
              className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
          <button onClick={clearSelection} className="text-slate-500 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="bg-[#001233] rounded-xl border border-[#33415C]/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#000814] border-b border-[#33415C]/40">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Vehicle</th>
                <th
                  className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer select-none"
                  onClick={() => toggleSort('year')}
                >
                  <span className="inline-flex items-center gap-1">Year <SortIcon dir={sortCol === 'year' ? sortDir : ''} /></span>
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer select-none"
                  onClick={() => toggleSort('cashPrice')}
                >
                  <span className="inline-flex items-center gap-1">Price <SortIcon dir={sortCol === 'cashPrice' ? sortDir : ''} /></span>
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer select-none"
                  onClick={() => toggleSort('mileage')}
                >
                  <span className="inline-flex items-center gap-1">Mileage <SortIcon dir={sortCol === 'mileage' ? sortDir : ''} /></span>
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer select-none"
                  onClick={() => toggleSort('status')}
                >
                  <span className="inline-flex items-center gap-1">Status <SortIcon dir={sortCol === 'status' ? sortDir : ''} /></span>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                      Loading vehicles...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <Car className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No vehicles found.
                    {search && <span> Try adjusting your search or filters.</span>}
                  </td>
                </tr>
              ) : (
                paginated.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(v.id)}
                        onChange={() => toggleSelect(v.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {v.images[0] ? (
                          <img src={v.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Car className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{v.make} {v.model}</div>
                          <div className="text-xs text-slate-500">{v.registration || 'No reg'} &middot; ID: {v.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{v.year}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">&pound;{v.cashPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700">{v.mileage.toLocaleString()} mi</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColors[v.status] || 'bg-slate-100 text-slate-700'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(v)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDuplicate(v)} className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(v)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION ===== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600">
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} vehicles
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="input-admin py-1 text-xs"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
            <button
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
              className="p-1.5 rounded-md border border-[#33415C]/40 bg-[#001233] text-[#C8D3D9] hover:bg-[#0077B6]/20 disabled:opacity-40 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-md border border-[#33415C]/40 bg-[#001233] text-[#C8D3D9] hover:bg-[#0077B6]/20 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#8B9EB3] px-2">{safePage} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-md border border-[#33415C]/40 bg-[#001233] text-[#C8D3D9] hover:bg-[#0077B6]/20 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-md border border-[#33415C]/40 bg-[#001233] text-[#C8D3D9] hover:bg-[#0077B6]/20 disabled:opacity-40 transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== ADD / EDIT / DUPLICATE MODAL ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div
            className="bg-[#001233] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#33415C]/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#33415C]/40 bg-[#000814]">
              <h2 className="text-lg font-bold text-white">
                {modalMode === 'add' && 'Add Vehicle'}
                {modalMode === 'edit' && 'Edit Vehicle'}
                {modalMode === 'duplicate' && 'Duplicate Vehicle'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-[#5C677D] hover:text-white hover:bg-white/10 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#33415C]/40 bg-[#000814]">
              {['details', 'pricing', 'features', 'media', 'seo'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-[#0077B6] text-[#00B4D8] bg-[#001233]'
                      : 'border-transparent text-[#5C677D] hover:text-[#C8D3D9] hover:bg-[#001233]/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ── Details Tab ── */}
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Make *">
                    <input type="text" value={form.make} onChange={(e) => updateForm({ make: e.target.value })} className="input-admin w-full" placeholder="e.g. BMW" required />
                  </Field>
                  <Field label="Model *">
                    <input type="text" value={form.model} onChange={(e) => updateForm({ model: e.target.value })} className="input-admin w-full" placeholder="e.g. 3 Series" required />
                  </Field>
                  <Field label="Year *">
                    <input type="number" value={form.year} onChange={(e) => updateForm({ year: Number(e.target.value) })} className="input-admin w-full" min="1900" max="2099" required />
                  </Field>
                  <Field label="Variant">
                    <input type="text" value={form.variant} onChange={(e) => updateForm({ variant: e.target.value })} className="input-admin w-full" placeholder="e.g. M Sport" />
                  </Field>
                  <Field label="Body Type">
                    <select value={form.bodyType} onChange={(e) => updateForm({ bodyType: e.target.value })} className="input-admin w-full">
                      <option value="">Select...</option>
                      {bodyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Fuel Type">
                    <select value={form.fuelType} onChange={(e) => updateForm({ fuelType: e.target.value })} className="input-admin w-full">
                      <option value="">Select...</option>
                      {fuelTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Transmission">
                    <select value={form.transmission} onChange={(e) => updateForm({ transmission: e.target.value })} className="input-admin w-full">
                      <option value="">Select...</option>
                      {transmissionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Engine Size">
                    <input type="text" value={form.engineSize} onChange={(e) => updateForm({ engineSize: e.target.value })} className="input-admin w-full" placeholder="e.g. 2.0L" />
                  </Field>
                  <Field label="Colour">
                    <input type="text" value={form.colour} onChange={(e) => updateForm({ colour: e.target.value })} className="input-admin w-full" placeholder="e.g. Alpine White" />
                  </Field>
                  <Field label="Registration">
                    <input type="text" value={form.registration} onChange={(e) => updateForm({ registration: e.target.value.toUpperCase() })} className="input-admin w-full uppercase" placeholder="e.g. AB23 CDE" />
                  </Field>
                  <Field label="Doors">
                    <input type="number" value={form.doors} onChange={(e) => updateForm({ doors: Number(e.target.value) })} className="input-admin w-full" min="1" max="9" />
                  </Field>
                  <Field label="Seats">
                    <input type="number" value={form.seats} onChange={(e) => updateForm({ seats: Number(e.target.value) })} className="input-admin w-full" min="1" max="9" />
                  </Field>
                  <Field label="Mileage">
                    <input type="number" value={form.mileage} onChange={(e) => updateForm({ mileage: Number(e.target.value) })} className="input-admin w-full" min="0" />
                  </Field>
                  <Field label="Condition">
                    <select value={form.condition} onChange={(e) => updateForm({ condition: e.target.value })} className="input-admin w-full">
                      {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select value={form.status} onChange={(e) => updateForm({ status: e.target.value as VehicleStatus })} className="input-admin w-full">
                      {Object.keys(statusColors).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="Description">
                      <textarea
                        value={form.description}
                        onChange={(e) => updateForm({ description: e.target.value })}
                        className="input-admin w-full"
                        rows={4}
                        placeholder="Enter vehicle description..."
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Pricing Tab ── */}
              {activeTab === 'pricing' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Cash Price (&pound;)">
                    <input type="number" value={form.cashPrice} onChange={(e) => updateForm({ cashPrice: Number(e.target.value) })} className="input-admin w-full" min="0" />
                  </Field>
                  <Field label="Finance Price (&pound;)">
                    <input type="number" value={form.financePrice} onChange={(e) => updateForm({ financePrice: Number(e.target.value) })} className="input-admin w-full" min="0" />
                  </Field>
                  <Field label="Monthly Payment (&pound;)">
                    <input type="number" value={form.monthlyPayment} onChange={(e) => updateForm({ monthlyPayment: Number(e.target.value) })} className="input-admin w-full" min="0" />
                  </Field>
                  <Field label="Deposit (&pound;)">
                    <input type="number" value={form.deposit} onChange={(e) => updateForm({ deposit: Number(e.target.value) })} className="input-admin w-full" min="0" />
                  </Field>
                  <Field label="APR (%)">
                    <input type="number" value={form.apr} onChange={(e) => updateForm({ apr: Number(e.target.value) })} className="input-admin w-full" min="0" max="100" step="0.1" />
                  </Field>
                </div>
              )}

              {/* ── Features Tab ── */}
              {activeTab === 'features' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{form.features.length} features selected</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={featureSearch}
                        onChange={(e) => setFeatureSearch(e.target.value)}
                        placeholder="Search features..."
                        className="input-admin pl-9 py-1.5 text-sm w-56"
                      />
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                    {filteredFeatures.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">No features match your search.</div>
                    ) : (
                      filteredFeatures.map((feature) => {
                        const checked = form.features.includes(feature)
                        return (
                          <button
                            key={feature}
                            onClick={() => toggleFeature(feature)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition border-b border-[#33415C]/20 last:border-0 ${
                              checked ? 'bg-[#0077B6]/15 text-[#00B4D8]' : 'hover:bg-white/5 text-[#C8D3D9]'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition ${
                              checked ? 'bg-[#0077B6] border-[#0077B6]' : 'border-[#33415C]/40 bg-[#000814]'
                            }`}>
                              {checked && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-[#33415C] flex-shrink-0" />
                            {feature}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ── Media Tab ── */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  {/* Drag & drop area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
                  >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 mb-1">Drag & drop images here</p>
                    <p className="text-xs text-slate-500 mb-3">or</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Browse Files
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </label>
                    <p className="text-xs text-slate-400 mt-2">Supports JPG, PNG, WEBP</p>
                  </div>

                  {/* Add URL */}
                  <button
                    onClick={addImageUrl}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add image by URL
                  </button>

                  {/* Gallery */}
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {form.images.map((url, i) => (
                        <div key={`${url}-${i}`} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={url} alt={`Vehicle ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow-sm"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 text-[10px] px-1.5 py-0.5 bg-blue-600 text-white rounded font-medium">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── SEO Tab ── */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <Field label="Meta Title">
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={(e) => updateForm({ metaTitle: e.target.value })}
                      className="input-admin w-full"
                      placeholder="e.g. BMW 3 Series M Sport for sale"
                      maxLength={70}
                    />
                    <span className="text-xs text-slate-400">{form.metaTitle.length} / 70 characters</span>
                  </Field>
                  <Field label="Meta Description">
                    <textarea
                      value={form.metaDescription}
                      onChange={(e) => updateForm({ metaDescription: e.target.value })}
                      className="input-admin w-full"
                      rows={3}
                      placeholder="Enter meta description..."
                      maxLength={160}
                    />
                    <span className="text-xs text-slate-400">{form.metaDescription.length} / 160 characters</span>
                  </Field>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {modalMode === 'add' ? 'Add Vehicle' : modalMode === 'edit' ? 'Save Changes' : 'Create Duplicate'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div
            className="bg-[#001233] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#33415C]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF4D6D]/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#FF4D6D]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Vehicle</h3>
                <p className="text-sm text-[#8B9EB3] mt-1">
                  Are you sure you want to delete <strong className="text-white">{deleteTarget.make} {deleteTarget.model}</strong> ({deleteTarget.year})?
                </p>
                {deleteTarget.registration && (
                  <p className="text-xs text-[#5C677D] mt-1">Registration: {deleteTarget.registration}</p>
                )}
                <p className="text-xs text-[#FF4D6D] mt-2">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#33415C]/40 bg-[#000814]">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition"
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== STYLES ===== */}
      <style jsx>{`
        .input-admin {
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .input-admin:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }
        .input-admin::placeholder {
          color: #94a3b8;
        }
        select.input-admin {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #fff;
          background: #2563eb;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-primary:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  )
}
