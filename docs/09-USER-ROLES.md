# APEX Automotive — User Role System

**Purpose:** Complete role-based access control (RBAC) specification for the APEX Automotive platform.  
**Audience:** Developers, administrators, security auditors  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Role Hierarchy](#1-role-hierarchy)
2. [Role Definitions](#2-role-definitions)
3. [Permission Matrix](#3-permission-matrix)
4. [Route Guards](#4-route-guards)
5. [Conditional UI Rendering](#5-conditional-ui-rendering)
6. [API Endpoint Permissions](#6-api-endpoint-permissions)
7. [Implementation Guide](#7-implementation-guide)
8. [Security Considerations](#8-security-considerations)

---

## 1. Role Hierarchy

The APEX Automotive role system follows a hierarchical model where higher roles inherit permissions from lower roles.

```
Super Admin (Level 5)
    └── Full system access
    └── Can manage users and roles
    └── Can delete any data
    └── Can access all settings

    Admin (Level 4)
        └── Vehicle CRUD
        └── Lead management
        └── Analytics access
        └── Settings access (most)
        └── Cannot manage user roles
        └── Cannot delete other admins

        Staff (Level 3)
            └── Vehicle management (add/edit)
            └── View leads
            └── Update lead status
            └── Add notes
            └── Cannot delete vehicles
            └── Cannot access settings
            └── Cannot view analytics

            Sales Team (Level 2)
                └── Lead management only
                └── Cannot access vehicles
                └── Cannot access settings
                └── Cannot access analytics
                └── Can update lead status
                └── Can add notes

                Marketing Team (Level 1)
                    └── Blog management only
                    └── Can create/edit/publish posts
                    └── Can view analytics (limited)
                    └── Cannot access vehicles
                    └── Cannot access leads
                    └── Cannot access settings
```

### Role Assignment Rules

| Rule | Description |
|------|-------------|
| A user can only have one role | No multiple roles per user |
| Super Admin can assign any role | Only super_admin can create other super_admins |
| Admin cannot create super_admins | Prevents privilege escalation |
| Users cannot change their own role | Prevents self-promotion |
| Deactivating a user revokes all access | Soft delete via `is_active` flag |

---

## 2. Role Definitions

### 2.1 Super Admin

**Level:** 5  
**Purpose:** System owner with unrestricted access.

```typescript
const superAdminPermissions = {
  // Users
  users: {
    create: true,
    read: true,
    update: true,
    delete: true,
    manageRoles: true,    // Can change any user's role
    deactivate: true,     // Can deactivate any account
  },

  // Vehicles
  vehicles: {
    create: true,
    read: true,
    update: true,
    delete: true,
    bulkActions: true,
    export: true,
    duplicate: true,
  },

  // Leads
  leads: {
    create: true,
    read: true,
    update: true,
    delete: true,
    assign: true,
    changeStatus: true,
    addNotes: true,
    export: true,
    bulkActions: true,
  },

  // Test Drives
  testDrives: {
    create: true,
    read: true,
    update: true,
    delete: true,
    confirm: true,
    cancel: true,
  },

  // Finance
  finance: {
    create: true,
    read: true,
    update: true,
    delete: true,
    approve: true,
    decline: true,
  },

  // Blog
  blog: {
    create: true,
    read: true,
    update: true,
    delete: true,
    publish: true,
    unpublish: true,
  },

  // Analytics
  analytics: {
    view: true,
    export: true,
    allReports: true,
  },

  // Settings
  settings: {
    view: true,
    update: true,
    allSections: true,    // Access to all settings tabs
  },

  // System
  system: {
    backup: true,
    restore: true,
    logs: true,
    auditTrail: true,
  },
};
```

### 2.2 Admin

**Level:** 4  
**Purpose:** General management with some restrictions.

```typescript
const adminPermissions = {
  users: {
    create: true,
    read: true,
    update: true,
    delete: false,        // Cannot delete users (only deactivate)
    manageRoles: false,   // Cannot change roles (only super_admin can)
    deactivate: true,     // Can deactivate staff/sales/marketing
  },
  vehicles: { create: true, read: true, update: true, delete: true, bulkActions: true, export: true, duplicate: true },
  leads: { create: true, read: true, update: true, delete: false, assign: true, changeStatus: true, addNotes: true, export: true, bulkActions: true },
  testDrives: { create: true, read: true, update: true, delete: false, confirm: true, cancel: true },
  finance: { create: true, read: true, update: true, delete: false, approve: true, decline: true },
  blog: { create: true, read: true, update: true, delete: true, publish: true, unpublish: true },
  analytics: { view: true, export: true, allReports: true },
  settings: { view: true, update: true, allSections: false }, // Most settings except critical system settings
  system: { backup: false, restore: false, logs: true, auditTrail: true },
};
```

### 2.3 Staff

**Level:** 3  
**Purpose:** Day-to-day vehicle and lead management.

```typescript
const staffPermissions = {
  users: { create: false, read: false, update: false, delete: false, manageRoles: false, deactivate: false },
  vehicles: { create: true, read: true, update: true, delete: false, bulkActions: true, export: false, duplicate: true },
  leads: { create: false, read: true, update: true, delete: false, assign: false, changeStatus: true, addNotes: true, export: false, bulkActions: false },
  testDrives: { create: false, read: true, update: true, delete: false, confirm: true, cancel: false },
  finance: { create: false, read: true, update: false, delete: false, approve: false, decline: false },
  blog: { create: false, read: false, update: false, delete: false, publish: false, unpublish: false },
  analytics: { view: false, export: false, allReports: false },
  settings: { view: false, update: false, allSections: false },
  system: { backup: false, restore: false, logs: false, auditTrail: false },
};
```

### 2.4 Sales Team

**Level:** 2  
**Purpose:** Lead-focused role for sales representatives.

```typescript
const salesPermissions = {
  users: { create: false, read: false, update: false, delete: false, manageRoles: false, deactivate: false },
  vehicles: { create: false, read: true, update: false, delete: false, bulkActions: false, export: false, duplicate: false },
  leads: { create: false, read: true, update: true, delete: false, assign: false, changeStatus: true, addNotes: true, export: false, bulkActions: false },
  testDrives: { create: true, read: true, update: true, delete: false, confirm: false, cancel: false },
  finance: { create: true, read: true, update: true, delete: false, approve: false, decline: false },
  blog: { create: false, read: false, update: false, delete: false, publish: false, unpublish: false },
  analytics: { view: false, export: false, allReports: false },
  settings: { view: false, update: false, allSections: false },
  system: { backup: false, restore: false, logs: false, auditTrail: false },
};
```

### 2.5 Marketing Team

**Level:** 1  
**Purpose:** Content creation and marketing activities.

```typescript
const marketingPermissions = {
  users: { create: false, read: false, update: false, delete: false, manageRoles: false, deactivate: false },
  vehicles: { create: false, read: true, update: false, delete: false, bulkActions: false, export: false, duplicate: false },
  leads: { create: false, read: false, update: false, delete: false, assign: false, changeStatus: false, addNotes: false, export: false, bulkActions: false },
  testDrives: { create: false, read: false, update: false, delete: false, confirm: false, cancel: false },
  finance: { create: false, read: false, update: false, delete: false, approve: false, decline: false },
  blog: { create: true, read: true, update: true, delete: true, publish: true, unpublish: true },
  analytics: { view: true, export: true, allReports: false }, // Limited reports only
  settings: { view: false, update: false, allSections: false },
  system: { backup: false, restore: false, logs: false, auditTrail: false },
};
```

---

## 3. Permission Matrix

### Complete Permission Overview

| Feature | Super Admin | Admin | Staff | Sales | Marketing |
|---------|:-----------:|:-----:|:-----:|:-----:|:---------:|
| **USERS** |
| Create users | Yes | Yes | No | No | No |
| View users | Yes | Yes | No | No | No |
| Edit users | Yes | Yes | No | No | No |
| Delete users | Yes | No | No | No | No |
| Manage roles | Yes | No | No | No | No |
| Deactivate users | Yes | Yes | No | No | No |
| **VEHICLES** |
| View vehicles | Yes | Yes | Yes | Yes | Yes |
| Add vehicle | Yes | Yes | Yes | No | No |
| Edit vehicle | Yes | Yes | Yes | No | No |
| Delete vehicle | Yes | Yes | No | No | No |
| Duplicate vehicle | Yes | Yes | Yes | No | No |
| Bulk actions | Yes | Yes | Yes | No | No |
| Export vehicles | Yes | Yes | No | No | No |
| **LEADS** |
| View all leads | Yes | Yes | Yes | Yes | No |
| View assigned leads | Yes | Yes | Yes | Yes | No |
| Update lead status | Yes | Yes | Yes | Yes | No |
| Assign leads | Yes | Yes | No | No | No |
| Add notes | Yes | Yes | Yes | Yes | No |
| Export leads | Yes | Yes | No | No | No |
| Delete leads | Yes | No | No | No | No |
| **TEST DRIVES** |
| View bookings | Yes | Yes | Yes | Yes | No |
| Create booking | Yes | Yes | No | Yes | No |
| Confirm booking | Yes | Yes | Yes | No | No |
| Cancel booking | Yes | Yes | No | No | No |
| **FINANCE** |
| View applications | Yes | Yes | Yes | Yes | No |
| Create application | Yes | Yes | No | Yes | No |
| Approve application | Yes | Yes | No | No | No |
| Decline application | Yes | Yes | No | No | No |
| **BLOG** |
| Create posts | Yes | Yes | No | No | Yes |
| Edit posts | Yes | Yes | No | No | Yes |
| Publish posts | Yes | Yes | No | No | Yes |
| Delete posts | Yes | Yes | No | No | Yes |
| **ANALYTICS** |
| View dashboard | Yes | Yes | No | No | Yes |
| View all reports | Yes | Yes | No | No | No |
| View marketing reports | Yes | Yes | No | No | Yes |
| Export reports | Yes | Yes | No | No | Yes |
| **SETTINGS** |
| View settings | Yes | Yes | No | No | No |
| Edit business info | Yes | Yes | No | No | No |
| Edit SEO settings | Yes | Yes | No | No | No |
| Manage integrations | Yes | No | No | No | No |
| **SYSTEM** |
| View audit log | Yes | Yes | No | No | No |
| Create backup | Yes | No | No | No | No |
| Restore backup | Yes | No | No | No | No |

---

## 4. Route Guards

### Frontend Route Guards

```typescript
// hooks/useAuth.ts
import { useUser } from "@clerk/clerk-react";

export type UserRole = "super_admin" | "admin" | "staff" | "sales" | "marketing";

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || "staff";

  return {
    user,
    isLoaded,
    isSignedIn,
    role,
    isSuperAdmin: role === "super_admin",
    isAdmin: role === "super_admin" || role === "admin",
    isStaff: ["super_admin", "admin", "staff"].includes(role),
    isSales: ["super_admin", "admin", "staff", "sales"].includes(role),
    isMarketing: ["super_admin", "admin", "marketing"].includes(role),
  };
}

// Route guard component
export function RouteGuard({
  requiredRole,
  children,
  fallback,
}: {
  requiredRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isLoaded, isSignedIn, role } = useAuth();

  if (!isLoaded) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/login" />;

  const roleHierarchy: Record<UserRole, number> = {
    super_admin: 5,
    admin: 4,
    staff: 3,
    sales: 2,
    marketing: 1,
  };

  if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
    return fallback || <Navigate to="/admin" />;
  }

  return <>{children}</>;
}

// Route configuration
export const adminRoutes = [
  { path: "/admin", element: <Dashboard />, minRole: "staff" as UserRole },
  { path: "/admin/vehicles", element: <VehiclesPage />, minRole: "staff" as UserRole },
  { path: "/admin/vehicles/new", element: <VehicleForm />, minRole: "staff" as UserRole },
  { path: "/admin/vehicles/:id/edit", element: <VehicleForm />, minRole: "staff" as UserRole },
  { path: "/admin/leads", element: <LeadsPage />, minRole: "sales" as UserRole },
  { path: "/admin/leads/:id", element: <LeadDetail />, minRole: "sales" as UserRole },
  { path: "/admin/analytics", element: <AnalyticsPage />, minRole: "admin" as UserRole },
  { path: "/admin/settings", element: <SettingsPage />, minRole: "admin" as UserRole },
  { path: "/admin/blog", element: <BlogPage />, minRole: "marketing" as UserRole },
];
```

### Navigation Menu Based on Role

```typescript
// components/admin/Sidebar.tsx
const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    minRole: "staff",
  },
  {
    label: "Vehicles",
    icon: Car,
    href: "/admin/vehicles",
    minRole: "staff",
  },
  {
    label: "Leads",
    icon: Users,
    href: "/admin/leads",
    minRole: "sales",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    minRole: "admin",
  },
  {
    label: "Blog",
    icon: FileText,
    href: "/admin/blog",
    minRole: "marketing",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
    minRole: "admin",
  },
];

function Sidebar() {
  const { role } = useAuth();
  const roleHierarchy = { super_admin: 5, admin: 4, staff: 3, sales: 2, marketing: 1 };
  const userLevel = roleHierarchy[role];

  const visibleItems = menuItems.filter((item) => {
    const requiredLevel = roleHierarchy[item.minRole];
    return userLevel >= requiredLevel;
  });

  return (
    <nav>
      {visibleItems.map((item) => (
        <SidebarItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
```

---

## 5. Conditional UI Rendering

### Permission Hook

```typescript
// hooks/usePermissions.ts
import { useAuth, type UserRole } from "./useAuth";

type Permission =
  | "vehicles:create" | "vehicles:read" | "vehicles:update" | "vehicles:delete"
  | "leads:read" | "leads:update" | "leads:assign"
  | "analytics:view"
  | "settings:view" | "settings:update"
  | "users:manage";

const permissionMap: Record<UserRole, Permission[]> = {
  super_admin: [
    "vehicles:create", "vehicles:read", "vehicles:update", "vehicles:delete",
    "leads:read", "leads:update", "leads:assign",
    "analytics:view",
    "settings:view", "settings:update",
    "users:manage",
  ],
  admin: [
    "vehicles:create", "vehicles:read", "vehicles:update", "vehicles:delete",
    "leads:read", "leads:update", "leads:assign",
    "analytics:view",
    "settings:view", "settings:update",
  ],
  staff: [
    "vehicles:create", "vehicles:read", "vehicles:update",
    "leads:read", "leads:update",
  ],
  sales: [
    "vehicles:read",
    "leads:read", "leads:update",
  ],
  marketing: [
    "vehicles:read",
    "analytics:view",
  ],
};

export function usePermissions() {
  const { role } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    return permissionMap[role]?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions };
}
```

### Conditional Component Rendering

```typescript
// components/PermissionGate.tsx
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage in components:
function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { hasPermission } = usePermissions();

  return (
    <Card>
      <CardContent>
        <h3>{vehicle.make} {vehicle.model}</h3>
        <p>{vehicle.price}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline">View</Button>

        <PermissionGate permission="vehicles:update">
          <Button variant="outline">Edit</Button>
        </PermissionGate>

        <PermissionGate permission="vehicles:delete">
          <Button variant="destructive">Delete</Button>
        </PermissionGate>
      </CardFooter>
    </Card>
  );
}
```

### Conditional Table Actions

```typescript
// Vehicle table actions based on role
function VehicleActions({ vehicle }: { vehicle: Vehicle }) {
  const { hasPermission } = usePermissions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => viewVehicle(vehicle.id)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>

        <PermissionGate permission="vehicles:update">
          <DropdownMenuItem onClick={() => editVehicle(vehicle.id)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        </PermissionGate>

        <PermissionGate permission="vehicles:update">
          <DropdownMenuItem onClick={() => duplicateVehicle(vehicle.id)}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
        </PermissionGate>

        <PermissionGate permission="vehicles:update">
          <DropdownMenuItem onClick={() => toggleFeatured(vehicle.id)}>
            <Star className="mr-2 h-4 w-4" />
            {vehicle.isFeatured ? "Remove Featured" : "Mark Featured"}
          </DropdownMenuItem>
        </PermissionGate>

        <DropdownMenuSeparator />

        <PermissionGate permission="vehicles:delete">
          <DropdownMenuItem
            onClick={() => deleteVehicle(vehicle.id)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 6. API Endpoint Permissions

### Middleware Implementation

```typescript
// middleware/permissions.ts
import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

type ApiPermission =
  | "vehicles:create" | "vehicles:read" | "vehicles:update" | "vehicles:delete"
  | "leads:read" | "leads:update" | "leads:assign"
  | "analytics:view"
  | "settings:read" | "settings:update"
  | "users:manage";

const apiPermissionMap: Record<string, ApiPermission[]> = {
  super_admin: ["*" as any], // All permissions
  admin: [
    "vehicles:*", "leads:*", "analytics:*", "settings:*",
  ],
  staff: [
    "vehicles:create", "vehicles:read", "vehicles:update",
    "leads:read", "leads:update",
  ],
  sales: [
    "vehicles:read",
    "leads:read", "leads:update",
  ],
  marketing: [
    "vehicles:read",
    "analytics:view",
  ],
};

export function requirePermission(permission: ApiPermission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user role from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: "Account inactive" });
    }

    const permissions = apiPermissionMap[user.role] || [];
    const hasWildcard = permissions.includes("*");
    const hasResourceWildcard = permissions.includes(`${permission.split(":")[0]}:*`);
    const hasSpecific = permissions.includes(permission);

    if (!hasWildcard && !hasResourceWildcard && !hasSpecific) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Required permission: ${permission}`,
      });
    }

    // Attach user to request for use in handlers
    (req as any).userRole = user.role;
    (req as any).userPermissions = permissions;

    next();
  };
}

// Usage in routes:
// router.post("/vehicles", requireAuth, requirePermission("vehicles:create"), createVehicle);
// router.delete("/vehicles/:id", requireAuth, requirePermission("vehicles:delete"), deleteVehicle);
```

---

## 7. Implementation Guide

### Setting Up Clerk.dev with Roles

```typescript
// 1. Configure Clerk with custom claims
// In Clerk Dashboard → JWT Templates → New Template
{
  "name": "apex-automotive",
  "claims": {
    "metadata": {
      "role": "{{user.public_metadata.role}}"
    }
  }
}

// 2. Set user role via Clerk API
import { clerkClient } from "@clerk/clerk-sdk-node";

async function assignUserRole(userId: string, role: UserRole) {
  await clerkClient.users.updateUser(userId, {
    publicMetadata: { role },
  });
}

// 3. Read role in frontend
import { useUser } from "@clerk/clerk-react";

function AdminPage() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as UserRole;

  // Use role for conditional rendering
}

// 4. Read role in backend
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

app.use(ClerkExpressRequireAuth());

app.get("/api/admin/data", async (req, res) => {
  const role = req.auth.sessionClaims?.metadata?.role;
  if (role !== "super_admin" && role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  // Return admin data
});
```

### Database Role Storage

```sql
-- Role is stored in the users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'staff'
  CHECK (role IN ('super_admin', 'admin', 'staff', 'sales', 'marketing'));

-- Create default super admin
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin@apexautomotive.co.uk', 'HASH', 'System', 'Admin', 'super_admin', true);
```

---

## 8. Security Considerations

### Role Security Checklist

| # | Check | Implementation |
|---|-------|---------------|
| 1 | Roles enforced on backend | API middleware validates every request |
| 2 | Roles enforced on frontend | Route guards + conditional rendering |
| 3 | Role stored server-side | Database is source of truth, not client |
| 4 | Users cannot self-elevate | Role changes require higher-privileged user |
| 5 | Audit trail for role changes | Activity log records all role assignments |
| 6 | Principle of least privilege | Each role has minimum required permissions |
| 7 | Regular access reviews | Quarterly review of active user roles |
| 8 | Auto-disable inactive accounts | `is_active` flag for soft deletion |
| 9 | Session timeout | 24-hour session expiry |
| 10 | Concurrent session limit | Maximum 3 active sessions per user |

### Audit Trail for Role Changes

All role changes are logged in the activity_log table:

```typescript
async function changeUserRole(
  targetUserId: string,
  newRole: UserRole,
  changedBy: string
) {
  const oldRole = await getUserRole(targetUserId);

  await db.update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, targetUserId));

  // Log the change
  await db.insert(activityLog).values({
    userId: changedBy,
    action: "ROLE_CHANGE",
    entityType: "user",
    entityId: targetUserId,
    details: {
      from: oldRole,
      to: newRole,
      changedAt: new Date().toISOString(),
    },
  });
}
```

---

**Document Version:** 1.0  
**Last Updated:** January 2025
