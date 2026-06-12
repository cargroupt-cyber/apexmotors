import { useState, useEffect, useCallback } from 'react'
import {
  getLeads,
  addLead as storeAddLead,
  updateLead as storeUpdateLead,
  deleteLead as storeDeleteLead,
  getLeadById as storeGetLeadById,
  subscribe,
} from '@/lib/store'
import type { Lead } from '@/lib/store'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(getLeads())

  useEffect(() => {
    return subscribe(() => {
      setLeads(getLeads())
    })
  }, [])

  const refresh = useCallback(() => {
    setLeads(getLeads())
  }, [])

  const addLead = useCallback((lead: Lead) => {
    storeAddLead(lead)
    setLeads(getLeads())
  }, [])

  const updateLead = useCallback((id: string, patch: Partial<Lead>) => {
    storeUpdateLead(id, patch)
    setLeads(getLeads())
  }, [])

  const deleteLead = useCallback((id: string) => {
    storeDeleteLead(id)
    setLeads(getLeads())
  }, [])

  const getLeadById = useCallback((id: string) => {
    return storeGetLeadById(id)
  }, [])

  return {
    leads,
    addLead,
    updateLead,
    deleteLead,
    getLeadById,
    refresh,
  }
}

export type { Lead }
