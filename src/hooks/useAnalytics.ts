import { useState, useEffect, useCallback } from 'react'
import {
  getVehicleCounts,
  getLeadCounts,
  getVehicles,
  getLeads,
  subscribe,
} from '@/lib/store'
import type { VehicleCounts, LeadCounts } from '@/lib/store'

export function useAnalytics() {
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCounts>(getVehicleCounts())
  const [leadCounts, setLeadCounts] = useState<LeadCounts>(getLeadCounts())

  useEffect(() => {
    return subscribe(() => {
      setVehicleCounts(getVehicleCounts())
      setLeadCounts(getLeadCounts())
    })
  }, [])

  const refresh = useCallback(() => {
    setVehicleCounts(getVehicleCounts())
    setLeadCounts(getLeadCounts())
  }, [])

  return {
    vehicleCounts,
    leadCounts,
    refresh,
  }
}

// Re-export the raw data getters for use in charts etc
export { getVehicles, getLeads, getVehicleCounts, getLeadCounts }
export type { VehicleCounts, LeadCounts }
