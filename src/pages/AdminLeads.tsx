// @ts-nocheck
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Mail, Phone, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Edit2, Trash2, Check, X, Star, Download, MoreHorizontal, ArrowUpDown,
  MessageSquare, DollarSign, Car, Calendar, CreditCard,
  ClipboardList, FileText, AlertTriangle, Clock,
} from 'lucide-react'
import { useSupabaseLeads, type Lead, type LeadStatus } from '@/hooks/useSupabaseLeads'

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const TABS = [
  { key: 'all', label: 'All Enquiries', icon: ClipboardList },
  { key: 'contact', label: 'Contact', icon: Mail },
  { key: 'sell-my-car', label: 'Sell My Car', icon: DollarSign },
  { key: 'test-drive', label: 'Test Drive', icon: Car },
  { key: 'finance', label: 'Finance', icon: CreditCard },
]

const STATUS_META: Record<string, { color: string; icon: any }> = {
  New: { color: 'bg-electric-blue/15 text-electric-blue border-electric-blue/25', icon: Star },
  Contacted: { color: 'bg-warning/15 text-warning border-warning/25', icon: MessageSquare },
  Qualified: { color: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: Check },
  'Test Drive': { color: 'bg-info/15 text-info border-info/25', icon: Car },
  Closed: { color: 'bg-success/15 text-success border-success/25', icon: Check },
  new: { color: 'bg-electric-blue/15 text-electric-blue border-electric-blue/25', icon: Star },
  contacted: { color: 'bg-warning/15 text-warning border-warning/25', icon: MessageSquare },
  qualified: { color: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: Check },
  pending: { color: 'bg-warning/15 text-warning border-warning/25', icon: Clock },
  confirmed: { color: 'bg-success/15 text-success border-success/25', icon: Check },
  approved: { color: 'bg-success/15 text-success border-success/25', icon: Check },
  declined: { color: 'bg-error/15 text-error border-error/25', icon: X },
  valued: { color: 'bg-electric-blue/15 text-electric-blue border-electric-blue/25', icon: DollarSign },
  appointment: { color: 'bg-info/15 text-info border-info/25', icon: Calendar },
  completed: { color: 'bg-success/15 text-success border-success/25', icon: Check },
  sold: { color: 'bg-success/15 text-success border-success/25', icon: Check },
  cancelled: { color: 'bg-error/15 text-error border-error/25', icon: X },
}

const ALL_STATUSES = Object.keys(STATUS_META)

const COLUMNS = [
  { key: 'name', label: 'Customer' },
  { key: 'vehicle_interest', label: 'Interest' },
  { key: 'status', label: 'Status' },
  { key: 'source', label: 'Source' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: '' },
]

const ROWS_PER_PAGE = 10

/* ═══════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════ */

function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = STATUS_META[status] || STATUS_META['New']
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${meta.color}`}>
      <Icon size={10} /> {status}
    </span>
  )
}

/* ═══════════════════════════════════════════
   EDIT MODAL
   ═══════════════════════════════════════════ */

function EditModal({ lead, onSave, onClose }: { lead: Lead; onSave: (id: string, data: Partial<Lead>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    status: lead.status || 'New',
    notes: lead.notes || '',
    assigned_to: lead.assigned_to || '',
    vehicle_interest: lead.vehicle_interest || lead.vehicle || '',
  })

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,8,20,0.85)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-2xl p-6" style={{ backgroundColor: '#0a1628', border: '1px solid #1a2744' }}>
        <h3 className="font-display font-semibold text-lg text-pure-white mb-4">Edit Enquiry</h3>
        <div className="flex flex-col gap-3">
          <div><label className="text-xs text-chrome mb-1 block">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-chrome mb-1 block">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue" /></div>
            <div><label className="text-xs text-chrome mb-1 block">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-chrome mb-1 block">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LeadStatus })} className="w-full px-3 py-2 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue">{ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="text-xs text-chrome mb-1 block">Assigned To</label><input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue" /></div>
          </div>
          <div><label className="text-xs text-chrome mb-1 block">Vehicle Interest</label><input value={form.vehicle_interest} onChange={e => setForm({ ...form, vehicle_interest: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue" /></div>
          <div><label className="text-xs text-chrome mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue resize-none" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-chrome hover:text-pure-white transition-colors">Cancel</button>
          <button onClick={() => { onSave(lead.id, form); onClose(); }} className="px-4 py-2 bg-electric-blue text-pure-white rounded-lg text-sm font-medium hover:bg-blue-glow transition-colors">Save Changes</button>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   VIEW MODAL
   ═══════════════════════════════════════════ */

function ViewModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const detailFields = [
    { label: 'Customer', value: lead.name },
    { label: 'Email', value: lead.email },
    { label: 'Phone', value: lead.phone },
    { label: 'Type', value: lead.type || 'contact' },
    { label: 'Status', value: lead.status },
    { label: 'Source', value: lead.source },
    { label: 'Vehicle Interest', value: lead.vehicle_interest || lead.vehicle || 'N/A' },
    { label: 'Registration', value: lead.registration || 'N/A' },
    { label: 'Mileage', value: lead.mileage ? `${lead.mileage.toLocaleString()} miles` : 'N/A' },
    { label: 'Condition', value: lead.condition || 'N/A' },
    { label: 'Estimated Value', value: lead.estimated_value ? `£${lead.estimated_value.toLocaleString()}` : 'N/A' },
    { label: 'Amount', value: lead.amount ? `£${lead.amount.toLocaleString()}` : 'N/A' },
    { label: 'Term', value: lead.term ? `${lead.term} months` : 'N/A' },
    { label: 'Employment Status', value: lead.employment_status || 'N/A' },
    { label: 'Income', value: lead.income ? `£${lead.income.toLocaleString()}` : 'N/A' },
    { label: 'Credit Rating', value: lead.credit_rating || 'N/A' },
    { label: 'Preferred Date', value: lead.preferred_date || 'N/A' },
    { label: 'Preferred Time', value: lead.preferred_time || 'N/A' },
    { label: 'Assigned To', value: lead.assigned_to || 'Unassigned' },
    { label: 'Date', value: new Date(lead.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,8,20,0.85)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#0a1628', border: '1px solid #1a2744' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-lg text-pure-white">Enquiry Details</h3>
          <button onClick={onClose} className="text-chrome hover:text-pure-white transition-colors"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
          {detailFields.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[0.625rem] text-chrome uppercase tracking-wider">{label}</p>
              <p className="text-sm text-pure-white font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {lead.subject && (
          <div className="mb-3">
            <p className="text-[0.625rem] text-chrome uppercase tracking-wider">Subject</p>
            <p className="text-sm text-pure-white font-medium mt-0.5">{lead.subject}</p>
          </div>
        )}
        {lead.message && (
          <div className="mb-5">
            <p className="text-[0.625rem] text-chrome uppercase tracking-wider">Message</p>
            <p className="text-sm text-frost mt-0.5 bg-obsidian/40 p-3 rounded-lg">{lead.message}</p>
          </div>
        )}
        {lead.notes && (
          <div className="mb-5">
            <p className="text-[0.625rem] text-chrome uppercase tracking-wider">Notes</p>
            <p className="text-sm text-frost mt-0.5 bg-obsidian/40 p-3 rounded-lg">{lead.notes}</p>
          </div>
        )}
        <div className="flex justify-end"><button onClick={onClose} className="px-4 py-2 text-sm text-chrome hover:text-pure-white transition-colors">Close</button></div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   DELETE CONFIRMATION
   ═══════════════════════════════════════════ */

function DeleteConfirm({ lead, onConfirm, onClose }: { lead: Lead; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,8,20,0.85)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ backgroundColor: '#0a1628', border: '1px solid #1a2744' }}>
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-error" />
        </div>
        <h3 className="font-display font-semibold text-lg text-pure-white mb-2">Delete Enquiry?</h3>
        <p className="text-sm text-chrome mb-5">This will permanently delete the enquiry from <strong className="text-pure-white">{lead.name}</strong>. This action cannot be undone.</p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-chrome hover:text-pure-white transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-error text-pure-white rounded-lg text-sm font-medium hover:bg-error/80 transition-colors">Delete</button>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function AdminLeads() {
  const { leads, loading, updateLead, deleteLead, bulkUpdateStatus, bulkDelete, searchLeads, refresh } = useSupabaseLeads()
  const [urlParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [sourceFilter, setSourceFilter] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState({ key: 'date', dir: 'desc' as 'asc' | 'desc' })
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewLead, setViewLead] = useState<Lead | null>(null)
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [deleteLeadData, setDeleteLeadData] = useState<Lead | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  /* Handle URL params for filtered views */
  useEffect(() => {
    if (urlParams.get('sellcar')) setActiveTab('sell-my-car')
    if (urlParams.get('finance')) setActiveTab('finance')
    if (urlParams.get('testdrive')) setActiveTab('test-drive')
  }, [urlParams])

  /* Filtered leads */
  const filtered = useMemo(() => {
    let result = [...leads]

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(l => l.type === activeTab || (activeTab === 'contact' && !l.type))
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.vehicle_interest?.toLowerCase().includes(q) ||
        l.registration?.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter.length > 0) {
      result = result.filter(l => statusFilter.includes(l.status))
    }

    // Source filter
    if (sourceFilter.length > 0) {
      result = result.filter(l => sourceFilter.includes(l.source))
    }

    // Sort
    result.sort((a, b) => {
      const dir = sortConfig.dir === 'asc' ? 1 : -1
      if (sortConfig.key === 'date') return dir * (new Date(a.date).getTime() - new Date(b.date).getTime())
      if (sortConfig.key === 'name') return dir * (a.name || '').localeCompare(b.name || '')
      if (sortConfig.key === 'status') return dir * (a.status || '').localeCompare(b.status || '')
      if (sortConfig.key === 'source') return dir * (a.source || '').localeCompare(b.source || '')
      return 0
    })

    return result
  }, [leads, activeTab, searchQuery, statusFilter, sourceFilter, sortConfig])

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  /* Reset page on filter change */
  useEffect(() => { setPage(1) }, [activeTab, searchQuery, statusFilter, sourceFilter])

  /* Selection */
  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selectAll = () => {
    const allIds = paginated.map(l => l.id)
    const allSelected = allIds.every(id => selectedIds.includes(id))
    setSelectedIds(allSelected ? selectedIds.filter(id => !allIds.includes(id)) : [...new Set([...selectedIds, ...allIds])])
  }

  /* Bulk actions */
  const handleBulkStatus = async (status: LeadStatus) => {
    if (selectedIds.length === 0) return
    await bulkUpdateStatus(selectedIds, status)
    setSelectedIds([])
  }
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    await bulkDelete(selectedIds)
    setSelectedIds([])
  }

  /* Search handler */
  const handleSearch = (q: string) => {
    setSearchQuery(q)
  }

  /* Unique sources for filter */
  const sources = useMemo(() => [...new Set(leads.map(l => l.source).filter(Boolean))], [leads])

  /* Tab counts */
  const tabCounts = useMemo(() => ({
    all: leads.length,
    contact: leads.filter(l => !l.type || l.type === 'contact').length,
    'sell-my-car': leads.filter(l => l.type === 'sell-my-car' || l.type === 'sell_car').length,
    'test-drive': leads.filter(l => l.type === 'test-drive').length,
    finance: leads.filter(l => l.type === 'finance').length,
  }), [leads])

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-pure-white">Enquiries & Leads</h1>
          <p className="text-chrome text-sm mt-1">Manage all customer enquiries from your website</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="px-4 py-2 bg-obsidian/60 border border-slate/15 rounded-xl text-sm text-chrome hover:text-pure-white hover:border-electric-blue transition-all">
            Refresh
          </button>
          <button className="px-4 py-2 bg-electric-blue text-pure-white rounded-xl text-sm font-medium hover:bg-blue-glow transition-colors flex items-center gap-2">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-electric-blue/10 border-electric-blue/30 text-pure-white'
                : 'bg-obsidian/40 border-slate/10 text-chrome hover:border-slate/30'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? 'bg-electric-blue/20 text-electric-blue' : 'bg-obsidian/60 text-slate'}`}>
              {tabCounts[tab.key as keyof typeof tabCounts] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            placeholder="Search by name, email, phone, vehicle, reg..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm placeholder-slate outline-none focus:border-electric-blue transition-all"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${showFilters ? 'bg-electric-blue/10 border-electric-blue/30 text-pure-white' : 'bg-obsidian/40 border-slate/15 text-chrome hover:border-slate/30'}`}>
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
            <div className="glass rounded-xl p-4 flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-chrome mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {['New', 'Contacted', 'Qualified', 'Test Drive', 'Closed'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${statusFilter.includes(s) ? 'bg-electric-blue/10 border-electric-blue/30 text-pure-white' : 'border-slate/15 text-chrome hover:border-slate/30'}`}>{s}</button>
                  ))}
                </div>
              </div>
              {sources.length > 0 && (
                <div>
                  <p className="text-xs text-chrome mb-2">Source</p>
                  <div className="flex flex-wrap gap-2">
                    {sources.map(s => (
                      <button key={s} onClick={() => setSourceFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${sourceFilter.includes(s) ? 'bg-electric-blue/10 border-electric-blue/30 text-pure-white' : 'border-slate/15 text-chrome hover:border-slate/30'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => { setStatusFilter([]); setSourceFilter([]); }} className="text-xs text-chrome hover:text-frost underline self-end">Clear filters</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-electric-blue/5 border border-electric-blue/20">
          <span className="text-sm text-pure-white font-medium">{selectedIds.length} selected</span>
          <div className="h-4 w-px bg-slate/30" />
          <select onChange={e => { if (e.target.value) { handleBulkStatus(e.target.value as LeadStatus); e.target.value = ''; } }} className="bg-transparent text-sm text-chrome outline-none cursor-pointer">
            <option value="">Change status...</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleBulkDelete} className="text-sm text-error hover:text-error/80 transition-colors">Delete</button>
        </motion.div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-electric-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare size={40} className="text-slate/30 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg text-pure-white">No enquiries found</h3>
            <p className="text-chrome text-sm mt-2">
              {searchQuery || statusFilter.length > 0 ? 'Try adjusting your filters' : 'Customer enquiries will appear here when submitted through your website'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate/15">
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={paginated.length > 0 && paginated.every(l => selectedIds.includes(l.id))} onChange={selectAll} className="w-4 h-4 accent-electric-blue" />
                    </th>
                    {COLUMNS.map(col => (
                      <th key={col.key} className="px-4 py-3 text-left">
                        {col.key !== 'actions' ? (
                          <button onClick={() => setSortConfig(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'asc' ? 'desc' : 'asc' }))} className="flex items-center gap-1 text-xs font-semibold text-chrome uppercase tracking-wider hover:text-pure-white transition-colors">
                            {col.label}
                            {sortConfig.key === col.key && <ArrowUpDown size={10} className={sortConfig.dir === 'asc' ? 'rotate-180' : ''} />}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-chrome uppercase tracking-wider">{col.label}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate/10 hover:bg-obsidian/30 transition-colors"
                    >
                      <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} className="w-4 h-4 accent-electric-blue" /></td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-pure-white">{lead.name}</p>
                          <p className="text-xs text-chrome">{lead.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-frost">{lead.vehicle_interest || lead.vehicle || '-'}</td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3 text-xs text-chrome">{lead.source || 'Website'}</td>
                      <td className="px-4 py-3 text-xs text-chrome">{new Date(lead.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewLead(lead)} className="p-1.5 rounded-lg hover:bg-obsidian/60 text-chrome hover:text-electric-blue transition-colors" title="View"><Eye size={14} /></button>
                          <button onClick={() => setEditLead(lead)} className="p-1.5 rounded-lg hover:bg-obsidian/60 text-chrome hover:text-warning transition-colors" title="Edit"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteLeadData(lead)} className="p-1.5 rounded-lg hover:bg-obsidian/60 text-chrome hover:text-error transition-colors" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate/15">
              <p className="text-xs text-chrome">Showing {filtered.length > 0 ? (page - 1) * ROWS_PER_PAGE + 1 : 0}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-obsidian/60 text-chrome hover:text-pure-white disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-electric-blue text-pure-white' : 'text-chrome hover:bg-obsidian/60 hover:text-pure-white'}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-obsidian/60 text-chrome hover:text-pure-white disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {viewLead && <ViewModal lead={viewLead} onClose={() => setViewLead(null)} />}
        {editLead && <EditModal lead={editLead} onSave={updateLead} onClose={() => setEditLead(null)} />}
        {deleteLeadData && <DeleteConfirm lead={deleteLeadData} onConfirm={async () => { await deleteLead(deleteLeadData.id); setDeleteLeadData(null); }} onClose={() => setDeleteLeadData(null)} />}
      </AnimatePresence>
    </div>
  )
}
