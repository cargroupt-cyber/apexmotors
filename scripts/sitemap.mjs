// Runs before every build (npm "prebuild"): writes public/sitemap.xml with the static pages plus every
// non-sold car from Supabase. If Supabase is unreachable the static pages are still written.
import { writeFileSync } from 'node:fs'

const SITE = 'https://www.carzee.co.uk'
const pages = [['/', 'daily', '1.0'], ['/inventory', 'daily', '0.9'], ['/finance', 'monthly', '0.7'], ['/sell-your-car', 'monthly', '0.7'], ['/about', 'monthly', '0.5'], ['/contact', 'monthly', '0.5']]
const today = new Date().toISOString().slice(0, 10)

let cars = []
const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY
if (url && key) {
  try {
    const r = await fetch(`${url}/rest/v1/vehicles?select=id,status,created_at&status=neq.sold`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    if (r.ok) cars = await r.json()
    else console.warn('sitemap: Supabase returned', r.status)
  } catch (e) { console.warn('sitemap: Supabase fetch failed', e.message) }
} else console.warn('sitemap: VITE_SUPABASE_URL/ANON_KEY not set, skipping cars')

const entry = (loc, freq, prio, mod = today) => `  <url><loc>${SITE}${loc}</loc><lastmod>${mod}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
  ...pages.map(([p, f, pr]) => entry(p, f, pr)),
  ...cars.map(c => entry(`/vehicle/${c.id}`, 'weekly', '0.8', (c.created_at || today).slice(0, 10))),
].join('\n')}\n</urlset>\n`
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`sitemap: ${pages.length} pages + ${cars.length} cars`)
