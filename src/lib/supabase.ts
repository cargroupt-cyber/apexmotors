import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export interface Vehicle {
  id: string
  make: string
  model: string
  variant: string
  year: number
  price: number
  monthly_payment: number
  mileage: number
  fuel_type: string
  transmission: string
  engine_size: string
  body_type: string
  colour: string
  doors: number
  seats: number
  registration: string
  status: 'available' | 'reserved' | 'sold' | 'coming_soon' | 'in_preparation'
  featured: boolean
  description: string
  features: string[]
  images: string[]
  location: string
  discount_amount: number
  created_at: string
}

export interface Lead {
  id: string
  type: 'contact' | 'sell_car' | 'test_drive' | 'finance'
  first_name: string
  last_name: string
  email: string
  phone: string
  subject?: string
  message?: string
  vehicle_id?: string
  registration?: string
  mileage?: number
  condition?: string
  preferred_date?: string
  preferred_time?: string
  amount?: number
  term?: number
  employment_status?: string
  annual_income?: number
  status: 'new' | 'contacted' | 'qualified' | 'appointment' | 'converted' | 'declined'
  notes: string[]
  source: string
  created_at: string
}
