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
  meta_title?: string
  meta_description?: string
  created_at?: string
}

// Module-level cache: prefetched at app start so /inventory opens instantly and revisits don't refetch.
let cache: Vehicle[] | null = null
let inflight: Promise<Vehicle[]> | null = null

async function fetchVehicles(): Promise<Vehicle[]> {
  const { data, error: err } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })
  if (err) throw err
  cache = (data || []).map((v: any) => ({ ...v, images: normalizeArray(v.images), features: normalizeArray(v.features) }))
  return cache
}

export function prefetchVehicles() {
  if (!cache && !inflight) inflight = fetchVehicles().catch(() => []).finally(() => { inflight = null })
}

export function useSupabaseVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(cache || [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (force = true) => {
    if (!force && cache) { setVehicles(cache); setLoading(false); return }
    setLoading(!cache)
    setError(null)
    try {
      setVehicles(await (inflight && !force ? inflight : fetchVehicles()))
    } catch (err: any) {
      console.error('Supabase vehicles error:', err)
      setError(err.message)
      setVehicles([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh(false) // background refresh keeps the cached list fresh
    if (cache) fetchVehicles().then(setVehicles).catch(() => {})
  }, [refresh])

  return { vehicles, loading, error, refresh }
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
