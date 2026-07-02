import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getLeads as getLocalLeads,
  addLead as addLocalLead,
  updateLead as updateLocalLead,
  deleteLead as deleteLocalLead,
} from '@/lib/store'

const SUPABASE_CONFIGURED = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

/* Map localStorage camelCase lead fields to AdminLeads snake_case expectation */
function mapLocalToSupabase(lead: Record<string, unknown>): Lead {
  return {
    ...lead,
    vehicle_interest: (lead.vehicleInterest as string) || (lead.vehicle_interest as string) || '',
    assigned_to: (lead.assignedTo as string) || (lead.assigned_to as string) || '',
    estimated_value: (lead.estimatedValue as number) || (lead.estimated_value as number) || 0,
    employment_status: (lead.employmentStatus as string) || (lead.employment_status as string) || '',
    credit_rating: (lead.creditRating as string) || (lead.credit_rating as string) || '',
    preferred_date: (lead.preferredDate as string) || (lead.preferred_date as string) || '',
    preferred_time: (lead.preferredTime as string) || (lead.preferred_time as string) || '',
    created_at: (lead.createdAt as string) || (lead.created_at as string) || (lead.date as string),
  } as Lead
}

/* Map AdminLeads snake_case patch back to localStorage camelCase */
function mapSupabaseToLocal(patch: Partial<Lead>): Record<string, unknown> {
  const mapped: Record<string, unknown> = { ...patch }
  if ('vehicle_interest' in patch) {
    mapped.vehicleInterest = patch.vehicle_interest
    delete mapped.vehicle_interest
  }
  if ('assigned_to' in patch) {
    mapped.assignedTo = patch.assigned_to
    delete mapped.assigned_to
  }
  if ('estimated_value' in patch) {
    mapped.estimatedValue = patch.estimated_value
    delete mapped.estimated_value
  }
  if ('employment_status' in patch) {
    mapped.employmentStatus = patch.employment_status
    delete mapped.employment_status
  }
  if ('credit_rating' in patch) {
    mapped.creditRating = patch.credit_rating
    delete mapped.credit_rating
  }
  if ('preferred_date' in patch) {
    mapped.preferredDate = patch.preferred_date
    delete mapped.preferred_date
  }
  if ('preferred_time' in patch) {
    mapped.preferredTime = patch.preferred_time
    delete mapped.preferred_time
  }
  if ('created_at' in patch) {
    mapped.createdAt = patch.created_at
    delete mapped.created_at
  }
  return mapped
}

export type LeadStatus =
  | 'New' | 'Contacted' | 'Qualified' | 'Test Drive' | 'Closed'
  | 'new' | 'contacted' | 'qualified' | 'pending' | 'confirmed'
  | 'approved' | 'declined' | 'referred' | 'closed' | 'valued'
  | 'appointment' | 'completed' | 'sold' | 'cancelled' | 'no-show'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  vehicle_interest?: string
  status: LeadStatus
  source: string
  date: string
  notes: string
  type?: 'contact' | 'sell_car' | 'sell-my-car' | 'test-drive' | 'finance'
  assigned_to?: string
  subject?: string
  message?: string
  registration?: string
  mileage?: number
  condition?: string
  estimated_value?: number
  vehicle?: string
  amount?: number
  term?: number
  employment_status?: string
  income?: number
  credit_rating?: string
  preferred_date?: string
  preferred_time?: string
  created_at?: string
}

export function useSupabaseLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ── fetch all leads ── */
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!SUPABASE_CONFIGURED) {
      // Fallback to localStorage when Supabase is not configured
      const localLeads = ((getLocalLeads() as unknown as Record<string, unknown>[])).map(mapLocalToSupabase)
      localLeads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setLeads(localLeads)
      setLoading(false)
      return
    }

    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('date', { ascending: false })

    if (err) {
      console.error('Supabase leads error:', err)
      setError(err.message)
    } else {
      setLeads((data as Lead[]) || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  /* ── add lead ── */
  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at'>) => {
    if (!SUPABASE_CONFIGURED) {
      const localLead = mapSupabaseToLocal({ ...lead, date: lead.date || new Date().toISOString() })
      addLocalLead(localLead as any)
      const fresh = ((getLocalLeads() as unknown as Record<string, unknown>[])).map(mapLocalToSupabase)
      fresh.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setLeads(fresh)
      return fresh[0] || null
    }

    const { data, error: err } = await supabase
      .from('leads')
      .insert([{ ...lead, date: lead.date || new Date().toISOString() }])
      .select()
      .single()

    if (err) {
      console.error('Add lead error:', err)
      return null
    }
    setLeads(prev => [data as Lead, ...prev])
    return data as Lead
  }, [])

  /* ── update lead ── */
  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    if (!SUPABASE_CONFIGURED) {
      updateLocalLead(id, mapSupabaseToLocal(patch) as any)
      const fresh = ((getLocalLeads() as unknown as Record<string, unknown>[])).map(mapLocalToSupabase)
      fresh.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setLeads(fresh)
      return true
    }

    const { data, error: err } = await supabase
      .from('leads')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (err) {
      console.error('Update lead error:', err)
      return false
    }
    setLeads(prev => prev.map(l => (l.id === id ? (data as Lead) : l)))
    return true
  }, [])

  /* ── delete lead ── */
  const deleteLead = useCallback(async (id: string) => {
    if (!SUPABASE_CONFIGURED) {
      deleteLocalLead(id)
      setLeads(prev => prev.filter(l => l.id !== id))
      return true
    }

    const { error: err } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (err) {
      console.error('Delete lead error:', err)
      return false
    }
    setLeads(prev => prev.filter(l => l.id !== id))
    return true
  }, [])

  /* ── bulk update status ── */
  const bulkUpdateStatus = useCallback(async (ids: string[], status: LeadStatus) => {
    if (!SUPABASE_CONFIGURED) {
      ids.forEach(id => updateLocalLead(id, { status } as any))
      const fresh = ((getLocalLeads() as unknown as Record<string, unknown>[])).map(mapLocalToSupabase)
      fresh.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setLeads(fresh)
      return true
    }

    const { error: err } = await supabase
      .from('leads')
      .update({ status })
      .in('id', ids)

    if (err) {
      console.error('Bulk update error:', err)
      return false
    }
    setLeads(prev => prev.map(l => (ids.includes(l.id) ? { ...l, status } : l)))
    return true
  }, [])

  /* ── bulk delete ── */
  const bulkDelete = useCallback(async (ids: string[]) => {
    if (!SUPABASE_CONFIGURED) {
      ids.forEach(id => deleteLocalLead(id))
      setLeads(prev => prev.filter(l => !ids.includes(l.id)))
      return true
    }

    const { error: err } = await supabase
      .from('leads')
      .delete()
      .in('id', ids)

    if (err) {
      console.error('Bulk delete error:', err)
      return false
    }
    setLeads(prev => prev.filter(l => !ids.includes(l.id)))
    return true
  }, [])

  /* ── search leads ── */
  const searchLeads = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)

    if (!SUPABASE_CONFIGURED) {
      const q = query.toLowerCase()
      const localLeads = ((getLocalLeads() as unknown as Record<string, unknown>[]))
        .map(mapLocalToSupabase)
        .filter(l =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.vehicle_interest?.toLowerCase().includes(q) ||
          l.registration?.toLowerCase().includes(q)
        )
      localLeads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setLeads(localLeads)
      setLoading(false)
      return
    }

    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,vehicle_interest.ilike.%${query}%,registration.ilike.%${query}%`)
      .order('date', { ascending: false })

    if (err) {
      console.error('Search leads error:', err)
      setError(err.message)
    } else {
      setLeads((data as Lead[]) || [])
    }
    setLoading(false)
  }, [])

  return {
    leads,
    loading,
    error,
    refresh,
    addLead,
    updateLead,
    deleteLead,
    bulkUpdateStatus,
    bulkDelete,
    searchLeads,
  }
}
