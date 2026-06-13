import { useState, useEffect, useCallback } from 'react'
import { supabase, type Vehicle } from '@/lib/supabase'

// Supabase returns PostgreSQL arrays as strings like {"url1","url2"}
// This converts whatever format into a proper JavaScript array
function normalizeArray(value: any): string[] {
  // Already an array
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }
  // Null or undefined
  if (!value) {
    return []
  }
  // String format: {"url1","url2"} or {url1,url2}
  if (typeof value === 'string') {
    const cleaned = value
      .replace(/^\{|\}$/g, '')           // remove { }
      .replace(/^"|"$/g, '')             // remove outer quotes
      .split(',')                         // split by comma
      .map((s: string) => s.replace(/^"|"$/g, '').trim()) // remove inner quotes
      .filter((s: string) => s.length > 0 && s !== 'NULL' && s !== 'null')
    return cleaned
  }
  return []
}

function normalizeVehicle(v: any): Vehicle {
  return {
    ...v,
    features: normalizeArray(v.features),
    images: normalizeArray(v.images),
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
      console.error('Supabase fetch error:', error)
      setVehicles([])
    } else {
      const normalized = (data || []).map(normalizeVehicle)
      console.log('Fetched', normalized.length, 'vehicles')
      setVehicles(normalized)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const getVehicleById = useCallback(async (id: string) => {
    if (!id || id === 'undefined') return null
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Fetch by ID error:', error)
      return null
    }
    return normalizeVehicle(data)
  }, [])

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select()

    if (error) {
      console.error('Add vehicle error:', error)
      return { data: null, error }
    }
    if (data) {
      setVehicles(prev => [normalizeVehicle(data[0]), ...prev])
    }
    return { data: data ? normalizeVehicle(data[0]) : null, error: null }
  }, [])

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Update vehicle error:', error)
      return { data: null, error }
    }
    if (data) {
      setVehicles(prev => prev.map(v => v.id === id ? normalizeVehicle(data[0]) : v))
    }
    return { data: data ? normalizeVehicle(data[0]) : null, error: null }
  }, [])

  const deleteVehicle = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) return false
    setVehicles(prev => prev.filter(v => v.id !== id))
    return true
  }, [])

  const uploadImage = useCallback(async (file: File, filename: string) => {
    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (error) {
      console.error('Upload error:', error)
      return null
    }
    const { data: urlData } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }, [])

  return {
    vehicles,
    loading,
    fetchVehicles,
    getVehicleById,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    uploadImage,
  }
}
