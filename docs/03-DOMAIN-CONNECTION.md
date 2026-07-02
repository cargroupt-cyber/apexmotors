# APEX Automotive — Domain Connection Guide

**Purpose:** Step-by-step instructions for connecting a custom domain to the APEX Automotive website deployment.  
**Target Audience:** Developers, DevOps engineers, system administrators  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Pre-Connection Requirements](#1-pre-connection-requirements)
2. [Option A: Vercel Deployment (RECOMMENDED)](#2-option-a-vercel-deployment-recommended)
3. [Option B: VPS Deployment (DigitalOcean/AWS/Linode)](#3-option-b-vps-deployment)
4. [Option C: Netlify Deployment](#4-option-c-netlify-deployment)
5. [DNS Configuration Reference](#5-dns-configuration-reference)
6. [SSL Certificate Setup](#6-ssl-certificate-setup)
7. [Subdomain Configuration](#7-subdomain-configuration)
8. [Troubleshooting](#8-troubleshooting)
9. [Recommendation Summary](#9-recommendation-summary)

---

## 1. Pre-Connection Requirements

Before connecting your domain, ensure you have:

| Requirement | Details |
|-------------|---------|
| Domain name registered | e.g., `apexautomotive.co.uk` at Namecheap, GoDaddy, Google Domains, etc. |
| DNS access | Ability to modify DNS records (A, CNAME, NS records) |
| Hosting account | Active Vercel / VPS / Netlify account |
| Source code | Pushed to GitHub repository |
| SSL | Will be auto-provisioned by most modern hosts |

**Domain best practices:**
- Use `.co.uk` for UK-focused businesses (better local SEO)
- Register both `.co.uk` and `.com` versions (redirect `.com` to `.co.uk`)
- Enable domain privacy protection to hide WHOIS data
- Set auto-renewal to prevent accidental expiration

---

## 2. Option A: Vercel Deployment (RECOMMENDED)

Vercel is the recommended hosting platform for this React/Next.js application. It provides automatic deployments, SSL, CDN, and preview environments.

### Step 1: Create GitHub Repository and Push Code

```bash
# 1. Create a new repository on GitHub
# Go to https://github.com/new
# Name: apex-automotive
# Visibility: Private (recommended for client work)

# 2. Initialize git in your project directory (if not already done)
cd /path/to/apex-automotive
git init

# 3. Add all files to staging
git add .

# 4. Create initial commit
git commit -m "Initial commit: APEX Automotive website"

# 5. Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/apex-automotive.git

# 6. Push to main branch
git branch -M main
git push -u origin main

# For subsequent updates
git add .
git commit -m "Describe your changes"
git push origin main
```

### Step 2: Connect Vercel to GitHub

```
1. Go to https://vercel.com and sign up (use GitHub SSO)
2. Click "Add New..." → "Project"
3. Under "Import Git Repository", find and select "apex-automotive"
4. Click "Import"
5. Configure project settings:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./ (or apps/web if monorepo)
   - Build Command: next build (default)
   - Output Directory: .next (default)
   - Install Command: npm install (default)
6. Expand "Environment Variables" and add all from .env
7. Click "Deploy"
8. Wait 2-3 minutes for build to complete
9. Your site will be live at: https://apex-automotive-xxx.vercel.app
```

### Step 3: Configure Build Settings

```json
// vercel.json — Add to project root
{
  "version": 2,
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["lhr1"],
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
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self)"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    },
    {
      "source": "/robots.txt",
      "destination": "/api/robots"
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

### Step 4: Add Custom Domain in Vercel Dashboard

```
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select the "apex-automotive" project
3. Click "Settings" tab
4. Click "Domains" in the left sidebar
5. Enter your domain: "apexautomotive.co.uk"
6. Click "Add"
7. Vercel will detect if the domain is correctly configured
```

### Step 5: Configure DNS Records

**Option A: Vercel Nameservers (RECOMMENDED — simplest)**

```
1. In your domain registrar (Namecheap, GoDaddy, etc.), go to DNS settings
2. Change nameservers to Vercel's:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com
3. Save changes
4. Wait 24-48 hours for propagation
5. Vercel will automatically manage all DNS records
```

**Option B: Manual DNS Configuration**

```
If you prefer to keep your current nameservers:

For APEX domain (apexautomotive.co.uk):
  Record Type: A
  Name: @
  Value: 76.76.21.21
  TTL: 600

For WWW subdomain (www.apexautomotive.co.uk):
  Record Type: CNAME
  Name: www
  Value: cname.vercel-dns.com
  TTL: 600

For Admin subdomain (admin.apexautomotive.co.uk):
  Record Type: CNAME
  Name: admin
  Value: cname.vercel-dns.com
  TTL: 600
```

**DNS Record Summary Table:**

| Type | Host | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | @ | 76.76.21.21 | 600 | Root domain → Vercel |
| CNAME | www | cname.vercel-dns.com | 600 | WWW redirect |
| CNAME | admin | cname.vercel-dns.com | 600 | Admin panel |
| TXT | @ | v=spf1 include:_spf.google.com ~all | 600 | Email SPF |
| MX | @ | aspmx.l.google.com (priority 1) | 600 | Email routing |

### Step 6: SSL Certificate (Automatic)

```
Vercel automatically provisions SSL certificates via Let's Encrypt.

1. After DNS propagation, Vercel detects your domain
2. SSL certificate is auto-generated (usually within minutes)
3. HTTPS is automatically enabled
4. HTTP → HTTPS redirect is automatic
5. Certificate auto-renews before expiry

To verify:
- Visit https://apexautomotive.co.uk
- Click the lock icon in browser
- Certificate should show: "Let's Encrypt" issued to your domain
```

### Step 7: Configure Environment Variables in Vercel

```
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from your .env file:

   DATABASE_URL = postgresql://...
   CLERK_SECRET_KEY = sk_...
   CLERK_PUBLISHABLE_KEY = pk_...
   CLOUDINARY_CLOUD_NAME = ...
   CLOUDINARY_API_KEY = ...
   CLOUDINARY_API_SECRET = ...
   RESEND_API_KEY = re_...
   REDIS_URL = redis://...
   GOOGLE_ANALYTICS_ID = G-...
   SENTRY_DSN = https://...

3. Select environments: Production, Preview, Development (as appropriate)
4. Click "Save"
5. Redeploy: Go to Deployments tab → Click the three dots on latest → "Redeploy"
```

---

## 3. Option B: VPS Deployment

For full control over the server environment, deploy on a VPS (Virtual Private Server).

### Recommended VPS Providers

| Provider | Plan | Price/Month | Specs |
|----------|------|-------------|-------|
| DigitalOcean | Droplet Basic | $12 | 2GB RAM, 1 vCPU, 50GB SSD |
| Hetzner | CPX11 | EUR 5.35 | 4GB RAM, 2 vCPU, 40GB SSD |
| Linode | Nanode 1GB | $5 | 1GB RAM, 1 vCPU, 25GB SSD |
| AWS Lightsail | 2GB | $10 | 2GB RAM, 1 vCPU, 60GB SSD |

### Step 1: Ubuntu 22.04 Server Setup

```bash
# 1. Create a new VPS instance (DigitalOcean example)
# - Choose Ubuntu 22.04 LTS
# - Select region closest to your audience (London for UK)
# - Add SSH key for authentication
# - Create droplet

# 2. SSH into your server
ssh root@YOUR_SERVER_IP

# 3. Create a new user (don't use root for daily operations)
adduser apexuser
usermod -aG sudo apexuser

# 4. Set up SSH key authentication for new user
mkdir -p /home/apexuser/.ssh
cp /root/.ssh/authorized_keys /home/apexuser/.ssh/
chown -R apexuser:apexuser /home/apexuser/.ssh
chmod 700 /home/apexuser/.ssh
chmod 600 /home/apexuser/.ssh/authorized_keys

# 5. Secure SSH configuration
nano /etc/ssh/sshd_config
# Set these values:
#   PermitRootLogin no
#   PasswordAuthentication no
#   PubkeyAuthentication yes
#   MaxAuthTries 3

# 6. Restart SSH
systemctl restart sshd

# 7. Install essential packages
apt update && apt upgrade -y
apt install -y curl git build-essential nginx python3-certbot-nginx

# 8. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version  # Should show v20.x.x
npm --version

# 9. Install PM2 process manager
npm install -g pm2

# 10. Install PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# 11. Install Redis
apt install -y redis-server
systemctl enable redis
systemctl start redis

# 12. Configure timezone
timedatectl set-timezone Europe/London
```

### Step 2: Nginx Installation and Configuration

```bash
# 1. Install Nginx (if not already installed)
apt install -y nginx

# 2. Remove default site
rm /etc/nginx/sites-enabled/default

# 3. Create Nginx configuration for APEX
nano /etc/nginx/sites-available/apexautomotive
```

```nginx
# /etc/nginx/sites-available/apexautomotive
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name apexautomotive.co.uk www.apexautomotive.co.uk;
    return 301 https://$server_name$request_uri;
}

# Main website
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name apexautomotive.co.uk www.apexautomotive.co.uk;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/apexautomotive.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apexautomotive.co.uk/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/apexautomotive.co.uk/chain.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Brotli compression (if available)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Static assets — serve directly with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$ {
        root /var/www/apex-automotive/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Main app — proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Upload size limit
    client_max_body_size 50M;
}
```

```bash
# 4. Enable the site
ln -s /etc/nginx/sites-available/apexautomotive /etc/nginx/sites-enabled/

# 5. Test Nginx configuration
nginx -t

# 6. Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

### Step 3: SSL with Let's Encrypt (Certbot)

```bash
# 1. Install Certbot
apt install -y certbot python3-certbot-nginx

# 2. Obtain certificate
# Make sure DNS A record points to your server IP first!
certbot --nginx -d apexautomotive.co.uk -d www.apexautomotive.co.uk

# 3. Follow prompts:
#   - Enter email for renewal notices
#   - Agree to terms
#   - Choose redirect option (Yes — redirect HTTP to HTTPS)

# 4. Verify auto-renewal
certbot renew --dry-run

# 5. Certbot auto-renewal is set up via systemd timer
# Verify it's active:
systemctl status certbot.timer
```

### Step 4: PM2 Process Manager Setup

```bash
# 1. Switch to your application user
su - apexuser

# 2. Clone the repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/apex-automotive.git
cd apex-automotive

# 3. Install dependencies
npm install

# 4. Build the application
npm run build

# 5. Create ecosystem.config.js for PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'apex-automotive',
    script: './dist/server/index.js',
    instances: 'max',        // Use all CPU cores
    exec_mode: 'cluster',    // Cluster mode for load balancing
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s',
    watch: false,
    kill_timeout: 5000,
    listen_timeout: 10000,
  }],
};
EOF

# 6. Create logs directory
mkdir -p logs

# 7. Start with PM2
pm2 start ecosystem.config.js --env production

# 8. Save PM2 config
pm2 save

# 9. Set up PM2 startup script
pm2 startup systemd
# Run the command that PM2 outputs

# 10. Check status
pm2 status
pm2 logs apex-automotive

# Useful PM2 commands:
pm2 restart apex-automotive     # Restart
pm2 reload apex-automotive      # Zero-downtime reload
pm2 stop apex-automotive        # Stop
pm2 delete apex-automotive      # Remove
pm2 monit                       # Monitor
```

### Step 5: Git-Based Deployment Workflow

```bash
# On your local machine, create a deploy script
# scripts/deploy.sh

#!/bin/bash
set -e

echo "Starting deployment..."

# 1. Run tests
npm run test

# 2. Build locally
npm run build

# 3. Push to main
git add .
git commit -m "Deploy: $(date)" || true
git push origin main

# 4. SSH into server and pull
ssh apexuser@YOUR_SERVER_IP << 'REMOTESCRIPT'
  cd /var/www/apex-automotive
  git pull origin main
  npm install --production
  npm run build
  pm2 reload apex-automotive
REMOTESCRIPT

echo "Deployment complete!"
```

```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### Step 6: Firewall Configuration (UFW)

```bash
# As root user
# 1. Enable UFW
ufw default deny incoming
ufw default allow outgoing

# 2. Allow SSH (be careful — don't lock yourself out!)
ufw allow ssh
# Or specify port: ufw allow 22/tcp

# 3. Allow HTTP and HTTPS
ufw allow 'Nginx Full'

# 4. Allow your API port (only from localhost — Nginx proxies)
# ufw allow from 127.0.0.1 to any port 3000

# 5. Enable firewall
ufw enable

# 6. Check status
ufw status verbose

# Expected output:
# Status: active
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# Nginx Full                 ALLOW       Anywhere
# 22/tcp (v6)                ALLOW       Anywhere (v6)
# Nginx Full (v6)            ALLOW       Anywhere (v6)
```

### Step 7: Automatic Updates

```bash
# 1. Install unattended-upgrades
apt install -y unattended-upgrades

# 2. Configure
nano /etc/apt/apt.conf.d/50unattended-upgrades

# Uncomment and modify these lines:
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::InstallOnShutdown "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";

# 3. Enable automatic updates
nano /etc/apt/apt.conf.d/20auto-upgrades

APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";

# 4. Restart service
systemctl restart unattended-upgrades

# 5. Verify
unattended-upgrades --dry-run --debug
```

---

## 4. Option C: Netlify Deployment

```bash
# 1. Create netlify.toml at project root
cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
EOF

# 2. Connect Netlify to GitHub
# - Go to https://app.netlify.com
# - Click "Add new site" → "Import an existing project"
# - Select GitHub, authorize, choose repository
# - Build settings auto-detected from netlify.toml
# - Add environment variables in Site Settings
# - Click "Deploy site"

# 3. Add custom domain
# - Site Settings → Domain Management → Add custom domain
# - Enter: apexautomotive.co.uk
# - Follow DNS instructions provided by Netlify
# - Netlify will auto-provision SSL via Let's Encrypt
```

---

## 5. DNS Configuration Reference

### Complete DNS Record Set

| Type | Host | Value | TTL | Priority | Notes |
|------|------|-------|-----|----------|-------|
| A | @ | 76.76.21.21 | 600 | — | Vercel apex |
| CNAME | www | cname.vercel-dns.com | 600 | — | WWW redirect |
| CNAME | admin | cname.vercel-dns.com | 600 | — | Admin panel |
| CNAME | api | api-server-ip | 600 | — | API subdomain |
| TXT | @ | v=spf1 include:_spf.google.com ~all | 600 | — | Email SPF |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:dmarc@apexautomotive.co.uk | 600 | — | DMARC policy |
| MX | @ | aspmx.l.google.com | 600 | 1 | Google Workspace |
| MX | @ | alt1.aspmx.l.google.com | 600 | 5 | Backup |
| MX | @ | alt2.aspmx.l.google.com | 600 | 5 | Backup |
| TXT | @ | google-site-verification=XXXXX | 600 | — | Google Search Console |

### DNS Propagation Check

```bash
# Check A record
dig apexautomotive.co.uk A +short

# Check CNAME
dig www.apexautomotive.co.uk CNAME +short

# Check all records
dig apexautomotive.co.uk ANY

# Check using Google DNS
dig @8.8.8.8 apexautomotive.co.uk A

# Online tools:
# https://dnschecker.org
# https://whatsmydns.net
```

---

## 6. SSL Certificate Setup

### For Vercel (Automatic)

```
No action required. Vercel automatically:
- Provisions certificates via Let's Encrypt
- Renews before expiry
- Handles HTTP → HTTPS redirect
- Supports TLS 1.2 and 1.3
```

### For VPS (Manual with Certbot)

```bash
# Already covered in Section 3, Step 3
# Quick reference:

# Renew manually (usually auto-renews)
certbot renew

# Force renew
certbot renew --force-renewal

# View certificate info
openssl x509 -in /etc/letsencrypt/live/apexautomotive.co.uk/cert.pem -text -noout

# Check expiry date
echo | openssl s_client -servername apexautomotive.co.uk -connect apexautomotive.co.uk:443 2>/dev/null | openssl x509 -noout -dates
```

### SSL Test Tools

| Tool | URL | What It Checks |
|------|-----|----------------|
| SSL Labs | https://ssllabs.com/ssltest | Grade A+ certification |
| Security Headers | https://securityheaders.com | Security headers analysis |
| Mozilla Observatory | https://observatory.mozilla.org | Comprehensive security scan |

---

## 7. Subdomain Configuration

### Common Subdomain Setup

| Subdomain | Purpose | Hosting |
|-----------|---------|---------|
| `apexautomotive.co.uk` | Main website | Vercel |
| `www.apexautomotive.co.uk` | Redirect to apex | Vercel |
| `admin.apexautomotive.co.uk` | Admin dashboard | Vercel |
| `api.apexautomotive.co.uk` | Backend API | VPS / Railway |
| `cdn.apexautomotive.co.uk` | CDN assets | Cloudflare |
| `staging.apexautomotive.co.uk` | Staging environment | Vercel |

### Nginx Subdomain Configuration (VPS)

```nginx
# /etc/nginx/sites-available/api.apexautomotive
server {
    listen 443 ssl http2;
    server_name api.apexautomotive.co.uk;

    ssl_certificate /etc/letsencrypt/live/api.apexautomotive.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.apexautomotive.co.uk/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 8. Troubleshooting

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Domain not found" | DNS not propagated | Wait 24-48 hours; check with `dig` |
| "ERR_SSL_PROTOCOL_ERROR" | SSL not provisioned | Verify DNS; check Certbot logs |
| "502 Bad Gateway" | Backend not running | Check PM2: `pm2 status`; check logs |
| "404 on refresh" | SPA routing | Verify catch-all redirect in config |
| "CORS errors" | CORS misconfigured | Check `Access-Control-Allow-Origin` header |
| "Images not loading" | Wrong asset path | Check base URL in build config |
| "Build fails on Vercel" | Node version mismatch | Set `NODE_VERSION` env var to 20 |
| "API timeout" | Slow queries | Add database indexes; enable Redis cache |

### Diagnostic Commands

```bash
# Check DNS propagation
dig +trace apexautomotive.co.uk

# Check SSL certificate
curl -vI https://apexautomotive.co.uk 2>&1 | grep -E "(subject|issuer|SSL)"

# Test website response time
curl -o /dev/null -s -w "%{time_total}s\n" https://apexautomotive.co.uk

# Check server logs
pm2 logs apex-automotive --lines 100

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

---

## 9. Recommendation Summary

### Recommended Architecture: Hybrid Approach

```
                    Internet
                       |
                Cloudflare DNS + CDN
                       |
        +--------------+--------------+
        |                             |
   apexautomotive.co.uk       api.apexautomotive.co.uk
        |                             |
      Vercel                     VPS / Railway
   (Next.js Frontend)         (Node.js API)
        |                             |
   Static Files              PostgreSQL + Redis
   Edge Network              (Database + Cache)
        |
   Cloudinary
   (Image Storage)
```

### Why This Architecture?

| Layer | Choice | Reason |
|-------|--------|--------|
| **Frontend** | Vercel | Automatic deployments, edge CDN, SSR, preview deployments |
| **Backend** | VPS/Railway | Full control, cost-effective, predictable pricing |
| **Database** | PostgreSQL | ACID compliance, JSON support, full-text search |
| **Cache** | Redis | Fast session storage, API response caching |
| **Images** | Cloudinary | Auto-optimization, CDN delivery, transformations |
| **DNS** | Cloudflare | DDoS protection, DNS speed, analytics |

### Cost Estimate (Monthly)

| Service | Provider | Estimated Cost |
|---------|----------|---------------|
| Domain | Namecheap | GBP 10-15/year |
| Frontend hosting | Vercel Pro | $20/month |
| VPS (API) | Hetzner | EUR 5-10/month |
| Database | Supabase / Self-hosted | $0-25/month |
| Redis | Upstash / Self-hosted | $0-10/month |
| Images | Cloudinary | $0-25/month |
| Email | Resend | $0-20/month |
| DNS/CDN | Cloudflare | Free tier |
| Monitoring | Sentry | $0-26/month |
| **Total** | | **~$50-150/month** |

---

**Document Version:** 1.0  
**Last Updated:** January 2025
