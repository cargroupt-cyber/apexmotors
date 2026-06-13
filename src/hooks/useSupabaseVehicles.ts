import { useState, useEffect, useCallback } from 'react'
import { supabase, type Vehicle } from '@/lib/supabase'

export function useSupabaseVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching vehicles:', error)
      setError(error.message)
      setVehicles([])
    } else {
      setVehicles(data || [])
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

    if (error) {
      console.error('Error fetching vehicle:', error)
      return null
    }
    return data as Vehicle
  }, [])

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select()

    if (error) {
      console.error('Error adding vehicle:', error)
      return { data: null, error }
    }
    if (data) {
      setVehicles(prev => [data[0], ...prev])
    }
    return { data: data?.[0] || null, error: null }
  }, [])

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating vehicle:', error)
      return { data: null, error }
    }
    if (data) {
      setVehicles(prev => prev.map(v => v.id === id ? data[0] : v))
    }
    return { data: data?.[0] || null, error: null }
  }, [])

  const deleteVehicle = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting vehicle:', error)
      return false
    }
    setVehicles(prev => prev.filter(v => v.id !== id))
    return true
  }, [])

  const uploadImage = useCallback(async (file: File, filename: string) => {
    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }, [])

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    getVehicleById,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    uploadImage,
  }
}
