# APEX Automotive — Admin Dashboard Guide

**Purpose:** Comprehensive documentation for the APEX Automotive admin dashboard interface.  
**Audience:** Developers, administrators, dealership staff  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Overview](#1-overview)
2. [Dashboard Overview Page](#2-dashboard-overview-page)
3. [Vehicle Management](#3-vehicle-management)
4. [Lead CRM](#4-lead-crm)
5. [Analytics & Reporting](#5-analytics--reporting)
6. [Settings](#6-settings)
7. [Technical Implementation](#7-technical-implementation)
8. [UI Component Library](#8-ui-component-library)
9. [Data Flow Architecture](#9-data-flow-architecture)

---

## 1. Overview

The APEX Automotive admin dashboard provides a complete back-office system for managing every aspect of the dealership operation. Built with React, Recharts for data visualization, and shadcn/ui for the component library, it offers a modern, responsive, and intuitive interface.

### Dashboard Architecture

```
/admin                          Dashboard Overview (KPIs + Charts)
/admin/vehicles                 Vehicle Management (List + CRUD)
/admin/vehicles/new             Add New Vehicle
/admin/vehicles/:id/edit        Edit Vehicle
/admin/leads                    Lead CRM (Pipeline + Details)
/admin/leads/:id                Lead Detail View
/admin/analytics                Analytics & Reports
/admin/settings                 System Settings
```

### Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| React 19 | UI framework | 19.x |
| TypeScript | Type safety | 5.x |
| React Router DOM | Client-side routing | 6.x |
| Recharts | Data visualization | 2.x |
| shadcn/ui | UI component primitives | Latest |
| Tailwind CSS | Styling | 3.4 |
| Lucide React | Icons | Latest |
| Framer Motion | Page transitions | 11.x |
| date-fns | Date formatting | 3.x |

---

## 2. Dashboard Overview Page

### Route: `/admin`

The dashboard overview provides a high-level summary of the dealership's current state through KPI cards, charts, and recent activity feeds.

### KPI Cards (Top Row)

Four key metric cards display the most critical business data:

```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  change: number;        // Percentage change from previous period
  changeLabel: string;   // e.g., "vs last month"
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
  href?: string;         // Link to detail page
}

// KPI Cards Configuration
const kpiCards: KPICardProps[] = [
  {
    title: "Total Vehicles",
    value: 142,
    change: 12,
    changeLabel: "vs last month",
    icon: Car,
    trend: "up",
    href: "/admin/vehicles",
  },
  {
    title: "New Leads",
    value: 38,
    change: 24,
    changeLabel: "vs last week",
    icon: Users,
    trend: "up",
    href: "/admin/leads",
  },
  {
    title: "Test Drives",
    value: 15,
    change: -5,
    changeLabel: "vs last week",
    icon: Calendar,
    trend: "down",
    href: "/admin/leads?filter=test_drive",
  },
  {
    title: "Conversion Rate",
    value: "18.4%",
    change: 3.2,
    changeLabel: "vs last month",
    icon: TrendingUp,
    trend: "up",
    href: "/admin/analytics",
  },
];
```

### Sales Chart (Main Area)

A Recharts area chart showing sales trends over the last 12 months:

```typescript
// Sales data structure
interface SalesDataPoint {
  month: string;       // "Jan 2025"
  sales: number;       // Number of vehicles sold
  revenue: number;     // Total revenue
  leads: number;       // New leads generated
  testDrives: number;  // Test drives booked
}

// Chart configuration
<ResponsiveContainer width="100%" height={400}>
  <AreaChart data={salesData}>
    <defs>
      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="month" stroke="#6b7280" />
    <YAxis stroke="#6b7280" />
    <Tooltip
      contentStyle={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      }}
    />
    <Legend />
    <Area
      type="monotone"
      dataKey="sales"
      stroke="#2563eb"
      strokeWidth={2}
      fill="url(#salesGradient)"
      name="Vehicles Sold"
    />
    <Area
      type="monotone"
      dataKey="leads"
      stroke="#10b981"
      strokeWidth={2}
      fill="transparent"
      name="New Leads"
    />
  </AreaChart>
</ResponsiveContainer>
```

### Lead Funnel Chart

A funnel visualization showing lead progression through the pipeline:

```typescript
// Funnel data
const funnelData = [
  { stage: "New", count: 156, percentage: 100 },
  { stage: "Contacted", count: 134, percentage: 86 },
  { stage: "Qualified", count: 89, percentage: 57 },
  { stage: "Appointment", count: 52, percentage: 33 },
  { stage: "Converted", count: 29, percentage: 19 },
];

// Funnel chart using Recharts BarChart
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={funnelData} layout="vertical">
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" />
    <YAxis dataKey="stage" type="category" width={100} />
    <Tooltip />
    <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]}>
      {funnelData.map((entry, index) => (
        <Cell
          key={index}
          fill={COLORS[index % COLORS.length]}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

### Recent Activity Feed

A real-time feed of recent system actions:

```typescript
interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  entity: string;
  entityName: string;
  timestamp: Date;
}

// Recent activities displayed in sidebar or bottom panel
const recentActivities: ActivityItem[] = [
  {
    id: "1",
    user: "James Wilson",
    avatar: "/avatars/james.jpg",
    action: "added",
    entity: "vehicle",
    entityName: "2023 Audi A4",
    timestamp: new Date("2025-01-20T14:30:00"),
  },
  {
    id: "2",
    user: "John Smith",
    avatar: "/avatars/john.jpg",
    action: "updated status of",
    entity: "lead",
    entityName: "Michael Thompson",
    timestamp: new Date("2025-01-20T14:15:00"),
  },
];
```

---

## 3. Vehicle Management

### Route: `/admin/vehicles`

The vehicle management page is the most feature-rich section of the admin dashboard, providing full CRUD operations for the vehicle inventory.

### Vehicle List View

```typescript
// Vehicle list with filtering, sorting, and pagination
interface VehicleListState {
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  pageSize: number;
  sortBy: string;       // e.g., "created_at", "price", "year"
  sortOrder: "asc" | "desc";
  filters: VehicleFilters;
  selectedIds: string[]; // For bulk actions
}

interface VehicleFilters {
  search: string;       // Full-text search
  status: VehicleStatus | "all";
  make: string;
  fuelType: FuelType | "all";
  transmission: Transmission | "all";
  bodyType: BodyType | "all";
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  isFeatured: boolean | "all";
}
```

### Column Configuration

| Column | Key | Sortable | Filterable | Width |
|--------|-----|----------|------------|-------|
| Image | `primaryImage` | No | No | 80px |
| Make & Model | `make`, `model` | Yes | Yes (dropdown) | 200px |
| Year | `year` | Yes | Yes (range) | 80px |
| Price | `price` | Yes | Yes (range) | 120px |
| Status | `status` | Yes | Yes (dropdown) | 120px |
| Featured | `isFeatured` | Yes | Yes (toggle) | 100px |
| Views | `viewCount` | Yes | No | 80px |
| Created | `createdAt` | Yes | Yes (date) | 120px |
| Actions | — | No | No | 120px |

### Vehicle Status Badge Component

```typescript
// Status badge with color coding
const statusConfig: Record<VehicleStatus, { label: string; variant: BadgeVariant }> = {
  available:      { label: "Available",       variant: "success" },
  reserved:       { label: "Reserved",        variant: "warning" },
  sold:           { label: "Sold",            variant: "destructive" },
  coming_soon:    { label: "Coming Soon",     variant: "info" },
  in_preparation: { label: "In Preparation",  variant: "secondary" },
};

function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

### Add/Edit Vehicle Form

The vehicle form is organized into sections:

```typescript
// Form sections
const formSections = [
  {
    title: "Basic Information",
    fields: ["make", "model", "year", "variant", "registration"],
  },
  {
    title: "Specifications",
    fields: ["bodyType", "fuelType", "transmission", "engineSize", "doors", "seats", "colour", "mileage"],
  },
  {
    title: "Pricing",
    fields: ["price", "financePrice", "monthlyPayment", "apr", "deposit"],
  },
  {
    title: "Features",
    fields: ["features"], // Checkbox group
  },
  {
    title: "Description",
    fields: ["description"],
  },
  {
    title: "SEO",
    fields: ["metaTitle", "metaDescription"],
  },
  {
    title: "Images",
    fields: ["images"], // Drag & drop upload
  },
  {
    title: "Publishing",
    fields: ["status", "isFeatured"],
  },
];
```

### Vehicle Features Checklist

```typescript
const availableFeatures = [
  "Satellite Navigation",
  "Leather Seats",
  "Parking Sensors",
  "Reverse Camera",
  "Bluetooth",
  "Climate Control",
  "Cruise Control",
  "LED Headlights",
  "Alloy Wheels",
  "Apple CarPlay",
  "Android Auto",
  "Sunroof",
  "Heated Seats",
  "Electric Seats",
  "Keyless Entry",
  "Start/Stop System",
  "Lane Assist",
  "Blind Spot Monitoring",
  "Adaptive Cruise Control",
  "Panoramic Roof",
  "DAB Radio",
  "USB Ports",
  "Wireless Charging",
  "Head-Up Display",
  "360 Camera",
  "Electric Tailgate",
  "Memory Seats",
  "Ambient Lighting",
  "Sports Suspension",
  "Rain Sensors",
];

// Feature selector component
function FeatureSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (features: string[]) => void;
}) {
  const toggleFeature = (feature: string) => {
    if (selected.includes(feature)) {
      onChange(selected.filter((f) => f !== feature));
    } else {
      onChange([...selected, feature]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {availableFeatures.map((feature) => (
        <label
          key={feature}
          className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
            selected.includes(feature)
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Checkbox
            checked={selected.includes(feature)}
            onCheckedChange={() => toggleFeature(feature)}
          />
          <span className="text-sm">{feature}</span>
        </label>
      ))}
    </div>
  );
}
```

### Image Upload Component

```typescript
// Drag & drop image upload with preview
interface ImageUploadProps {
  images: VehicleImage[];
  onImagesChange: (images: VehicleImage[]) => void;
  maxImages?: number;
}

function ImageUpload({ images, onImagesChange, maxImages = 20 }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const newImages = acceptedFiles.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        sortOrder: images.length + index,
        isPrimary: images.length === 0 && index === 0,
      }));

      onImagesChange([...images, ...newImages]);
    },
    [images, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const setPrimary = (id: string) => {
    onImagesChange(
      images.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const reorderImages = (oldIndex: number, newIndex: number) => {
    const reordered = arrayMove(images, oldIndex, newIndex);
    onImagesChange(
      reordered.map((img, index) => ({ ...img, sortOrder: index }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? "Drop images here..."
            : `Drag & drop images, or click to browse (max ${maxImages})`}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 10MB each</p>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <SortableContext items={images.map((i) => i.id)}>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                isPrimary={image.isPrimary}
                onSetPrimary={() => setPrimary(image.id)}
                onRemove={() => removeImage(image.id)}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
```

### Bulk Actions

```typescript
// Bulk actions for vehicle management
const bulkActions = [
  {
    label: "Change Status",
    icon: RefreshCw,
    action: "change-status",
    requiresConfirmation: true,
  },
  {
    label: "Mark as Featured",
    icon: Star,
    action: "feature",
    requiresConfirmation: false,
  },
  {
    label: "Remove Featured",
    icon: StarOff,
    action: "unfeature",
    requiresConfirmation: false,
  },
  {
    label: "Duplicate",
    icon: Copy,
    action: "duplicate",
    requiresConfirmation: false,
  },
  {
    label: "Export CSV",
    icon: Download,
    action: "export",
    requiresConfirmation: false,
  },
  {
    label: "Delete",
    icon: Trash2,
    action: "delete",
    requiresConfirmation: true,
    danger: true,
  },
];

// Bulk action handler
async function handleBulkAction(
  action: string,
  vehicleIds: string[],
  extraData?: Record<string, unknown>
): Promise<void> {
  switch (action) {
    case "change-status":
      await api.patch("/api/vehicles/bulk/status", {
        ids: vehicleIds,
        status: extraData?.status,
      });
      toast.success(`Updated status for ${vehicleIds.length} vehicles`);
      break;

    case "duplicate":
      await Promise.all(
        vehicleIds.map((id) => api.post(`/api/vehicles/${id}/duplicate`))
      );
      toast.success(`Duplicated ${vehicleIds.length} vehicles`);
      break;

    case "delete":
      await api.delete("/api/vehicles/bulk", { data: { ids: vehicleIds } });
      toast.success(`Deleted ${vehicleIds.length} vehicles`);
      break;

    case "export":
      const csv = await api.post("/api/vehicles/export", { ids: vehicleIds });
      downloadFile(csv, "vehicles-export.csv");
      break;
  }
}
```

---

## 4. Lead CRM

### Route: `/admin/leads`

The lead management system provides a complete CRM (Customer Relationship Management) interface for tracking customer enquiries from initial contact through to conversion.

### Lead Pipeline View

```typescript
// Pipeline stages
const pipelineStages: PipelineStage[] = [
  { id: "new",         label: "New",         color: "#3b82f6", count: 12 },
  { id: "contacted",   label: "Contacted",   color: "#8b5cf6", count: 8 },
  { id: "qualified",   label: "Qualified",   color: "#f59e0b", count: 5 },
  { id: "appointment", label: "Appointment", color: "#10b981", count: 3 },
  { id: "converted",   label: "Converted",   color: "#059669", count: 2 },
  { id: "declined",    label: "Declined",    color: "#ef4444", count: 1 },
];

// Pipeline board (Kanban-style)
function LeadPipeline({ leads }: { leads: Lead[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {pipelineStages.map((stage) => (
        <div
          key={stage.id}
          className="flex-shrink-0 w-80"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <h3 className="font-medium">{stage.label}</h3>
              <Badge variant="secondary">{stage.count}</Badge>
            </div>
          </div>
          <div className="space-y-3">
            {leads
              .filter((l) => l.status === stage.id)
              .map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Lead Card Component

```typescript
function LeadCard({ lead }: { lead: Lead }) {
  const typeIcon = {
    contact:    { icon: MessageSquare, label: "Contact" },
    sell_car:   { icon: Tag, label: "Sell Car" },
    test_drive: { icon: Calendar, label: "Test Drive" },
    finance:    { icon: CreditCard, label: "Finance" },
  };

  const { icon: Icon, label } = typeIcon[lead.type];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {label}
        </Badge>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
        </span>
      </div>
      <h4 className="font-medium mb-1">
        {lead.firstName} {lead.lastName}
      </h4>
      <p className="text-sm text-gray-500 mb-2">{lead.email}</p>
      {lead.vehicleId && (
        <p className="text-xs text-blue-600 mb-2">
          Interested in vehicle #{lead.vehicleId.slice(0, 8)}
        </p>
      )}
      <div className="flex items-center gap-2 mt-3">
        {lead.assignedTo ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={lead.assignedToAvatar} />
            <AvatarFallback>
              {lead.assignedToName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Assign
          </Button>
        )}
      </div>
    </Card>
  );
}
```

### Lead Detail View

The lead detail page (`/admin/leads/:id`) provides comprehensive information:

```typescript
// Lead detail sections
const leadDetailSections = [
  {
    title: "Customer Information",
    fields: ["firstName", "lastName", "email", "phone"],
  },
  {
    title: "Enquiry Details",
    fields: ["type", "subject", "message", "source"],
  },
  {
    title: "Vehicle Interest",
    fields: ["vehicleId", "registration", "mileage", "condition"],
  },
  {
    title: "Pipeline Status",
    fields: ["status", "assignedTo", "statusChangedAt"],
  },
  {
    title: "Test Drive / Finance Details",
    fields: ["preferredDate", "preferredTime", "amount", "term", "employmentStatus", "annualIncome", "creditRating"],
  },
  {
    title: "Internal Notes",
    fields: ["notes", "internalNotes"],
  },
];
```

### Status Update with Timeline

```typescript
// Status update timeline
interface StatusHistoryEntry {
  id: string;
  from: LeadStatus;
  to: LeadStatus;
  changedBy: string;
  changedAt: Date;
  note: string;
}

function StatusTimeline({ entries }: { entries: StatusHistoryEntry[] }) {
  return (
    <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative">
          {/* Timeline dot */}
          <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />

          <div className="text-sm">
            <p className="font-medium">
              Status changed from{" "}
              <StatusBadge status={entry.from} /> to{" "}
              <StatusBadge status={entry.to} />
            </p>
            <p className="text-gray-500 mt-1">
              by {entry.changedBy} —{" "}
              {format(entry.changedAt, "dd MMM yyyy, HH:mm")}
            </p>
            {entry.note && (
              <p className="text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                {entry.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 5. Analytics & Reporting

### Route: `/admin/analytics`

Comprehensive analytics dashboard with multiple chart types and date range selection.

### Chart Types

```typescript
// Sales trend — Area chart
<SalesTrendChart
  data={monthlySales}
  dateRange={dateRange}
  granularity="month" // or "week", "day"
/>

// Lead sources — Pie chart
<LeadSourcesChart
  data={leadSources}
  showPercentages={true}
/>

// Conversion funnel — Funnel chart
<ConversionFunnel
  stages={conversionStages}
  showDropOff={true}
/>

// Vehicle performance — Bar chart
<VehiclePerformanceChart
  data={topVehicles}
  metric="views" // or "enquiries", "test_drives"
/>

// Staff performance — Table + sparklines
<StaffPerformanceTable
  data={staffMetrics}
  columns={["name", "leads_handled", "conversion_rate", "response_time"]}
/>
```

### Date Range Selector

```typescript
const dateRangePresets = [
  { label: "Today", days: 0 },
  { label: "Yesterday", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "This Month", type: "month", offset: 0 },
  { label: "Last Month", type: "month", offset: 1 },
  { label: "This Year", type: "year", offset: 0 },
  { label: "Custom", type: "custom" },
];
```

### Key Reports

| Report | Data | Update Frequency |
|--------|------|-----------------|
| Sales Overview | Revenue, units sold, average price | Real-time |
| Lead Pipeline | Stage distribution, conversion rate | Real-time |
| Source Analysis | Lead origin breakdown | Daily |
| Vehicle Performance | Views, enquiries per vehicle | Hourly |
| Staff Activity | Leads handled, response time | Real-time |
| Finance Overview | Applications, approval rate | Daily |

---

## 6. Settings

### Route: `/admin/settings`

Multi-tab settings page for system configuration.

### Settings Tabs

```typescript
const settingsTabs = [
  { id: "profile",     label: "My Profile",     icon: User },
  { id: "business",    label: "Business Info",  icon: Building2 },
  { id: "hours",       label: "Opening Hours",  icon: Clock },
  { id: "social",      label: "Social Media",   icon: Share2 },
  { id: "seo",         label: "SEO Defaults",   icon: Search },
  { id: "email",       label: "Email Templates", icon: Mail },
  { id: "finance",     label: "Finance Rates",  icon: CreditCard },
  { id: "appearance",  label: "Appearance",     icon: Palette },
  { id: "users",       label: "Staff Users",    icon: Users },
];
```

### Settings Form Pattern

```typescript
// Generic settings form with type-safe fields
function SettingsSection({ group }: { group: string }) {
  const { settings, updateSetting } = useSettings(group);
  const form = useForm({
    defaultValues: settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {}
    ),
  });

  const onSubmit = async (data: Record<string, string>) => {
    await Promise.all(
      Object.entries(data).map(([key, value]) =>
        updateSetting(key, value)
      )
    );
    toast.success("Settings saved successfully");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {settings.map((setting) => (
          <FormField
            key={setting.key}
            control={form.control}
            name={setting.key}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{setting.label}</FormLabel>
                {setting.type === "textarea" ? (
                  <Textarea {...field} />
                ) : setting.type === "select" ? (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {setting.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input {...field} />
                )}
                <FormDescription>{setting.description}</FormDescription>
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 7. Technical Implementation

### 7.1 Admin Layout

```typescript
// admin/AdminLayout.tsx
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <SidebarHeader />
        <SidebarNavigation activePath={location.pathname} />
        <SidebarFooter />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 7.2 Route Guards

```typescript
// Route guard for admin pages
function AdminRouteGuard({ requiredRole }: { requiredRole?: UserRole }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    if (requiredRole) {
      const userRole = user?.publicMetadata?.role as UserRole;
      if (!hasRole(userRole, requiredRole)) {
        navigate("/admin");
      }
    }
  }, [isLoaded, isSignedIn, requiredRole]);

  if (!isLoaded || !isSignedIn) {
    return <PageLoader />;
  }

  return <Outlet />;
}

// Route configuration
const adminRoutes = [
  {
    path: "/admin",
    element: <AdminRouteGuard />,
    children: [
      { path: "", element: <DashboardOverview /> },
      { path: "vehicles", element: <VehicleManagement /> },
      { path: "vehicles/new", element: <VehicleForm /> },
      { path: "vehicles/:id/edit", element: <VehicleForm /> },
      {
        path: "leads",
        element: <AdminRouteGuard requiredRole="staff" />,
        children: [
          { path: "", element: <LeadCRM /> },
          { path: ":id", element: <LeadDetail /> },
        ],
      },
      {
        path: "analytics",
        element: <AdminRouteGuard requiredRole="admin" />,
        children: [{ path: "", element: <AnalyticsDashboard /> }],
      },
      {
        path: "settings",
        element: <AdminRouteGuard requiredRole="admin" />,
        children: [{ path: "", element: <SettingsPage /> }],
      },
    ],
  },
];
```

### 7.3 Data Fetching with React Query

```typescript
// hooks/useVehicles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => api.get("/api/vehicles", { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleInput) =>
      api.post("/api/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create vehicle: ${error.message}`);
    },
  });
}

export function useUpdateVehicle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVehicleInput) =>
      api.patch(`/api/vehicles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", id] });
      toast.success("Vehicle updated successfully");
    },
  });
}
```

---

## 8. UI Component Library

### 8.1 shadcn/ui Components Used

| Component | Usage | Customization |
|-----------|-------|---------------|
| `Button` | All actions | Custom variants for status actions |
| `Card` | Content containers | Consistent shadow and border radius |
| `Input` | Form fields | Error states with red borders |
| `Textarea` | Description fields | Auto-resize on content |
| `Select` | Dropdown filters | Custom trigger with icons |
| `Dialog` | Confirmations, modals | Backdrop blur effect |
| `DropdownMenu` | Bulk actions, row actions | Keyboard navigation |
| `Table` | Vehicle list, lead list | Sortable headers, sticky first column |
| `Badge` | Status indicators | Color-coded by status |
| `Avatar` | User profile images | Fallback initials |
| `Tabs` | Settings sections | Animated indicator |
| `Toast` | Notifications | Success/error/info variants |
| `Skeleton` | Loading states | Pulsing animation |
| `Calendar` | Date pickers | Range selection |
| `Popover` | Filters, tooltips | Click-outside to close |
| `Checkbox` | Bulk select, features | Indeterminate state |
| `Switch` | Toggle settings | Smooth animation |
| `Slider` | Price range filters | Dual-thumb for min/max |
| `Pagination` | List pagination | Page size selector |
| `Command` | Command palette | Keyboard shortcut access |
| `DataTable` | Advanced tables | Sorting, filtering, pagination |

### 8.2 Custom Components

```typescript
// StatCard — KPI display
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
}

// ChartCard — Chart container
interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// FilterBar — Advanced filtering
interface FilterBarProps<T> {
  filters: FilterConfig<T>[];
  onFiltersChange: (filters: Partial<T>) => void;
  onReset: () => void;
}

// EmptyState — No data display
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## 9. Data Flow Architecture

```
User Action → Component State → React Query Cache → API Request → Database
                ↓                      ↓
         Optimistic UI          Background Refetch
                ↓                      ↓
         Loading Skeleton      Cache Invalidation
                ↓                      ↓
         Error Toast            UI Refresh
```

### State Management Strategy

| State Type | Tool | Examples |
|------------|------|----------|
| Server state | TanStack Query | Vehicles, leads, analytics |
| Form state | React Hook Form | Vehicle form, lead form |
| UI state | useState | Sidebar open, active tab, filters |
| Global UI | Zustand | Toast notifications, modal state |

---

**Document Version:** 1.0  
**Last Updated:** January 2025
