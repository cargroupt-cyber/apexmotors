# APEX Automotive — PostgreSQL Database Schema

**Purpose:** Complete database schema definition for the APEX Automotive platform.  
**Database:** PostgreSQL 16+  
**ORM:** Drizzle ORM (TypeScript-first)  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Schema Overview](#1-schema-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Table Definitions](#3-table-definitions)
4. [Indexes](#4-indexes)
5. [Triggers & Functions](#5-triggers--functions)
6. [Sample Data](#6-sample-data)
7. [Migration Strategy](#7-migration-strategy)
8. [Drizzle ORM Implementation](#8-drizzle-orm-implementation)

---

## 1. Schema Overview

The APEX Automotive database consists of 10 core tables designed to support a full-featured car dealership management system. The schema follows PostgreSQL best practices with proper data types, constraints, indexes, and foreign key relationships.

| # | Table | Purpose | Estimated Rows |
|---|-------|---------|---------------|
| 1 | `users` | Staff and admin accounts | 10-50 |
| 2 | `vehicles` | Vehicle inventory | 100-10,000 |
| 3 | `vehicle_images` | Vehicle photo gallery | 500-100,000 |
| 4 | `leads` | Customer enquiries (CRM) | 1,000-100,000 |
| 5 | `test_drive_bookings` | Test drive appointments | 500-50,000 |
| 6 | `finance_applications` | Finance enquiries | 500-50,000 |
| 7 | `blog_posts` | Blog articles | 10-1,000 |
| 8 | `blog_categories` | Blog categorization | 5-20 |
| 9 | `activity_log` | Audit trail | 10,000-1M |
| 10 | `settings` | System configuration | 20-100 |

---

## 2. Entity Relationship Diagram

```
+------------------+       +-----------------------+
|     users        |       |      vehicles         |
+------------------+       +-----------------------+
| id (PK)          |<-----+| id (PK)               |
| email            |       | make                  |
| password_hash    |       | model                 |
| first_name       |       | year                  |
| last_name        |       | price                 |
| role             |       | status                |
| is_active        |       | is_featured           |
| created_at       |       | created_by (FK->users)|
+------------------+       +-----------------------+
         |                            |
         |                    +-------+-------+
         |                    |               |
         |            +-------+------+ +------+-----------+
         |            |vehicle_images| |   leads          |
         |            +--------------+ +------------------+
         |            | id (PK)      | | id (PK)          |
         |            | vehicle_id   | | type             |
         |            | image_url    | | first_name       |
         |            | is_primary   | | last_name        |
         |            +--------------+ | email            |
         |                             | phone            |
         |                             | vehicle_id (FK)  |
         |                             | status           |
         |                             | assigned_to (FK) |
         |                             +------------------+
         |                                      |
         |                    +-----------------+------------------+
         |                    |                                    |
         |           +--------+-----------+         +-------------+---------+
         |           |test_drive_bookings |         |finance_applications  |
         |           +--------------------+         +-----------------------+
         |           | id (PK)            |         | id (PK)               |
         |           | lead_id (FK)       |         | lead_id (FK)          |
         |           | vehicle_id (FK)    |         | vehicle_id (FK)       |
         |           | booking_date       |         | amount                |
         |           | status             |         | status                |
         |           +--------------------+         +-----------------------+
         |
         |           +--------------------+
         +---------->|   activity_log     |
                     +--------------------+
                     | id (PK)            |
                     | user_id (FK)       |
                     | action             |
                     | entity_type        |
                     | entity_id          |
                     | details            |
                     +--------------------+

+------------------+       +--------------------+
| blog_categories  |       |   blog_posts       |
+------------------+       +--------------------+
| id (PK)          |<-----+| id (PK)            |
| name             |       | category_id (FK)   |
| slug             |       | title              |
| description      |       | slug               |
+------------------+       | author_id (FK->users)
                           | status             |
                           | published_at       |
                           +--------------------+

+------------------+
|    settings      |
+------------------+
| id (PK)          |
| key              |
| value            |
| group            |
+------------------+
```

---

## 3. Table Definitions

### 3.1 Users Table

Stores staff and administrator accounts for the admin dashboard.

```sql
-- ============================================================
-- Table: users
-- Purpose: Staff and admin authentication
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'staff'
                        CHECK (role IN ('super_admin', 'admin', 'staff', 'sales', 'marketing')),
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE users IS 'Staff and administrator accounts for the admin dashboard';
COMMENT ON COLUMN users.role IS 'Role hierarchy: super_admin > admin > staff > sales > marketing';
COMMENT ON COLUMN users.is_active IS 'Soft delete flag — inactive users cannot log in';
```

### 3.2 Vehicles Table

Core inventory table storing all vehicle information.

```sql
-- ============================================================
-- Table: vehicles
-- Purpose: Vehicle inventory — the central entity of the system
-- ============================================================
CREATE TABLE vehicles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Vehicle identification
    make                    VARCHAR(50) NOT NULL,
    model                   VARCHAR(50) NOT NULL,
    year                    INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    variant                 VARCHAR(100),

    -- Specifications
    body_type               VARCHAR(30) NOT NULL
                                CHECK (body_type IN ('saloon', 'hatchback', 'estate', 'suv', 'coupe', 'convertible', 'mpv', 'pickup', 'van')),
    fuel_type               VARCHAR(20) NOT NULL
                                CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
    transmission            VARCHAR(20) NOT NULL
                                CHECK (transmission IN ('manual', 'automatic')),
    engine_size             VARCHAR(20),
    doors                   INTEGER CHECK (doors BETWEEN 2 AND 6),
    seats                   INTEGER CHECK (seats BETWEEN 1 AND 9),
    colour                  VARCHAR(30) NOT NULL,
    registration            VARCHAR(20) UNIQUE,
    mileage                 INTEGER NOT NULL CHECK (mileage >= 0),
    condition_description   TEXT,

    -- Pricing
    price                   DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    finance_price           DECIMAL(10, 2),
    monthly_payment         DECIMAL(8, 2),
    apr                     DECIMAL(5, 2) CHECK (apr >= 0 AND apr <= 100),
    deposit                 DECIMAL(10, 2),

    -- Features & description
    features                JSONB DEFAULT '[]'::jsonb,
    description             TEXT,

    -- SEO fields
    meta_title              VARCHAR(70),
    meta_description        VARCHAR(160),

    -- Status & visibility
    status                  VARCHAR(20) NOT NULL DEFAULT 'available'
                                CHECK (status IN ('available', 'reserved', 'sold', 'coming_soon', 'in_preparation')),
    is_featured             BOOLEAN NOT NULL DEFAULT false,
    view_count              INTEGER NOT NULL DEFAULT 0,

    -- Audit
    created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search vector for vehicle search
ALTER TABLE vehicles ADD COLUMN search_vector TSVECTOR
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(make, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(model, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(variant, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(colour, '')), 'D')
    ) STORED;

COMMENT ON TABLE vehicles IS 'Core vehicle inventory — the central entity of the dealership system';
COMMENT ON COLUMN vehicles.status IS 'available=publicly visible, reserved=deposit paid, sold=completed, coming_soon=arriving, in_preparation=being prepared';
COMMENT ON COLUMN vehicles.features IS 'JSON array of feature strings, e.g., ["Sat Nav", "Leather Seats", "Parking Sensors"]';
```

### 3.3 Vehicle Images Table

Stores vehicle photo gallery with ordering and primary image designation.

```sql
-- ============================================================
-- Table: vehicle_images
-- Purpose: Vehicle photo gallery
-- ============================================================
CREATE TABLE vehicle_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    public_id   VARCHAR(200),              -- Cloudinary public ID for deletion
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT false,
    file_size   INTEGER,                    -- Bytes
    width       INTEGER,
    height      INTEGER,
    mime_type   VARCHAR(30),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Only one primary image per vehicle
    UNIQUE(vehicle_id, is_primary)
);

-- Partial index: only primary images
COMMENT ON TABLE vehicle_images IS 'Vehicle photo gallery — supports drag-and-drop reordering';
```

### 3.4 Leads Table

CRM system for tracking all customer enquiries.

```sql
-- ============================================================
-- Table: leads
-- Purpose: Customer enquiries — central CRM entity
-- ============================================================
CREATE TABLE leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Lead classification
    type                VARCHAR(20) NOT NULL
                            CHECK (type IN ('contact', 'sell_car', 'test_drive', 'finance')),

    -- Customer information
    first_name          VARCHAR(50) NOT NULL,
    last_name           VARCHAR(50) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),
    subject             VARCHAR(200),
    message             TEXT,

    -- Vehicle reference (optional)
    vehicle_id          UUID REFERENCES vehicles(id) ON DELETE SET NULL,

    -- Sell My Car specific fields
    registration        VARCHAR(20),
    mileage             INTEGER CHECK (mileage >= 0),
    condition           VARCHAR(50),

    -- Test drive specific fields
    preferred_date      DATE,
    preferred_time      TIME,

    -- Finance specific fields
    amount              DECIMAL(10, 2) CHECK (amount > 0),
    term                INTEGER CHECK (term BETWEEN 12 AND 84),
    employment_status   VARCHAR(20)
                            CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'retired', 'student')),
    annual_income       DECIMAL(10, 2),
    credit_rating       VARCHAR(10)
                            CHECK (credit_rating IN ('excellent', 'good', 'fair', 'poor')),

    -- Pipeline status
    status              VARCHAR(20) NOT NULL DEFAULT 'new'
                            CHECK (status IN ('new', 'contacted', 'qualified', 'appointment', 'converted', 'declined')),
    status_changed_at   TIMESTAMPTZ,
    status_changed_by   UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Assignment & notes
    assigned_to         UUID REFERENCES users(id) ON DELETE SET NULL,
    notes               TEXT,
    internal_notes      TEXT,

    -- Source tracking
    source              VARCHAR(50) DEFAULT 'website',
                            -- website, google, facebook, autotrader, referral, walk-in, phone
    utm_source          VARCHAR(100),
    utm_medium          VARCHAR(100),
    utm_campaign        VARCHAR(200),
    ip_address          INET,
    user_agent          TEXT,

    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE leads IS 'Central CRM entity — tracks all customer enquiries from initial contact to conversion';
COMMENT ON COLUMN leads.status IS 'Pipeline: new → contacted → qualified → appointment → converted/declined';
```

### 3.5 Test Drive Bookings Table

Manages test drive appointments linked to leads.

```sql
-- ============================================================
-- Table: test_drive_bookings
-- Purpose: Test drive appointment management
-- ============================================================
CREATE TABLE test_drive_bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    booking_date    DATE NOT NULL,
    booking_time    TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes           TEXT,
    reminder_sent   BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent double-booking
    UNIQUE(vehicle_id, booking_date, booking_time)
);

COMMENT ON TABLE test_drive_bookings IS 'Test drive appointments linked to lead records';
```

### 3.6 Finance Applications Table

Tracks finance enquiries and application outcomes.

```sql
-- ============================================================
-- Table: finance_applications
-- Purpose: Finance application tracking
-- ============================================================
CREATE TABLE finance_applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id             UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    vehicle_id          UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    amount              DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    term                INTEGER NOT NULL CHECK (term BETWEEN 12 AND 84),
    deposit             DECIMAL(10, 2),
    apr                 DECIMAL(5, 2) CHECK (apr >= 0 AND apr <= 100),
    employment_status   VARCHAR(20)
                            CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'retired', 'student')),
    annual_income       DECIMAL(10, 2),
    credit_rating       VARCHAR(10)
                            CHECK (credit_rating IN ('excellent', 'good', 'fair', 'poor')),
    monthly_outgoings   DECIMAL(10, 2),

    -- Application status
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'under_review', 'approved', 'declined', 'documents_required', 'completed')),
    decision            VARCHAR(20)
                            CHECK (decision IN ('approved', 'declined', 'referred', 'pending')),
    decision_notes      TEXT,
    decision_at         TIMESTAMPTZ,
    decision_by         UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Lender information
    lender_reference    VARCHAR(100),
    lender_name         VARCHAR(100),

    -- Documents
    documents           JSONB DEFAULT '[]'::jsonb,
    -- e.g., [{"type": "payslip", "url": "...", "uploaded_at": "..."}]

    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE finance_applications IS 'Finance applications with full tracking from submission to decision';
```

### 3.7 Blog Posts Table

Content management for the blog section.

```sql
-- ============================================================
-- Table: blog_posts
-- Purpose: Blog content management
-- ============================================================
CREATE TABLE blog_posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL UNIQUE,
    excerpt             TEXT,
    content             TEXT NOT NULL,
    featured_image      VARCHAR(500),
    category_id         UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    tags                VARCHAR(50)[],

    -- SEO fields
    meta_title          VARCHAR(70),
    meta_description    VARCHAR(160),

    -- Author & publishing
    author_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at        TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published', 'archived')),

    -- Engagement
    view_count          INTEGER NOT NULL DEFAULT 0,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE blog_posts IS 'Blog content with SEO optimization and publishing workflow';
```

### 3.8 Blog Categories Table

Categories for organizing blog content.

```sql
-- ============================================================
-- Table: blog_categories
-- Purpose: Blog post categorization
-- ============================================================
CREATE TABLE blog_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE,
    slug            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    post_count      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE blog_categories IS 'Blog categories for content organization';
```

### 3.9 Activity Log Table

Audit trail for all system actions.

```sql
-- ============================================================
-- Table: activity_log
-- Purpose: Complete audit trail of all system actions
-- ============================================================
CREATE TABLE activity_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email      VARCHAR(255),              -- Denormalized for audit integrity
    action          VARCHAR(50) NOT NULL,
                    -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT,
                    -- EXPORT, IMPORT, STATUS_CHANGE, ASSIGN, NOTE_ADDED
    entity_type     VARCHAR(30) NOT NULL,
                    -- vehicle, lead, user, blog_post, setting, finance_application
    entity_id       UUID,
    details         JSONB DEFAULT '{}'::jsonb,
                    -- e.g., {"from": "available", "to": "sold", "reason": "Customer purchase"}
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioning recommendation for high-volume logs
-- PARTITION BY RANGE (created_at);

COMMENT ON TABLE activity_log IS 'Complete audit trail — partition by month when > 1M rows';
```

### 3.10 Settings Table

System configuration and business information.

```sql
-- ============================================================
-- Table: settings
-- Purpose: System configuration and business information
-- ============================================================
CREATE TABLE settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(100) NOT NULL UNIQUE,
    value       TEXT,
    group       VARCHAR(30) NOT NULL DEFAULT 'general'
                    CHECK ("group" IN ('general', 'business', 'contact', 'hours', 'social', 'seo', 'email', 'finance', 'appearance')),
    label       VARCHAR(100),
    type        VARCHAR(20) NOT NULL DEFAULT 'text'
                    CHECK (type IN ('text', 'textarea', 'number', 'boolean', 'select', 'json', 'image', 'color')),
    options     JSONB,                        -- For select type: ["option1", "option2"]
    is_public   BOOLEAN NOT NULL DEFAULT false, -- Expose via public API?
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE settings IS 'Key-value configuration with type safety and grouping';
```

---

## 4. Indexes

### 4.1 Performance Indexes

```sql
-- ============================================================
-- INDEXES: Optimized for query patterns
-- ============================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role) WHERE is_active = true;
CREATE INDEX idx_users_active ON users(is_active);

-- Vehicles indexes
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_year ON vehicles(year DESC);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_featured ON vehicles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_vehicles_fuel_type ON vehicles(fuel_type);
CREATE INDEX idx_vehicles_body_type ON vehicles(body_type);
CREATE INDEX idx_vehicles_transmission ON vehicles(transmission);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at DESC);
CREATE INDEX idx_vehicles_search ON vehicles USING GIN(search_vector);

-- Vehicle images indexes
CREATE INDEX idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_images_primary ON vehicle_images(vehicle_id, is_primary) WHERE is_primary = true;

-- Leads indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_type ON leads(type);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_vehicle ON leads(vehicle_id);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_name ON leads(last_name, first_name);

-- Test drive indexes
CREATE INDEX idx_test_drives_date ON test_drive_bookings(booking_date);
CREATE INDEX idx_test_drives_status ON test_drive_bookings(status);
CREATE INDEX idx_test_drives_lead ON test_drive_bookings(lead_id);

-- Finance indexes
CREATE INDEX idx_finance_status ON finance_applications(status);
CREATE INDEX idx_finance_lead ON finance_applications(lead_id);
CREATE INDEX idx_finance_created ON finance_applications(created_at DESC);

-- Blog indexes
CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_status ON blog_posts(status);
CREATE INDEX idx_blog_category ON blog_posts(category_id);
CREATE INDEX idx_blog_published ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_author ON blog_posts(author_id);

-- Activity log indexes
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_action ON activity_log(action, entity_type);

-- Settings index
CREATE INDEX idx_settings_group ON settings("group", sort_order);
```

### 4.2 Full-Text Search Configuration

```sql
-- Create GIN index on search vector (already added in table definition)
-- For advanced search, create a search function:

CREATE OR REPLACE FUNCTION search_vehicles(search_query TEXT)
RETURNS TABLE (
    id UUID,
    make VARCHAR,
    model VARCHAR,
    year INTEGER,
    price DECIMAL,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.make,
        v.model,
        v.year,
        v.price,
        ts_rank(v.search_vector, plainto_tsquery('english', search_query))::REAL AS rank
    FROM vehicles v
    WHERE v.search_vector @@ plainto_tsquery('english', search_query)
      AND v.status = 'available'
    ORDER BY rank DESC, v.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Triggers & Functions

### 5.1 Auto-Update Timestamps

```sql
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_test_drives_updated_at
    BEFORE UPDATE ON test_drive_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_finance_updated_at
    BEFORE UPDATE ON finance_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Lead Status Change Tracking

```sql
-- Track status changes on leads
CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.status_changed_at = NOW();

        INSERT INTO activity_log (
            user_id, action, entity_type, entity_id, details
        ) VALUES (
            NEW.status_changed_by,
            'STATUS_CHANGE',
            'lead',
            NEW.id,
            jsonb_build_object(
                'from', OLD.status,
                'to', NEW.status,
                'changed_at', NOW()
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lead_status_change
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION log_lead_status_change();
```

### 5.3 View Count Increment

```sql
-- Thread-safe view count increment
CREATE OR REPLACE FUNCTION increment_vehicle_view(vehicle_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE vehicles
    SET view_count = view_count + 1
    WHERE id = vehicle_uuid;
END;
$$ LANGUAGE plpgsql;
```

### 5.4 Blog Post Count on Categories

```sql
-- Auto-update post_count on categories
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
        UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'published' AND NEW.status = 'published' THEN
            UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
        ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
            UPDATE blog_categories SET post_count = post_count - 1 WHERE id = NEW.category_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
        UPDATE blog_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_blog_post_count
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_category_post_count();
```

---

## 6. Sample Data

### 6.1 Users

```sql
-- Super admin
INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
VALUES (
    'admin@apexautomotive.co.uk',
    '$2b$12$abcdefghijklmnopqrstuv', -- bcrypt hash of 'ChangeMe123!'
    'System',
    'Administrator',
    '020 7946 0958',
    'super_admin'
);

-- Sales manager
INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
VALUES (
    'sales@apexautomotive.co.uk',
    '$2b$12$abcdefghijklmnopqrstuv',
    'James',
    'Wilson',
    '07700 900123',
    'admin'
);

-- Sales team member
INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
VALUES (
    'john@apexautomotive.co.uk',
    '$2b$12$abcdefghijklmnopqrstuv',
    'John',
    'Smith',
    '07700 900456',
    'sales'
);

-- Marketing team
INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
VALUES (
    'marketing@apexautomotive.co.uk',
    '$2b$12$abcdefghijklmnopqrstuv',
    'Sarah',
    'Chen',
    '07700 900789',
    'marketing'
);
```

### 6.2 Blog Categories

```sql
INSERT INTO blog_categories (name, slug, description) VALUES
('Buying Guide', 'buying-guide', 'Tips and advice for buying a used car'),
('Car Maintenance', 'car-maintenance', 'How to keep your vehicle in top condition'),
('Industry News', 'industry-news', 'Latest updates from the automotive world'),
('Finance Advice', 'finance-advice', 'Understanding car finance options'),
('Reviews', 'reviews', 'In-depth vehicle reviews and comparisons');
```

### 6.3 Sample Vehicle

```sql
INSERT INTO vehicles (
    make, model, year, variant, body_type, fuel_type, transmission,
    engine_size, doors, seats, colour, registration, mileage,
    condition_description, price, finance_price, monthly_payment, apr, deposit,
    features, description, meta_title, meta_description, status, is_featured
) VALUES (
    'BMW',
    '3 Series',
    2022,
    'M Sport',
    'saloon',
    'petrol',
    'automatic',
    '2.0L',
    4,
    5,
    'Alpine White',
    'BF22 ABC',
    15000,
    'Immaculate condition, full BMW service history, one previous owner',
    32995.00,
    29995.00,
    450.00,
    9.9,
    3299.50,
    '["Satellite Navigation", "Leather Seats", "Parking Sensors", "Reverse Camera", "Bluetooth", "Climate Control", "Cruise Control", "LED Headlights", "Alloy Wheels", "Apple CarPlay"]',
    'Stunning BMW 3 Series M Sport in Alpine White...',
    '2022 BMW 3 Series M Sport | APEX Automotive',
    'Immaculate 2022 BMW 3 Series M Sport with low mileage and full service history. Available now at APEX Automotive.',
    'available',
    true
);

-- Add vehicle images
INSERT INTO vehicle_images (vehicle_id, image_url, public_id, sort_order, is_primary, mime_type)
VALUES (
    (SELECT id FROM vehicles WHERE registration = 'BF22 ABC'),
    'https://res.cloudinary.com/demo/image/upload/v1/apex/vehicles/bmw-3-series-1.jpg',
    'apex/vehicles/bmw-3-series-1',
    0,
    true,
    'image/jpeg'
);
```

### 6.4 Sample Leads

```sql
-- Contact form lead
INSERT INTO leads (type, first_name, last_name, email, phone, subject, message, status, source)
VALUES (
    'contact',
    'Michael',
    'Thompson',
    'michael.thompson@email.co.uk',
    '07700 123456',
    'Enquiry about BMW 3 Series',
    'I am interested in the BMW 3 Series you have in stock. Is it still available? Can I arrange a viewing for this weekend?',
    'new',
    'website'
);

-- Sell my car lead
INSERT INTO leads (type, first_name, last_name, email, phone, registration, mileage, condition, status, source)
VALUES (
    'sell_car',
    'Emma',
    'Roberts',
    'emma.roberts@email.co.uk',
    '07700 654321',
    'KN19 XYZ',
    45000,
    'Good condition, full service history',
    'new',
    'website'
);

-- Test drive lead
INSERT INTO leads (type, first_name, last_name, email, phone, vehicle_id, preferred_date, preferred_time, status, source)
VALUES (
    'test_drive',
    'David',
    'Patel',
    'david.patel@email.co.uk',
    '07700 789012',
    (SELECT id FROM vehicles WHERE registration = 'BF22 ABC'),
    '2025-02-15',
    '14:00',
    'new',
    'website'
);
```

### 6.5 Settings

```sql
-- Business information
INSERT INTO settings ("key", value, "group", label, type, is_public) VALUES
('business_name', 'APEX Automotive', 'business', 'Business Name', 'text', true),
('business_tagline', 'Premium Quality Used Vehicles', 'business', 'Tagline', 'text', true),
('business_registration', '12345678', 'business', 'Company Registration Number', 'text', false),
('business_vat', 'GB123456789', 'business', 'VAT Number', 'text', false);

-- Contact information
INSERT INTO settings ("key", value, "group", label, type, is_public) VALUES
('contact_phone', '020 7946 0958', 'contact', 'Main Phone', 'text', true),
('contact_email', 'info@apexautomotive.co.uk', 'contact', 'Email Address', 'text', true),
('contact_address_line1', '123 High Street', 'contact', 'Address Line 1', 'text', true),
('contact_address_line2', 'Unit 5, Showroom Centre', 'contact', 'Address Line 2', 'text', true),
('contact_city', 'London', 'contact', 'City', 'text', true),
('contact_postcode', 'SW1A 1AA', 'contact', 'Postcode', 'text', true),
('contact_map_url', 'https://maps.google.com/?q=51.5074,-0.1278', 'contact', 'Google Maps URL', 'text', true);

-- Opening hours
INSERT INTO settings ("key", value, "group", label, type, is_public) VALUES
('hours_monday', '09:00-18:00', 'hours', 'Monday', 'text', true),
('hours_tuesday', '09:00-18:00', 'hours', 'Tuesday', 'text', true),
('hours_wednesday', '09:00-18:00', 'hours', 'Wednesday', 'text', true),
('hours_thursday', '09:00-18:00', 'hours', 'Thursday', 'text', true),
('hours_friday', '09:00-18:00', 'hours', 'Friday', 'text', true),
('hours_saturday', '09:00-17:00', 'hours', 'Saturday', 'text', true),
('hours_sunday', '10:00-16:00', 'hours', 'Sunday', 'text', true);

-- Social media
INSERT INTO settings ("key", value, "group", label, type, is_public) VALUES
('social_facebook', 'https://facebook.com/apexautomotive', 'social', 'Facebook URL', 'text', true),
('social_instagram', 'https://instagram.com/apexautomotive', 'social', 'Instagram URL', 'text', true),
('social_twitter', 'https://twitter.com/apexautomotive', 'social', 'Twitter URL', 'text', true),
('social_youtube', 'https://youtube.com/apexautomotive', 'social', 'YouTube URL', 'text', true);

-- SEO defaults
INSERT INTO settings ("key", value, "group", label, type, is_public) VALUES
('seo_default_title', 'APEX Automotive | Premium Used Cars in London', 'seo', 'Default Page Title', 'text', true),
('seo_default_description', 'Your trusted destination for premium quality used vehicles. Browse our extensive inventory of cars, SUVs, and vans.', 'seo', 'Default Meta Description', 'textarea', true),
('seo_keywords', 'used cars, car dealership, premium vehicles, London, BMW, Mercedes, Audi', 'seo', 'Default Keywords', 'text', false);
```

---

## 7. Migration Strategy

### 7.1 Initial Migration

```bash
# Using Drizzle ORM migrations
# 1. Generate migration from schema
npx drizzle-kit generate:pg

# 2. Apply migration
npx drizzle-kit push:pg

# 3. Verify
psql $DATABASE_URL -c "\dt"
```

### 7.2 Migration Best Practices

```typescript
// db/migrate.ts
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

async function runMigrations() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete!");
  await pool.end();
}

runMigrations().catch(console.error);
```

### 7.3 Seeding the Database

```typescript
// db/seed.ts
import { db } from "./index";
import { users, blogCategories, settings } from "./schema";
import { hashPassword } from "../utils/password";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hashPassword("ChangeMe123!");
  await db.insert(users).values({
    email: "admin@apexautomotive.co.uk",
    passwordHash: adminPassword,
    firstName: "System",
    lastName: "Administrator",
    role: "super_admin",
  });

  // Create blog categories
  await db.insert(blogCategories).values([
    { name: "Buying Guide", slug: "buying-guide", description: "Tips and advice for buying a used car" },
    { name: "Car Maintenance", slug: "car-maintenance", description: "Keep your vehicle in top condition" },
    { name: "Industry News", slug: "industry-news", description: "Latest automotive updates" },
    { name: "Finance Advice", slug: "finance-advice", description: "Understanding car finance" },
    { name: "Reviews", slug: "reviews", description: "Vehicle reviews and comparisons" },
  ]);

  console.log("Seeding complete!");
}

seed().catch(console.error);
```

---

## 8. Drizzle ORM Implementation

### 8.1 Schema Definition (TypeScript)

```typescript
// db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  boolean,
  text,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
  inet,
  date,
  time,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "staff",
  "sales",
  "marketing",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "reserved",
  "sold",
  "coming_soon",
  "in_preparation",
]);

export const leadTypeEnum = pgEnum("lead_type", [
  "contact",
  "sell_car",
  "test_drive",
  "finance",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "appointment",
  "converted",
  "declined",
]);

export const bodyTypeEnum = pgEnum("body_type", [
  "saloon",
  "hatchback",
  "estate",
  "suv",
  "coupe",
  "convertible",
  "mpv",
  "pickup",
  "van",
]);

export const fuelTypeEnum = pgEnum("fuel_type", [
  "petrol",
  "diesel",
  "hybrid",
  "electric",
]);

export const transmissionEnum = pgEnum("transmission", [
  "manual",
  "automatic",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull().default("staff"),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("idx_users_email").on(table.email),
  roleIdx: index("idx_users_role").on(table.role),
}));

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  variant: varchar("variant", { length: 100 }),
  bodyType: bodyTypeEnum("body_type").notNull(),
  fuelType: fuelTypeEnum("fuel_type").notNull(),
  transmission: transmissionEnum("transmission").notNull(),
  engineSize: varchar("engine_size", { length: 20 }),
  doors: integer("doors"),
  seats: integer("seats"),
  colour: varchar("colour", { length: 30 }).notNull(),
  registration: varchar("registration", { length: 20 }).unique(),
  mileage: integer("mileage").notNull(),
  conditionDescription: text("condition_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  financePrice: decimal("finance_price", { precision: 10, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 8, scale: 2 }),
  apr: decimal("apr", { precision: 5, scale: 2 }),
  deposit: decimal("deposit", { precision: 10, scale: 2 }),
  features: jsonb("features").default([]),
  description: text("description"),
  metaTitle: varchar("meta_title", { length: 70 }),
  metaDescription: varchar("meta_description", { length: 160 }),
  status: vehicleStatusEnum("status").notNull().default("available"),
  isFeatured: boolean("is_featured").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  makeModelIdx: index("idx_vehicles_make_model").on(table.make, table.model),
  statusIdx: index("idx_vehicles_status").on(table.status),
  featuredIdx: index("idx_vehicles_featured").on(table.isFeatured),
  priceIdx: index("idx_vehicles_price").on(table.price),
}));

// Vehicle images table
export const vehicleImages = pgTable("vehicle_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  publicId: varchar("public_id", { length: 200 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  fileSize: integer("file_size"),
  width: integer("width"),
  height: integer("height"),
  mimeType: varchar("mime_type", { length: 30 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: leadTypeEnum("type").notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message"),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  registration: varchar("registration", { length: 20 }),
  mileage: integer("mileage"),
  condition: varchar("condition", { length: 50 }),
  preferredDate: date("preferred_date"),
  preferredTime: time("preferred_time"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  term: integer("term"),
  employmentStatus: varchar("employment_status", { length: 20 }),
  annualIncome: decimal("annual_income", { precision: 10, scale: 2 }),
  creditRating: varchar("credit_rating", { length: 10 }),
  status: leadStatusEnum("status").notNull().default("new"),
  statusChangedAt: timestamp("status_changed_at", { withTimezone: true }),
  statusChangedBy: uuid("status_changed_by").references(() => users.id),
  assignedTo: uuid("assigned_to").references(() => users.id),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  source: varchar("source", { length: 50 }).default("website"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Export type inference helpers
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
```

### 8.2 Database Connection

```typescript
// db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum pool size
});

export const db = drizzle(pool, { schema });
export { pool };
```

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Schema Version:** 1.0.0
