import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

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

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
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

  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at'>) => {
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

  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
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

  const deleteLead = useCallback(async (id: string) => {
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

  const bulkUpdateStatus = useCallback(async (ids: string[], status: LeadStatus) => {
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

  const bulkDelete = useCallback(async (ids: string[]) => {
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

  const searchLeads = useCallback(async (query: string) => {
    setLoading(true)
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
