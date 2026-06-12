export interface ContactEnquiry {
  id: string;
  type: 'contact';
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  vehicleInterested: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  date: string;
  assignedTo: string;
  notes: string;
  source: string;
}

export interface SellMyCarRequest {
  id: string;
  type: 'sell_car';
  name: string;
  email: string;
  phone: string;
  registration: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  features: string;
  estimatedValue: number;
  status: 'new' | 'valued' | 'appointment' | 'sold';
  date: string;
  notes: string;
  source: string;
}

export interface TestDriveBooking {
  id: string;
  type: 'test-drive';
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  preferredDate: string;
  preferredTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  date: string;
  notes: string;
  source: string;
}

export interface FinanceApplication {
  id: string;
  type: 'finance';
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  amount: number;
  term: number;
  employmentStatus: string;
  income: number;
  creditRating: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'pending' | 'approved' | 'declined' | 'referred';
  date: string;
  notes: string;
  source: string;
}

export type Lead = ContactEnquiry | SellMyCarRequest | TestDriveBooking | FinanceApplication;

export const contactEnquiries: ContactEnquiry[] = [
  {
    id: 'CE-2024-001',
    type: 'contact',
    name: 'James Richardson',
    email: 'james.richardson@email.com',
    phone: '+44 7700 900123',
    subject: 'Vehicle Enquiry - BMW M4 Competition',
    message: 'Hi, I am interested in the BMW M4 Competition listed on your website. Is it still available? Can you provide more details about the service history and any remaining warranty? I would also like to know if finance options are available.',
    vehicleInterested: 'BMW M4 Competition',
    status: 'new',
    date: '2024-12-11T09:30:00',
    assignedTo: 'Unassigned',
    notes: '',
    source: 'Website',
  },
  {
    id: 'CE-2024-002',
    type: 'contact',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@outlook.com',
    phone: '+44 7700 900456',
    subject: 'Part Exchange Query',
    message: 'I currently have a 2021 Audi A3 Sportback and I am looking to upgrade to something larger. Do you accept part exchanges? What is the process for getting a valuation?',
    vehicleInterested: 'Audi A5 Sportback',
    status: 'contacted',
    date: '2024-12-10T14:15:00',
    assignedTo: 'Tom Bradley',
    notes: 'Left voicemail, waiting for callback. Interested in part exchange.',
    source: 'Phone',
  },
  {
    id: 'CE-2024-003',
    type: 'contact',
    name: 'David Chen',
    email: 'david.chen@gmail.com',
    phone: '+44 7700 900789',
    subject: 'Mercedes-AMG C63 Availability',
    message: 'I saw the Mercedes-AMG C63 on your site. I am ready to purchase this week if the price is negotiable. Can we arrange a viewing for this weekend?',
    vehicleInterested: 'Mercedes-AMG C63',
    status: 'qualified',
    date: '2024-12-09T11:00:00',
    assignedTo: 'Emma Watson',
    notes: 'High intent buyer. Ready to purchase. Price sensitive.',
    source: 'Website',
  },
  {
    id: 'CE-2024-004',
    type: 'contact',
    name: 'Olivia Parker',
    email: 'olivia.parker@yahoo.com',
    phone: '+44 7700 900321',
    subject: 'Porsche 911 Carrera Enquiry',
    message: 'I have been looking for a Porsche 911 Carrera in midnight blue. Do you have any in stock or can you source one? Budget is around £85,000.',
    vehicleInterested: 'Porsche 911 Carrera',
    status: 'new',
    date: '2024-12-11T08:45:00',
    assignedTo: 'Unassigned',
    notes: '',
    source: 'Walk-in',
  },
  {
    id: 'CE-2024-005',
    type: 'contact',
    name: 'William Thompson',
    email: 'will.thompson@email.com',
    phone: '+44 7700 900654',
    subject: 'Service Package Enquiry',
    message: 'I recently purchased a vehicle from you and I am interested in your premium service package. Can you send me the details and pricing?',
    vehicleInterested: 'N/A',
    status: 'closed',
    date: '2024-12-05T16:30:00',
    assignedTo: 'Tom Bradley',
    notes: 'Sold premium service package. Customer happy.',
    source: 'Referral',
  },
  {
    id: 'CE-2024-006',
    type: 'contact',
    name: 'Sophie Anderson',
    email: 'sophie.anderson@email.com',
    phone: '+44 7700 900987',
    subject: 'Range Rover Sport Test Drive',
    message: 'I would like to book a test drive for the Range Rover Sport HSE. I am available most afternoons this week. Please let me know the available slots.',
    vehicleInterested: 'Range Rover Sport HSE',
    status: 'contacted',
    date: '2024-12-10T10:20:00',
    assignedTo: 'Emma Watson',
    notes: 'Test drive booked for Friday 3pm.',
    source: 'Social',
  },
  {
    id: 'CE-2024-007',
    type: 'contact',
    name: 'Mohammed Ali',
    email: 'm.ali@email.com',
    phone: '+44 7700 900147',
    subject: 'Audi RS6 Avant Availability',
    message: 'Looking for a 2022 or newer Audi RS6 Avant. Do you have any in stock? What colours do you have available?',
    vehicleInterested: 'Audi RS6 Avant',
    status: 'qualified',
    date: '2024-12-08T13:00:00',
    assignedTo: 'Tom Bradley',
    notes: 'Has £70k budget. Pre-approved finance.',
    source: 'Website',
  },
  {
    id: 'CE-2024-008',
    type: 'contact',
    name: 'Emily Watson',
    email: 'emily.watson@outlook.com',
    phone: '+44 7700 900258',
    subject: 'BMW X5 M50i Enquiry',
    message: 'Interested in the BMW X5 M50i. Need to know if it has the panoramic roof and heated seats. Also what is the warranty situation?',
    vehicleInterested: 'BMW X5 M50i',
    status: 'new',
    date: '2024-12-11T07:15:00',
    assignedTo: 'Unassigned',
    notes: '',
    source: 'Website',
  },
  {
    id: 'CE-2024-009',
    type: 'contact',
    name: 'Robert Hughes',
    email: 'rob.hughes@gmail.com',
    phone: '+44 7700 900369',
    subject: 'Tesla Model S Finance Options',
    message: 'I am interested in purchasing a Tesla Model S through your finance options. Can you provide me with a quote for a 48-month PCP deal?',
    vehicleInterested: 'Tesla Model S',
    status: 'contacted',
    date: '2024-12-10T15:45:00',
    assignedTo: 'Sarah Jenkins',
    notes: 'Finance application sent. Waiting for documents.',
    source: 'Social',
  },
  {
    id: 'CE-2024-010',
    type: 'contact',
    name: 'Charlotte Williams',
    email: 'charlotte.w@email.com',
    phone: '+44 7700 900741',
    subject: 'Jaguar F-Type R Coupe',
    message: 'Is the Jaguar F-Type R Coupe still available? I would like to arrange a viewing this weekend if possible.',
    vehicleInterested: 'Jaguar F-Type R Coupe',
    status: 'qualified',
    date: '2024-12-07T09:00:00',
    assignedTo: 'Emma Watson',
    notes: 'Viewed on Saturday. Very interested. Considering finance.',
    source: 'Walk-in',
  },
  {
    id: 'CE-2024-011',
    type: 'contact',
    name: 'Daniel Foster',
    email: 'dan.foster@email.com',
    phone: '+44 7700 900852',
    subject: 'Lamborghini Urus Availability',
    message: 'Looking for a Lamborghini Urus in Giallo Inti yellow. Can you source one if not in stock? What is the typical lead time?',
    vehicleInterested: 'Lamborghini Urus',
    status: 'new',
    date: '2024-12-11T06:30:00',
    assignedTo: 'Unassigned',
    notes: '',
    source: 'Website',
  },
  {
    id: 'CE-2024-012',
    type: 'contact',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@email.com',
    phone: '+44 7700 900963',
    subject: 'Mercedes GLE 63 S Query',
    message: 'I am comparing the GLE 63 S with the BMW X5M. Can you highlight the key differences and advantages? Also do you offer extended warranties?',
    vehicleInterested: 'Mercedes GLE 63 S',
    status: 'contacted',
    date: '2024-12-09T16:00:00',
    assignedTo: 'Tom Bradley',
    notes: 'Sent comparison sheet. Following up Thursday.',
    source: 'Referral',
  },
  {
    id: 'CE-2024-013',
    type: 'contact',
    name: 'Alexander King',
    email: 'alex.king@email.com',
    phone: '+44 7700 900159',
    subject: 'Ferrari Roma Enquiry',
    message: 'I am a serious buyer looking for a Ferrari Roma with the optional carbon fibre package. Do you have any available or coming in soon?',
    vehicleInterested: 'Ferrari Roma',
    status: 'qualified',
    date: '2024-12-06T11:30:00',
    assignedTo: 'Sarah Jenkins',
    notes: 'VIP customer. Has purchased from us before.',
    source: 'Referral',
  },
  {
    id: 'CE-2024-014',
    type: 'contact',
    name: 'Grace Evans',
    email: 'grace.evans@outlook.com',
    phone: '+44 7700 900357',
    subject: 'Porsche Taycan 4S',
    message: 'Interested in the Taycan 4S. Need to know charging options and home installation support. Also interested in the Porsche warranty.',
    vehicleInterested: 'Porsche Taycan 4S',
    status: 'new',
    date: '2024-12-11T10:00:00',
    assignedTo: 'Unassigned',
    notes: '',
    source: 'Social',
  },
  {
    id: 'CE-2024-015',
    type: 'contact',
    name: 'Liam Murphy',
    email: 'liam.murphy@email.com',
    phone: '+44 7700 900486',
    subject: 'Aston Martin DBX',
    message: 'Looking at the Aston Martin DBX. Would like to know about customisation options and delivery timeframes. Budget is flexible.',
    vehicleInterested: 'Aston Martin DBX',
    status: 'contacted',
    date: '2024-12-10T12:00:00',
    assignedTo: 'Emma Watson',
    notes: 'High net worth client. Customisation enquiry.',
    source: 'Walk-in',
  },
];

export const sellMyCarRequests: SellMyCarRequest[] = [
  {
    id: 'SC-2024-001',
    type: 'sell_car',
    name: 'Nathan Cooper',
    email: 'nathan.cooper@email.com',
    phone: '+44 7700 800123',
    registration: 'AB21 XYZ',
    mileage: 25000,
    condition: 'good',
    features: 'Panoramic roof, heated seats, upgraded sound system, reversing camera',
    estimatedValue: 28500,
    status: 'new',
    date: '2024-12-11T08:00:00',
    notes: 'Initial valuation request submitted.',
    source: 'Website',
  },
  {
    id: 'SC-2024-002',
    type: 'sell_car',
    name: 'Isabella Scott',
    email: 'isabella.scott@email.com',
    phone: '+44 7700 800456',
    registration: 'BD20 ABC',
    mileage: 15000,
    condition: 'excellent',
    features: 'Full service history, ceramic coating, custom alloys, premium leather',
    estimatedValue: 42000,
    status: 'valued',
    date: '2024-12-10T10:30:00',
    notes: 'Valuation complete. Customer happy with price. Awaiting appointment.',
    source: 'Website',
  },
  {
    id: 'SC-2024-003',
    type: 'sell_car',
    name: 'Ryan Phillips',
    email: 'ryan.phillips@email.com',
    phone: '+44 7700 800789',
    registration: 'CF19 DEF',
    mileage: 45000,
    condition: 'fair',
    features: 'Standard specification, some minor bodywork needed',
    estimatedValue: 18000,
    status: 'new',
    date: '2024-12-11T09:00:00',
    notes: '',
    source: 'Website',
  },
  {
    id: 'SC-2024-004',
    type: 'sell_car',
    name: 'Mia Johnson',
    email: 'mia.johnson@email.com',
    phone: '+44 7700 800321',
    registration: 'GH18 GHI',
    mileage: 8000,
    condition: 'excellent',
    features: 'Virtually new, all options, extended warranty, garage kept',
    estimatedValue: 55000,
    status: 'appointment',
    date: '2024-12-09T14:00:00',
    notes: 'Inspection booked for Friday 2pm.',
    source: 'Referral',
  },
  {
    id: 'SC-2024-005',
    type: 'sell_car',
    name: 'Lucas Martin',
    email: 'lucas.martin@email.com',
    phone: '+44 7700 800654',
    registration: 'JK17 JKL',
    mileage: 60000,
    condition: 'fair',
    features: 'Tow bar, roof rails, winter tyres included',
    estimatedValue: 14500,
    status: 'valued',
    date: '2024-12-08T11:00:00',
    notes: 'Customer negotiating price. Offered £15,000.',
    source: 'Website',
  },
  {
    id: 'SC-2024-006',
    type: 'sell_car',
    name: 'Amelia Brown',
    email: 'amelia.brown@email.com',
    phone: '+44 7700 800987',
    registration: 'LM16 MNO',
    mileage: 32000,
    condition: 'good',
    features: 'Full dealer service history, parking sensors, cruise control',
    estimatedValue: 22000,
    status: 'sold',
    date: '2024-12-05T15:30:00',
    notes: 'Vehicle purchased. Payment processed. Customer satisfied.',
    source: 'Walk-in',
  },
  {
    id: 'SC-2024-007',
    type: 'sell_car',
    name: 'Henry Davis',
    email: 'henry.davis@email.com',
    phone: '+44 7700 800147',
    registration: 'NP15 PQR',
    mileage: 12000,
    condition: 'excellent',
    features: 'One owner, PPF installed, ceramic brakes, sport exhaust',
    estimatedValue: 78000,
    status: 'appointment',
    date: '2024-12-07T09:30:00',
    notes: 'Premium vehicle. Inspection with senior buyer booked.',
    source: 'Website',
  },
  {
    id: 'SC-2024-008',
    type: 'sell_car',
    name: 'Ella Wilson',
    email: 'ella.wilson@email.com',
    phone: '+44 7700 800258',
    registration: 'QR14 STU',
    mileage: 55000,
    condition: 'poor',
    features: 'Needs new clutch, bodywork repairs required',
    estimatedValue: 8500,
    status: 'new',
    date: '2024-12-11T07:30:00',
    notes: '',
    source: 'Website',
  },
  {
    id: 'SC-2024-009',
    type: 'sell_car',
    name: 'Jack Robinson',
    email: 'jack.robinson@email.com',
    phone: '+44 7700 800369',
    registration: 'ST13 VWX',
    mileage: 22000,
    condition: 'good',
    features: 'Sat nav, Bluetooth, climate control, alloy wheels',
    estimatedValue: 19500,
    status: 'valued',
    date: '2024-12-10T13:00:00',
    notes: 'Customer considering offer. Follow up Monday.',
    source: 'Phone',
  },
  {
    id: 'SC-2024-010',
    type: 'sell_car',
    name: 'Ava Harris',
    email: 'ava.harris@email.com',
    phone: '+44 7700 800741',
    registration: 'UV12 YZA',
    mileage: 38000,
    condition: 'good',
    features: 'Leather seats, sunroof, upgraded wheels, parking assist',
    estimatedValue: 26500,
    status: 'sold',
    date: '2024-12-04T16:00:00',
    notes: 'Sold. Vehicle collected. All paperwork complete.',
    source: 'Website',
  },
  {
    id: 'SC-2024-011',
    type: 'sell_car',
    name: 'Oliver Clark',
    email: 'oliver.clark@email.com',
    phone: '+44 7700 800852',
    registration: 'WX11 BCD',
    mileage: 18000,
    condition: 'excellent',
    features: 'Full options, CPO warranty, always serviced with main dealer',
    estimatedValue: 35000,
    status: 'appointment',
    date: '2024-12-06T10:00:00',
    notes: 'Inspection completed. Finalising offer.',
    source: 'Referral',
  },
];

export const testDriveBookings: TestDriveBooking[] = [
  {
    id: 'TD-2024-001',
    type: 'test-drive',
    name: 'Sophia Lewis',
    email: 'sophia.lewis@email.com',
    phone: '+44 7700 700123',
    vehicle: 'BMW M4 Competition',
    preferredDate: '2024-12-14',
    preferredTime: '10:00',
    status: 'confirmed',
    date: '2024-12-11T09:00:00',
    notes: 'Customer requested extended test drive route.',
    source: 'Website',
  },
  {
    id: 'TD-2024-002',
    type: 'test-drive',
    name: 'Noah Walker',
    email: 'noah.walker@email.com',
    phone: '+44 7700 700456',
    vehicle: 'Porsche 911 Carrera',
    preferredDate: '2024-12-13',
    preferredTime: '14:00',
    status: 'pending',
    date: '2024-12-11T08:00:00',
    notes: 'Awaiting confirmation. Vehicle currently in prep.',
    source: 'Website',
  },
  {
    id: 'TD-2024-003',
    type: 'test-drive',
    name: 'Emma Hall',
    email: 'emma.hall@email.com',
    phone: '+44 7700 700789',
    vehicle: 'Range Rover Sport HSE',
    preferredDate: '2024-12-12',
    preferredTime: '11:00',
    status: 'completed',
    date: '2024-12-10T10:00:00',
    notes: 'Customer loved the vehicle. Discussing finance options.',
    source: 'Phone',
  },
  {
    id: 'TD-2024-004',
    type: 'test-drive',
    name: 'Mason Young',
    email: 'mason.young@email.com',
    phone: '+44 7700 700321',
    vehicle: 'Audi RS6 Avant',
    preferredDate: '2024-12-13',
    preferredTime: '16:00',
    status: 'cancelled',
    date: '2024-12-09T15:00:00',
    notes: 'Customer cancelled due to illness. Reschedule requested.',
    source: 'Website',
  },
  {
    id: 'TD-2024-005',
    type: 'test-drive',
    name: 'Aria King',
    email: 'aria.king@email.com',
    phone: '+44 7700 700654',
    vehicle: 'Mercedes-AMG C63',
    preferredDate: '2024-12-14',
    preferredTime: '09:30',
    status: 'confirmed',
    date: '2024-12-10T14:00:00',
    notes: 'Confirmed. Sales exec to prep vehicle.',
    source: 'Social',
  },
  {
    id: 'TD-2024-006',
    type: 'test-drive',
    name: 'Ethan Wright',
    email: 'ethan.wright@email.com',
    phone: '+44 7700 700987',
    vehicle: 'Jaguar F-Type R Coupe',
    preferredDate: '2024-12-11',
    preferredTime: '15:00',
    status: 'no-show',
    date: '2024-12-08T09:00:00',
    notes: 'Customer did not show. Left voicemail to reschedule.',
    source: 'Website',
  },
  {
    id: 'TD-2024-007',
    type: 'test-drive',
    name: 'Lily Green',
    email: 'lily.green@email.com',
    phone: '+44 7700 700147',
    vehicle: 'Tesla Model S',
    preferredDate: '2024-12-15',
    preferredTime: '11:00',
    status: 'confirmed',
    date: '2024-12-11T07:00:00',
    notes: 'First-time EV buyer. Needs charging demo.',
    source: 'Website',
  },
  {
    id: 'TD-2024-008',
    type: 'test-drive',
    name: 'James Baker',
    email: 'james.baker@email.com',
    phone: '+44 7700 700258',
    vehicle: 'Lamborghini Urus',
    preferredDate: '2024-12-14',
    preferredTime: '13:00',
    status: 'pending',
    date: '2024-12-10T16:00:00',
    notes: 'VIP client. Ensure vehicle is showroom ready.',
    source: 'Referral',
  },
  {
    id: 'TD-2024-009',
    type: 'test-drive',
    name: 'Isla Adams',
    email: 'isla.adams@email.com',
    phone: '+44 7700 700369',
    vehicle: 'BMW X5 M50i',
    preferredDate: '2024-12-13',
    preferredTime: '10:30',
    status: 'completed',
    date: '2024-12-09T11:00:00',
    notes: 'Customer very impressed. Negotiating on price.',
    source: 'Walk-in',
  },
  {
    id: 'TD-2024-010',
    type: 'test-drive',
    name: 'Logan Nelson',
    email: 'logan.nelson@email.com',
    phone: '+44 7700 700741',
    vehicle: 'Porsche Taycan 4S',
    preferredDate: '2024-12-15',
    preferredTime: '14:00',
    status: 'confirmed',
    date: '2024-12-10T09:00:00',
    notes: 'Wants to test charging speed. Bring charging cable.',
    source: 'Social',
  },
];

export const financeApplications: FinanceApplication[] = [
  {
    id: 'FA-2024-001',
    type: 'finance',
    name: 'Benjamin Carter',
    email: 'ben.carter@email.com',
    phone: '+44 7700 600123',
    vehicle: 'BMW M4 Competition',
    amount: 62000,
    term: 48,
    employmentStatus: 'Full-time employed',
    income: 75000,
    creditRating: 'good',
    status: 'approved',
    date: '2024-12-10T10:00:00',
    notes: 'Approved at 6.9% APR. Documents sent for signing.',
    source: 'Website',
  },
  {
    id: 'FA-2024-002',
    type: 'finance',
    name: 'Harper Mitchell',
    email: 'harper.mitchell@email.com',
    phone: '+44 7700 600456',
    vehicle: 'Range Rover Sport HSE',
    amount: 85000,
    term: 60,
    employmentStatus: 'Self-employed',
    income: 120000,
    creditRating: 'excellent',
    status: 'approved',
    date: '2024-12-09T14:00:00',
    notes: 'Approved at 5.9% APR. Customer reviewing terms.',
    source: 'Website',
  },
  {
    id: 'FA-2024-003',
    type: 'finance',
    name: 'Alexander Perez',
    email: 'alex.perez@email.com',
    phone: '+44 7700 600789',
    vehicle: 'Audi RS6 Avant',
    amount: 68000,
    term: 48,
    employmentStatus: 'Full-time employed',
    income: 55000,
    creditRating: 'fair',
    status: 'referred',
    date: '2024-12-11T08:00:00',
    notes: 'Referred to senior underwriter. Income verification needed.',
    source: 'Website',
  },
  {
    id: 'FA-2024-004',
    type: 'finance',
    name: 'Mila Roberts',
    email: 'mila.roberts@email.com',
    phone: '+44 7700 600321',
    vehicle: 'Mercedes-AMG C63',
    amount: 52000,
    term: 36,
    employmentStatus: 'Part-time employed',
    income: 32000,
    creditRating: 'poor',
    status: 'declined',
    date: '2024-12-10T09:00:00',
    notes: 'Declined due to insufficient income. Alternative options discussed.',
    source: 'Website',
  },
  {
    id: 'FA-2024-005',
    type: 'finance',
    name: 'Daniel Turner',
    email: 'daniel.turner@email.com',
    phone: '+44 7700 600654',
    vehicle: 'Porsche 911 Carrera',
    amount: 92000,
    term: 60,
    employmentStatus: 'Full-time employed',
    income: 95000,
    creditRating: 'excellent',
    status: 'pending',
    date: '2024-12-11T09:30:00',
    notes: 'Application under review. Credit check in progress.',
    source: 'Referral',
  },
  {
    id: 'FA-2024-006',
    type: 'finance',
    name: 'Chloe Stewart',
    email: 'chloe.stewart@email.com',
    phone: '+44 7700 600987',
    vehicle: 'Jaguar F-Type R Coupe',
    amount: 58000,
    term: 48,
    employmentStatus: 'Full-time employed',
    income: 68000,
    creditRating: 'good',
    status: 'approved',
    date: '2024-12-08T11:00:00',
    notes: 'Approved at 7.2% APR. Deposit received.',
    source: 'Walk-in',
  },
  {
    id: 'FA-2024-007',
    type: 'finance',
    name: 'Samuel Morris',
    email: 'sam.morris@email.com',
    phone: '+44 7700 600147',
    vehicle: 'Tesla Model S',
    amount: 78000,
    term: 60,
    employmentStatus: 'Contractor',
    income: 85000,
    creditRating: 'good',
    status: 'pending',
    date: '2024-12-10T15:00:00',
    notes: 'Additional income proof requested.',
    source: 'Website',
  },
  {
    id: 'FA-2024-008',
    type: 'finance',
    name: 'Zoe Campbell',
    email: 'zoe.campbell@email.com',
    phone: '+44 7700 600258',
    vehicle: 'BMW X5 M50i',
    amount: 45000,
    term: 36,
    employmentStatus: 'Full-time employed',
    income: 60000,
    creditRating: 'fair',
    status: 'referred',
    date: '2024-12-11T07:00:00',
    notes: 'Under manual review. Large deposit may help.',
    source: 'Phone',
  },
];

export const allLeads: Lead[] = [
  ...contactEnquiries,
  ...sellMyCarRequests,
  ...testDriveBookings,
  ...financeApplications,
];

export const staffMembers = [
  'Tom Bradley',
  'Emma Watson',
  'Sarah Jenkins',
  'James Cooper',
  'Unassigned',
];

export const statusOptions = {
  contact: ['new', 'contacted', 'qualified', 'closed'] as const,
  'sell_car': ['new', 'valued', 'appointment', 'sold'] as const,
  'test-drive': ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] as const,
  finance: ['pending', 'approved', 'declined', 'referred'] as const,
};

export function getStatusColor(status: string): string {
  switch (status) {
    case 'new':
    case 'pending':
      return 'bg-[#0077B6]/20 text-[#00B4D8] border-[#0077B6]/40';
    case 'contacted':
    case 'valued':
    case 'referred':
      return 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40';
    case 'qualified':
    case 'confirmed':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    case 'appointment':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'closed':
    case 'completed':
    case 'approved':
    case 'sold':
      return 'bg-[#00C896]/20 text-[#00C896] border-[#00C896]/40';
    case 'cancelled':
    case 'declined':
    case 'no-show':
    case 'poor':
      return 'bg-[#FF4D6D]/20 text-[#FF4D6D] border-[#FF4D6D]/40';
    default:
      return 'bg-[#33415C]/30 text-[#C8D3D9] border-[#33415C]/40';
  }
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
