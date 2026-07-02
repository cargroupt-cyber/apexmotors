import { useState, useEffect, useCallback } from 'react'
import {
  getVehicles,
  addVehicle as storeAddVehicle,
  updateVehicle as storeUpdateVehicle,
  deleteVehicle as storeDeleteVehicle,
  getVehicleById as storeGetVehicleById,
  subscribe,
} from '@/lib/store'
import type { Vehicle } from '@/lib/store'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(getVehicles())

  useEffect(() => {
    return subscribe(() => {
      setVehicles(getVehicles())
    })
  }, [])

  const refresh = useCallback(() => {
    setVehicles(getVehicles())
  }, [])

  const addVehicle = useCallback((vehicle: Vehicle) => {
    storeAddVehicle(vehicle)
    setVehicles(getVehicles())
  }, [])

  const updateVehicle = useCallback((id: string, patch: Partial<Vehicle>) => {
    storeUpdateVehicle(id, patch)
    setVehicles(getVehicles())
  }, [])

  const deleteVehicle = useCallback((id: string) => {
    storeDeleteVehicle(id)
    setVehicles(getVehicles())
  }, [])

  const duplicateVehicle = useCallback((id: string) => {
    const v = storeGetVehicleById(id)
    if (!v) return
    const all = getVehicles()
    const maxNum = all.reduce((max, veh) => {
      const match = veh.id.match(/VEH-(\d+)/)
      return match ? Math.max(max, parseInt(match[1], 10)) : max
    }, 0)
    const newId = `VEH-${String(maxNum + 1).padStart(3, '0')}`
    const duplicate: Vehicle = {
      ...v,
      id: newId,
      registration: '',
      status: 'Available',
      dateAdded: new Date().toISOString().split('T')[0],
      dateSold: undefined,
    }
    storeAddVehicle(duplicate)
    setVehicles(getVehicles())
  }, [])

  const getVehicleById = useCallback((id: string) => {
    return storeGetVehicleById(id)
  }, [])

  return {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    duplicateVehicle,
    getVehicleById,
    refresh,
  }
}

export type { Vehicle }
