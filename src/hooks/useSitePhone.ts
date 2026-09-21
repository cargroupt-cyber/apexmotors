import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Single source of truth for the public phone number.
// Admin → Settings → Phone saves it to settings.business.phone; every page reads it here.
const DEFAULT_PHONE = '07522332210'

const format = (raw: string) => {
  const digits = (raw || DEFAULT_PHONE).replace(/\D/g, '')
  const national = digits.startsWith('44') ? '0' + digits.slice(2) : digits
  const intl = '44' + national.replace(/^0/, '')
  return {
    phone: national,                                   // 07522332210 (display)
    tel: `tel:${national}`,                            // tel: link
    wa: intl,                                          // wa.me number
    schema: `+44-${intl.slice(2, 6)}-${intl.slice(6)}`, // +44-7522-332210
  }
}

let current = format(DEFAULT_PHONE)
let started = false
const listeners = new Set<() => void>()

const load = async () => {
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', 'business').single()
    const p = data?.value?.phone
    if (p) {
      current = format(p)
      listeners.forEach((l) => l())
    }
  } catch {
    /* keep default */
  }
}

export const getSitePhone = () => current

export function useSitePhone() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    if (!started) {
      started = true
      load()
    }
    return () => { listeners.delete(l) }
  }, [])
  return current
}
