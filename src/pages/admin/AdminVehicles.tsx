// @ts-nocheck
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useVehicles } from '@/hooks/useVehicles'
import type { Vehicle, VehicleStatus } from '@/lib/store'
import { FEATURES_LIST } from '@/lib/constants'
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

type SortKey = keyof Vehicle | null
type SortDir = 'asc' | 'desc'

const statusColors: Record<VehicleStatus, { bg: string; text: string; border: string }> = {
  Available: { bg: 'bg-[#00C896]/10', text: 'text-[#00C896]', border: 'border-[#00C896]/25' },
  Reserved: { bg: 'bg-[#FFB703]/10', text: 'text-[#FFB703]', border: 'border-[#FFB703]/25' },
  Sold: { bg: 'bg-[#FF4D6D]/10', text: 'text-[#FF4D6D]', border: 'border-[#FF4D6D]/25' },
  'Coming Soon': { bg: 'bg-[#00B4D8]/10', text: 'text-[#00B4D8]', border: 'border-[#00B4D8]/25' },
  'In Preparation': { bg: 'bg-[#FF8C42]/10', text: 'text-[#FF8C42]', border: 'border-[#FF8C42]/25' },
}

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
  bodyType: 'Sedan',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  engineSize: '',
  doors: 4,
  seats: 5,
  colour: '',
  registration: '',
  cashPrice: 0,
  financePrice: 0,
  monthlyPayment: 0,
  deposit: 0,
  apr: 9.9,
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

export default function AdminVehiclesContent() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, duplicateVehicle } = useVehicles()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate' | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle>({ ...emptyVehicle })
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'pricing' | 'features' | 'media' | 'seo'>('details')
  const [featureSearch, setFeatureSearch] = useState('')

  const pageSize = 8

  const filtered = useMemo(() => {
    let result = [...vehicles]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.registration.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'All') {
      result = result.filter((v) => v.status === statusFilter)
    }
    if (sortKey) {
      result.sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (typeof av === 'string' && typeof bv === 'string') {
          return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        }
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av
        }
        return 0
      })
    }
    return result
  }, [vehicles, search, statusFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortIcon({ colKey }: { colKey: SortKey }) {
    if (sortKey !== colKey) return <ArrowUpDown className="w-3 h-3 text-[#33415C]" />
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#0077B6]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#0077B6]" />
    )
  }

  function generateNewId(): string {
    const maxNum = vehicles.reduce((max, veh) => {
      const match = veh.id.match(/VEH-(\d+)/)
      return match ? Math.max(max, parseInt(match[1], 10)) : max
    }, 0)
    return `VEH-${String(maxNum + 1).padStart(3, '0')}`
  }

  function openAdd() {
    setEditingVehicle({ ...emptyVehicle, id: generateNewId() })
    setModalMode('add')
    setActiveTab('details')
  }

  function openEdit(v: Vehicle) {
    setEditingVehicle({ ...v })
    setModalMode('edit')
    setActiveTab('details')
  }

  function saveVehicle() {
    if (modalMode === 'add' || modalMode === 'duplicate') {
      addVehicle(editingVehicle)
    } else if (modalMode === 'edit') {
      updateVehicle(editingVehicle.id, editingVehicle)
    }
    setModalMode(null)
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteVehicle(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  function toggleFeature(f: string) {
    setEditingVehicle((prev) => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter((x) => x !== f) : [...prev.features, f],
    }))
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const pageIds = paged.map((v) => v.id)
    const allSelected = pageIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      pageIds.forEach((id) => {
        if (allSelected) next.delete(id)
        else next.add(id)
      })
      return next
    })
  }

  function bulkDelete() {
    selectedIds.forEach((id) => deleteVehicle(id))
    setSelectedIds(new Set())
  }

  function bulkMarkSold() {
    selectedIds.forEach((id) => {
      updateVehicle(id, { status: 'Sold' as VehicleStatus, dateSold: new Date().toISOString().split('T')[0] })
    })
    setSelectedIds(new Set())
  }

  const filteredFeatures = featureSearch
    ? FEATURES_LIST.filter((f) => f.toLowerCase().includes(featureSearch.toLowerCase()))
    : FEATURES_LIST

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Vehicle Management
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[#5C677D] mt-0.5"
          >
            Manage your dealership inventory
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0077B6] hover:bg-[#0077B6]/90 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-[#0077B6]/20"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </motion.button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
          <input
            type="text"
            placeholder="Search by make, model, reg, ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#001233] border border-[#33415C]/40 text-sm text-[#E5E5E5] placeholder:text-[#5C677D] focus:outline-none focus:border-[#0077B6]/50 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(''); setCurrentPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C677D] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5C677D]" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            className="h-10 px-3 rounded-lg bg-[#001233] border border-[#33415C]/40 text-sm text-[#E5E5E5] focus:outline-none focus:border-[#0077B6]/50"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Coming Soon">Coming Soon</option>
            <option value="In Preparation">In Preparation</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-[#0077B6]/10 border border-[#0077B6]/20"
          >
            <span className="text-sm text-[#00B4D8] font-medium">{selectedIds.size} selected</span>
            <div className="w-px h-4 bg-[#33415C]/40 mx-1" />
            <button onClick={bulkMarkSold} className="text-xs px-3 py-1.5 rounded-md bg-[#00C896]/10 text-[#00C896] hover:bg-[#00C896]/20 transition-colors">
              Mark as Sold
            </button>
            <button onClick={bulkDelete} className="text-xs px-3 py-1.5 rounded-md bg-[#FF4D6D]/10 text-[#FF4D6D] hover:bg-[#FF4D6D]/20 transition-colors">
              Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs px-3 py-1.5 rounded-md text-[#5C677D] hover:text-white transition-colors ml-auto">
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#33415C]/30">
                <th className="px-4 py-3 text-left w-10">
                  <button onClick={toggleSelectAll} className="flex items-center justify-center">
                    <div className={cn(
                      'w-4 h-4 rounded border transition-colors flex items-center justify-center',
                      paged.every((v) => selectedIds.has(v.id)) && paged.length > 0
                        ? 'bg-[#0077B6] border-[#0077B6]'
                        : 'border-[#5C677D]/40'
                    )}>
                      {paged.every((v) => selectedIds.has(v.id)) && paged.length > 0 && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#C8D3D9]">Vehicle</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort('year')} className="flex items-center gap-1 font-medium text-[#C8D3D9]">
                    Year <SortIcon colKey="year" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort('cashPrice')} className="flex items-center gap-1 font-medium text-[#C8D3D9]">
                    Price <SortIcon colKey="cashPrice" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort('mileage')} className="flex items-center gap-1 font-medium text-[#C8D3D9]">
                    Mileage <SortIcon colKey="mileage" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#C8D3D9]">Status</th>
                <th className="px-4 py-3 text-right font-medium text-[#C8D3D9]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((vehicle, i) => {
                const sc = statusColors[vehicle.status]
                return (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#33415C]/15 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(vehicle.id)} className="flex items-center justify-center">
                        <div className={cn(
                          'w-4 h-4 rounded border transition-colors flex items-center justify-center',
                          selectedIds.has(vehicle.id) ? 'bg-[#0077B6] border-[#0077B6]' : 'border-[#5C677D]/40'
                        )}>
                          {selectedIds.has(vehicle.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#001233] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <Car className="w-5 h-5 text-[#5C677D]" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{vehicle.make} {vehicle.model}</p>
                          <p className="text-xs text-[#5C677D]">{vehicle.id} &middot; {vehicle.registration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#C8D3D9]">{vehicle.year}</td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">&pound;{vehicle.cashPrice.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-[#C8D3D9]">{vehicle.mileage.toLocaleString()} mi</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.bg, sc.text, sc.border)}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(vehicle)}
                          className="p-1.5 rounded-md text-[#5C677D] hover:text-[#00B4D8] hover:bg-[#00B4D8]/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateVehicle(vehicle.id)}
                          className="p-1.5 rounded-md text-[#5C677D] hover:text-[#FFB703] hover:bg-[#FFB703]/10 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(vehicle)}
                          className="p-1.5 rounded-md text-[#5C677D] hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#5C677D]">
                    <Car className="w-8 h-8 mx-auto mb-2 text-[#33415C]" />
                    <p className="text-sm">No vehicles found</p>
                    <p className="text-xs mt-0.5">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#33415C]/20">
            <span className="text-xs text-[#5C677D]">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-md text-[#5C677D] hover:text-white disabled:opacity-30">
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-md text-[#5C677D] hover:text-white disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-md text-xs font-medium transition-colors',
                    currentPage === p ? 'bg-[#0077B6] text-white' : 'text-[#C8D3D9] hover:bg-white/5'
                  )}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-md text-[#5C677D] hover:text-white disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-md text-[#5C677D] hover:text-white disabled:opacity-30">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit/Duplicate Modal */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="w-full max-w-4xl glass-dark rounded-2xl shadow-2xl overflow-hidden my-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#33415C]/30">
                <div>
                  <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {modalMode === 'add' && 'Add New Vehicle'}
                    {modalMode === 'edit' && `Edit Vehicle: ${editingVehicle.id}`}
                    {modalMode === 'duplicate' && `Duplicate: ${editingVehicle.make} ${editingVehicle.model}`}
                  </h2>
                  <p className="text-xs text-[#5C677D] mt-0.5">{editingVehicle.make} {editingVehicle.model} {editingVehicle.year}</p>
                </div>
                <button onClick={() => setModalMode(null)} className="p-2 rounded-lg text-[#5C677D] hover:text-white hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-6 border-b border-[#33415C]/30 overflow-x-auto">
                {(['details', 'pricing', 'features', 'media', 'seo'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap',
                      activeTab === tab
                        ? 'text-[#00B4D8] border-[#0077B6]'
                        : 'text-[#5C677D] border-transparent hover:text-[#C8D3D9]'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                {/* DETAILS TAB */}
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Make *">
                      <input value={editingVehicle.make} onChange={(e) => setEditingVehicle((p) => ({ ...p, make: e.target.value }))} className="input-admin" placeholder="e.g. BMW" />
                    </Field>
                    <Field label="Model *">
                      <input value={editingVehicle.model} onChange={(e) => setEditingVehicle((p) => ({ ...p, model: e.target.value }))} className="input-admin" placeholder="e.g. M3 Competition" />
                    </Field>
                    <Field label="Year *">
                      <input type="number" value={editingVehicle.year} onChange={(e) => setEditingVehicle((p) => ({ ...p, year: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                    <Field label="Variant">
                      <input value={editingVehicle.variant} onChange={(e) => setEditingVehicle((p) => ({ ...p, variant: e.target.value }))} className="input-admin" placeholder="e.g. xDrive" />
                    </Field>
                    <Field label="Body Type">
                      <select value={editingVehicle.bodyType} onChange={(e) => setEditingVehicle((p) => ({ ...p, bodyType: e.target.value }))} className="input-admin">
                        {bodyTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                    </Field>
                    <Field label="Fuel Type">
                      <select value={editingVehicle.fuelType} onChange={(e) => setEditingVehicle((p) => ({ ...p, fuelType: e.target.value }))} className="input-admin">
                        {fuelTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                    </Field>
                    <Field label="Transmission">
                      <select value={editingVehicle.transmission} onChange={(e) => setEditingVehicle((p) => ({ ...p, transmission: e.target.value }))} className="input-admin">
                        {transmissionTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                    </Field>
                    <Field label="Engine Size">
                      <input value={editingVehicle.engineSize} onChange={(e) => setEditingVehicle((p) => ({ ...p, engineSize: e.target.value }))} className="input-admin" placeholder="e.g. 3.0L" />
                    </Field>
                    <Field label="Colour">
                      <input value={editingVehicle.colour} onChange={(e) => setEditingVehicle((p) => ({ ...p, colour: e.target.value }))} className="input-admin" placeholder="e.g. Isle of Man Green" />
                    </Field>
                    <Field label="Registration">
                      <input value={editingVehicle.registration} onChange={(e) => setEditingVehicle((p) => ({ ...p, registration: e.target.value }))} className="input-admin" placeholder="e.g. MX24 BMW" />
                    </Field>
                    <Field label="Doors">
                      <input type="number" value={editingVehicle.doors} onChange={(e) => setEditingVehicle((p) => ({ ...p, doors: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                    <Field label="Seats">
                      <input type="number" value={editingVehicle.seats} onChange={(e) => setEditingVehicle((p) => ({ ...p, seats: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                    <Field label="Mileage">
                      <input type="number" value={editingVehicle.mileage} onChange={(e) => setEditingVehicle((p) => ({ ...p, mileage: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                    <Field label="Condition">
                      <select value={editingVehicle.condition} onChange={(e) => setEditingVehicle((p) => ({ ...p, condition: e.target.value }))} className="input-admin">
                        {conditions.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                    </Field>
                    <Field label="Status">
                      <select
                        value={editingVehicle.status}
                        onChange={(e) => setEditingVehicle((p) => ({ ...p, status: e.target.value as VehicleStatus }))}
                        className="input-admin"
                      >
                        {(['Available', 'Reserved', 'Sold', 'Coming Soon', 'In Preparation'] as VehicleStatus[]).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Field label="Description">
                        <textarea
                          value={editingVehicle.description}
                          onChange={(e) => setEditingVehicle((p) => ({ ...p, description: e.target.value }))}
                          className="input-admin min-h-[100px] resize-y"
                          placeholder="Enter vehicle description..."
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* PRICING TAB */}
                {activeTab === 'pricing' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Cash Price (&pound;)">
                      <input type="number" value={editingVehicle.cashPrice} onChange={(e) => setEditingVehicle((p) => ({ ...p, cashPrice: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                    <Field label="Finance Price (&pound;)">
                      <input type="number" value={editingVehicle.financePrice} onChange={(e) => setEditingVehicle((p) => ({ ...p, financePrice: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                    <Field label="Monthly Payment (&pound;)">
                      <input type="number" value={editingVehicle.monthlyPayment} onChange={(e) => setEditingVehicle((p) => ({ ...p, monthlyPayment: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                    <Field label="Deposit (&pound;)">
                      <input type="number" value={editingVehicle.deposit} onChange={(e) => setEditingVehicle((p) => ({ ...p, deposit: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                    <Field label="APR (%)">
                      <input type="number" step="0.1" value={editingVehicle.apr} onChange={(e) => setEditingVehicle((p) => ({ ...p, apr: Number(e.target.value) }))} className="input-admin" />
                    </Field>
                  </div>
                )}

                {/* FEATURES TAB */}
                {activeTab === 'features' && (
                  <div>
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search features..."
                        value={featureSearch}
                        onChange={(e) => setFeatureSearch(e.target.value)}
                        className="input-admin w-full sm:w-72"
                      />
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xs text-[#5C677D]">{editingVehicle.features.length} features selected</span>
                      {editingVehicle.features.length > 0 && (
                        <button onClick={() => setEditingVehicle((p) => ({ ...p, features: [] }))} className="text-xs text-[#FF4D6D] hover:underline">Clear all</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {filteredFeatures.map((feature) => {
                        const selected = editingVehicle.features.includes(feature)
                        return (
                          <button
                            key={feature}
                            onClick={() => toggleFeature(feature)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border text-left',
                              selected
                                ? 'bg-[#0077B6]/15 text-[#00B4D8] border-[#0077B6]/30'
                                : 'bg-[#001233]/50 text-[#C8D3D9] border-[#33415C]/20 hover:border-[#33415C]/40'
                            )}
                          >
                            {selected ? <Check className="w-3 h-3 flex-shrink-0" /> : <div className="w-3 h-3 rounded border border-[#5C677D]/30 flex-shrink-0" />}
                            {feature}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* MEDIA TAB */}
                {activeTab === 'media' && (
                  <div>
                    <div className="border-2 border-dashed border-[#33415C]/40 rounded-xl p-8 text-center hover:border-[#0077B6]/40 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-[#5C677D]" />
                      <p className="text-sm text-[#C8D3D9] mb-1">Drag &amp; drop images here</p>
                      <p className="text-xs text-[#5C677D] mb-3">or click to browse (up to 20 images)</p>
                      <button
                        onClick={() => alert('Image upload would open file picker here')}
                        className="px-4 py-2 rounded-lg bg-[#0077B6]/10 text-[#00B4D8] text-xs font-medium hover:bg-[#0077B6]/20 transition-colors"
                      >
                        Browse Files
                      </button>
                    </div>
                    {editingVehicle.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-[#5C677D] mb-2">{editingVehicle.images.length} image(s)</p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {editingVehicle.images.map((img, i) => (
                            <div key={i} className="relative aspect-square rounded-lg bg-[#001233] overflow-hidden group">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => setEditingVehicle((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                  className="p-1 rounded bg-[#FF4D6D] text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="absolute top-1 left-1 p-0.5 rounded bg-black/40 text-white cursor-move">
                                <GripVertical className="w-3 h-3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SEO TAB */}
                {activeTab === 'seo' && (
                  <div className="space-y-4 max-w-2xl">
                    <Field label="Meta Title">
                      <input
                        value={editingVehicle.metaTitle}
                        onChange={(e) => setEditingVehicle((p) => ({ ...p, metaTitle: e.target.value }))}
                        className="input-admin"
                        placeholder="e.g. BMW M3 Competition 2024 | APEX Automotive"
                      />
                      <p className="text-[11px] text-[#5C677D] mt-1">{editingVehicle.metaTitle.length} / 60 characters</p>
                    </Field>
                    <Field label="Meta Description">
                      <textarea
                        value={editingVehicle.metaDescription}
                        onChange={(e) => setEditingVehicle((p) => ({ ...p, metaDescription: e.target.value }))}
                        className="input-admin min-h-[80px] resize-y"
                        placeholder="Enter meta description..."
                      />
                      <p className="text-[11px] text-[#5C677D] mt-1">{editingVehicle.metaDescription.length} / 160 characters</p>
                    </Field>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#33415C]/30 bg-[#000814]/40">
                <button
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 rounded-lg text-sm text-[#C8D3D9] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveVehicle}
                  disabled={!editingVehicle.make || !editingVehicle.model}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0077B6] hover:bg-[#0077B6]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-lg shadow-[#0077B6]/20"
                >
                  <Save className="w-4 h-4" />
                  {modalMode === 'edit' ? 'Save Changes' : 'Create Vehicle'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md glass-dark rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4">
                <div className="w-12 h-12 rounded-full bg-[#FF4D6D]/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-[#FF4D6D]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Delete Vehicle</h3>
                <p className="text-sm text-[#C8D3D9]">
                  Are you sure you want to delete <span className="text-white font-medium">{deleteTarget.make} {deleteTarget.model}</span>?
                </p>
                <div className="mt-3 p-3 rounded-lg bg-[#001233] border border-[#33415C]/30 text-xs space-y-1">
                  <p className="text-[#5C677D]">ID: <span className="text-[#C8D3D9]">{deleteTarget.id}</span></p>
                  <p className="text-[#5C677D]">Registration: <span className="text-[#C8D3D9]">{deleteTarget.registration}</span></p>
                  <p className="text-[#5C677D]">Price: <span className="text-[#C8D3D9]">&pound;{deleteTarget.cashPrice.toLocaleString()}</span></p>
                </div>
                <p className="text-xs text-[#FF4D6D] mt-3">This action cannot be undone.</p>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#33415C]/30">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 rounded-lg text-sm text-[#C8D3D9] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF4D6D] hover:bg-[#FF4D6D]/90 text-white text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Vehicle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles for admin inputs */}
      <style>{`
        .input-admin {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.75rem;
          border-radius: 0.5rem;
          background: rgba(0, 8, 20, 0.5);
          border: 1px solid rgba(92, 103, 125, 0.3);
          color: #E5E5E5;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.25s ease-out;
        }
        .input-admin::placeholder {
          color: #5C677D;
        }
        .input-admin:focus {
          border-color: rgba(0, 119, 182, 0.5);
          box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.15);
        }
        .input-admin option {
          background: #001233;
          color: #E5E5E5;
        }
        select.input-admin {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C677D' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2rem;
        }
        textarea.input-admin {
          height: auto;
          padding: 0.625rem 0.75rem;
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#C8D3D9] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
