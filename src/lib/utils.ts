import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Smaller copy of a Supabase Storage image (Pro image transforms); other URLs pass through unchanged.
export function thumb(url: string, width = 480) {
  return url.includes('/storage/v1/object/public/')
    ? url.replace('/object/public/', '/render/image/public/') + `?width=${width}&quality=70`
    : url
}
