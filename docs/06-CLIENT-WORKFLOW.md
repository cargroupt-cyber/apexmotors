# APEX Automotive — Client Workflow Guide

**Purpose:** Step-by-step operational workflows for dealership staff using the APEX Automotive admin system.  
**Audience:** Dealership staff, sales team, administrators  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Adding a Vehicle](#2-adding-a-vehicle)
3. [Editing a Vehicle](#3-editing-a-vehicle)
4. [Duplicating a Vehicle](#4-duplicating-a-vehicle)
5. [Managing Vehicle Status](#5-managing-vehicle-status)
6. [Managing Leads](#6-managing-leads)
7. [Processing a Sale](#7-processing-a-sale)
8. [Managing Test Drives](#8-managing-test-drives)
9. [Processing Finance Applications](#9-processing-finance-applications)
10. [Managing Blog Posts](#10-managing-blog-posts)
11. [Using Analytics](#11-using-analytics)
12. [Quick Reference](#12-quick-reference)

---

## 1. Getting Started

### Logging In

1. Open your web browser and navigate to `https://apexautomotive.co.uk/admin`
2. Enter your email address and password
3. Click **Sign In**
4. If two-factor authentication is enabled, enter the code from your authenticator app

**First-time login:**
- You will be prompted to change your temporary password
- Choose a strong password (minimum 12 characters, including uppercase, lowercase, numbers, and symbols)
- Upload a profile photo (optional but recommended)

### Dashboard Overview

After logging in, you will see the **Dashboard Overview** page containing:

| Section | What You See |
|---------|-------------|
| **KPI Cards** | Total vehicles, new leads, test drives this week, conversion rate |
| **Sales Chart** | Monthly sales trend over the last 12 months |
| **Lead Funnel** | Visual pipeline showing lead progression |
| **Recent Activity** | Latest actions by all team members |
| **Quick Actions** | Shortcuts to common tasks |

### Navigation Menu

The left sidebar provides access to all admin functions:

| Menu Item | What It Does | Who Can Access |
|-----------|-------------|----------------|
| Dashboard | Overview and analytics | All roles |
| Vehicles | Manage vehicle inventory | Admin, Staff |
| Leads | Customer relationship management | Admin, Staff, Sales |
| Analytics | Reports and data analysis | Admin |
| Settings | System configuration | Admin, Super Admin |

---

## 2. Adding a Vehicle

Adding a new vehicle to the inventory is a guided multi-step process.

### Step 1: Navigate to Vehicle Management

1. Click **Vehicles** in the left sidebar
2. Click the **"Add Vehicle"** button in the top-right corner
3. The vehicle creation form will open

### Step 2: Enter Basic Information

Fill in the vehicle identification details:

| Field | Required | Example | Notes |
|-------|----------|---------|-------|
| **Make** | Yes | BMW | Select from dropdown or type |
| **Model** | Yes | 3 Series | Select from dropdown or type |
| **Year** | Yes | 2022 | Registration year |
| **Variant** | No | M Sport | Trim level or special edition |
| **Registration** | No | BF22 ABC | UK registration plate |

**Tip:** The system will auto-populate some fields if you enter the registration number first and click **Lookup** (this feature requires DVLA API integration).

### Step 3: Enter Specifications

Complete the technical specifications:

| Field | Required | Options |
|-------|----------|---------|
| **Body Type** | Yes | Saloon, Hatchback, Estate, SUV, Coupe, Convertible, MPV, Pickup, Van |
| **Fuel Type** | Yes | Petrol, Diesel, Hybrid, Electric |
| **Transmission** | Yes | Manual, Automatic |
| **Engine Size** | No | e.g., "2.0L", "3.0L TDI" |
| **Doors** | No | 2, 3, 4, 5, 6 |
| **Seats** | No | 2, 4, 5, 7, 9 |
| **Colour** | Yes | e.g., "Alpine White", "Midnight Black" |
| **Mileage** | Yes | Current odometer reading in miles |
| **Condition** | No | Brief description of vehicle condition |

### Step 4: Set Pricing

Enter all pricing information:

| Field | Required | Example | Notes |
|-------|----------|---------|-------|
| **Cash Price** | Yes | GBP 32,995 | The advertised sale price |
| **Finance Price** | No | GBP 29,995 | Price when financed |
| **Monthly Payment** | No | GBP 450 | Representative monthly payment |
| **APR** | No | 9.9 | Annual Percentage Rate |
| **Deposit** | No | GBP 3,299.50 | Required deposit amount |

**Pricing tip:** The monthly payment is automatically calculated based on the finance price, APR, and typical term (48 months). You can override this value if needed.

### Step 5: Select Features

Check all features that apply to this vehicle:

1. Scroll to the **Features** section
2. You will see a grid of 30+ common features
3. Click each feature that the vehicle has — selected features will be highlighted in blue
4. To deselect, click again

**Common feature categories:**

| Category | Features |
|----------|----------|
| **Technology** | Satellite Navigation, Bluetooth, Apple CarPlay, Android Auto, DAB Radio, Head-Up Display |
| **Comfort** | Leather Seats, Heated Seats, Electric Seats, Memory Seats, Climate Control, Sunroof |
| **Safety** | Parking Sensors, Reverse Camera, 360 Camera, Lane Assist, Blind Spot Monitoring, Adaptive Cruise Control |
| **Convenience** | Keyless Entry, Electric Tailgate, Wireless Charging, USB Ports, Rain Sensors |
| **Styling** | LED Headlights, Alloy Wheels, Ambient Lighting, Sports Suspension, Panoramic Roof |

### Step 6: Write Description

1. Enter a detailed vehicle description in the **Description** field
2. Write at least 150 words covering:
   - Key selling points
   - Vehicle history (service history, previous owners)
   - Notable features
   - Condition details
3. Use paragraphs for readability

**Example description:**

```
This stunning 2022 BMW 3 Series M Sport is presented in immaculate Alpine White 
with Black Dakota Leather upholstery. Having covered just 15,000 miles with 
full BMW main dealer service history, this vehicle represents exceptional value.

Key features include the Professional Navigation system, Harman Kardon surround 
sound, Head-Up Display, and the Driving Assistant Professional package. The 
M Sport Plus package adds upgraded 19-inch alloy wheels, adaptive M suspension, 
and M Sport brakes.

The vehicle has been meticulously maintained with services at 5,000-mile 
intervals. It comes with the balance of BMW warranty until March 2025 and 
12 months MOT. Two keys, full book pack, and HPI clear certificate included.

Finance options available from GBP 450 per month with a GBP 3,299 deposit. 
Part exchange welcome. Viewing by appointment.
```

### Step 7: Upload Images

1. Scroll to the **Images** section
2. Click the upload area or drag and drop images from your computer
3. Supported formats: JPG, PNG, WebP
4. Maximum file size: 10MB per image
5. Maximum images: 20 per vehicle
6. Images will automatically:
   - Be optimized for web
   - Generate thumbnail and full-size versions
   - Upload to Cloudinary CDN

**Image requirements:**

| Type | Recommended | Purpose |
|------|-------------|---------|
| Exterior front | Yes | Primary listing image |
| Exterior rear | Yes | Secondary view |
| Exterior side | Yes | Profile view |
| Interior front | Yes | Dashboard and seats |
| Interior rear | Yes | Rear passenger area |
| Engine bay | Yes | Engine condition |
| Boot/trunk | Yes | Cargo space |
| Detail shots | Optional | Specific features |

**Image ordering:**
- The first image uploaded becomes the primary (featured) image
- Drag and drop to reorder images
- Click the star icon to set a different primary image
- Click the trash icon to delete an image

### Step 8: Set SEO Fields

1. Enter a **Meta Title** (maximum 60 characters)
   - Example: `2022 BMW 3 Series M Sport | APEX Automotive`
2. Enter a **Meta Description** (maximum 160 characters)
   - Example: `Immaculate 2022 BMW 3 Series M Sport with 15,000 miles. Full BMW service history. Finance available. View at APEX Automotive.`

### Step 9: Set Publishing Options

| Option | Default | Description |
|--------|---------|-------------|
| **Status** | Available | Available, Reserved, Sold, Coming Soon, In Preparation |
| **Featured** | No | Show on homepage featured section |

### Step 10: Publish

1. Click **"Save & Publish"** to make the vehicle live immediately
2. Or click **"Save as Draft"** to publish later
3. The vehicle will appear on the website within seconds
4. You will see a success message with a link to view the live listing

---

## 3. Editing a Vehicle

### To Edit a Vehicle:

1. Navigate to **Vehicles** in the sidebar
2. Find the vehicle using:
   - **Search bar:** Type make, model, or registration
   - **Filters:** Filter by status, make, fuel type, etc.
   - **Browse:** Scroll through the list
3. Click on the vehicle row or the **Edit** icon
4. Make your changes in the form
5. Click **"Save Changes"**

### Common Edit Scenarios

| Scenario | What to Change |
|----------|---------------|
| Price reduction | Update **Cash Price** field |
| Mileage correction | Update **Mileage** field |
| Add feature | Check additional feature in Features section |
| Update description | Edit **Description** field |
| Add more photos | Upload additional images |
| Change primary photo | Click star icon on different image |

### Edit History

All changes are tracked in the **Activity Log**. To view the history:
1. Open the vehicle edit page
2. Scroll to the bottom
3. Click the **"View History"** tab
4. See a chronological list of all edits with user names and timestamps

---

## 4. Duplicating a Vehicle

Duplicating saves time when adding similar vehicles (e.g., same make/model, different year).

### To Duplicate:

1. Find the vehicle you want to duplicate
2. Click the **More Actions** menu (three dots)
3. Select **"Duplicate"**
4. A copy will be created with:
   - All specifications copied
   - All features copied
   - Description copied
   - Status set to **"In Preparation"**
   - Images NOT copied (upload new images)
5. Edit the duplicated vehicle to change:
   - Registration number
   - Mileage
   - Year
   - Price
   - Upload new images
6. Click **"Save & Publish"**

---

## 5. Managing Vehicle Status

Vehicle status controls visibility on the public website.

### Status Definitions

| Status | Public View | When to Use |
|--------|-------------|-------------|
| **Available** | Visible on website | Vehicle is ready for sale |
| **Reserved** | Visible with "Reserved" badge | Deposit paid, sale pending |
| **Sold** | Hidden from listings | Vehicle sold |
| **Coming Soon** | Visible with "Coming Soon" badge | Vehicle arriving soon |
| **In Preparation** | Hidden | Vehicle being prepared for sale |

### Changing Status

**Method 1 — Quick change:**
1. On the Vehicles list page, click the status badge
2. Select new status from the dropdown
3. Confirm the change

**Method 2 — Edit page:**
1. Open the vehicle edit page
2. Change the **Status** dropdown
3. Save changes

**Method 3 — Bulk action:**
1. Select multiple vehicles using checkboxes
2. Click **Bulk Actions** → **Change Status**
3. Select new status
4. Confirm

---

## 6. Managing Leads

### Viewing All Leads

1. Navigate to **Leads** in the sidebar
2. View leads in either:
   - **Pipeline view** — Kanban board organized by status
   - **List view** — Sortable table format

### Lead Filtering

Use the filter bar to narrow down leads:

| Filter | Options |
|--------|---------|
| **Type** | Contact, Sell My Car, Test Drive, Finance |
| **Status** | New, Contacted, Qualified, Appointment, Converted, Declined |
| **Assigned To** | Specific team member or Unassigned |
| **Date Range** | Today, This Week, This Month, Custom |
| **Source** | Website, Google, Facebook, AutoTrader, Phone, Walk-in |

### Processing a New Lead

When a new lead arrives, follow this workflow:

#### Step 1: Acknowledge (within 15 minutes)
1. Open the lead detail page
2. Read the enquiry details
3. Update status to **"Contacted"**
4. Add a note: "Acknowledged via email/phone at [time]"

#### Step 2: Initial Contact (within 2 hours)
1. Call or email the customer
2. Gather additional requirements
3. Update the lead with:
   - Customer preferences
   - Budget range
   - Timeline
4. Add detailed notes from the conversation

#### Step 3: Qualify
1. Based on the conversation, update status to **"Qualified"**
2. If interested in a specific vehicle:
   - Link the vehicle to the lead
   - Check vehicle availability
   - Prepare vehicle for viewing

#### Step 4: Schedule Appointment
1. Update status to **"Appointment"**
2. For test drives: Create a test drive booking
3. Send confirmation to customer
4. Add appointment details to notes

#### Step 5: Convert or Decline
- **Converted:** Update status to **"Converted"** and process the sale
- **Declined:** Update status to **"Declined"** with reason

### Adding Notes

1. Open the lead detail page
2. Scroll to the **Notes** section
3. Type your note in the text area
4. Click **"Add Note"**
5. Notes are timestamped and show the author

**Note best practices:**
- Be specific and detailed
- Record customer preferences
- Note any promises made
- Document follow-up actions
- Include next steps

### Assigning Leads

1. Open the lead detail page
2. Click the **Assigned To** field
3. Select a team member from the dropdown
4. The assignee will receive a notification

**Auto-assignment rules** (configurable in Settings):
- Round-robin: Leads distributed equally among team
- By source: Different sources go to different team members
- By type: Finance leads → finance specialist, etc.

---

## 7. Processing a Sale

When a customer decides to purchase a vehicle:

### Step 1: Update Vehicle Status

1. Navigate to **Vehicles**
2. Find the sold vehicle
3. Click **Edit**
4. Change status to **"Reserved"** (deposit paid) or **"Sold"** (completed)
5. Add sale details in the **Notes** field:
   - Sale date
   - Sale price (if different from listed price)
   - Customer name
   - Salesperson

### Step 2: Update the Lead

1. Navigate to **Leads**
2. Find the customer's lead record
3. Update status to **"Converted"**
4. Add conversion details in notes

### Step 3: Record in Activity Log

The system automatically logs:
- Vehicle status change
- Lead conversion
- Associated user actions

### Step 4: Vehicle Removal

- **Reserved:** Vehicle stays visible with "Reserved" badge for 7 days, then hidden
- **Sold:** Vehicle is immediately hidden from public listings
- Sold vehicles remain in the admin system for reporting

---

## 8. Managing Test Drives

### Viewing Test Drive Bookings

1. Navigate to **Leads**
2. Click the **Test Drives** tab
3. View upcoming bookings in calendar or list format

### Calendar View

- Shows bookings by day/week/month
- Color-coded by status:
  - **Blue** = Pending confirmation
  - **Green** = Confirmed
  - **Gray** = Completed
  - **Red** = Cancelled

### Confirming a Test Drive

1. Open the booking details
2. Verify vehicle availability
3. Check for scheduling conflicts
4. Click **"Confirm"**
5. The customer receives a confirmation email/SMS

### Day-of-Test-Drive Checklist

- [ ] Vehicle fuelled and cleaned
- [ ] Vehicle moved to front of showroom
- [ ] Keys prepared
- [ ] Test drive route planned
- [ ] Customer reminded 1 hour before
- [ ] Paperwork prepared (if purchase likely)

### After Test Drive

1. Record outcome in the lead notes:
   - Customer feedback
   - Interest level
   - Objections or concerns
   - Next steps
2. Update lead status accordingly

---

## 9. Processing Finance Applications

### Viewing Finance Applications

1. Navigate to **Leads**
2. Filter by type: **Finance**
3. Click on a finance lead to view details

### Finance Application Review

The application shows:

| Section | Details |
|---------|---------|
| **Applicant** | Name, contact, employment status, income |
| **Vehicle** | Selected vehicle and price |
| **Finance Terms** | Amount, term, deposit, preferred APR |
| **Credit Information** | Self-reported credit rating |

### Processing Steps

1. **Review application** — Check completeness and accuracy
2. **Verify documents** — If documents uploaded, review them
3. **Credit check** — Run formal credit check (external service)
4. **Make decision:**
   - **Approved:** Set status to "Approved", contact customer with terms
   - **Declined:** Set status to "Declined", inform customer with reason
   - **Referred:** Set status to "Documents Required", request additional info
5. **Record decision** with notes explaining the rationale

---

## 10. Managing Blog Posts

### Creating a Blog Post

1. Navigate to **Blog** in the sidebar
2. Click **"New Post"**
3. Fill in the form:

| Field | Required | Notes |
|-------|----------|-------|
| **Title** | Yes | Compelling, SEO-friendly headline |
| **Category** | Yes | Select from existing categories |
| **Excerpt** | Yes | 1-2 sentence summary |
| **Content** | Yes | Full article (rich text editor) |
| **Featured Image** | Yes | 1200x630px recommended |
| **Tags** | No | Comma-separated keywords |
| **Meta Title** | No | SEO title (60 chars max) |
| **Meta Description** | No | SEO description (160 chars max) |

4. Click **"Save as Draft"** or **"Publish"**

### Blog Content Guidelines

| Topic Type | Recommended Length | Frequency |
|------------|-------------------|-----------|
| Buying guides | 1,500-2,500 words | 2 per month |
| Vehicle reviews | 1,000-1,500 words | 1 per week |
| Industry news | 500-800 words | As needed |
| Finance advice | 1,000-1,500 words | 1 per month |

### Publishing Workflow

```
Draft → Review → Scheduled → Published → Archived
  ↑                                    |
  └────── Can edit at any stage ───────┘
```

- **Draft:** Being written, not visible publicly
- **Review:** Ready for approval
- **Scheduled:** Will publish at set date/time
- **Published:** Live on website
- **Archived:** No longer visible, kept for records

---

## 11. Using Analytics

### Sales Dashboard

Navigate to **Analytics** to view:

| Report | What It Shows | How to Use |
|--------|--------------|------------|
| **Sales Overview** | Revenue, units sold, avg. price | Track monthly performance |
| **Lead Pipeline** | Conversion rates by stage | Identify bottlenecks |
| **Source Analysis** | Where leads come from | Optimize marketing spend |
| **Vehicle Performance** | Views and enquiries per vehicle | Identify popular stock |
| **Staff Performance** | Leads handled, conversion rate | Team performance review |

### Date Range Selection

All reports support custom date ranges:
1. Click the date range selector at the top
2. Choose a preset (Today, This Week, This Month, etc.)
3. Or select custom start and end dates
4. Click **Apply** to refresh the data

### Exporting Reports

1. Configure the report with desired filters and date range
2. Click the **Export** button
3. Choose format: CSV, PDF, or Excel
4. The file will download to your computer

---

## 12. Quick Reference

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open command palette |
| `Ctrl + N` | Add new vehicle |
| `Ctrl + L` | Go to leads |
| `Ctrl + D` | Go to dashboard |
| `Ctrl + S` | Save current form |
| `Escape` | Close modal/dialog |
| `/` | Focus search bar |

### Common Actions Reference

| Task | Path | Time Estimate |
|------|------|---------------|
| Add new vehicle | Vehicles → Add Vehicle | 10-15 minutes |
| Edit vehicle | Vehicles → Click vehicle | 2-5 minutes |
| Process new lead | Leads → Open lead → Update status | 3-5 minutes |
| Book test drive | Leads → Test Drive tab → New booking | 2 minutes |
| Publish blog post | Blog → New Post → Publish | 15-30 minutes |
| Export report | Analytics → Export | 1 minute |
| Change settings | Settings → Section → Save | 2-5 minutes |

### Support Contacts

| Issue | Contact | Response Time |
|-------|---------|---------------|
| Technical problems | support@apexautomotive.co.uk | Within 4 hours |
| Feature requests | product@apexautomotive.co.uk | Within 24 hours |
| Training requests | training@apexautomotive.co.uk | Within 48 hours |
| Urgent issues | Call 020 7946 0958 | Immediate |

---

**Document Version:** 1.0  
**Last Updated:** January 2025
