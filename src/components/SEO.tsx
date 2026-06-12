import { useEffect } from 'react'

interface SEOProps {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product' | 'business.business'
  twitterCard?: 'summary' | 'summary_large_image'
  schema?: Record<string, unknown>
  noindex?: boolean
  nofollow?: boolean
  keywords?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

const SITE_NAME = 'APEX Automotive'
const DEFAULT_DESCRIPTION =
  'APEX Automotive — London\'s premier destination for premium pre-owned vehicles. Explore our curated collection of luxury cars, from Mercedes-Benz and BMW to Porsche and Tesla. Finance available, part exchange welcome.'
const DEFAULT_OG_IMAGE = 'https://apexautomotive.co.uk/assets/og-default.jpg'
const SITE_URL = 'https://apexautomotive.co.uk'

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  schema,
  noindex = false,
  nofollow = false,
  keywords,
  author = 'APEX Automotive',
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (attr: 'name' | 'property' | 'rel', value: string, content?: string) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, value)
        document.head.appendChild(el)
      }
      if (content !== undefined) {
        el.setAttribute('content', content)
      }
      return el
    }

    // Basic meta tags
    setMeta('name', 'description', description)
    if (keywords) {
      setMeta('name', 'keywords', keywords)
    }
    setMeta('name', 'author', author)

    // Robots
    const robotsValue = []
    if (noindex) robotsValue.push('noindex')
    if (nofollow) robotsValue.push('nofollow')
    if (robotsValue.length > 0) {
      setMeta('name', 'robots', robotsValue.join(','))
    } else {
      setMeta('name', 'robots', 'index,follow')
    }

    // Googlebot
    setMeta('name', 'googlebot', noindex ? 'noindex,nofollow' : 'index,follow')

    // Open Graph
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', ogType)
    setMeta('property', 'og:site_name', SITE_NAME)
    if (canonicalUrl) {
      setMeta('property', 'og:url', canonicalUrl)
    }
    setMeta('property', 'og:image', ogImage)
    setMeta('property', 'og:locale', 'en_GB')
    if (publishedTime) {
      setMeta('property', 'article:published_time', publishedTime)
    }
    if (modifiedTime) {
      setMeta('property', 'article:modified_time', modifiedTime)
    }

    // Twitter Card
    setMeta('name', 'twitter:card', twitterCard)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', ogImage)
    setMeta('name', 'twitter:site', '@apexautomotive')
    setMeta('name', 'twitter:creator', '@apexautomotive')

    // Canonical link
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (canonicalUrl) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link')
        canonicalEl.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalEl)
      }
      canonicalEl.setAttribute('href', canonicalUrl)
    } else if (canonicalEl) {
      canonicalEl.remove()
    }

    // JSON-LD Schema
    let schemaEl = document.getElementById('jsonld-schema') as HTMLScriptElement | null
    if (schema) {
      if (!schemaEl) {
        schemaEl = document.createElement('script')
        schemaEl.id = 'jsonld-schema'
        schemaEl.type = 'application/ld+json'
        document.head.appendChild(schemaEl)
      }
      schemaEl.textContent = JSON.stringify(schema)
    } else if (schemaEl) {
      schemaEl.remove()
    }

    return () => {
      // Cleanup schema on unmount
      const el = document.getElementById('jsonld-schema')
      if (el) el.remove()
    }
  }, [
    fullTitle,
    description,
    canonicalUrl,
    ogImage,
    ogType,
    twitterCard,
    schema ? JSON.stringify(schema) : '',
    noindex,
    nofollow,
    keywords,
    author,
    publishedTime,
    modifiedTime,
  ])

  return null
}
