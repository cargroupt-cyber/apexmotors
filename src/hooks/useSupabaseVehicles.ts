import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Vehicle {
  id: string
  make: string
  model: string
  variant: string
  year: number
  price: number
  mileage: number
  fuel_type: string
  transmission: string
  body_type?: string
  engine_size?: string
  colour?: string
  doors?: number
  seats?: number
  images: string[]
  features: string[]
  badge?: string
  discount_amount?: number
  monthly_payment?: number
  location?: string
  registration?: string
  status?: string
  description?: string
  created_at?: string
}

function normalizeArray(value: any): string[] {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  if (typeof value === 'string') {
    const cleaned = value.replace(/^\{|\}$/g, '').split(',')
      .map((s: string) => s.replace(/^"|"$/g, '').trim())
      .filter((s: string) => s.length > 0 && s !== 'NULL' && s !== 'null')
    return cleaned
  }
  return []
}

export function useSupabaseVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      console.error('Supabase vehicles error:', err)
      setError(err.message)
      setVehicles([])
    } else {
      const normalized = (data || []).map((v: any) => ({
        ...v,
        images: normalizeArray(v.images),
        features: normalizeArray(v.features),
      }))
      setVehicles(normalized)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { vehicles, loading, error, refresh }
}
