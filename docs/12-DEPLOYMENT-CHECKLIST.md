# APEX Automotive — Deployment Checklist

**Purpose:** Complete pre-deployment, deployment, and post-deployment verification checklist.  
**Audience:** Developers, DevOps engineers, project managers  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Security Checklist](#2-security-checklist)
3. [SEO Checklist](#3-seo-checklist)
4. [Performance Checklist](#4-performance-checklist)
5. [Database Checklist](#5-database-checklist)
6. [Infrastructure Checklist](#6-infrastructure-checklist)
7. [Post-Deployment Verification](#7-post-deployment-verification)
8. [Go-Live Sign-Off](#8-go-live-sign-off)

---

## 1. Pre-Deployment Checklist

### 1.1 Code & Repository

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | All code committed to Git | [ ] | Every file tracked and committed |
| 2 | No uncommitted changes | [ ] | Run `git status` to verify |
| 3 | Code review completed | [ ] | All PRs merged and approved |
| 4 | Branch is `main` (or `production`) | [ ] | Deploy from correct branch |
| 5 | Git tags created for version | [ ] | Tag format: `v1.0.0` |
| 6 | README.md is up to date | [ ] | Installation and setup instructions |
| 7 | CHANGELOG.md updated | [ ] | List all changes for this release |
| 8 | `.gitignore` properly configured | [ ] | No secrets or build files committed |

### 1.2 Environment Variables

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9 | `.env.example` file is complete | [ ] | All required variables documented |
| 10 | Production `.env` configured | [ ] | Real values, not placeholders |
| 11 | No secrets in source code | [ ] | Search for `password`, `secret`, `key` |
| 12 | API keys are production-ready | [ ] | Using production endpoints, not sandbox |
| 13 | Database URL points to production DB | [ ] | Verify connection string |
| 14 | Cloudinary account is production | [ ] | Not using development cloud name |
| 15 | Clerk.dev keys are production | [ ] | Using `pk_live_` not `pk_test_` |

### 1.3 Database

| # | Task | Status | Notes |
|---|------|--------|-------|
| 16 | Database migrations created | [ ] | All schema changes in migration files |
| 17 | Migrations tested on staging | [ ] | Run `drizzle-kit push` successfully |
| 18 | Seed data prepared | [ ] | Admin user, settings, categories |
| 19 | Database indexes created | [ ] | Performance indexes applied |
| 20 | Database connection verified | [ ] | Can connect from production server |
| 21 | Migration rollback tested | [ ] | Know how to undo if needed |

### 1.4 SSL Certificates

| # | Task | Status | Notes |
|---|------|--------|-------|
| 22 | Domain DNS configured | [ ] | A record and CNAME set correctly |
| 23 | SSL certificate obtained | [ ] | Let's Encrypt or purchased cert |
| 24 | HTTPS redirect configured | [ ] | HTTP → HTTPS auto-redirect |
| 25 | Certificate auto-renewal set up | [ ] | Certbot timer/cron job active |
| 26 | SSL test passes (A+ rating) | [ ] | Test at ssllabs.com |

### 1.5 Analytics & Monitoring

| # | Task | Status | Notes |
|---|------|--------|-------|
| 27 | Google Analytics 4 configured | [ ] | Measurement ID installed |
| 28 | Google Search Console verified | [ ] | Domain ownership verified |
| 29 | Sitemap submitted to Google | [ ] | Via Search Console or robots.txt |
| 30 | Error tracking configured (Sentry) | [ ] | DSN configured in production |
| 31 | Uptime monitoring set up | [ ] | Pingdom, UptimeRobot, or similar |

---

## 2. Security Checklist

### 2.1 Authentication & Authorization

| # | Task | Status | Notes |
|---|------|--------|-------|
| 32 | Authentication system implemented | [ ] | Clerk.dev or equivalent |
| 33 | Admin routes protected | [ ] | Cannot access `/admin` without login |
| 34 | Role-based access control active | [ ] | RBAC enforced on all routes |
| 35 | Password policy enforced | [ ] | Minimum 12 characters, complexity rules |
| 36 | Session timeout configured | [ ] | 24-hour idle timeout |
| 37 | Brute force protection enabled | [ ] | Account lockout after failed attempts |

### 2.2 Data Protection

| # | Task | Status | Notes |
|---|------|--------|-------|
| 38 | HTTPS enforced everywhere | [ ] | No mixed content warnings |
| 39 | Security headers configured | [ ] | HSTS, X-Frame-Options, CSP, etc. |
| 40 | Rate limiting enabled | [ ] | Form submissions limited |
| 41 | CSRF protection active | [ ] | Tokens on all forms |
| 42 | XSS protection enabled | [ ] | Input sanitization on all user inputs |
| 43 | SQL injection prevention | [ ] | Parameterized queries only |
| 44 | reCAPTCHA on public forms | [ ] | v3 invisible on contact, lead forms |

### 2.3 Infrastructure Security

| # | Task | Status | Notes |
|---|------|--------|-------|
| 45 | Firewall configured (UFW) | [ ] | Only necessary ports open |
| 46 | SSH key authentication only | [ ] | Password auth disabled |
| 47 | Root login disabled | [ ] | Use sudo user only |
| 48 | Automatic security updates | [ ] | unattended-upgrades configured |
| 49 | Server timezone set correctly | [ ] | `timedatectl` shows correct TZ |
| 50 | Backup system operational | [ ] | Daily backups verified |

---

## 3. SEO Checklist

### 3.1 Technical SEO

| # | Task | Status | Notes |
|---|------|--------|-------|
| 51 | Sitemap.xml accessible | [ ] | `https://apexautomotive.co.uk/sitemap.xml` |
| 52 | Robots.txt configured | [ ] | Allows search engines, blocks admin |
| 53 | Canonical URLs set | [ ] | Every page has canonical link |
| 54 | Schema markup validated | [ ] | Test with Google Rich Results Tool |
| 55 | Open Graph tags on all pages | [ ] | Facebook sharing preview works |
| 56 | Twitter Cards configured | [ ] | Twitter sharing preview works |
| 57 | Page titles are unique | [ ] | No duplicate titles across pages |
| 58 | Meta descriptions on all pages | [ ] | 150-160 characters each |

### 3.2 Content SEO

| # | Task | Status | Notes |
|---|------|--------|-------|
| 59 | Semantic HTML structure | [ ] | Proper H1-H6 hierarchy |
| 60 | Alt text on all images | [ ] | Descriptive alt attributes |
| 61 | Internal linking structure | [ ] | Related vehicles linked |
| 62 | Breadcrumb navigation | [ ] | Schema markup + visible breadcrumbs |
| 63 | URL structure is clean | [ ] | `/vehicles/bmw-3-series` not `/v?id=123` |
| 64 | 404 page is custom | [ ] | Branded 404 with navigation |
| 65 | No broken links | [ ] | Test with link checker tool |

### 3.3 Performance SEO

| # | Task | Status | Notes |
|---|------|--------|-------|
| 66 | Page load time < 3 seconds | [ ] | Test with PageSpeed Insights |
| 67 | Mobile-friendly design | [ ] | Passes Google Mobile-Friendly Test |
| 68 | Core Web Vitals passing | [ ] | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| 69 | Lazy loading on images | [ ] | Below-fold images load on scroll |
| 70 | Responsive images | [ ] | Correct sizes for each viewport |

---

## 4. Performance Checklist

### 4.1 Frontend Optimization

| # | Task | Status | Notes |
|---|------|--------|-------|
| 71 | Code splitting implemented | [ ] | Route-based lazy loading |
| 72 | Bundle size < 2MB (initial) | [ ] | Check with `npm run build:analyze` |
| 73 | Unused code removed | [ ] | Tree-shaking enabled |
| 74 | Fonts optimized | [ ] | `font-display: swap`, subset fonts |
| 75 | Critical CSS inlined | [ ] ] Above-the-fold styles inlined |

### 4.2 Asset Optimization

| # | Task | Status | Notes |
|---|------|--------|-------|
| 76 | Images optimized | [ ] | Cloudinary auto-optimization active |
| 77 | WebP/AVIF delivery | [ ] | Modern formats for modern browsers |
| 78 | Gzip/Brotli compression | [ ] | Enabled on server |
| 79 | CDN configured | [ ] | Cloudflare or Cloudinary CDN active |
| 80 | Browser caching set | [ ] ] Static assets cached for 1 year |
| 81 | Service worker (optional) | [ ] | Offline caching if implemented |

### 4.3 Backend Optimization

| # | Task | Status | Notes |
|---|------|--------|-------|
| 82 | Database indexes applied | [ ] | All query patterns indexed |
| 83 | API response caching | [ ] ] Redis caching for common queries |
| 84 | Connection pooling | [ ] | PostgreSQL pool configured |
| 85 | Rate limiting active | [ ] | Prevents API abuse |

### 4.4 Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Lighthouse Performance | 90+ | | [ ] |
| Lighthouse Accessibility | 95+ | | [ ] |
| Lighthouse Best Practices | 100 | | [ ] |
| Lighthouse SEO | 100 | | [ ] |
| First Contentful Paint | < 1.8s | | [ ] |
| Largest Contentful Paint | < 2.5s | | [ ] |
| Time to Interactive | < 3.8s | | [ ] |
| Cumulative Layout Shift | < 0.1 | | [ ] |

---

## 5. Database Checklist

| # | Task | Status | Notes |
|---|------|--------|-------|
| 86 | PostgreSQL installed | [ ] | Version 16+ |
| 87 | Database created | [ ] | `apex_automotive` database |
| 88 | Migrations run successfully | [ ] ] All tables created |
| 89 | Indexes created | [ ] | Performance indexes applied |
| 90 | Triggers installed | [ ] | Auto-timestamps, audit log |
| 91 | Admin user seeded | [ ] | Can log in immediately |
| 92 | Settings seeded | [ ] | Business info, hours, contact |
| 93 | Blog categories seeded | [ ] | Default categories created |
| 94 | Connection pool configured | [ ] | Max 20 connections |
| 95 | Backup user created | [ ] | Limited permissions for backups |
| 96 | WAL archiving enabled | [ ] | For point-in-time recovery |

---

## 6. Infrastructure Checklist

### 6.1 Server Setup

| # | Task | Status | Notes |
|---|------|--------|-------|
| 97 | Server provisioned | [ ] | Ubuntu 22.04 LTS |
| 98 | System packages updated | [ ] | `apt update && apt upgrade` |
| 99 | Node.js 20 installed | [ ] | LTS version |
| 100 | PM2 installed | [ ] | Process manager |
| 101 | Nginx installed | [ ] | Reverse proxy |
| 102 | PostgreSQL 16 installed | [ ] | Database server |
| 103 | Redis installed | [ ] | Cache server |
| 104 | Application deployed | [ ] ] Code on server, built |
| 105 | PM2 started | [ ] | `pm2 start ecosystem.config.js` |
| 106 | PM2 startup script set | [ ] | `pm2 startup systemd` |
| 107 | Nginx configured | [ ] | Site config active |
| 108 | Nginx restarted | [ ] | `systemctl restart nginx` |

### 6.2 Domain & SSL

| # | Task | Status | Notes |
|---|------|--------|-------|
| 109 | Domain registered | [ ] | `apexautomotive.co.uk` |
| 110 | DNS A record set | [ ] | Points to server IP |
| 111 | DNS CNAME for www | [ ] | `www` → apex |
| 112 | SSL certificate installed | [ ] | Let's Encrypt |
| 113 | HTTPS redirect works | [ ] | HTTP → HTTPS |
| 114 | Certificate auto-renewal | [ ] | Certbot timer active |

### 6.3 Third-Party Services

| # | Service | Status | Notes |
|---|---------|--------|-------|
| 115 | Cloudinary | [ ] | Account created, API keys configured |
| 116 | Clerk.dev | [ ] | Production keys, users configured |
| 117 | Resend (Email) | [ ] | Domain verified, API key configured |
| 118 | Google Analytics | [ ] | GA4 property created, ID in code |
| 119 | Google Search Console | [ ] | Domain verified |
| 120 | Sentry (Error Tracking) | [ ] ] DSN configured |
| 121 | reCAPTCHA | [ ] | Keys configured on forms |

---

## 7. Post-Deployment Verification

### 7.1 Functionality Testing

| # | Test | Expected Result | Status |
|---|------|----------------|--------|
| 122 | Homepage loads | < 3 seconds, no errors | [ ] |
| 123 | Vehicle listing page | Shows all available vehicles | [ ] |
| 124 | Vehicle detail page | Full details, images, specs visible | [ ] |
| 125 | Contact form submits | Success message, email sent | [ ] |
| 126 | Sell My Car form submits | Success message, lead created | [ ] |
| 127 | Test Drive booking | Calendar shows, booking confirmed | [ ] |
| 128 | Finance application | Form submits, lead created | [ ] |
| 129 | Blog page loads | Posts visible, pagination works | [ ] |
| 130 | Blog post page | Full article, images load | [ ] |
| 131 | About page loads | Content visible | [ ] |
| 132 | Search functionality | Returns relevant results | [ ] |
| 133 | Filter functionality | Filters apply correctly | [ ] |

### 7.2 Admin Panel Testing

| # | Test | Expected Result | Status |
|---|------|----------------|--------|
| 134 | Admin login works | Dashboard loads after login | [ ] |
| 135 | Vehicle CRUD | Create, read, update, delete vehicles | [ ] |
| 136 | Image upload | Images upload and display | [ ] |
| 137 | Lead management | View, update, assign leads | [ ] |
| 138 | Status updates | Pipeline changes save correctly | [ ] |
| 139 | Analytics page | Charts and data load | [ ] |
| 140 | Settings page | Save and retrieve settings | [ ] |
| 141 | User management | Add, edit, deactivate users | [ ] |
| 142 | Logout works | Session cleared, redirect to login | [ ] |

### 7.3 Mobile Testing

| # | Test | Device/Browser | Status |
|---|------|---------------|--------|
| 143 | Homepage responsive | iPhone Safari | [ ] |
| 144 | Vehicle pages responsive | iPhone Safari | [ ] |
| 145 | Forms work on mobile | iPhone Safari | [ ] |
| 146 | Navigation works | Android Chrome | [ ] |
| 147 | Images load correctly | iPad Safari | [ ] |
| 148 | Touch interactions work | Android Chrome | [ ] |

### 7.4 Cross-Browser Testing

| # | Test | Browser | Status |
|---|------|---------|--------|
| 149 | All pages load | Chrome 120+ | [ ] |
| 150 | All pages load | Firefox 120+ | [ ] |
| 151 | All pages load | Safari 17+ | [ ] |
| 152 | All pages load | Edge 120+ | [ ] |
| 153 | Animations work | Chrome | [ ] |
| 154 | Forms submit | All browsers | [ ] |

### 7.5 Security Testing

| # | Test | Expected Result | Status |
|---|------|----------------|--------|
| 155 | Admin without login | Redirects to login | [ ] |
| 156 | Invalid credentials | Shows error, no access | [ ] |
| 157 | XSS attempt blocked | Script not executed | [ ] |
| 158 | SQL injection blocked | Query sanitized | [ ] |
| 159 | Rate limit works | Blocks after threshold | [ ] |
| 160 | HTTPS enforced | No HTTP access | [ ] |
| 161 | Security headers present | Check with securityheaders.com | [ ] |

---

## 8. Go-Live Sign-Off

### Final Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Project Manager** | | | |
| **Lead Developer** | | | |
| **QA Engineer** | | | |
| **Security Reviewer** | | | |
| **Client Representative** | | | |

### Deployment Summary

| Item | Detail |
|------|--------|
| **Deployment Date** | |
| **Version Deployed** | |
| **Environment** | Production |
| **Server** | |
| **Domain** | https://apexautomotive.co.uk |
| **Database** | PostgreSQL 16 |
| **SSL Certificate** | Let's Encrypt |
| **CDN** | Cloudflare |
| **Image Storage** | Cloudinary |

### Known Issues

| # | Issue | Severity | Workaround | Planned Fix |
|---|-------|----------|------------|-------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### Post-Launch Monitoring Plan

| Timeframe | Action | Owner |
|-----------|--------|-------|
| Hour 1 | Monitor error logs, check all pages | DevOps |
| Hour 4 | Verify lead forms working, check analytics | QA |
| Day 1 | Review Sentry errors, check performance | Dev |
| Day 3 | Check Search Console for crawl errors | SEO |
| Day 7 | Weekly performance review | PM |
| Day 14 | Full system health check | DevOps |
| Day 30 | Monthly review and optimization | Team |

### Rollback Plan

If critical issues are discovered:

1. **Immediate:** Switch DNS to maintenance page
2. **Database:** Restore from last known good backup
3. **Code:** Revert to previous Git tag: `git checkout v0.9.0`
4. **Images:** Restore from S3 backup if needed
5. **Communication:** Notify stakeholders of issue and ETA

**Rollback time estimate:** 30-60 minutes

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Deployment Date:** ___/___/______
