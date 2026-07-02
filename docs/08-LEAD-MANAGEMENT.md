# APEX Automotive — Lead Management System

**Purpose:** Complete documentation for the lead management (CRM) system.  
**Audience:** Sales team, administrators, developers  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Lead Types](#2-lead-types)
3. [Lead Pipeline](#3-lead-pipeline)
4. [CRM Interface](#4-crm-interface)
5. [Lead Processing Workflow](#5-lead-processing-workflow)
6. [Notification System](#6-notification-system)
7. [Analytics & Reporting](#7-analytics--reporting)
8. [Bulk Actions](#8-bulk-actions)
9. [CSV Export](#9-csv-export)
10. [Technical Implementation](#10-technical-implementation)

---

## 1. System Overview

The APEX Automotive Lead Management System is a comprehensive CRM (Customer Relationship Management) solution designed specifically for car dealership operations. It captures, tracks, and manages all customer enquiries from initial contact through to conversion or closure.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **Multi-channel capture** | Collects leads from website forms, phone, walk-ins, and referrals |
| **Pipeline management** | Visual Kanban board showing lead progression |
| **Automated routing** | Assigns leads to team members based on rules |
| **Communication tracking** | Logs all interactions with each lead |
| **Performance analytics** | Reports on conversion rates, response times, and team performance |
| **Notification system** | Real-time alerts for new leads and status changes |
| **Integration ready** | Connects with email, SMS, and calendar systems |

### Lead Lifecycle

```
Capture → Acknowledge → Qualify → Nurture → Convert/Decline → Follow-up
  ↑                                                        |
  └──────────────── Lost lead re-engagement ────────────────┘
```

---

## 2. Lead Types

The system handles four distinct types of customer enquiries, each with its own data fields and processing workflow.

### 2.1 Contact Form Enquiries

General enquiries submitted through the website contact form.

| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Customer first name |
| Last Name | Yes | Customer last name |
| Email | Yes | Contact email address |
| Phone | No | Contact phone number |
| Subject | No | Enquiry topic |
| Message | Yes | Detailed enquiry text |
| Vehicle Interest | No | Specific vehicle of interest |

**Typical enquiries:**
- "Is this vehicle still available?"
- "Can you arrange a viewing?"
- "Do you offer part exchange?"
- "What finance options are available?"
- "Can I get more photos of the interior?"

### 2.2 Sell My Car Valuations

Customers looking to sell their vehicle to the dealership.

| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Customer first name |
| Last Name | Yes | Customer last name |
| Email | Yes | Contact email address |
| Phone | Yes | Contact phone number |
| Registration | Yes | Vehicle registration number |
| Mileage | Yes | Current mileage |
| Condition | No | Brief condition description |

**Processing steps:**
1. Verify registration via DVLA lookup
2. Research market value using valuation tools
3. Contact customer with provisional offer
4. Arrange physical inspection
5. Finalize offer

### 2.3 Test Drive Bookings

Customers requesting to test drive a specific vehicle.

| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Customer first name |
| Last Name | Yes | Customer last name |
| Email | Yes | Contact email address |
| Phone | Yes | Contact phone number |
| Vehicle | Yes | Vehicle to test drive |
| Preferred Date | Yes | Requested date |
| Preferred Time | Yes | Requested time slot |
| Additional Info | No | Special requirements |

**Time slots offered:**
```
Morning:   09:00, 09:30, 10:00, 10:30, 11:00, 11:30
Afternoon: 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30
```

**Booking rules:**
- Minimum 24 hours advance notice
- Maximum 14 days in advance
- 30-minute slots (extendable to 60 minutes)
- Maximum 2 test drives per customer per day

### 2.4 Finance Applications

Customers applying for vehicle financing.

| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Applicant first name |
| Last Name | Yes | Applicant last name |
| Email | Yes | Contact email address |
| Phone | Yes | Contact phone number |
| Vehicle | Yes | Vehicle being financed |
| Loan Amount | Yes | Amount to finance |
| Term | Yes | Repayment period (12-84 months) |
| Deposit | No | Proposed deposit amount |
| Employment Status | Yes | Employed/Self-employed/etc. |
| Annual Income | Yes | Gross annual income |
| Credit Rating | No | Self-assessed credit score |

---

## 3. Lead Pipeline

The pipeline represents the stages a lead passes through from initial capture to final resolution.

### Pipeline Stages

```
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌─────────────┐    ┌───────────┐
│   NEW   │───▶│ CONTACTED │───▶│ QUALIFIED │───▶│ APPOINTMENT │───▶│ CONVERTED │
│  (Blue) │    │  (Purple) │    │  (Amber)  │    │   (Green)   │    │  (Green)  │
└─────────┘    └───────────┘    └───────────┘    └─────────────┘    └───────────┘
     │                                                              
     │         ┌──────────┐                                         
     └────────▶│ DECLINED │◀───────────────────────────────────────┘
               │   (Red)  │
               └──────────┘
```

### Stage Definitions

| Stage | Colour | Description | SLA Target |
|-------|--------|-------------|------------|
| **New** | Blue | Lead just captured, not yet reviewed | Acknowledge within 15 minutes |
| **Contacted** | Purple | Initial contact made with customer | Within 2 hours of capture |
| **Qualified** | Amber | Customer needs assessed, vehicle identified | Within 24 hours |
| **Appointment** | Green | Test drive or meeting scheduled | At customer's convenience |
| **Converted** | Dark green | Sale completed or commitment made | N/A |
| **Declined** | Red | Customer no longer interested | N/A |

### Stage Transitions

```typescript
const allowedTransitions: Record<LeadStatus, LeadStatus[]> = {
  new:         ["contacted", "declined"],
  contacted:   ["qualified", "declined", "new"],
  qualified:   ["appointment", "declined", "contacted"],
  appointment: ["converted", "declined", "qualified"],
  converted:   ["qualified"], // Can reopen if needed
  declined:    ["new", "contacted"], // Can reopen
};
```

### Automated Stage Rules

| Trigger | Action |
|---------|--------|
| New lead created | Auto-assign via round-robin |
| 15 min in "New" | Escalation alert to manager |
| 2 hours in "New" | Auto-reassign to next available |
| Test drive booked | Status auto-updates to "Appointment" |
| Test drive completed | Status auto-updates to "Qualified" |
| Vehicle marked sold | All linked leads auto-updated |
| 30 days in any stage | Reminder alert to assigned staff |

---

## 4. CRM Interface

### 4.1 Pipeline View (Kanban Board)

The pipeline view provides a visual drag-and-drop interface for managing leads.

```
┌─────────────────────────────────────────────────────────────────────┐
│  NEW (12)    │ CONTACTED (8) │ QUALIFIED (5) │ APPOINTMENT (3)    │
│  ─────────   │ ───────────   │ ───────────   │ ─────────────      │
│ ┌─────────┐  │ ┌─────────┐   │ ┌─────────┐   │ ┌─────────┐        │
│ │ Michael │  │ │ Sarah   │   │ │ David   │   │ │ James   │        │
│ │ Thomp.  │  │ │ Wilson  │   │ │ Patel   │   │ │ Miller  │        │
│ │         │  │ │         │   │ │         │   │ │         │        │
│ │ Contact │  │ │ Sell    │   │ │ Test    │   │ │ Finance │        │
│ │ 2m ago  │  │ │ Car     │   │ │ Drive   │   │ │ 1d ago  │        │
│ └─────────┘  │ └─────────┘   │ └─────────┘   │ └─────────┘        │
│ ┌─────────┐  │ ┌─────────┐   │               │                    │
│ │ Emma    │  │ │ Robert  │   │               │                    │
│ │ Roberts │  │ │ Chen    │   │               │                    │
│ └─────────┘  │ └─────────┘   │               │                    │
│              │               │               │                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Drag cards** between columns to change status
- **Click card** to open lead detail view
- **Right-click card** for quick actions (assign, add note, email)
- **Filter** by type, assignee, date range

### 4.2 List View

Sortable table format with advanced filtering.

| Column | Sortable | Filterable |
|--------|----------|------------|
| Name | Yes | Text search |
| Type | Yes | Dropdown |
| Status | Yes | Dropdown |
| Vehicle | Yes | Dropdown |
| Assigned To | Yes | Dropdown |
| Source | Yes | Dropdown |
| Date | Yes | Date range |
| Actions | No | No |

### 4.3 Lead Detail View

Comprehensive single-lead view with all information and actions.

```
┌─────────────────────────────────────────────────────────────┐
│  Michael Thompson                    [Contact] [Edit] [More]│
│  Contact Enquiry │ NEW │ 2 hours ago                    │
├─────────────────────────────────────────────────────────────┤
│  CUSTOMER INFO          │  VEHICLE INTEREST               │
│  ─────────────          │  ────────────────               │
│  Name: Michael Thompson │  Vehicle: 2022 BMW 3 Series     │
│  Email: m.t@email.com   │  ID: #V-2025-001                │
│  Phone: 07700 123456    │  Price: GBP 32,995              │
│                         │                                 │
│  PIPELINE STATUS        │  ACTIVITY TIMELINE              │
│  ───────────────        │  ────────────────               │
│  [NEW] ──▶ [CONTACTED] │  14:30 - Lead created           │
│  Assigned: John Smith   │  14:32 - Auto-assigned to John  │
│  SLA: 12 min remaining  │  14:35 - Viewed by John         │
│                         │                                 │
│  NOTES                  │  INTERNAL NOTES                 │
│  ─────                  │  ─────────────                  │
│  "Interested in the BMW │  John: Called at 14:45, left    │
│   3 Series. Available   │  voicemail. Will retry at 15:30.│
│   for viewing this      │                                 │
│   weekend."             │                                 │
├─────────────────────────────────────────────────────────────┤
│  [Add Note] [Change Status] [Assign] [Send Email] [Export]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Lead Processing Workflow

### Standard Processing Timeline

```
T+0 min     Lead captured from website form
T+1 min     Auto-confirmation email sent to customer
T+1 min     Notification sent to assigned staff member
T+15 min    SLA warning if not acknowledged
T+2 hours   Staff must make initial contact
T+24 hours  Lead should be qualified
T+1-7 days  Test drive or meeting scheduled
T+7-30 days Follow-up and nurturing
T+30 days   Review if not converted
```

### Detailed Processing Steps

#### Step 1: Acknowledge (Target: within 15 minutes)

1. Open the lead from the notification or pipeline
2. Read the enquiry details carefully
3. Click **"Acknowledge"** or update status to **"Contacted"**
4. Add an initial note: "Lead acknowledged at [time]. Planning to call within 2 hours."

#### Step 2: Initial Contact (Target: within 2 hours)

**By phone (preferred):**
1. Call the customer using the provided phone number
2. Introduce yourself and APEX Automotive
3. Confirm the nature of their enquiry
4. Gather additional requirements:
   - Budget range
   - Preferred timeline
   - Trade-in vehicle (if applicable)
   - Financing needs
5. Record conversation details in the lead notes

**By email (if phone unavailable):**
1. Use the **"Send Email"** button in the lead detail
2. Use a template or write a personalized response
3. Include relevant vehicle information
4. Offer to arrange a phone call

#### Step 3: Qualify (Target: within 24 hours)

Update the lead status to **"Qualified"** when:
- Customer needs are understood
- Budget is confirmed
- Specific vehicle(s) of interest identified
- Timeline established
- Next steps agreed

**Qualification criteria:**
```
BANT Framework:
├─ Budget: Customer has confirmed budget or financing approval
├─ Authority: Customer is the decision maker
├─ Need: Genuine need for a vehicle identified
└─ Timeline: Customer has a specific purchase timeframe
```

#### Step 4: Nurture (Ongoing)

For leads not yet ready to purchase:
1. Add to nurture sequence (automated email follow-ups)
2. Schedule periodic check-in calls
3. Send relevant vehicle recommendations
4. Invite to showroom events
5. Provide market updates

#### Step 5: Convert or Decline

**Conversion:**
1. Customer agrees to purchase
2. Process deposit payment
3. Update vehicle status to **"Reserved"**
4. Update lead status to **"Converted"**
5. Hand over to admin team for paperwork

**Decline:**
1. Customer confirms they're no longer interested
2. Record reason for decline:
   - Found vehicle elsewhere
   - Changed mind
   - Budget constraints
   - Timing not right
3. Update status to **"Declined"**
4. Set reminder for future re-engagement (if appropriate)

---

## 6. Notification System

### Notification Types

| Type | Trigger | Recipients | Channel |
|------|---------|------------|---------|
| **New Lead** | Lead form submitted | Assigned staff + manager | In-app + Email |
| **Lead Assigned** | Lead auto/manually assigned | Assigned staff | In-app |
| **Status Change** | Lead moves pipeline stage | Assigned staff + manager | In-app |
| **SLA Warning** | Lead approaching time limit | Assigned staff + manager | In-app + Email |
| **Test Drive Booked** | Customer books test drive | Assigned staff | In-app + Email |
| **Test Drive Reminder** | 24 hours before appointment | Assigned staff | In-app |
| **Finance Application** | Application submitted | Finance team | In-app + Email |
| **Note Added** | Internal note added | Assigned staff | In-app |
| **Reassignment** | Lead moved to different staff | New assignee | In-app + Email |

### Notification Preferences

Staff can configure notification preferences in their profile:

| Channel | Options |
|---------|---------|
| **In-app** | Real-time, batched (hourly), or disabled |
| **Email** | Instant, hourly digest, daily digest, or disabled |
| **SMS** | Enabled/disabled for urgent notifications only |

### Notification Templates

#### New Lead Email Template

```
Subject: New Lead: {lead.type} — {lead.firstName} {lead.lastName}

Hello {assignedTo.firstName},

A new lead has been assigned to you:

Type: {lead.type}
Name: {lead.firstName} {lead.lastName}
Email: {lead.email}
Phone: {lead.phone}
Vehicle: {vehicle.make} {vehicle.model} ({vehicle.year})
Message: {lead.message}

SLA: Please acknowledge within 15 minutes and make initial
contact within 2 hours.

View lead: https://apexautomotive.co.uk/admin/leads/{lead.id}
```

#### Test Drive Booking Template

```
Subject: Test Drive Booked — {customerName} on {date} at {time}

A test drive has been booked:

Customer: {customerName}
Phone: {customerPhone}
Vehicle: {vehicle.make} {vehicle.model}
Date: {bookingDate}
Time: {bookingTime}
Duration: {duration} minutes

Please ensure:
- Vehicle is fuelled and cleaned
- Keys are ready
- Route is planned

Confirm booking: [Confirm Button]
Reschedule: [Reschedule Button]
```

---

## 7. Analytics & Reporting

### Lead Dashboard KPIs

| Metric | Formula | Target |
|--------|---------|--------|
| **New Leads (Today)** | Count of leads created today | Varies |
| **Response Time** | Average time from capture to first contact | < 30 minutes |
| **Conversion Rate** | Converted leads / Total leads x 100 | > 15% |
| **Pipeline Velocity** | Average days from New to Converted | < 14 days |
| **Lead Quality Score** | Qualified leads / Total leads x 100 | > 40% |

### Reports Available

| Report | Data | Frequency |
|--------|------|-----------|
| **Lead Summary** | Total leads by status, type, source | Real-time |
| **Conversion Funnel** | Stage-by-stage drop-off rates | Daily |
| **Source Analysis** | Leads by acquisition channel | Weekly |
| **Team Performance** | Leads handled per staff member | Monthly |
| **Response Time** | Average time to first contact | Daily |
| **SLA Compliance** | % of leads meeting SLA targets | Weekly |

### Conversion Funnel

```
New:           ████████████████████████████████████████  100% (156 leads)
Contacted:     ███████████████████████████████████░░░░░   86% (134 leads)
Qualified:     █████████████████████░░░░░░░░░░░░░░░░░░░   57%  (89 leads)
Appointment:   ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░   33%  (52 leads)
Converted:     ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   19%  (29 leads)

Overall Conversion Rate: 19%
Average Pipeline Velocity: 8.5 days
```

---

## 8. Bulk Actions

Available bulk actions for lead management:

| Action | Description | Required Permission |
|--------|-------------|-------------------|
| **Change Status** | Move multiple leads to a new pipeline stage | Staff |
| **Assign** | Reassign multiple leads to a team member | Admin |
| **Add Tag** | Add tags/labels to multiple leads | Staff |
| **Export CSV** | Download lead data as CSV | Staff |
| **Send Email** | Send bulk email to selected leads | Admin |
| **Merge** | Combine duplicate lead records | Admin |
| **Archive** | Archive old/resolved leads | Admin |
| **Delete** | Permanently delete leads | Super Admin |

### Bulk Action Workflow

1. Select leads using checkboxes in the list view
2. Click **Bulk Actions** dropdown
3. Select desired action
4. Configure action parameters (e.g., new status, assignee)
5. Review confirmation dialog
6. Confirm to execute
7. View results summary

---

## 9. CSV Export

### Export Format

```csv
id,type,first_name,last_name,email,phone,subject,message,vehicle_id,vehicle_make,vehicle_model,vehicle_year,status,assigned_to,source,created_at,updated_at
lead-001,contact,Michael,Thompson,m.t@email.com,07700123456,Enquiry,Is it available?,veh-001,BMW,3 Series,2022,new,John Smith,website,2025-01-20T14:30:00Z,2025-01-20T14:30:00Z
lead-002,sell_car,Emma,Roberts,e.r@email.com,07700654321,,,KN19 XYZ,,,,new,Unassigned,website,2025-01-20T15:00:00Z,2025-01-20T15:00:00Z
```

### Export Options

| Option | Description |
|--------|-------------|
| **All fields** | Export every field in the database |
| **Selected fields** | Choose specific columns to export |
| **Current filter** | Export only leads matching current filters |
| **Date range** | Export leads from a specific period |
| **Include notes** | Append internal notes as additional columns |

### Scheduled Exports

Configure automatic weekly/monthly exports:

```typescript
// Weekly lead report (every Monday at 9 AM)
const weeklyReport = {
  schedule: "0 9 * * 1", // Cron expression
  recipients: ["manager@apexautomotive.co.uk"],
  format: "csv",
  filters: {
    createdAfter: "last_week",
  },
  include: ["id", "type", "first_name", "last_name", "email", "phone", "status", "source", "created_at"],
};
```

---

## 10. Technical Implementation

### Database Schema (Leads)

```typescript
// server/db/schema/leads.ts
import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { vehicles } from "./vehicles";
import { users } from "./users";

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

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: leadTypeEnum("type").notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message"),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  registration: varchar("registration", { length: 20 }),
  mileage: integer("mileage"),
  condition: varchar("condition", { length: 50 }),
  preferredDate: timestamp("preferred_date", { withTimezone: true }),
  preferredTime: varchar("preferred_time", { length: 10 }),
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
```

### API Endpoints

```typescript
// server/routes/leads.ts
import { Router } from "express";
const router = Router();

// GET /api/leads — List all leads (paginated, filterable)
router.get("/", async (req, res) => {
  const { page = 1, limit = 20, status, type, assignedTo, search } = req.query;
  // Implementation with filtering, sorting, pagination
});

// GET /api/leads/:id — Get single lead
router.get("/:id", async (req, res) => {
  // Return lead with vehicle details and notes
});

// POST /api/leads — Create new lead (public)
router.post("/", async (req, res) => {
  // Validate input, create lead, send notifications
});

// PATCH /api/leads/:id/status — Update lead status
router.patch("/:id/status", async (req, res) => {
  // Validate transition, update status, log activity
});

// PATCH /api/leads/:id/assign — Assign lead to staff
router.patch("/:id/assign", async (req, res) => {
  // Update assignee, send notification
});

// POST /api/leads/:id/notes — Add note to lead
router.post("/:id/notes", async (req, res) => {
  // Add note, update timestamp
});

// POST /api/leads/bulk — Bulk actions
router.post("/bulk", async (req, res) => {
  // Process bulk status changes, assignments
});

// GET /api/leads/export — Export leads to CSV
router.get("/export", async (req, res) => {
  // Generate CSV with filters applied
});

export default router;
```

### WebSocket for Real-Time Updates

```typescript
// server/websocket/leads.ts
import { Server } from "socket.io";

export function setupLeadWebSocket(io: Server) {
  io.on("connection", (socket) => {
    // Join lead room for real-time updates
    socket.on("subscribe:leads", () => {
      socket.join("leads");
    });

    socket.on("subscribe:lead", (leadId: string) => {
      socket.join(`lead:${leadId}`);
    });
  });
}

// Emit new lead notification
export function notifyNewLead(io: Server, lead: Lead) {
  io.to("leads").emit("lead:new", {
    id: lead.id,
    type: lead.type,
    firstName: lead.firstName,
    lastName: lead.lastName,
    status: lead.status,
    createdAt: lead.createdAt,
  });
}
```

---

**Document Version:** 1.0  
**Last Updated:** January 2025
