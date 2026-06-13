import { useState, useEffect, useCallback } from 'react'
import { supabase, type Vehicle } from '@/lib/supabase'

// Helper: ensure features/images are arrays (not strings)
function normalizeVehicle(v: any): Vehicle {
  return {
    ...v,
    features: Array.isArray(v.features) ? v.features : (v.features ? [v.features] : []),
    images: Array.isArray(v.images) ? v.images : (v.images ? [v.images] : []),
  }
}

export function useSupabaseVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      setVehicles([])
    } else {
      setVehicles((data || []).map(normalizeVehicle))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const getVehicleById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return normalizeVehicle(data)
  }, [])

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('vehicles').insert([vehicle]).select()
    if (error) return { data: null, error }
    if (data) setVehicles(prev => [normalizeVehicle(data[0]), ...prev])
    return { data: normalizeVehicle(data[0]) || null, error: null }
  }, [])

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select()
    if (error) return { data: null, error }
    if (data) setVehicles(prev => prev.map(v => v.id === id ? normalizeVehicle(data[0]) : v))
    return { data: normalizeVehicle(data[0]) || null, error: null }
  }, [])

  const deleteVehicle = useCallback(async (id: string) => {
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) return false
    setVehicles(prev => prev.filter(v => v.id !== id))
    return true
  }, [])

  const uploadImage = useCallback(async (file: File, filename: string) => {
    const { data, error } = await supabase.storage.from('vehicle-images').upload(filename, file, { cacheControl: '3600', upsert: false })
    if (error) return null
    const { data: urlData } = supabase.storage.from('vehicle-images').getPublicUrl(data.path)
    return urlData.publicUrl
  }, [])

  return { vehicles, loading, fetchVehicles, getVehicleById, addVehicle, updateVehicle, deleteVehicle, uploadImage }
}
