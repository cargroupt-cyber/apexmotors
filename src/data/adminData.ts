export type VehicleStatus = "Available" | "Reserved" | "Sold" | "Coming Soon" | "In Preparation";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  variant: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  engineSize: string;
  doors: number;
  seats: number;
  colour: string;
  registration: string;
  cashPrice: number;
  financePrice: number;
  monthlyPayment: number;
  deposit: number;
  apr: number;
  mileage: number;
  condition: string;
  features: string[];
  description: string;
  status: VehicleStatus;
  images: string[];
  metaTitle: string;
  metaDescription: string;
  dateAdded: string;
  dateSold?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleInterest: string;
  status: "New" | "Contacted" | "Qualified" | "Test Drive" | "Closed";
  source: string;
  date: string;
  notes: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  type: "create" | "update" | "delete" | "sale" | "lead" | "system";
}

export interface MonthlySales {
  month: string;
  vehicles: number;
  revenue: number;
  leads: number;
}

export interface VehicleStatusCount {
  status: VehicleStatus;
  count: number;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
}

export interface BusinessSettings {
  dealershipName: string;
  address: string;
  phone: string;
  email: string;
  vatNumber: string;
  openingHours: {
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }[];
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
  seoDefaults: {
    metaTitle: string;
    metaDescription: string;
  };
}

// ── Mock Vehicle Inventory ───────────────────────────────────────

const allFeatures = [
  "Bluetooth",
  "Sat Nav",
  "Leather Seats",
  "Heated Seats",
  "Cruise Control",
  "Parking Sensors",
  "Reversing Camera",
  "Apple CarPlay",
  "Android Auto",
  "Climate Control",
  "Panoramic Roof",
  "Alloy Wheels",
  "Keyless Entry",
  "Push Button Start",
  "DAB Radio",
  "USB Port",
  "Lane Assist",
  "Blind Spot Monitoring",
  "Adaptive Headlights",
  "Rain Sensing Wipers",
  "Electric Mirrors",
  "Electric Windows",
  "ISOFIX Points",
  "Split Rear Seats",
  "Roof Rails",
  "Towing Hook",
  "Sport Mode",
  "Ambient Lighting",
  "Wireless Charging",
  "Head-Up Display",
  "360 Camera",
  "Power Tailgate",
  "Memory Seats",
  "Ventilated Seats",
  "Heated Steering Wheel",
  "Auto-Dimming Mirrors",
  "Traffic Sign Recognition",
  "Adaptive Cruise Control",
  "Auto Parking",
  "Start/Stop System",
];

export const vehicles: Vehicle[] = [
  {
    id: "VEH-001",
    make: "BMW",
    model: "M3 Competition",
    year: 2024,
    variant: "xDrive",
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineSize: "3.0L",
    doors: 4,
    seats: 5,
    colour: "Isle of Man Green",
    registration: "MX24 BMW",
    cashPrice: 84950,
    financePrice: 78950,
    monthlyPayment: 899,
    deposit: 8500,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 25),
    description: "The latest BMW M3 Competition xDrive in stunning Isle of Man Green. Pure driving pleasure with M xDrive all-wheel drive.",
    status: "Available",
    images: ["/vehicle-thumb-01.jpg"],
    metaTitle: "BMW M3 Competition xDrive 2024 | APEX Automotive",
    metaDescription: "Discover the BMW M3 Competition xDrive at APEX Automotive. Ultimate driving machine with 510PS.",
    dateAdded: "2025-01-15",
  },
  {
    id: "VEH-002",
    make: "Mercedes-Benz",
    model: "AMG C63 S",
    year: 2023,
    variant: "E Performance",
    bodyType: "Sedan",
    fuelType: "Hybrid",
    transmission: "Automatic",
    engineSize: "2.0L + Electric",
    doors: 4,
    seats: 5,
    colour: "Obsidian Black",
    registration: "MX23 AMG",
    cashPrice: 79950,
    financePrice: 74950,
    monthlyPayment: 849,
    deposit: 8000,
    apr: 9.9,
    mileage: 3250,
    condition: "Nearly New",
    features: allFeatures.slice(0, 30),
    description: "Mercedes-AMG C63 S E Performance. Hybrid powertrain delivering 680PS. Barely driven.",
    status: "Available",
    images: ["/vehicle-thumb-02.jpg"],
    metaTitle: "Mercedes-AMG C63 S E Performance 2023 | APEX Automotive",
    metaDescription: "Mercedes-AMG C63 S with hybrid technology. 680PS of pure performance.",
    dateAdded: "2025-02-01",
  },
  {
    id: "VEH-003",
    make: "Audi",
    model: "RS6 Avant",
    year: 2024,
    variant: "Performance",
    bodyType: "Estate",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineSize: "4.0L V8",
    doors: 5,
    seats: 5,
    colour: "Nardo Grey",
    registration: "MX24 RS6",
    cashPrice: 112950,
    financePrice: 104950,
    monthlyPayment: 1199,
    deposit: 11000,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 35),
    description: "The ultimate performance estate. Audi RS6 Avant Performance with 630PS twin-turbo V8.",
    status: "Reserved",
    images: ["/vehicle-thumb-03.jpg"],
    metaTitle: "Audi RS6 Avant Performance 2024 | APEX Automotive",
    metaDescription: "Audi RS6 Avant Performance. The ultimate super estate with 630PS.",
    dateAdded: "2025-01-20",
  },
  {
    id: "VEH-004",
    make: "Porsche",
    model: "911 Carrera S",
    year: 2023,
    variant: "992.2",
    bodyType: "Coupe",
    fuelType: "Petrol",
    transmission: "PDK",
    engineSize: "3.0L",
    doors: 2,
    seats: 4,
    colour: "Guards Red",
    registration: "MX23 911",
    cashPrice: 119950,
    financePrice: 109950,
    monthlyPayment: 1299,
    deposit: 12000,
    apr: 9.9,
    mileage: 5400,
    condition: "Approved Used",
    features: allFeatures.slice(0, 32),
    description: "Porsche 911 Carrera S 992.2 in iconic Guards Red. PDK, Sports Chrono, Sport Exhaust.",
    status: "Available",
    images: ["/vehicle-thumb-04.jpg"],
    metaTitle: "Porsche 911 Carrera S 2023 | APEX Automotive",
    metaDescription: "Approved used Porsche 911 Carrera S. The timeless sports car icon.",
    dateAdded: "2025-02-10",
  },
  {
    id: "VEH-005",
    make: "Range Rover",
    model: "Sport SV",
    year: 2024,
    variant: "Edition One",
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineSize: "4.4L V8",
    doors: 5,
    seats: 5,
    colour: "Satin Bronze",
    registration: "MX24 SVR",
    cashPrice: 171950,
    financePrice: 159950,
    monthlyPayment: 1799,
    deposit: 17000,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 40),
    description: "Range Rover Sport SV Edition One. The most powerful Range Rover Sport ever with 635PS.",
    status: "In Preparation",
    images: ["/vehicle-thumb-05.jpg"],
    metaTitle: "Range Rover Sport SV Edition One 2024 | APEX Automotive",
    metaDescription: "Range Rover Sport SV. 635PS of supercharged V8 power.",
    dateAdded: "2025-03-01",
  },
  {
    id: "VEH-006",
    make: "BMW",
    model: "X5 M60i",
    year: 2024,
    variant: "M Sport",
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineSize: "4.4L V8",
    doors: 5,
    seats: 7,
    colour: "Brooklyn Grey",
    registration: "MX24 X5M",
    cashPrice: 98950,
    financePrice: 91950,
    monthlyPayment: 999,
    deposit: 10000,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 28),
    description: "BMW X5 M60i with M Sport package. Twin-turbo V8 power in a luxury SUV package.",
    status: "Available",
    images: ["/vehicle-thumb-06.jpg"],
    metaTitle: "BMW X5 M60i M Sport 2024 | APEX Automotive",
    metaDescription: "BMW X5 M60i. The ultimate performance luxury SUV.",
    dateAdded: "2025-01-28",
  },
  {
    id: "VEH-007",
    make: "Mercedes-Benz",
    model: "GLE 63 S",
    year: 2023,
    variant: "AMG",
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineSize: "4.0L V8",
    doors: 5,
    seats: 5,
    colour: "Selenite Grey",
    registration: "MX23 GLE",
    cashPrice: 94950,
    financePrice: 88950,
    monthlyPayment: 949,
    deposit: 9500,
    apr: 9.9,
    mileage: 8200,
    condition: "Approved Used",
    features: allFeatures.slice(0, 30),
    description: "Mercedes-AMG GLE 63 S. 612PS super SUV with AMG Ride Control+",
    status: "Sold",
    images: ["/vehicle-thumb-07.jpg"],
    metaTitle: "Mercedes-AMG GLE 63 S 2023 | APEX Automotive",
    metaDescription: "Approved used Mercedes-AMG GLE 63 S. Super SUV performance.",
    dateAdded: "2024-11-15",
    dateSold: "2025-02-28",
  },
  {
    id: "VEH-008",
    make: "Audi",
    model: "e-tron GT",
    year: 2024,
    variant: "RS",
    bodyType: "Sedan",
    fuelType: "Electric",
    transmission: "Automatic",
    engineSize: "Dual Motor",
    doors: 4,
    seats: 4,
    colour: "Tactical Green",
    registration: "MX24 EGT",
    cashPrice: 129950,
    financePrice: 119950,
    monthlyPayment: 1399,
    deposit: 13000,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 33),
    description: "Audi RS e-tron GT. 646PS electric grand tourer with quattro all-wheel drive.",
    status: "Coming Soon",
    images: ["/vehicle-thumb-08.jpg"],
    metaTitle: "Audi RS e-tron GT 2024 | APEX Automotive",
    metaDescription: "Audi RS e-tron GT. Electric performance with 646PS.",
    dateAdded: "2025-03-10",
  },
  {
    id: "VEH-009",
    make: "Porsche",
    model: "Cayenne Turbo GT",
    year: 2024,
    variant: "Coupe",
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "PDK",
    engineSize: "4.0L V8",
    doors: 5,
    seats: 4,
    colour: "Arctic Grey",
    registration: "MX24 CGT",
    cashPrice: 154950,
    financePrice: 144950,
    monthlyPayment: 1599,
    deposit: 15500,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 36),
    description: "Porsche Cayenne Turbo GT Coupe. Nurburgring record holder with 659PS.",
    status: "Available",
    images: ["/vehicle-thumb-01.jpg"],
    metaTitle: "Porsche Cayenne Turbo GT 2024 | APEX Automotive",
    metaDescription: "Porsche Cayenne Turbo GT. The fastest SUV around the Nurburgring.",
    dateAdded: "2025-02-15",
  },
  {
    id: "VEH-010",
    make: "BMW",
    model: "iX M60",
    year: 2024,
    variant: "M Performance",
    bodyType: "SUV",
    fuelType: "Electric",
    transmission: "Automatic",
    engineSize: "Dual Motor",
    doors: 5,
    seats: 5,
    colour: "Aventurine Red",
    registration: "MX24 IXM",
    cashPrice: 121950,
    financePrice: 112950,
    monthlyPayment: 1299,
    deposit: 12000,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 38),
    description: "BMW iX M60. 619PS electric performance SUV with Bowers & Wilkins Diamond surround sound.",
    status: "Available",
    images: ["/vehicle-thumb-02.jpg"],
    metaTitle: "BMW iX M60 2024 | APEX Automotive",
    metaDescription: "BMW iX M60. 619PS electric performance with luxury technology.",
    dateAdded: "2025-02-20",
  },
  {
    id: "VEH-011",
    make: "Mercedes-Benz",
    model: "S-Class",
    year: 2024,
    variant: "S580e L",
    bodyType: "Saloon",
    fuelType: "Hybrid",
    transmission: "Automatic",
    engineSize: "3.0L + Electric",
    doors: 4,
    seats: 5,
    colour: "Emerald Green",
    registration: "MX24 SCL",
    cashPrice: 134950,
    financePrice: 124950,
    monthlyPayment: 1399,
    deposit: 13500,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 40),
    description: "Mercedes-Benz S580e L AMG Line. The ultimate luxury plug-in hybrid saloon.",
    status: "Available",
    images: ["/vehicle-thumb-03.jpg"],
    metaTitle: "Mercedes-Benz S-Class S580e L 2024 | APEX Automotive",
    metaDescription: "Mercedes-Benz S-Class S580e L. Ultimate luxury plug-in hybrid.",
    dateAdded: "2025-03-05",
  },
  {
    id: "VEH-012",
    make: "Audi",
    model: "Q8 e-tron",
    year: 2024,
    variant: "S Line",
    bodyType: "SUV",
    fuelType: "Electric",
    transmission: "Automatic",
    engineSize: "Dual Motor",
    doors: 5,
    seats: 5,
    colour: "Chronos Grey",
    registration: "MX24 Q8E",
    cashPrice: 87950,
    financePrice: 81950,
    monthlyPayment: 899,
    deposit: 8800,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 27),
    description: "Audi Q8 e-tron S Line. Premium electric SUV with 408PS and 411km range.",
    status: "Coming Soon",
    images: ["/vehicle-thumb-04.jpg"],
    metaTitle: "Audi Q8 e-tron S Line 2024 | APEX Automotive",
    metaDescription: "Audi Q8 e-tron. Premium electric SUV with 411km range.",
    dateAdded: "2025-03-12",
  },
  {
    id: "VEH-013",
    make: "Range Rover",
    model: "Autobiography",
    year: 2024,
    variant: "P530",
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineSize: "4.4L V8",
    doors: 5,
    seats: 5,
    colour: "Belgravia Green",
    registration: "MX24 RRA",
    cashPrice: 158950,
    financePrice: 147950,
    monthlyPayment: 1649,
    deposit: 16000,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 40),
    description: "Range Rover Autobiography P530. The pinnacle of luxury with twin-turbo V8 power.",
    status: "Reserved",
    images: ["/vehicle-thumb-05.jpg"],
    metaTitle: "Range Rover Autobiography P530 2024 | APEX Automotive",
    metaDescription: "Range Rover Autobiography P530. Pinnacle luxury SUV.",
    dateAdded: "2025-01-25",
  },
  {
    id: "VEH-014",
    make: "BMW",
    model: "M4 CSL",
    year: 2023,
    variant: "Competition",
    bodyType: "Coupe",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineSize: "3.0L",
    doors: 2,
    seats: 2,
    colour: "Frozen Brooklyn Grey",
    registration: "MX23 CSL",
    cashPrice: 139950,
    financePrice: 129950,
    monthlyPayment: 1499,
    deposit: 14000,
    apr: 9.9,
    mileage: 1200,
    condition: "Nearly New",
    features: allFeatures.slice(0, 25),
    description: "BMW M4 CSL. Limited edition with 550PS, carbon bucket seats, and extreme lightweighting.",
    status: "Sold",
    images: ["/vehicle-thumb-06.jpg"],
    metaTitle: "BMW M4 CSL 2023 | APEX Automotive",
    metaDescription: "BMW M4 CSL. Limited edition with 550PS.",
    dateAdded: "2024-10-20",
    dateSold: "2025-01-30",
  },
  {
    id: "VEH-015",
    make: "Porsche",
    model: "Taycan Turbo S",
    year: 2024,
    variant: "Cross Turismo",
    bodyType: "Estate",
    fuelType: "Electric",
    transmission: "Automatic",
    engineSize: "Dual Motor",
    doors: 5,
    seats: 4,
    colour: "Ice Grey",
    registration: "MX24 TTS",
    cashPrice: 159950,
    financePrice: 149950,
    monthlyPayment: 1699,
    deposit: 16000,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 35),
    description: "Porsche Taycan Turbo S Cross Turismo. 952PS electric shooting brake with 2.4s 0-60.",
    status: "In Preparation",
    images: ["/vehicle-thumb-07.jpg"],
    metaTitle: "Porsche Taycan Turbo S Cross Turismo 2024 | APEX Automotive",
    metaDescription: "Porsche Taycan Turbo S Cross Turismo. 952PS electric.",
    dateAdded: "2025-03-08",
  },
  {
    id: "VEH-016",
    make: "Mercedes-Benz",
    model: "G63 AMG",
    year: 2024,
    variant: "Stronger Than Time",
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineSize: "4.0L V8",
    doors: 5,
    seats: 5,
    colour: "Designo Night Black",
    registration: "MX24 G63",
    cashPrice: 189950,
    financePrice: 174950,
    monthlyPayment: 1999,
    deposit: 19000,
    apr: 9.9,
    mileage: 0,
    condition: "New",
    features: allFeatures.slice(0, 37),
    description: "Mercedes-AMG G63 Stronger Than Time Edition. The ultimate status symbol with 585PS.",
    status: "Available",
    images: ["/vehicle-thumb-08.jpg"],
    metaTitle: "Mercedes-AMG G63 2024 | APEX Automotive",
    metaDescription: "Mercedes-AMG G63. The iconic performance off-roader.",
    dateAdded: "2025-02-25",
  },
];

// ── Analytics Data ──────────────────────────────────────────────

export const monthlySales: MonthlySales[] = [
  { month: "Oct", vehicles: 8, revenue: 680000, leads: 42 },
  { month: "Nov", vehicles: 12, revenue: 1020000, leads: 58 },
  { month: "Dec", vehicles: 18, revenue: 1540000, leads: 67 },
  { month: "Jan", vehicles: 10, revenue: 850000, leads: 48 },
  { month: "Feb", vehicles: 14, revenue: 1190000, leads: 55 },
  { month: "Mar", vehicles: 11, revenue: 945000, leads: 63 },
];

export const vehicleStatusCounts: VehicleStatusCount[] = [
  { status: "Available", count: 8, color: "#00C896" },
  { status: "Reserved", count: 2, color: "#FFB703" },
  { status: "Sold", count: 2, color: "#FF4D6D" },
  { status: "Coming Soon", count: 2, color: "#00B4D8" },
  { status: "In Preparation", count: 2, color: "#FF8C42" },
];

// ── Recent Activity Log ─────────────────────────────────────────

export const recentActivity: ActivityLog[] = [
  { id: "ACT-001", action: "Vehicle listed", user: "James Wilson", target: "BMW M3 Competition xDrive", timestamp: "2025-03-15T09:30:00Z", type: "create" },
  { id: "ACT-002", action: "Lead received", user: "System", target: "Sarah Chen - Mercedes-AMG G63 enquiry", timestamp: "2025-03-15T10:15:00Z", type: "lead" },
  { id: "ACT-003", action: "Vehicle reserved", user: "Emily Parker", target: "Audi RS6 Avant Performance", timestamp: "2025-03-15T11:00:00Z", type: "sale" },
  { id: "ACT-004", action: "Vehicle marked as sold", user: "James Wilson", target: "BMW M4 CSL", timestamp: "2025-03-15T14:20:00Z", type: "sale" },
  { id: "ACT-005", action: "Price updated", user: "Emily Parker", target: "Porsche 911 Carrera S", timestamp: "2025-03-15T15:45:00Z", type: "update" },
  { id: "ACT-006", action: "New vehicle added", user: "James Wilson", target: "Range Rover Sport SV Edition One", timestamp: "2025-03-14T09:00:00Z", type: "create" },
  { id: "ACT-007", action: "Lead converted", user: "Emily Parker", target: "Michael Brown - GLE 63 S purchase", timestamp: "2025-03-14T16:30:00Z", type: "sale" },
  { id: "ACT-008", action: "Vehicle images updated", user: "James Wilson", target: "BMW X5 M60i", timestamp: "2025-03-14T11:15:00Z", type: "update" },
  { id: "ACT-009", action: "Lead received", user: "System", target: "David Lee - Taycan Turbo S enquiry", timestamp: "2025-03-14T08:45:00Z", type: "lead" },
  { id: "ACT-010", action: "SEO metadata updated", user: "Emily Parker", target: "Batch update: 5 vehicles", timestamp: "2025-03-13T14:00:00Z", type: "update" },
  { id: "ACT-011", action: "Vehicle status changed", user: "James Wilson", target: "Audi e-tron GT: Coming Soon -> Available", timestamp: "2025-03-13T10:30:00Z", type: "update" },
  { id: "ACT-012", action: "Test drive booked", user: "System", target: "Robert Taylor - Range Rover Autobiography", timestamp: "2025-03-13T09:15:00Z", type: "lead" },
];

// ── Leads ───────────────────────────────────────────────────────

export const leads: Lead[] = [
  { id: "LEAD-001", name: "Sarah Chen", email: "sarah.chen@email.com", phone: "07700 900123", vehicleInterest: "Mercedes-AMG G63", status: "New", source: "Website", date: "2025-03-15", notes: "Interested in finance options" },
  { id: "LEAD-002", name: "Michael Brown", email: "mbrown@email.com", phone: "07700 900456", vehicleInterest: "Mercedes-AMG GLE 63 S", status: "Closed", source: "Walk-in", date: "2025-03-14", notes: "Purchased vehicle" },
  { id: "LEAD-003", name: "David Lee", email: "dlee@email.com", phone: "07700 900789", vehicleInterest: "Porsche Taycan Turbo S", status: "Qualified", source: "Autotrader", date: "2025-03-14", notes: "Ready to test drive next week" },
  { id: "LEAD-004", name: "Robert Taylor", email: "rtaylor@email.com", phone: "07700 900321", vehicleInterest: "Range Rover Autobiography", status: "Test Drive", source: "Website", date: "2025-03-13", notes: "Test drive booked for Saturday" },
  { id: "LEAD-005", name: "Emma Wilson", email: "ewilson@email.com", phone: "07700 900654", vehicleInterest: "BMW M3 Competition", status: "Contacted", source: "Phone", date: "2025-03-12", notes: "Follow up on Friday" },
  { id: "LEAD-006", name: "James Anderson", email: "janderson@email.com", phone: "07700 900987", vehicleInterest: "Audi RS6 Avant", status: "New", source: "Website", date: "2025-03-15", notes: "Wants part-exchange valuation" },
  { id: "LEAD-007", name: "Lisa Martinez", email: "lmartinez@email.com", phone: "07700 900147", vehicleInterest: "BMW iX M60", status: "Qualified", source: "Google Ads", date: "2025-03-11", notes: "Company car purchase" },
  { id: "LEAD-008", name: "Oliver Thompson", email: "othompson@email.com", phone: "07700 900258", vehicleInterest: "Porsche 911 Carrera S", status: "Contacted", source: "Website", date: "2025-03-10", notes: "Cash buyer, flexible on spec" },
  { id: "LEAD-009", name: "Sophie Clark", email: "sclark@email.com", phone: "07700 900369", vehicleInterest: "Range Rover Sport SV", status: "New", source: "Instagram", date: "2025-03-15", notes: "Wants to know delivery timeline" },
  { id: "LEAD-010", name: "Daniel Wright", email: "dwright@email.com", phone: "07700 900741", vehicleInterest: "Mercedes-Benz S-Class", status: "Test Drive", source: "Walk-in", date: "2025-03-09", notes: "Second test drive scheduled" },
];

// ── User Profile ────────────────────────────────────────────────

export const userProfile: UserProfile = {
  name: "James Wilson",
  email: "sales.carzee@gmail.com",
  phone: "07983183814",
  role: "Sales Manager",
  avatar: "JW",
};

// ── Business Settings ───────────────────────────────────────────

export const businessSettings: BusinessSettings = {
  dealershipName: "APEX Automotive",
  address: "123 Prestige Lane, Manchester M1 1AA",
  phone: "07983183814",
  email: "sales.carzee@gmail.com",
  vatNumber: "GB 123 4567 89",
  openingHours: [
    { day: "Monday", open: "09:00", close: "18:00", closed: false },
    { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
    { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
    { day: "Thursday", open: "09:00", close: "18:00", closed: false },
    { day: "Friday", open: "09:00", close: "17:00", closed: false },
    { day: "Saturday", open: "10:00", close: "16:00", closed: false },
    { day: "Sunday", open: "", close: "", closed: true },
  ],
  socialMedia: {
    facebook: "https://facebook.com/apexautomotive",
    instagram: "https://instagram.com/apexautomotive",
    twitter: "https://twitter.com/apexautomotive",
    youtube: "https://youtube.com/apexautomotive",
    linkedin: "https://linkedin.com/company/apexautomotive",
  },
  seoDefaults: {
    metaTitle: "Premium Used Cars Manchester | APEX Automotive",
    metaDescription: "Discover premium used cars at APEX Automotive Manchester. Finance available. Part exchange welcome.",
  },
};

// ── Summary Stats ───────────────────────────────────────────────

export function getDashboardStats() {
  const totalVehicles = vehicles.length;
  const availableStock = vehicles.filter((v) => v.status === "Available").length;
  const soldThisMonth = vehicles.filter((v) => v.dateSold && v.dateSold.startsWith("2025-03")).length;
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const revenueThisMonth = monthlySales[monthlySales.length - 1].revenue;
  const revenueChange = +12.5;
  const pendingEnquiries = leads.filter((l) => l.status === "New" || l.status === "Contacted").length;

  return {
    totalVehicles,
    availableStock,
    stockPercentage: Math.round((availableStock / totalVehicles) * 100),
    soldThisMonth,
    monthlyTarget: 15,
    totalLeads,
    newLeads,
    leadTrend: +8.2,
    revenueThisMonth,
    revenueChange,
    pendingEnquiries,
  };
}

export const FEATURES_LIST = allFeatures;
