import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Vehicle {
  id: string; make: string; model: string; variant: string
  year: number; price: number; monthly_payment: number
  mileage: number; fuel_type: string; transmission: string
  engine_size: string; body_type: string; colour: string
  doors: number; seats: number; registration: string
  status: 'available' | 'reserved' | 'sold' | 'coming_soon' | 'in_preparation'
  featured: boolean; description: string; features: string[]
  images: string[]; location: string; discount_amount: number
  created_at: string
}
