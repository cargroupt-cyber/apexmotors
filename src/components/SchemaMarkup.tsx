/**
 * SchemaMarkup — Structured Data Components for APEX Automotive
 *
 * Provides JSON-LD schema.org markup for:
 * - Organization / AutoDealer
 * - Vehicle
 * - BreadcrumbList
 * - FAQPage
 * - LocalBusiness
 */

import SEO from './SEO'

/* ─────────────────────── constants ─────────────────────── */

const SITE_URL = 'https://apexautomotive.co.uk'
const LOGO_URL = `${SITE_URL}/assets/logo-apex.png`
const DEFAULT_IMAGE = `${SITE_URL}/assets/og-default.jpg`

const ORG_NAME = 'APEX Automotive'
const ORG_PHONE = '+44-7983-183814'
const ORG_EMAIL = 'sales.carzee@gmail.com'

const HEADQUARTERS = {
  '@type': 'PostalAddress' as const,
  streetAddress: '120 Park Lane',
  addressLocality: 'London',
  addressRegion: 'England',
  postalCode: 'W1K 7AF',
  addressCountry: 'GB',
}

const OPENING_HOURS = [
  'Mo-Fr 09:00-19:00',
  'Sa 09:00-18:00',
  'Su 10:00-16:00',
]

const SOCIAL_LINKS = [
  'https://facebook.com/apexautomotive',
  'https://instagram.com/apexautomotive',
  'https://twitter.com/apexautomotive',
  'https://linkedin.com/company/apexautomotive',
  'https://youtube.com/@apexautomotive',
]

/* ─────────────────────── helpers ─────────────────────── */

function buildSchema(schemaObj: Record<string, unknown>) {
  return {
    '@context': 'https://schema.org',
    ...schemaObj,
  }
}

/* ─────────────────────── 1. Organization Schema ─────────────────────── */

interface OrganizationSchemaProps {
  render?: boolean
}

export function OrganizationSchema({ render = false }: OrganizationSchemaProps = {}) {
  const schema = buildSchema({
    '@type': 'AutoDealer',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    image: DEFAULT_IMAGE,
    telephone: ORG_PHONE,
    email: ORG_EMAIL,
    address: HEADQUARTERS,
    openingHours: OPENING_HOURS,
    priceRange: '£££',
    paymentAccepted: 'Cash, Credit Card, Finance, Bank Transfer',
    currenciesAccepted: 'GBP',
    sameAs: SOCIAL_LINKS,
    hasMap: 'https://maps.google.com/?q=120+Park+Lane+London+W1K+7AF',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.5074,
      longitude: -0.1278,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '347',
      bestRating: '5',
      worstRating: '1',
    },
  })

  if (render) {
    return <SEO schema={schema} title={ORG_NAME} description="London's premier destination for premium pre-owned vehicles" />
  }

  return schema
}

/* ─────────────────────── 2. Vehicle Schema ─────────────────────── */

interface VehicleSchemaProps {
  make: string
  model: string
  year: number
  mileage: number
  mileageUnit?: string
  fuelType: string
  price: number
  priceCurrency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  condition?: 'New' | 'Used' | 'CertifiedPreOwned'
  bodyType?: string
  color?: string
  transmission?: string
  engineSize?: string
  horsepower?: number
  vin?: string
  description?: string
  image?: string
  url?: string
  render?: boolean
}

export function VehicleSchema({
  make,
  model,
  year,
  mileage,
  mileageUnit = 'MI',
  fuelType,
  price,
  priceCurrency = 'GBP',
  availability = 'InStock',
  condition = 'Used',
  bodyType = 'Sedan',
  color,
  transmission = 'Automatic',
  engineSize,
  horsepower,
  vin,
  description,
  image = DEFAULT_IMAGE,
  url,
  render = false,
}: VehicleSchemaProps) {
  const vehicleUrl = url || `${SITE_URL}/vehicle/${make.toLowerCase().replace(/\s+/g, '-')}-${model.toLowerCase().replace(/\s+/g, '-')}-${year}`
  const vehicleName = `${year} ${make} ${model}`
  const vehicleDesc =
    description ||
    `${vehicleName} — ${condition} ${bodyType} with ${mileage.toLocaleString()} ${mileageUnit}. ${fuelType}, ${transmission}. Available now at APEX Automotive London.`

  const schema = buildSchema({
    '@type': 'Vehicle',
    '@id': `${vehicleUrl}#vehicle`,
    name: vehicleName,
    description: vehicleDesc,
    url: vehicleUrl,
    image: image,
    brand: {
      '@type': 'Brand',
      name: make,
    },
    model: model,
    vehicleModelDate: `${year}`,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: mileage,
      unitCode: mileageUnit === 'KM' ? 'KMT' : 'SMI',
    },
    fuelType: fuelType,
    vehicleTransmission: transmission,
    bodyType: bodyType,
    ...(color && { color }),
    ...(engineSize && { vehicleEngine: { '@type': 'EngineSpecification', engineType: engineSize } }),
    ...(horsepower && { vehicleEngine: { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: horsepower, unitCode: 'BHP' } } }),
    ...(vin && { vehicleIdentificationNumber: vin }),
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: priceCurrency,
      availability: `https://schema.org/${availability}`,
      itemCondition: `https://schema.org/${condition}Condition`,
      priceValidUntil: '2026-12-31',
      url: vehicleUrl,
      seller: {
        '@type': 'AutoDealer',
        name: ORG_NAME,
        telephone: ORG_PHONE,
        address: HEADQUARTERS,
      },
    },
  })

  if (render) {
    return (
      <SEO
        title={`${vehicleName} for Sale | APEX Automotive London`}
        description={vehicleDesc}
        canonical={vehicleUrl.replace(SITE_URL, '')}
        ogImage={image}
        ogType="product"
        schema={schema}
      />
    )
  }

  return schema
}

/* ─────────────────────── 3. BreadcrumbList Schema ─────────────────────── */

interface BreadcrumbItem {
  name: string
  path: string
}

interface BreadcrumbListSchemaProps {
  items: BreadcrumbItem[]
  render?: boolean
}

export function BreadcrumbListSchema({ items, render = false }: BreadcrumbListSchemaProps) {
  const schema = buildSchema({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${SITE_URL}${item.path}`,
    })),
  })

  if (render) {
    return <SEO schema={schema} title={items[items.length - 1]?.name || ORG_NAME} />
  }

  return schema
}

/* ─────────────────────── 4. FAQPage Schema ─────────────────────── */

interface FAQItem {
  question: string
  answer: string
}

interface FAQPageSchemaProps {
  faqs: FAQItem[]
  render?: boolean
}

export function FAQPageSchema({ faqs, render = false }: FAQPageSchemaProps) {
  const schema = buildSchema({
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  })

  if (render) {
    return (
      <SEO
        schema={schema}
        title="Frequently Asked Questions | APEX Automotive"
        description="Find answers to common questions about buying, selling, and financing vehicles at APEX Automotive London."
      />
    )
  }

  return schema
}

/* ─────────────────────── 5. LocalBusiness Schema ─────────────────────── */

interface DealershipLocation {
  name: string
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  telephone: string
  latitude: number
  longitude: number
  image?: string
  openingHours?: string[]
}

interface LocalBusinessSchemaProps {
  locations?: DealershipLocation[]
  render?: boolean
}

export function LocalBusinessSchema({
  locations = [
    {
      name: 'CarZee London',
      streetAddress: '123 Motorway Lane',
      addressLocality: 'London',
      addressRegion: 'England',
      postalCode: 'EC1A 1BB',
      telephone: '+44-7983-183814',
      latitude: 51.5074,
      longitude: -0.1278,
      image: DEFAULT_IMAGE,
      openingHours: OPENING_HOURS,
    },
    {
      name: 'APEX Birmingham',
      streetAddress: '456 Carriageway Rd',
      addressLocality: 'Birmingham',
      addressRegion: 'England',
      postalCode: 'B1 1AA',
      telephone: '+44-7983-183814',
      latitude: 52.4862,
      longitude: -1.8904,
      openingHours: OPENING_HOURS,
    },
    {
      name: 'APEX Manchester',
      streetAddress: '789 Autobahn St',
      addressLocality: 'Manchester',
      addressRegion: 'England',
      postalCode: 'M1 1AA',
      telephone: '+44-7983-183814',
      latitude: 53.4808,
      longitude: -2.2426,
      openingHours: OPENING_HOURS,
    },
  ],
  render = false,
}: LocalBusinessSchemaProps) {
  const schema = buildSchema({
    '@type': 'AutoDealer',
    '@id': `${SITE_URL}/#localbusiness`,
    name: ORG_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    image: DEFAULT_IMAGE,
    telephone: ORG_PHONE,
    email: ORG_EMAIL,
    priceRange: '£££',
    paymentAccepted: 'Cash, Credit Card, Finance, Bank Transfer',
    currenciesAccepted: 'GBP',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    department: locations.map((loc) => ({
      '@type': 'AutoDealer',
      name: loc.name,
      telephone: loc.telephone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: loc.streetAddress,
        addressLocality: loc.addressLocality,
        addressRegion: loc.addressRegion,
        postalCode: loc.postalCode,
        addressCountry: 'GB',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
      ...(loc.image && { image: loc.image }),
      ...(loc.openingHours && { openingHours: loc.openingHours }),
    })),
    areaServed: {
      '@type': 'City',
      name: 'London',
      containedInPlace: {
        '@type': 'Country',
        name: 'United Kingdom',
      },
    },
    sameAs: SOCIAL_LINKS,
  })

  if (render) {
    return (
      <SEO
        schema={schema}
        title="Contact APEX Automotive | Our Dealership Locations"
        description="Visit CarZee and APEX Automotive showrooms in London, Birmingham and Manchester. Open 7 days a week."
        canonical="/contact"
      />
    )
  }

  return schema
}

/* ─────────────────────── 6. WebSite Schema (for search box) ─────────────────────── */

interface WebSiteSchemaProps {
  render?: boolean
}

export function WebSiteSchema({ render = false }: WebSiteSchemaProps = {}) {
  const schema = buildSchema({
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: ORG_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/inventory?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  })

  if (render) {
    return <SEO schema={schema} title={ORG_NAME} />
  }

  return schema
}

/* ─────────────────────── 7. BlogPosting Schema ─────────────────────── */

interface BlogPostingSchemaProps {
  headline: string
  description: string
  slug: string
  image?: string
  authorName?: string
  authorRole?: string
  publishedDate: string
  modifiedDate?: string
  tags?: string[]
  render?: boolean
}

export function BlogPostingSchema({
  headline,
  description,
  slug,
  image = DEFAULT_IMAGE,
  authorName = 'APEX Automotive Editorial',
  authorRole = 'Editorial Team',
  publishedDate,
  modifiedDate,
  tags = [],
  render = false,
}: BlogPostingSchemaProps) {
  const postUrl = `${SITE_URL}/blog/${slug}`

  const schema = buildSchema({
    '@type': 'BlogPosting',
    '@id': `${postUrl}#blogpost`,
    headline,
    description,
    url: postUrl,
    image: image,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      '@type': 'Person',
      name: authorName,
      jobTitle: authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: tags.join(', '),
    articleSection: tags[0] || 'Automotive',
    inLanguage: 'en-GB',
  })

  if (render) {
    return (
      <SEO
        title={`${headline} | APEX Automotive Blog`}
        description={description}
        canonical={`/blog/${slug}`}
        ogImage={image}
        ogType="article"
        publishedTime={publishedDate}
        modifiedTime={modifiedDate || publishedDate}
        schema={schema}
      />
    )
  }

  return schema
}

/* ─────────────────────── default export — combined schema renderer ─────────────────────── */

interface SchemaMarkupProps {
  type: 'organization' | 'vehicle' | 'breadcrumb' | 'faq' | 'localbusiness' | 'website' | 'blogpost'
  data?: Record<string, unknown>
}

export default function SchemaMarkup({ type, data = {} }: SchemaMarkupProps) {
  let schema: Record<string, unknown> | null = null

  switch (type) {
    case 'organization':
      schema = OrganizationSchema() as Record<string, unknown>
      break
    case 'vehicle':
      schema = VehicleSchema(data as unknown as VehicleSchemaProps) as Record<string, unknown>
      break
    case 'breadcrumb':
      schema = BreadcrumbListSchema(data as unknown as BreadcrumbListSchemaProps) as Record<string, unknown>
      break
    case 'faq':
      schema = FAQPageSchema(data as unknown as FAQPageSchemaProps) as Record<string, unknown>
      break
    case 'localbusiness':
      schema = LocalBusinessSchema(data as unknown as LocalBusinessSchemaProps) as Record<string, unknown>
      break
    case 'website':
      schema = WebSiteSchema() as Record<string, unknown>
      break
    case 'blogpost':
      schema = BlogPostingSchema(data as unknown as BlogPostingSchemaProps) as Record<string, unknown>
      break
    default:
      return null
  }

  return <SEO schema={schema || undefined} title="APEX Automotive" />
}
