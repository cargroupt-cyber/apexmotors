# Plan: Working Admin Dashboard + Beginner Deployment Guide

## Part 1: Make the Admin Dashboard Actually Work
Since the user is not a developer and has no backend, we'll use localStorage as the "database" — this means:
- Vehicles added in admin appear on the public website immediately
- Leads from contact forms are stored and viewable in admin
- All data persists between browser sessions
- Zero backend infrastructure needed

### Implementation:
1. **Create a localStorage data layer** — CRUD operations for vehicles, leads, settings
2. **Connect admin pages to real data** — AdminVehicles, AdminLeads, AdminDashboard, AdminSettings
3. **Connect public pages to shared data** — Inventory, VehicleDetail use the same data store
4. **Add form submissions** — Contact form, sell-your-car, test drive, finance apps store as leads
5. **Update App.tsx** — Ensure admin routes work properly

### Parallel Agents:
- **Data_Layer_Builder**: Creates localStorage CRUD system + connects admin vehicles page
- **Admin_Pages_Connector**: Connects admin dashboard, leads, analytics, settings to real data
- **Public_Pages_Connector**: Connects inventory, vehicle detail, contact forms to the data layer

## Part 2: Beginner-Friendly Deployment Guide
- **Deployment_Guide_Writer**: Creates the 14-phase beginner guide

## Part 3: Build & Deploy
- Merge all branches, build, deploy
