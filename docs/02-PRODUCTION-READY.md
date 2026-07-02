# APEX Automotive — Production Readiness Guide

**Purpose:** This document provides a comprehensive, step-by-step guide for transforming the APEX Automotive frontend demo into a fully production-ready web application.  
**Target Audience:** Development team, DevOps engineers, technical stakeholders  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Security Checklist](#2-security-checklist)
3. [Performance Optimization](#3-performance-optimization)
4. [SEO Implementation Details](#4-seo-implementation-details)
5. [Backend Architecture](#5-backend-architecture)
6. [Deployment Strategy](#6-deployment-strategy)
7. [Monitoring & Observability](#7-monitoring--observability)
8. [Testing Strategy](#8-testing-strategy)

---

## 1. Executive Summary

The APEX Automotive frontend is a high-quality React 19 application that requires backend services, security hardening, and infrastructure setup before production deployment. This guide covers every aspect of the production readiness journey.

**Production readiness phases:**

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Security hardening | 1-2 weeks | Auth, rate limiting, XSS protection |
| Backend API | 3-4 weeks | REST API, database, file uploads |
| Performance optimization | 1-2 weeks | CDN, compression, caching |
| SEO enhancement | 1 week | SSR, dynamic sitemaps, validation |
| Monitoring setup | 1 week | Analytics, error tracking, alerts |
| **Total** | **7-10 weeks** | **Full production deployment** |

---

## 2. Security Checklist

### 2.1 Environment Variables

Create a `.env.example` file as the canonical reference for all required environment variables:

```bash
# ============================================================
# APEX Automotive — Environment Variables Template
# Copy to .env and fill in actual values
# NEVER commit .env to version control
# ============================================================

# --- Application ---
NODE_ENV=production
PORT=3000
APP_URL=https://apexautomotive.co.uk
ADMIN_EMAIL=admin@apexautomotive.co.uk

# --- Database (PostgreSQL) ---
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apex_automotive
DB_USER=apex_user
DB_PASSWORD=your_secure_password_here
DB_SSL=true
DATABASE_URL=postgresql://apex_user:password@host:5432/apex_automotive?sslmode=require

# --- Authentication (Clerk.dev) ---
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# --- JWT (for API tokens) ---
JWT_SECRET=your_jwt_secret_min_32_chars_long
JWT_EXPIRES_IN=7d

# --- Email (Resend) ---
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM_DOMAIN=apexautomotive.co.uk
EMAIL_FROM_NAME=APEX Automotive

# --- Image Storage (Cloudinary) ---
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=apex_automotive

# --- reCAPTCHA ---
RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# --- Analytics ---
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXX

# --- Payment (Stripe) ---
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# --- Rate Limiting ---
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# --- Redis (caching) ---
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# --- Logging ---
LOG_LEVEL=info
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# --- Security ---
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your_session_secret_min_32_chars
CORS_ORIGIN=https://apexautomotive.co.uk
```

**Implementation checklist:**

```bash
# 1. Create .env.example (tracked in git)
touch .env.example
# Fill with all variable names and placeholder values

# 2. Create .env (NOT tracked in git)
cp .env.example .env
# Fill with actual values

# 3. Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# 4. For production deployment, set environment variables
# via hosting platform dashboard (Vercel, Railway, etc.)
```

### 2.2 Rate Limiting Implementation

```typescript
// server/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// General API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
    retryAfter: "15 minutes",
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

// Strict limiter for form submissions
export const formLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 submissions per 15 minutes
  skipSuccessfulRequests: false,
  message: {
    error: "Too many form submissions. Please try again after 15 minutes.",
  },
});

// Admin API limiter (more generous for authenticated users)
export const adminLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per 15 minutes for admins
  skip: (req) => !req.auth?.userId, // Skip if not authenticated
});
```

### 2.3 CSRF Protection

```typescript
// server/middleware/csrf.ts
import csurf from "csurf";
import { Request, Response, NextFunction } from "express";

// CSRF token middleware
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});

// Route to get CSRF token
export function csrfTokenRoute(req: Request, res: Response) {
  res.json({ csrfToken: req.csrfToken() });
}

// Frontend: Include CSRF token in all mutating requests
// api/client.ts
let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (!csrfToken) {
    const response = await fetch("/api/csrf-token");
    const data = await response.json();
    csrfToken = data.csrfToken;
  }
  return csrfToken;
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const token = await getCsrfToken();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify(body),
  });
  return response.json();
}
```

### 2.4 XSS Protection

```typescript
// server/utils/sanitizer.ts
import DOMPurify from "isomorphic-dompurify";

// Comprehensive input sanitization
export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }
  return sanitized;
}

// Usage in API routes
import { sanitizeObject } from "../utils/sanitizer";

app.post("/api/leads", formLimiter, async (req, res) => {
  const sanitizedBody = sanitizeObject(req.body);
  // Now safe to use sanitizedBody
  const lead = await createLead(sanitizedBody);
  res.json(lead);
});
```

### 2.5 Input Validation with Zod

```typescript
// server/validation/schemas.ts
import { z } from "zod";

// Vehicle schema
export const vehicleSchema = z.object({
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  variant: z.string().max(100).optional(),
  bodyType: z.enum([
    "saloon", "hatchback", "estate", "suv", "coupe", "convertible",
    "mpv", "pickup", "van",
  ]),
  fuelType: z.enum(["petrol", "diesel", "hybrid", "electric"]),
  transmission: z.enum(["manual", "automatic"]),
  engineSize: z.string().max(20).optional(),
  doors: z.number().int().min(2).max(6).optional(),
  seats: z.number().int().min(1).max(9).optional(),
  colour: z.string().min(1).max(30),
  registration: z.string().max(20).optional(),
  mileage: z.number().int().min(0),
  price: z.number().positive(),
  financePrice: z.number().positive().optional(),
  monthlyPayment: z.number().positive().optional(),
  description: z.string().max(5000).optional(),
  status: z.enum([
    "available", "reserved", "sold", "coming_soon", "in_preparation",
  ]).default("available"),
  features: z.array(z.string()).optional(),
});

// Lead/contact form schema
export const leadSchema = z.object({
  type: z.enum(["contact", "sell_car", "test_drive", "finance"]),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9\s-]{10,20}$/),
  subject: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  vehicleId: z.string().uuid().optional(),
  registration: z.string().max(20).optional(),
  mileage: z.number().int().min(0).optional(),
  condition: z.string().max(100).optional(),
  preferredDate: z.string().datetime().optional(),
  preferredTime: z.string().optional(),
  amount: z.number().positive().optional(),
  term: z.number().int().min(12).max(84).optional(),
  employmentStatus: z.enum([
    "employed", "self_employed", "unemployed", "retired", "student",
  ]).optional(),
  annualIncome: z.number().positive().optional(),
  creditRating: z.enum(["excellent", "good", "fair", "poor"]).optional(),
});

// Usage in API routes
import { leadSchema } from "../validation/schemas";

app.post("/api/leads", async (req, res) => {
  const result = leadSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.flatten(),
    });
  }
  const lead = await createLead(result.data);
  res.status(201).json(lead);
});
```

### 2.6 Authentication with Clerk.dev

Clerk.dev is the recommended authentication provider for its React-first approach and comprehensive feature set.

```typescript
// server/clerk.ts — Backend Clerk setup
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

// Protect API routes
export const requireAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error("Auth error:", error);
    return { error: "Unauthorized" };
  },
});

// Check roles middleware
export function requireRole(allowedRoles: string[]) {
  return async (req: any, res: any, next: any) => {
    const userRole = req.auth?.sessionClaims?.metadata?.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Usage
app.post("/api/vehicles",
  requireAuth,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    // Only super_admin and admin can create vehicles
  }
);
```

### 2.7 Password Hashing (bcrypt)

```typescript
// server/utils/password.ts
import bcrypt from "bcrypt";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Usage in user registration
const passwordHash = await hashPassword(plainPassword);
await db.insert(users).values({
  email,
  passwordHash,
  firstName,
  lastName,
  role: "staff",
});
```

### 2.8 HTTP Security Headers (Helmet.js)

```typescript
// server/middleware/security.ts
import helmet from "helmet";

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some React features
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://js.stripe.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://res.cloudinary.com",
        "https://images.unsplash.com",
      ],
      connectSrc: [
        "'self'",
        "https://api.clerk.dev",
        "https://*.clerk.accounts.dev",
        "https://www.google-analytics.com",
      ],
      frameSrc: ["'self'", "https://js.stripe.com", "https://www.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some third-party embeds
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
```

### 2.9 CORS Configuration

```typescript
// server/middleware/cors.ts
import cors from "cors";

const allowedOrigins = [
  "https://apexautomotive.co.uk",
  "https://www.apexautomotive.co.uk",
  "https://admin.apexautomotive.co.uk",
];

export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "X-Requested-With",
  ],
});
```

### 2.10 Security Checklist Summary

| # | Security Control | Implementation | Priority |
|---|-----------------|----------------|----------|
| 1 | Environment variables | `.env.example` + `.env` (gitignored) | Critical |
| 2 | Rate limiting | `express-rate-limit` + Redis store | Critical |
| 3 | CSRF protection | `csurf` package with cookie-based tokens | High |
| 4 | XSS sanitization | `DOMPurify` on all inputs | Critical |
| 5 | Input validation | `Zod` schemas for all endpoints | Critical |
| 6 | Authentication | Clerk.dev integration | Critical |
| 7 | Password hashing | `bcrypt` with 12 salt rounds | Critical |
| 8 | HTTP security headers | `helmet` package | High |
| 9 | CORS configuration | Whitelist-based origin validation | High |
| 10 | reCAPTCHA | Google reCAPTCHA v3 on forms | High |
| 11 | Content Security Policy | Helmet CSP directives | Medium |
| 12 | Request logging | Morgan + Winston loggers | Medium |
| 13 | SQL injection prevention | Parameterized queries (Drizzle ORM) | Critical |
| 14 | Secure cookies | HttpOnly, Secure, SameSite=Strict | High |

---

## 3. Performance Optimization

### 3.1 Image Optimization Pipeline (Sharp.js)

```typescript
// server/services/imageOptimizer.ts
import sharp from "sharp";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface OptimizedImage {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
  webp: string;
  blurDataUrl: string;
}

export async function optimizeAndUpload(
  fileBuffer: Buffer,
  filename: string
): Promise<OptimizedImage> {
  // Generate blur placeholder (tiny, low-quality)
  const blurBuffer = await sharp(fileBuffer)
    .resize(20, 20, { fit: "cover" })
    .blur()
    .jpeg({ quality: 30 })
    .toBuffer();
  const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;

  // Generate responsive sizes
  const sizes = {
    thumbnail: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1600, height: 1200 },
  };

  const uploadPromises = Object.entries(sizes).map(async ([key, size]) => {
    const optimized = await sharp(fileBuffer)
      .resize(size.width, size.height, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    return new Promise<{ key: string; url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${process.env.CLOUDINARY_FOLDER}/vehicles`,
            public_id: `${filename}_${key}`,
            format: "jpg",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({ key, url: result!.secure_url });
          }
        )
        .end(optimized);
    });
  });

  const results = await Promise.all(uploadPromises);
  const urls = Object.fromEntries(results.map((r) => [r.key, r.url]));

  // Upload WebP version for modern browsers
  const webpBuffer = await sharp(fileBuffer)
    .resize(1600, 1200, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer();

  const webpResult = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `${process.env.CLOUDINARY_FOLDER}/vehicles`,
          public_id: `${filename}_webp`,
          format: "webp",
        },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result);
        }
      )
      .end(webpBuffer);
  });

  // Upload original
  const originalResult = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `${process.env.CLOUDINARY_FOLDER}/vehicles`,
          public_id: `${filename}_original`,
        },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result);
        }
      )
      .end(fileBuffer);
  });

  return {
    original: originalResult.secure_url,
    thumbnail: urls.thumbnail,
    medium: urls.medium,
    large: urls.large,
    webp: webpResult.secure_url,
    blurDataUrl: blurDataUrl,
  };
}
```

### 3.2 CDN Setup (Cloudflare)

**Step-by-step Cloudflare configuration:**

```
1. Sign up at https://cloudflare.com
2. Add your domain (apexautomotive.co.uk)
3. Update nameservers at your registrar to Cloudflare's
4. Configure DNS records:
   - A record: apexautomotive.co.uk → 76.76.21.21
   - CNAME: www → apexautomotive.co.uk
5. Enable performance features:
   - Auto Minify: JS, CSS, HTML
   - Brotli compression: ON
   - Always Online: ON
   - Development Mode: OFF (only for debugging)
6. Configure caching:
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours
   - Edge Cache TTL: 1 month (for static assets)
7. Enable optimizations:
   - Polish: Lossless
   - Mirage: ON
   - Rocket Loader: OFF (can interfere with React)
```

### 3.3 Gzip/Brotli Compression

```typescript
// server/middleware/compression.ts
import compression from "compression";

export const compressionConfig = compression({
  level: 6, // Gzip compression level (1-9)
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers["x-no-compression"]) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  },
});

// Nginx Brotli configuration (preferred for production)
// /etc/nginx/nginx.conf
/*
http {
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/javascript
               application/json application/xml text/xml
               text/javascript application/rss+xml
               text/x-component image/svg+xml;
}
*/
```

### 3.4 Database Query Optimization

```typescript
// server/db/queries.ts
import { db } from "./index";
import { vehicles, vehicleImages } from "./schema";
import { eq, desc, sql } from "drizzle-orm";

// Optimized queries with proper indexing

// Get featured vehicles with images — single query with join
export async function getFeaturedVehicles() {
  return db
    .select({
      id: vehicles.id,
      make: vehicles.make,
      model: vehicles.model,
      year: vehicles.year,
      price: vehicles.price,
      monthlyPayment: vehicles.monthlyPayment,
      mileage: vehicles.mileage,
      fuelType: vehicles.fuelType,
      transmission: vehicles.transmission,
      status: vehicles.status,
      createdAt: vehicles.createdAt,
      primaryImage: sql<string>`(
        SELECT image_url FROM vehicle_images
        WHERE vehicle_images.vehicle_id = vehicles.id
        AND vehicle_images.is_primary = true
        LIMIT 1
      )`,
    })
    .from(vehicles)
    .where(eq(vehicles.isFeatured, true))
    .orderBy(desc(vehicles.createdAt))
    .limit(8);
}

// Search vehicles with full-text search
export async function searchVehicles(query: string, filters: VehicleFilters) {
  const conditions = [
    sql`${vehicles.status} = 'available'`,
  ];

  if (query) {
    conditions.push(
      sql`(
        ${vehicles.make} ILIKE ${`%${query}%`} OR
        ${vehicles.model} ILIKE ${`%${query}%`} OR
        ${vehicles.description} ILIKE ${`%${query}%`}
      )`
    );
  }

  if (filters.make) conditions.push(eq(vehicles.make, filters.make));
  if (filters.minPrice) conditions.push(sql`${vehicles.price} >= ${filters.minPrice}`);
  if (filters.maxPrice) conditions.push(sql`${vehicles.price} <= ${filters.maxPrice}`);

  return db
    .select()
    .from(vehicles)
    .where(sql.join(conditions, sql` AND `))
    .orderBy(desc(vehicles.createdAt))
    .limit(filters.limit || 20)
    .offset(filters.offset || 0);
}

// Get vehicle statistics for dashboard
export async function getVehicleStats() {
  const result = await db
    .select({
      total: sql<number>`COUNT(*)`,
      available: sql<number>`COUNT(CASE WHEN ${vehicles.status} = 'available' THEN 1 END)`,
      sold: sql<number>`COUNT(CASE WHEN ${vehicles.status} = 'sold' THEN 1 END)`,
      reserved: sql<number>`COUNT(CASE WHEN ${vehicles.status} = 'reserved' THEN 1 END)`,
      avgPrice: sql<number>`AVG(${vehicles.price})`,
    })
    .from(vehicles);

  return result[0];
}
```

### 3.5 Redis Caching Layer

```typescript
// server/services/cache.ts
import { createClient, RedisClientType } from "redis";

let client: RedisClientType;

export async function getCacheClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => console.error("Redis error:", err));
    await client.connect();
  }
  return client;
}

// Generic cache wrapper
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300 // 5 minutes default
): Promise<T> {
  const redis = await getCacheClient();
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetcher();
  await redis.setEx(key, ttlSeconds, JSON.stringify(data));
  return data;
}

// Cache invalidation helpers
export async function invalidateCache(pattern: string): Promise<void> {
  const redis = await getCacheClient();
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

// Usage examples
const vehicles = await getCached(
  "vehicles:featured",
  () => getFeaturedVehicles(),
  600 // 10 minutes
);

// Invalidate after vehicle update
await invalidateCache("vehicles:*");
```

### 3.6 Lighthouse Score Targets

| Metric | Target | Current (Est.) | Strategy |
|--------|--------|----------------|----------|
| Performance | 95+ | ~75 | CDN, compression, lazy loading |
| Accessibility | 100 | ~95 | ARIA labels, contrast, keyboard nav |
| Best Practices | 100 | ~90 | HTTPS, CSP, modern APIs |
| SEO | 100 | ~95 | Sitemap, schema, meta tags |

---

## 4. SEO Implementation Details

### 4.1 Server-Side Rendering Migration (Next.js)

Migrating from Vite + React to Next.js provides automatic SSR for improved SEO.

```typescript
// Migration steps:
// 1. Install Next.js
npm install next react react-dom

// 2. Update package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}

// 3. Create app/layout.tsx (root layout)
// app/layout.tsx
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "APEX Automotive | Premium Used Cars",
    template: "%s | APEX Automotive",
  },
  description: "APEX Automotive — Your trusted destination for premium quality used vehicles. Browse our extensive inventory of cars, SUVs, and vans.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://apexautomotive.co.uk",
    siteName: "APEX Automotive",
    images: [{
      url: "/images/og-default.jpg",
      width: 1200,
      height: 630,
      alt: "APEX Automotive Showroom",
    }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@apexautomotive",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://apexautomotive.co.uk",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// 4. Create dynamic pages
// app/vehicles/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/components/VehicleDetail";
import { getVehicleById } from "@/lib/api";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return { title: "Vehicle Not Found" };

  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: vehicle.metaDescription || vehicle.description?.slice(0, 160),
    openGraph: {
      images: [{
        url: vehicle.images[0]?.url,
        width: 1200,
        height: 800,
      }],
    },
  };
}

export async function generateStaticParams() {
  const vehicles = await getAllVehicleIds();
  return vehicles.map((v) => ({ id: v.id }));
}

export default async function VehiclePage({ params }: Props) {
  const vehicle = await getVehicleById(params.id);
  if (!vehicle) notFound();

  return <VehicleDetail vehicle={vehicle} />;
}
```

### 4.2 Dynamic Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllVehicles, getAllBlogPosts } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://apexautomotive.co.uk";

  // Static pages
  const staticPages = [
    { url: `${baseUrl}/`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/vehicles`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${baseUrl}/finance`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/about`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/blog`, priority: 0.7, changeFrequency: "daily" as const },
    { url: `${baseUrl}/contact`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/sell-my-car`, priority: 0.8, changeFrequency: "monthly" as const },
  ];

  // Dynamic vehicle pages
  const vehicles = await getAllVehicles();
  const vehiclePages = vehicles.map((vehicle) => ({
    url: `${baseUrl}/vehicles/${vehicle.id}`,
    lastModified: vehicle.updatedAt,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  // Dynamic blog pages
  const posts = await getAllBlogPosts();
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...vehiclePages, ...blogPages];
}
```

### 4.3 Schema Markup Server Rendering

```typescript
// components/JsonLd.tsx
import { Vehicle, WithContext } from "schema-dts";

interface VehicleJsonLdProps {
  vehicle: VehicleType;
}

export function VehicleJsonLd({ vehicle }: VehicleJsonLdProps) {
  const jsonLd: WithContext<Vehicle> = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant || ""}`,
    brand: {
      "@type": "Brand",
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleIdentificationNumber: vehicle.registration || undefined,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "SMI",
    },
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "GBP",
      availability: vehicle.status === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "AutoDealer",
        name: "APEX Automotive",
      },
    },
    vehicleEngine: {
      "@type": "EngineSpecification",
      engineType: vehicle.engineSize || undefined,
      fuelType: vehicle.fuelType,
    },
    color: vehicle.colour,
    bodyType: vehicle.bodyType,
    vehicleTransmission: vehicle.transmission,
    numberOfDoors: vehicle.doors,
    vehicleSeatingCapacity: vehicle.seats,
    image: vehicle.images?.map((img) => img.imageUrl),
    description: vehicle.description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 4.4 Meta Tag Management with React Helmet Async

```typescript
// components/SEO.tsx
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
  schema?: object;
}

export function SEO({
  title,
  description,
  canonical,
  ogImage = "/images/og-default.jpg",
  ogType = "website",
  noIndex = false,
  schema,
}: SEOProps) {
  const siteTitle = `${title} | APEX Automotive`;
  const fullCanonical = canonical
    ? `https://apexautomotive.co.uk${canonical}`
    : undefined;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* Canonical URL */}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content="APEX Automotive" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={`https://apexautomotive.co.uk${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://apexautomotive.co.uk${ogImage}`} />

      {/* Schema Markup */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
```

---

## 5. Backend Architecture

### 5.1 Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | Node.js 20 LTS | Stable, widely supported |
| Framework | Express.js or Hono | Lightweight, middleware-rich |
| ORM | Drizzle ORM | Type-safe, SQL-like syntax |
| Database | PostgreSQL 16 | Robust, JSON support, full-text search |
| Cache | Redis 7 | Session storage, API caching |
| Auth | Clerk.dev | React-first, comprehensive |
| File Storage | Cloudinary | Auto-optimization, CDN |
| Email | Resend | Simple API, React email templates |
| Validation | Zod | TypeScript-first, composable |
| Testing | Vitest + Playwright | Fast unit tests, E2E coverage |

### 5.2 Project Structure

```
apex-automotive/
├── apps/
│   ├── web/                  # Next.js frontend (SSR)
│   └── api/                  # Express.js API
│       ├── src/
│       │   ├── routes/       # API route definitions
│       │   ├── controllers/  # Request handlers
│       │   ├── services/     # Business logic
│       │   ├── middleware/   # Auth, validation, rate limiting
│       │   ├── db/           # Database config & schema
│       │   ├── validation/   # Zod schemas
│       │   ├── utils/        # Helpers & utilities
│       │   └── types/        # Shared TypeScript types
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── e2e/
│       └── package.json
├── packages/
│   ├── shared-types/         # Shared TypeScript types
│   ├── ui-components/        # shadcn/ui components
│   └── email-templates/      # React email templates
├── docker-compose.yml
├── turbo.json                # Monorepo config
└── package.json
```

### 5.3 API Route Structure

```typescript
// apps/api/src/routes/index.ts
import { Router } from "express";
import { vehicleRoutes } from "./vehicles";
import { leadRoutes } from "./leads";
import { authRoutes } from "./auth";
import { uploadRoutes } from "./upload";
import { analyticsRoutes } from "./analytics";
import { settingsRoutes } from "./settings";
import { blogRoutes } from "./blog";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/vehicles", vehicleRoutes);
apiRoutes.use("/leads", leadRoutes);
apiRoutes.use("/upload", uploadRoutes);
apiRoutes.use("/analytics", analyticsRoutes);
apiRoutes.use("/settings", settingsRoutes);
apiRoutes.use("/blog", blogRoutes);

// Error handling
apiRoutes.use((err: Error, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});
```

---

## 6. Deployment Strategy

### 6.1 Frontend (Vercel — Recommended)

```yaml
# vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 6.2 Backend (Railway or VPS)

```yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/apex
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=apex
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 6.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}/api:latest
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/apex
            docker-compose pull api
            docker-compose up -d api
            docker system prune -f
```

---

## 7. Monitoring & Observability

### 7.1 Error Tracking (Sentry)

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
});

// apps/api/src/utils/sentry.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.postgresIntegration(),
  ],
  tracesSampleRate: 0.1,
});
```

### 7.2 Health Checks

```typescript
// apps/api/src/routes/health.ts
import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    services: {} as Record<string, string>,
  };

  // Database check
  try {
    await db.execute(sql`SELECT 1`);
    checks.services.database = "healthy";
  } catch {
    checks.services.database = "unhealthy";
    checks.status = "degraded";
  }

  // Redis check
  try {
    const redis = await getCacheClient();
    await redis.ping();
    checks.services.redis = "healthy";
  } catch {
    checks.services.redis = "unhealthy";
    checks.status = "degraded";
  }

  const statusCode = checks.status === "ok" ? 200 : 503;
  res.status(statusCode).json(checks);
});
```

### 7.3 Logging Strategy

```typescript
// apps/api/src/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "apex-api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Usage
logger.info("Vehicle created", { vehicleId: "123", userId: "456" });
logger.error("Failed to process payment", { error, vehicleId: "123" });
```

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

| Level | Tool | Coverage Target | What to Test |
|-------|------|----------------|--------------|
| Unit | Vitest | 80%+ | Utilities, hooks, components in isolation |
| Integration | Vitest + MSW | 60%+ | API calls, data flow, state management |
| E2E | Playwright | Critical paths | Full user journeys |
| Visual | Chromatic | All components | UI regression prevention |

### 8.2 Unit Test Example

```typescript
// src/components/VehicleCard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VehicleCard } from "./VehicleCard";

const mockVehicle = {
  id: "1",
  make: "BMW",
  model: "3 Series",
  year: 2022,
  price: 25000,
  monthlyPayment: 350,
  mileage: 15000,
  fuelType: "petrol",
  transmission: "automatic",
  images: [{ url: "/test.jpg", isPrimary: true }],
};

describe("VehicleCard", () => {
  it("renders vehicle details correctly", () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    expect(screen.getByText("BMW 3 Series")).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();
    expect(screen.getByText(/£25,000/)).toBeInTheDocument();
  });

  it("calls onSelect when clicked", () => {
    const onSelect = vi.fn();
    render(<VehicleCard vehicle={mockVehicle} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("article"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("formats price with GBP currency", () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText("£25,000")).toBeInTheDocument();
  });
});
```

### 8.3 E2E Test Example

```typescript
// e2e/vehicle-purchase.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Vehicle Purchase Flow", () => {
  test("user can view and enquire about a vehicle", async ({ page }) => {
    // Navigate to vehicles page
    await page.goto("/vehicles");
    await expect(page).toHaveTitle(/Vehicles/);

    // Click on first vehicle
    await page.click("[data-testid='vehicle-card']:first-child");
    await expect(page).toHaveURL(/\/vehicles\//);

    // Verify vehicle details are displayed
    await expect(page.locator("h1")).toContainText(/BMW|Mercedes|Audi/);

    // Click enquire button
    await page.click("[data-testid='enquire-button']");
    await expect(page).toHaveURL(/\/contact/);

    // Fill contact form
    await page.fill("[name='firstName']", "John");
    await page.fill("[name='lastName']", "Smith");
    await page.fill("[name='email']", "john@example.com");
    await page.fill("[name='phone']", "07700123456");
    await page.fill("[name='message']", "I'm interested in this vehicle");

    // Submit form
    await page.click("[type='submit']");
    await expect(page.locator("[data-testid='success-message']")).toBeVisible();
  });
});
```

---

## 9. Summary Checklist

### Security
- [ ] Environment variables configured (.env)
- [ ] Rate limiting on all endpoints
- [ ] CSRF protection enabled
- [ ] XSS input sanitization (DOMPurify)
- [ ] Zod validation on all inputs
- [ ] Clerk.dev authentication
- [ ] bcrypt password hashing
- [ ] Helmet.js security headers
- [ ] CORS whitelist configured
- [ ] reCAPTCHA on forms
- [ ] Content Security Policy
- [ ] SQL injection prevention (parameterized queries)
- [ ] Secure cookie settings

### Performance
- [ ] Image optimization pipeline (Sharp.js)
- [ ] CDN configured (Cloudflare)
- [ ] Gzip/Brotli compression
- [ ] Database indexing
- [ ] Redis caching layer
- [ ] Code splitting
- [ ] Lazy loading images
- [ ] Bundle size optimization
- [ ] Lighthouse score 95+

### SEO
- [ ] Server-side rendering (Next.js)
- [ ] Dynamic sitemap generation
- [ ] Schema markup (5 types)
- [ ] Dynamic meta tags
- [ ] Open Graph tags
- [ ] Canonical URLs
- [ ] robots.txt
- [ ] Semantic HTML

### Infrastructure
- [ ] PostgreSQL database
- [ ] Redis cache
- [ ] Cloudinary image hosting
- [ ] Resend email service
- [ ] Sentry error tracking
- [ ] Health check endpoints
- [ ] CI/CD pipeline
- [ ] Automated backups
- [ ] SSL certificates

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** Monthly during active development
