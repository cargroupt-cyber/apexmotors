import { useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Gauge, Fuel,
  Settings, Zap, Check, CheckCircle, Heart, Share2,
  Phone, Send, Cog, AlertCircle
} from 'lucide-react';
import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles';
import { useSupabaseLeads } from '@/hooks/useSupabaseLeads';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SEO from '@/components/SEO';
import { VehicleSchema, BreadcrumbListSchema } from '@/components/SchemaMarkup';

const SITE_URL = 'https://www.carzee.co.uk';
const WEB3FORMS_KEY = '407a7337-aeca-42b8-9b02-afe80238f322';

type FinanceType = 'PCP' | 'HP' | 'Cash';
type CreditRating = 'Excellent' | 'Good' | 'Fair' | 'Poor';

const creditRatingAPR: Record<CreditRating, number> = {
  Excellent: 7.9,
  Good: 9.9,
  Fair: 13.9,
  Poor: 19.9,
};

function formatCurrency(n: number): string {
  return `£${Math.round(n).toLocaleString()}`;
}

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { vehicles: rawVehicles, loading } = useSupabaseVehicles();
  const { addLead } = useSupabaseLeads();

  // Normalize Supabase vehicle to internal format
  const vehicles = useMemo(() => {
    return rawVehicles.map(v => ({
      id: v.id,
      make: v.make || '',
      model: v.model || '',
      variant: v.variant || '',
      year: v.year || 0,
      price: v.price || 0,
      mileage: v.mileage || 0,
      fuelType: v.fuel_type || '',
      transmission: v.transmission || '',
      engineSize: v.engine_size || '',
      colour: v.colour || '',
      registration: v.registration || '',
      doors: v.doors || 4,
      seats: v.seats || 5,
      bodyType: v.body_type || '',
      description: v.description || '',
      status: v.status || 'available',
      metaTitle: v.meta_title || '',
      metaDescription: v.meta_description || '',
      images: v.images || [],
      features: v.features || [],
      monthlyPayment: v.monthly_payment || Math.round((v.price || 0) * 0.018),
      condition: 'Used',
      owners: 1,
      power: '',
      torque: '',
      acceleration: '',
      topSpeed: '',
      mpg: 'N/A',
      co2: '',
      taxBand: '',
      length: '',
      width: '',
      height: '',
      bootCapacity: '',
      gears: '',
      drivetrain: '',
      ncapRating: '',
    }));
  }, [rawVehicles]);

  const vehicle = vehicles.find(v => v.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Finance calculator state
  const [financeType, setFinanceType] = useState<FinanceType>('PCP');
  const [deposit, setDeposit] = useState(10);
  const [term, setTerm] = useState(48);
  const [creditRating, setCreditRating] = useState<CreditRating>('Good');

  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    privacy: false,
  });
  const [enquiryErrors, setEnquiryErrors] = useState<Record<string, string>>({});
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  // Test drive form state
  const [testDriveForm, setTestDriveForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    location: '',
    privacy: false,
  });
  const [testDriveErrors, setTestDriveErrors] = useState<Record<string, string>>({});
  const [testDriveSubmitting, setTestDriveSubmitting] = useState(false);
  const [testDriveSubmitted, setTestDriveSubmitted] = useState(false);

  // Reserve modal state
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveForm, setReserveForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    privacy: false,
  });
  const [reserveErrors, setReserveErrors] = useState<Record<string, string>>({});
  const [reserveSubmitting, setReserveSubmitting] = useState(false);
  const [reserveSubmitted, setReserveSubmitted] = useState(false);

  // Finance apply modal state
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeForm, setFinanceForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employmentStatus: '',
    monthlyIncome: '',
    vehicleInterest: '',
    message: '',
    privacy: false,
  });
  const [financeErrors, setFinanceErrors] = useState<Record<string, string>>({});
  const [financeSubmitting, setFinanceSubmitting] = useState(false);
  const [financeSubmitted, setFinanceSubmitted] = useState(false);

  // Share button feedback
  const [shareCopied, setShareCopied] = useState(false);

  // Touch swipe tracking for gallery
  const touchStartX = useRef<number | null>(null);

  // Similar vehicles: same make or similar price range
  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    return vehicles
      .filter(v => v.id !== vehicle.id && (v.make === vehicle.make || Math.abs(v.price - vehicle.price) < 15000))
      .slice(0, 3);
  }, [vehicle, vehicles]);

  // Finance calculations
  const depositAmount = vehicle ? Math.round(vehicle.price * (deposit / 100)) : 0;
  const amountFinanced = vehicle ? vehicle.price - depositAmount : 0;
  const apr = creditRatingAPR[creditRating];
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment = financeType !== 'Cash' && amountFinanced > 0
    ? Math.round((amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1))
    : 0;
  const totalPayable = monthlyPayment * term + depositAmount;

  const vehicleInterestTitle = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`
    : '';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-electric-blue" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-pure-white mb-4">Vehicle Not Found</h1>
          <p className="text-chrome mb-6">The vehicle you are looking for does not exist.</p>
          <Link to="/inventory" className="px-8 py-3 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow transition-all">
            Browse All Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };
  const staggerContainer = { initial: {}, whileInView: { transition: { staggerChildren: 0.06 } } };
  const staggerItem = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };

  const generatedTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant} for Sale | CarZee`;
  const generatedDescription = `Used ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant} with ${vehicle.mileage.toLocaleString()} miles. ${vehicle.fuelType}, ${vehicle.transmission}. View price, photos and finance options at CarZee.`;
  const vehicleTitle = vehicle.metaTitle || generatedTitle;
  const vehicleDescription = vehicle.metaDescription || generatedDescription;
  const vehicleUrl = `${SITE_URL}/vehicle/${id}`;
  const vehicleImage = vehicle.images?.[0] || 'https://www.carzee.co.uk/vehicle-thumb-01.jpg';

  const vehicleSchema = VehicleSchema({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    mileage: vehicle.mileage,
    mileageUnit: 'MI',
    fuelType: vehicle.fuelType,
    price: vehicle.price,
    priceCurrency: 'GBP',
    availability: vehicle.status?.toLowerCase() === 'sold' ? 'OutOfStock' : 'InStock',
    condition: 'Used',
    bodyType: vehicle.bodyType || 'Sedan',
    color: vehicle.colour,
    transmission: vehicle.transmission,
    engineSize: vehicle.engineSize,
    description: vehicle.description,
    image: vehicleImage,
    url: vehicleUrl,
  });

  const breadcrumbSchema = BreadcrumbListSchema({
    items: [
      { name: 'Home', path: '/' },
      { name: 'Used Cars', path: '/inventory' },
      { name: `${vehicle.make} ${vehicle.model}`, path: `/vehicle/${id}` },
    ],
  });

  const detailSchema = {
    '@context': 'https://schema.org',
    '@graph': [vehicleSchema, breadcrumbSchema],
  };

  /* ─────────────── Handlers ─────────────── */

  const handleShare = async () => {
    const shareData = { title: document.title, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      // User cancelled or share unavailable
    }
  };

  /* ── Reserve ── */
  const validateReserveForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!reserveForm.firstName.trim()) e.firstName = 'First name is required';
    if (!reserveForm.lastName.trim()) e.lastName = 'Last name is required';
    if (!reserveForm.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reserveForm.email)) {
      e.email = 'Please enter a valid email';
    }
    if (!reserveForm.phone.trim()) e.phone = 'Phone number is required';
    if (!reserveForm.privacy) e.privacy = 'You must agree to the privacy policy';
    setReserveErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetReserveForm = () => {
    setReserveForm({ firstName: '', lastName: '', email: '', phone: '', privacy: false });
    setReserveErrors({});
    setReserveSubmitted(false);
  };

  const handleReserveSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validateReserveForm()) return;
    setReserveSubmitting(true);
    setReserveErrors({});

    const fullName = `${reserveForm.firstName} ${reserveForm.lastName}`;
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: fullName,
          subject: 'New Vehicle Reservation - CarZee',
          name: fullName,
          email: reserveForm.email,
          phone: reserveForm.phone,
          enquiry_type: 'Vehicle Reservation',
          vehicle_interest: vehicleInterestTitle,
          vehicle_price: formatCurrency(vehicle.price),
          reservation_deposit: '£99',
          message: `Reservation request with £99 deposit for ${vehicleInterestTitle}`,
          replyto: reserveForm.email,
        }),
      });

      await addLead({
        name: fullName,
        email: reserveForm.email,
        phone: reserveForm.phone,
        vehicle_interest: vehicleInterestTitle,
        status: 'new',
        source: 'Vehicle Detail Page',
        date: new Date().toISOString(),
        notes: `£99 reservation deposit requested for ${vehicleInterestTitle}. Vehicle price: ${formatCurrency(vehicle.price)}.`,
        type: 'contact',
      });

      setReserveSubmitted(true);
    } catch {
      setReserveErrors({ submit: 'Something went wrong. Please try again or call us.' });
    } finally {
      setReserveSubmitting(false);
    }
  };

  /* ── Finance ── */
  const validateFinanceForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!financeForm.firstName.trim()) e.firstName = 'First name is required';
    if (!financeForm.lastName.trim()) e.lastName = 'Last name is required';
    if (!financeForm.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(financeForm.email)) {
      e.email = 'Please enter a valid email';
    }
    if (!financeForm.phone.trim()) e.phone = 'Phone number is required';
    if (!financeForm.employmentStatus) e.employmentStatus = 'Employment status is required';
    if (!financeForm.monthlyIncome) e.monthlyIncome = 'Income range is required';
    if (!financeForm.privacy) e.privacy = 'You must agree to the privacy policy';
    setFinanceErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetFinanceForm = () => {
    setFinanceForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employmentStatus: '',
      monthlyIncome: '',
      vehicleInterest: vehicleInterestTitle,
      message: '',
      privacy: false,
    });
    setFinanceErrors({});
    setFinanceSubmitted(false);
  };

  const openFinanceModal = () => {
    resetFinanceForm();
    setShowFinanceModal(true);
  };

  const handleFinanceSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validateFinanceForm()) return;
    setFinanceSubmitting(true);
    setFinanceErrors({});

    const fullName = `${financeForm.firstName} ${financeForm.lastName}`;
    const financeDetails = `Vehicle Price: ${formatCurrency(vehicle.price)} | Deposit: ${formatCurrency(depositAmount)} | Term: ${term} months | Finance Type: ${financeType} | Estimated Monthly: ${formatCurrency(monthlyPayment)} | APR: ${apr}%`;

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: fullName,
          subject: 'New Finance Application - CarZee',
          name: fullName,
          email: financeForm.email,
          phone: financeForm.phone,
          enquiry_type: 'Finance Application',
          employment_status: financeForm.employmentStatus,
          monthly_income: financeForm.monthlyIncome,
          vehicle_interest: financeForm.vehicleInterest || vehicleInterestTitle,
          finance_details: financeDetails,
          message: financeForm.message || 'No additional message',
          replyto: financeForm.email,
        }),
      });

      await addLead({
        name: fullName,
        email: financeForm.email,
        phone: financeForm.phone,
        vehicle_interest: financeForm.vehicleInterest || vehicleInterestTitle,
        status: 'new',
        source: 'Vehicle Detail Page',
        date: new Date().toISOString(),
        notes: `Finance application. ${financeDetails}. Employment: ${financeForm.employmentStatus}, Income: ${financeForm.monthlyIncome}. ${financeForm.message || ''}`,
        type: 'finance',
        amount: amountFinanced,
        term,
        employment_status: financeForm.employmentStatus,
        income: parseInt(financeForm.monthlyIncome.replace(/\D/g, ''), 10) || 0,
        credit_rating: creditRating,
      });

      setFinanceSubmitted(true);
    } catch {
      setFinanceErrors({ submit: 'Something went wrong. Please try again or call us.' });
    } finally {
      setFinanceSubmitting(false);
    }
  };

  /* ── Enquiry ── */
  const validateEnquiryForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!enquiryForm.firstName.trim()) e.firstName = 'First name is required';
    if (!enquiryForm.lastName.trim()) e.lastName = 'Last name is required';
    if (!enquiryForm.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiryForm.email)) {
      e.email = 'Please enter a valid email';
    }
    if (!enquiryForm.phone.trim()) e.phone = 'Phone number is required';
    if (!enquiryForm.privacy) e.privacy = 'You must agree to the privacy policy';
    setEnquiryErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEnquirySubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validateEnquiryForm()) return;
    setEnquirySubmitting(true);
    setEnquiryErrors({});

    const fullName = `${enquiryForm.firstName} ${enquiryForm.lastName}`;
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: fullName,
          subject: 'New Vehicle Enquiry - CarZee',
          name: fullName,
          email: enquiryForm.email,
          phone: enquiryForm.phone,
          enquiry_type: 'Vehicle Enquiry',
          vehicle_interest: vehicleInterestTitle,
          message: enquiryForm.message || 'No additional message',
          replyto: enquiryForm.email,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await addLead({
          name: fullName,
          email: enquiryForm.email,
          phone: enquiryForm.phone,
          vehicle_interest: vehicleInterestTitle,
          status: 'new',
          source: 'Vehicle Detail Enquiry',
          date: new Date().toISOString(),
          notes: enquiryForm.message || 'Vehicle enquiry from detail page.',
          type: 'contact',
        });
        setEnquirySubmitted(true);
      } else {
        setEnquiryErrors({ submit: 'Something went wrong. Please try again or call us.' });
      }
    } catch {
      setEnquiryErrors({ submit: 'Network error. Please try again or call us directly.' });
    } finally {
      setEnquirySubmitting(false);
    }
  };

  /* ── Test Drive ── */
  const validateTestDriveForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!testDriveForm.firstName.trim()) e.firstName = 'First name is required';
    if (!testDriveForm.lastName.trim()) e.lastName = 'Last name is required';
    if (!testDriveForm.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testDriveForm.email)) {
      e.email = 'Please enter a valid email';
    }
    if (!testDriveForm.phone.trim()) e.phone = 'Phone number is required';
    if (!testDriveForm.date) e.date = 'Preferred date is required';
    if (!testDriveForm.time) e.time = 'Preferred time is required';
    if (!testDriveForm.location) e.location = 'Showroom location is required';
    if (!testDriveForm.privacy) e.privacy = 'You must agree to the privacy policy';
    setTestDriveErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleTestDriveSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validateTestDriveForm()) return;
    setTestDriveSubmitting(true);
    setTestDriveErrors({});

    const fullName = `${testDriveForm.firstName} ${testDriveForm.lastName}`;
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: fullName,
          subject: 'New Test Drive Booking - CarZee',
          name: fullName,
          email: testDriveForm.email,
          phone: testDriveForm.phone,
          enquiry_type: 'Test Drive Booking',
          vehicle_interest: vehicleInterestTitle,
          preferred_date: testDriveForm.date,
          preferred_time: testDriveForm.time,
          showroom_location: testDriveForm.location,
          message: `Test drive request for ${vehicleInterestTitle} at ${testDriveForm.location} on ${testDriveForm.date} (${testDriveForm.time})`,
          replyto: testDriveForm.email,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await addLead({
          name: fullName,
          email: testDriveForm.email,
          phone: testDriveForm.phone,
          vehicle_interest: vehicleInterestTitle,
          status: 'new',
          source: 'Vehicle Detail Test Drive',
          date: new Date().toISOString(),
          notes: `Test drive requested at ${testDriveForm.location} on ${testDriveForm.date} (${testDriveForm.time}).`,
          type: 'test-drive',
          preferred_date: testDriveForm.date,
          preferred_time: testDriveForm.time,
        });
        setTestDriveSubmitted(true);
      } else {
        setTestDriveErrors({ submit: 'Something went wrong. Please try again or call us.' });
      }
    } catch {
      setTestDriveErrors({ submit: 'Network error. Please try again or call us directly.' });
    } finally {
      setTestDriveSubmitting(false);
    }
  };

  /* ── Render helpers ── */
  const inputClass = (error?: string) =>
    `w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all ${
      error ? 'border-error' : 'border-slate/30'
    }`;

  const selectClass = (error?: string) =>
    `w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border rounded-xl text-sm text-frost outline-none focus:border-electric-blue transition-all ${
      error ? 'border-error' : 'border-slate/30'
    }`;

  const checkboxClass = (checked: boolean, error?: string) =>
    `w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
      checked ? 'bg-electric-blue border-electric-blue' : error ? 'border-error' : 'border-slate/50'
    }`;

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      <SEO
        title={vehicleTitle}
        description={vehicleDescription}
        canonical={`/vehicle/${id}`}
        ogImage={vehicleImage}
        ogType="product"
        schema={detailSchema}
      />

      {/* ============ RESERVE MODAL ============ */}
      <Dialog open={showReserveModal} onOpenChange={setShowReserveModal}>
        <DialogContent className="bg-midnight border-white/10 text-pure-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-pure-white font-display text-xl">
              Reserve This Car — £99
            </DialogTitle>
          </DialogHeader>
          {reserveSubmitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h3 className="font-display font-semibold text-lg text-pure-white">Reservation Request Sent</h3>
              <p className="text-chrome mt-2 text-sm">Our team will contact you shortly to arrange your £99 deposit.</p>
              <button
                onClick={() => { setShowReserveModal(false); resetReserveForm(); }}
                className="mt-6 px-8 py-2.5 bg-electric-blue text-pure-white font-medium rounded-full hover:bg-blue-glow transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleReserveSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-chrome mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={reserveForm.firstName}
                    onChange={e => setReserveForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className={inputClass(reserveErrors.firstName)}
                    placeholder="John"
                  />
                  {reserveErrors.firstName && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {reserveErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-chrome mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={reserveForm.lastName}
                    onChange={e => setReserveForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className={inputClass(reserveErrors.lastName)}
                    placeholder="Smith"
                  />
                  {reserveErrors.lastName && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {reserveErrors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-chrome mb-1.5">Email</label>
                <input
                  type="email"
                  value={reserveForm.email}
                  onChange={e => setReserveForm(prev => ({ ...prev, email: e.target.value }))}
                  className={inputClass(reserveErrors.email)}
                  placeholder="john@example.com"
                />
                {reserveErrors.email && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {reserveErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm text-chrome mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={reserveForm.phone}
                  onChange={e => setReserveForm(prev => ({ ...prev, phone: e.target.value }))}
                  className={inputClass(reserveErrors.phone)}
                  placeholder="07XXX XXXXXX"
                />
                {reserveErrors.phone && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {reserveErrors.phone}</p>}
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={reserveForm.privacy}
                    onChange={e => setReserveForm(prev => ({ ...prev, privacy: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={checkboxClass(reserveForm.privacy, reserveErrors.privacy)}>
                    {reserveForm.privacy && <Check size={14} className="text-pure-white" />}
                  </div>
                </div>
                <span className="text-sm text-frost leading-relaxed">
                  I agree to the <Link to="/about" className="text-electric-blue hover:underline">Privacy Policy</Link> and consent to CarZee contacting me.
                </span>
              </label>
              {reserveErrors.privacy && <p className="text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {reserveErrors.privacy}</p>}
              {reserveErrors.submit && <p className="text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {reserveErrors.submit}</p>}
              <button
                type="submit"
                disabled={reserveSubmitting}
                className="w-full py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {reserveSubmitting ? <><span className="w-5 h-5 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" /> Sending...</> : 'Submit Reservation'}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ FINANCE APPLY MODAL ============ */}
      <Dialog open={showFinanceModal} onOpenChange={setShowFinanceModal}>
        <DialogContent className="bg-midnight border-white/10 text-pure-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-pure-white font-display text-xl">
              Apply for Finance
            </DialogTitle>
          </DialogHeader>
          {financeSubmitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h3 className="font-display font-semibold text-lg text-pure-white">Application Sent</h3>
              <p className="text-chrome mt-2 text-sm">Our finance team will be in touch shortly.</p>
              <button
                onClick={() => { setShowFinanceModal(false); resetFinanceForm(); }}
                className="mt-6 px-8 py-2.5 bg-electric-blue text-pure-white font-medium rounded-full hover:bg-blue-glow transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleFinanceSubmit} className="space-y-4 mt-2">
              <div className="p-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-slate/30 text-sm text-frost">
                <p className="text-chrome">Vehicle</p>
                <p className="text-pure-white font-medium">{vehicleInterestTitle}</p>
                <p className="text-chrome mt-1">Finance Summary</p>
                <p className="text-pure-white">
                  {formatCurrency(vehicle.price)} | Deposit {formatCurrency(depositAmount)} | {term} months | {financeType} | {formatCurrency(monthlyPayment)}/mo | {apr}% APR
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-chrome mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={financeForm.firstName}
                    onChange={e => setFinanceForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className={inputClass(financeErrors.firstName)}
                    placeholder="John"
                  />
                  {financeErrors.firstName && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {financeErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-chrome mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={financeForm.lastName}
                    onChange={e => setFinanceForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className={inputClass(financeErrors.lastName)}
                    placeholder="Smith"
                  />
                  {financeErrors.lastName && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {financeErrors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-chrome mb-1.5">Email</label>
                <input
                  type="email"
                  value={financeForm.email}
                  onChange={e => setFinanceForm(prev => ({ ...prev, email: e.target.value }))}
                  className={inputClass(financeErrors.email)}
                  placeholder="john@example.com"
                />
                {financeErrors.email && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {financeErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm text-chrome mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={financeForm.phone}
                  onChange={e => setFinanceForm(prev => ({ ...prev, phone: e.target.value }))}
                  className={inputClass(financeErrors.phone)}
                  placeholder="07XXX XXXXXX"
                />
                {financeErrors.phone && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {financeErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm text-chrome mb-1.5">Employment Status</label>
                <select
                  value={financeForm.employmentStatus}
                  onChange={e => setFinanceForm(prev => ({ ...prev, employmentStatus: e.target.value }))}
                  className={selectClass(financeErrors.employmentStatus)}
                >
                  <option value="">Select status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Retired">Retired</option>
                  <option value="Other">Other</option>
                </select>
                {financeErrors.employmentStatus && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {financeErrors.employmentStatus}</p>}
              </div>
              <div>
                <label className="block text-sm text-chrome mb-1.5">Monthly Income</label>
                <select
                  value={financeForm.monthlyIncome}
                  onChange={e => setFinanceForm(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                  className={selectClass(financeErrors.monthlyIncome)}
                >
                  <option value="">Select income range</option>
                  <option value="Under £1,500">Under £1,500</option>
                  <option value="£1,500 - £2,500">£1,500 - £2,500</option>
                  <option value="£2,500 - £4,000">£2,500 - £4,000</option>
                  <option value="£4,000+">£4,000+</option>
                </select>
                {financeErrors.monthlyIncome && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {financeErrors.monthlyIncome}</p>}
              </div>
              <div>
                <label className="block text-sm text-chrome mb-1.5">Vehicle of Interest</label>
                <input
                  type="text"
                  value={financeForm.vehicleInterest}
                  onChange={e => setFinanceForm(prev => ({ ...prev, vehicleInterest: e.target.value }))}
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="block text-sm text-chrome mb-1.5">Message <span className="text-slate">(optional)</span></label>
                <textarea
                  value={financeForm.message}
                  onChange={e => setFinanceForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className={`${inputClass()} resize-none`}
                  placeholder="Any additional information..."
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={financeForm.privacy}
                    onChange={e => setFinanceForm(prev => ({ ...prev, privacy: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={checkboxClass(financeForm.privacy, financeErrors.privacy)}>
                    {financeForm.privacy && <Check size={14} className="text-pure-white" />}
                  </div>
                </div>
                <span className="text-sm text-frost leading-relaxed">
                  I agree to the <Link to="/about" className="text-electric-blue hover:underline">Privacy Policy</Link> and consent to CarZee contacting me.
                </span>
              </label>
              {financeErrors.privacy && <p className="text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {financeErrors.privacy}</p>}
              {financeErrors.submit && <p className="text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {financeErrors.submit}</p>}
              <button
                type="submit"
                disabled={financeSubmitting}
                className="w-full py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {financeSubmitting ? <><span className="w-5 h-5 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" /> Sending...</> : 'Submit Application'}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ HERO GALLERY ============ */}
      <section className="bg-obsidian">
        {/* ── Full-width image slider (no text on top) ── */}
        <div
          className="relative w-full overflow-hidden select-none bg-[#0a0a0a]"
          style={{ height: 'clamp(300px, 56.25vw, 700px)' }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const startX = touchStartX.current ?? 0;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 40) {
              if (diff > 0) setActiveImage(prev => prev < vehicle.images.length - 1 ? prev + 1 : 0);
              else setActiveImage(prev => prev > 0 ? prev - 1 : vehicle.images.length - 1);
            }
            touchStartX.current = null;
          }}
        >
          <motion.img
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            src={vehicle.images[activeImage]}
            alt={`${vehicle.make} ${vehicle.model} — photo ${activeImage + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />

          {/* Left / Right arrows */}
          <button
            onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : vehicle.images.length - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full glass flex items-center justify-center text-pure-white hover:bg-pure-white/20 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setActiveImage(prev => prev < vehicle.images.length - 1 ? prev + 1 : 0)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full glass flex items-center justify-center text-pure-white hover:bg-pure-white/20 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>

          {/* Counter badge */}
          <span className="absolute top-4 right-4 z-10 font-mono text-xs text-pure-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {activeImage + 1} / {vehicle.images.length}
          </span>
        </div>

        {/* ── Thumbnail strip ── */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 bg-obsidian scrollbar-none">
          {vehicle.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? 'border-electric-blue opacity-100' : 'border-transparent opacity-50 hover:opacity-75'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* ── Vehicle details below the gallery ── */}
        <div className="px-[clamp(1.5rem,5vw,4rem)] pt-6 pb-10 bg-obsidian">
          <div className="max-w-[1400px] mx-auto">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-chrome mb-5"
            >
              <Link to="/" className="text-frost hover:text-pure-white transition-colors">Home</Link>
              <span className="mx-2 text-slate">/</span>
              <Link to="/inventory" className="text-frost hover:text-pure-white transition-colors">Inventory</Link>
              <span className="mx-2 text-slate">/</span>
              <span>{vehicle.make}</span>
              <span className="mx-2 text-slate">/</span>
              <span>{vehicle.model}</span>
            </motion.div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
                  className="font-display font-bold text-pure-white"
                  style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
                >
                  {vehicle.make} {vehicle.model} {vehicle.variant}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-2 font-mono text-sm text-chrome"
                >
                  {vehicle.year} &middot; {vehicle.mileage.toLocaleString()} miles &middot; {vehicle.transmission} &middot; {vehicle.fuelType}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-baseline gap-4 mt-4"
                >
                  <span className="font-display font-bold text-3xl text-pure-white">£{vehicle.price.toLocaleString()}</span>
                  <span className="text-base text-electric-blue">or £{vehicle.monthlyPayment}/month</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">PCP</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-wrap gap-2 mt-3"
                >
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">RAC Approved</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">200-Point Inspected</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">3-Month Warranty</span>
                </motion.div>
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[220px]"
              >
                <button
                  onClick={() => { resetReserveForm(); setShowReserveModal(true); }}
                  className="w-full lg:w-auto px-8 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 text-center"
                >
                  Reserve This Car — £99
                </button>
                <Link
                  to="/contact"
                  className="w-full lg:w-auto px-8 py-3 border-2 border-pure-white/30 text-pure-white font-semibold rounded-full hover:bg-pure-white/10 hover:border-electric-blue transition-all duration-300 text-center"
                >
                  Book Test Drive
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-frost hover:text-pure-white transition-colors"
                  >
                    <Heart size={16} className={isWishlisted ? 'fill-error text-error' : ''} />
                    {isWishlisted ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-frost hover:text-pure-white transition-colors"
                  >
                    <Share2 size={16} /> {shareCopied ? 'Link Copied!' : 'Share'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ KEY HIGHLIGHTS ============ */}
      <section className="bg-midnight py-12">
        <div className="container-apex">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          >
            {[
              { icon: <Calendar size={28} />, label: 'Year', value: String(vehicle.year) },
              { icon: <Gauge size={28} />, label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} miles` },
              { icon: <Fuel size={28} />, label: 'Fuel Type', value: vehicle.fuelType },
              { icon: <Settings size={28} />, label: 'Transmission', value: vehicle.transmission },
              { icon: <Cog size={28} />, label: 'Engine Size', value: vehicle.engineSize },
              { icon: <Zap size={28} />, label: 'Power', value: vehicle.power },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="flex flex-col items-center text-center py-6 px-4 border-r border-slate/20 last:border-r-0"
              >
                <span className="text-electric-blue mb-2">{item.icon}</span>
                <span className="text-[0.75rem] font-medium text-chrome uppercase tracking-[0.06em]">{item.label}</span>
                <span className="font-display font-semibold text-base text-pure-white mt-1">{item.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ DESCRIPTION & FEATURES ============ */}
      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left - Description */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="lg:col-span-3"
            >
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">About This Vehicle</h2>
              <p className="text-frost leading-relaxed mb-4">{vehicle.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                <CheckCircle size={16} className="text-success" />
                <span className="text-sm text-success font-medium">Condition: {vehicle.condition}</span>
              </div>
              <p className="mt-3 text-sm text-chrome">{vehicle.owners} previous owner{vehicle.owners !== 1 ? 's' : ''} &middot; Registration: {vehicle.registration}</p>
            </motion.div>

            {/* Right - Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="lg:col-span-2"
            >
              <h2 className="font-display font-semibold text-lg text-pure-white mb-4">Key Features</h2>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-2.5"
              >
                {vehicle.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className="flex items-center gap-2"
                  >
                    <Check size={16} className="text-success shrink-0" />
                    <span className="text-sm text-frost">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FULL SPECIFICATIONS ============ */}
      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div
            {...fadeUp}
            className="max-w-[1000px] mx-auto"
          >
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-8">Full Specifications</h2>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="space-y-0"
            >
              {[
                { label: 'Make', value: vehicle.make },
                { label: 'Model', value: `${vehicle.model} ${vehicle.variant}` },
                { label: 'Year', value: String(vehicle.year) },
                { label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} miles` },
                { label: 'Registration', value: vehicle.registration },
                { label: 'Previous Owners', value: String(vehicle.owners) },
                { label: 'Engine Size', value: vehicle.engineSize },
                { label: 'Power', value: vehicle.power },
                { label: 'Torque', value: vehicle.torque },
                { label: 'Acceleration (0-60)', value: `${vehicle.acceleration}s` },
                { label: 'Top Speed', value: `${vehicle.topSpeed} mph` },
                { label: 'Fuel Type', value: vehicle.fuelType },
                { label: 'MPG (Combined)', value: vehicle.mpg === 'N/A' ? 'N/A' : `${vehicle.mpg} mpg` },
                { label: 'CO2 Emissions', value: `${vehicle.co2} g/km` },
                { label: 'Tax Band', value: vehicle.taxBand },
                { label: 'Length', value: vehicle.length },
                { label: 'Width', value: vehicle.width },
                { label: 'Height', value: vehicle.height },
                { label: 'Boot Capacity', value: vehicle.bootCapacity },
                { label: 'Transmission', value: vehicle.transmission },
                { label: 'Gears', value: vehicle.gears },
                { label: 'Drivetrain', value: vehicle.drivetrain },
                { label: 'NCAP Rating', value: vehicle.ncapRating },
              ].map((spec, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className={`flex items-center justify-between py-3.5 border-b border-slate/20 ${i % 2 === 0 ? 'bg-[rgba(0,8,20,0.3)]' : ''} px-4 -mx-4`}
                >
                  <span className="text-sm font-medium text-chrome">{spec.label}</span>
                  <span className="text-sm text-pure-white">{spec.value}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ FINANCE CALCULATOR ============ */}
      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Calculator */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-6">Finance Calculator</h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {(['PCP', 'HP', 'Cash'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFinanceType(tab)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${financeType === tab ? 'bg-electric-blue text-pure-white' : 'bg-slate/20 text-chrome hover:text-frost'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                {/* Vehicle Price */}
                <div>
                  <label className="block text-sm text-chrome mb-2">Vehicle Price</label>
                  <div className="px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-pure-white font-mono">
                    £{vehicle.price.toLocaleString()}
                  </div>
                </div>

                {/* Deposit Slider */}
                <div>
                  <label className="flex justify-between text-sm text-chrome mb-2">
                    <span>Deposit ({deposit}%)</span>
                    <span className="text-pure-white font-mono">£{depositAmount.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    className="w-full h-2 bg-slate/30 rounded-full appearance-none cursor-pointer accent-electric-blue"
                  />
                  <div className="flex justify-between text-xs text-slate mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Term */}
                <div>
                  <label className="block text-sm text-chrome mb-2">Term</label>
                  <div className="flex gap-2">
                    {[24, 36, 48, 60].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTerm(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${term === t ? 'bg-electric-blue text-pure-white' : 'bg-[rgba(0,8,20,0.6)] border border-slate/30 text-frost hover:border-electric-blue'}`}
                      >
                        {t} mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* Credit Rating */}
                <div>
                  <label className="block text-sm text-chrome mb-2">Credit Rating</label>
                  <select
                    value={creditRating}
                    onChange={e => setCreditRating(e.target.value as CreditRating)}
                    className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Right - Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex items-center"
            >
              <div className="w-full glass rounded-2xl p-8">
                {financeType === 'Cash' ? (
                  <>
                    <p className="font-mono text-sm text-chrome mb-1">Cash Price</p>
                    <p className="font-display font-bold text-electric-blue" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                      £{vehicle.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-chrome mb-6">No finance required</p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-sm text-chrome mb-1">Monthly Payment</p>
                    <p className="font-display font-bold text-electric-blue" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                      £{monthlyPayment.toLocaleString()}
                    </p>
                    <p className="text-sm text-chrome mb-6">per month</p>
                  </>
                )}

                <div className="border-t border-slate/30 my-5" />

                <div className="space-y-3">
                  {[
                    { label: 'Vehicle Price', value: `£${vehicle.price.toLocaleString()}` },
                    ...(financeType !== 'Cash' ? [{ label: 'Deposit', value: `-£${depositAmount.toLocaleString()}` }] : []),
                    ...(financeType !== 'Cash' ? [{ label: 'Term', value: `${term} months` }] : []),
                    ...(financeType !== 'Cash' ? [{ label: 'Total Payable', value: `£${totalPayable.toLocaleString()}` }] : []),
                    { label: 'Representative APR', value: `${apr}%` },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-sm text-chrome">{row.label}</span>
                      <span className="text-sm font-mono text-pure-white">{row.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={openFinanceModal}
                  className="w-full mt-6 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all"
                >
                  Apply for Finance
                </button>
                <p className="text-xs text-slate text-center mt-3">
                  Representative example. Subject to status and affordability checks.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ ENQUIRY FORM ============ */}
      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-[800px] mx-auto text-center"
          >
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-3">Interested in This Car?</h2>
            <p className="text-frost mb-8">Send us an enquiry and our team will get back to you within 30 minutes during opening hours.</p>

            {enquirySubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="glass rounded-[20px] p-12 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle size={32} className="text-success" />
                </div>
                <h3 className="mt-6 font-display font-semibold text-pure-white text-xl">Enquiry Sent!</h3>
                <p className="mt-2 text-frost">Thank you for your interest. Our team will get back to you shortly.</p>
                <button
                  onClick={() => {
                    setEnquirySubmitted(false);
                    setEnquiryForm({ firstName: '', lastName: '', email: '', phone: '', message: '', privacy: false });
                  }}
                  className="mt-6 px-6 py-2.5 text-[0.875rem] font-medium text-electric-blue border border-electric-blue/30 rounded-full hover:bg-electric-blue/10 transition-colors"
                >
                  Send Another Enquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-sm text-chrome mb-2">First Name</label>
                  <input
                    type="text"
                    value={enquiryForm.firstName}
                    onChange={e => setEnquiryForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    className={inputClass(enquiryErrors.firstName)}
                  />
                  {enquiryErrors.firstName && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {enquiryErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-chrome mb-2">Last Name</label>
                  <input
                    type="text"
                    value={enquiryForm.lastName}
                    onChange={e => setEnquiryForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Smith"
                    className={inputClass(enquiryErrors.lastName)}
                  />
                  {enquiryErrors.lastName && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {enquiryErrors.lastName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-chrome mb-2">Email Address</label>
                  <input
                    type="email"
                    value={enquiryForm.email}
                    onChange={e => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className={inputClass(enquiryErrors.email)}
                  />
                  {enquiryErrors.email && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {enquiryErrors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-chrome mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={enquiryForm.phone}
                    onChange={e => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="07XXX XXXXXX"
                    className={inputClass(enquiryErrors.phone)}
                  />
                  {enquiryErrors.phone && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {enquiryErrors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-chrome mb-2">Your Message</label>
                  <textarea
                    value={enquiryForm.message}
                    onChange={e => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="I'd like to know more about this vehicle..."
                    rows={4}
                    className={`${inputClass()} resize-none`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={enquiryForm.privacy}
                        onChange={e => setEnquiryForm(prev => ({ ...prev, privacy: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={checkboxClass(enquiryForm.privacy, enquiryErrors.privacy)}>
                        {enquiryForm.privacy && <Check size={14} className="text-pure-white" />}
                      </div>
                    </div>
                    <span className="text-sm text-frost leading-relaxed">
                      I agree to the <Link to="/privacy" className="text-electric-blue hover:underline">Privacy Policy</Link> and consent to CarZee contacting me regarding my enquiry.
                    </span>
                  </label>
                  {enquiryErrors.privacy && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {enquiryErrors.privacy}</p>}
                </div>
                {enquiryErrors.submit && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-sm text-error">
                    <AlertCircle size={16} /> {enquiryErrors.submit}
                  </div>
                )}
                <div className="sm:col-span-2 text-center">
                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="mt-2 w-full sm:w-auto px-10 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {enquirySubmitting ? <><span className="w-5 h-5 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" /> Sending...</> : <><Send size={16} /> Send Enquiry</>}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ============ TEST DRIVE ============ */}
      <section className="py-24 bg-obsidian">
        <div className="container-apex">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">Book a Test Drive</h2>
              <p className="text-frost leading-relaxed mb-6">
                Nothing compares to getting behind the wheel. Book a test drive at your nearest showroom and experience this vehicle firsthand.
              </p>
              <ul className="space-y-3">
                {[
                  'No obligation or pressure',
                  'Available 7 days a week',
                  'Bring your part exchange for valuation',
                  'Finance pre-approval available',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-success shrink-0" />
                    <span className="text-sm text-frost">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass rounded-2xl p-8"
            >
              {testDriveSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="text-center py-6"
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
                    <CheckCircle size={28} className="text-success" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-pure-white">Test Drive Booked</h3>
                  <p className="text-chrome mt-2 text-sm">We will confirm your appointment shortly.</p>
                  <button
                    onClick={() => {
                      setTestDriveSubmitted(false);
                      setTestDriveForm({ firstName: '', lastName: '', email: '', phone: '', date: '', time: '', location: '', privacy: false });
                    }}
                    className="mt-6 px-6 py-2.5 text-[0.875rem] font-medium text-electric-blue border border-electric-blue/30 rounded-full hover:bg-electric-blue/10 transition-colors"
                  >
                    Book Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleTestDriveSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-chrome mb-2">First Name</label>
                      <input
                        type="text"
                        value={testDriveForm.firstName}
                        onChange={e => setTestDriveForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                        className={inputClass(testDriveErrors.firstName)}
                      />
                      {testDriveErrors.firstName && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-chrome mb-2">Last Name</label>
                      <input
                        type="text"
                        value={testDriveForm.lastName}
                        onChange={e => setTestDriveForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Smith"
                        className={inputClass(testDriveErrors.lastName)}
                      />
                      {testDriveErrors.lastName && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-chrome mb-2">Email</label>
                    <input
                      type="email"
                      value={testDriveForm.email}
                      onChange={e => setTestDriveForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      className={inputClass(testDriveErrors.email)}
                    />
                    {testDriveErrors.email && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-chrome mb-2">Phone</label>
                    <input
                      type="tel"
                      value={testDriveForm.phone}
                      onChange={e => setTestDriveForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="07XXX XXXXXX"
                      className={inputClass(testDriveErrors.phone)}
                    />
                    {testDriveErrors.phone && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-chrome mb-2">Preferred Date</label>
                    <input
                      type="date"
                      value={testDriveForm.date}
                      onChange={e => setTestDriveForm(prev => ({ ...prev, date: e.target.value }))}
                      className={inputClass(testDriveErrors.date)}
                    />
                    {testDriveErrors.date && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-chrome mb-2">Preferred Time</label>
                    <select
                      value={testDriveForm.time}
                      onChange={e => setTestDriveForm(prev => ({ ...prev, time: e.target.value }))}
                      className={selectClass(testDriveErrors.time)}
                    >
                      <option value="">Select time</option>
                      <option value="Morning (9am - 12pm)">Morning (9am - 12pm)</option>
                      <option value="Afternoon (12pm - 5pm)">Afternoon (12pm - 5pm)</option>
                      <option value="Evening (5pm - 7pm)">Evening (5pm - 7pm)</option>
                    </select>
                    {testDriveErrors.time && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.time}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-chrome mb-2">Showroom Location</label>
                    <select
                      value={testDriveForm.location}
                      onChange={e => setTestDriveForm(prev => ({ ...prev, location: e.target.value }))}
                      className={selectClass(testDriveErrors.location)}
                    >
                      <option value="">Select location</option>
                      <option value="London">London</option>
                      <option value="Manchester">Manchester</option>
                      <option value="Birmingham">Birmingham</option>
                      <option value="Edinburgh">Edinburgh</option>
                    </select>
                    {testDriveErrors.location && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.location}</p>}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={testDriveForm.privacy}
                        onChange={e => setTestDriveForm(prev => ({ ...prev, privacy: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={checkboxClass(testDriveForm.privacy, testDriveErrors.privacy)}>
                        {testDriveForm.privacy && <Check size={14} className="text-pure-white" />}
                      </div>
                    </div>
                    <span className="text-sm text-frost leading-relaxed">
                      I agree to the <Link to="/about" className="text-electric-blue hover:underline">Privacy Policy</Link> and consent to CarZee contacting me.
                    </span>
                  </label>
                  {testDriveErrors.privacy && <p className="text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.privacy}</p>}
                  {testDriveErrors.submit && <p className="text-xs text-error flex items-center gap-1"><AlertCircle size={12} /> {testDriveErrors.submit}</p>}
                  <button
                    type="submit"
                    disabled={testDriveSubmitting}
                    className="w-full mt-4 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {testDriveSubmitting ? <><span className="w-5 h-5 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" /> Sending...</> : 'Book Test Drive'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ SIMILAR VEHICLES ============ */}
      <section className="py-24 bg-midnight">
        <div className="container-apex">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-semibold text-2xl text-pure-white mb-2">Similar Vehicles</h2>
            <p className="text-chrome mb-8">More cars you might love</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarVehicles.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.1 }}
              >
                <Link to={`/vehicle/${v.id}`} className="block group">
                  <div className="rounded-2xl overflow-hidden bg-[rgba(0,18,51,0.5)] backdrop-blur-16 border border-slate/25 shadow-card transition-all duration-400 group-hover:shadow-card-hover group-hover:-translate-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={v.images?.[0] || '/vehicle-thumb-01.jpg'} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-base text-pure-white">{v.make} {v.model}</h3>
                      <p className="text-xs text-chrome mt-1">{v.variant}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-chrome">
                        <span>{v.year}</span><span>|</span><span>{v.mileage.toLocaleString()} mi</span><span>|</span><span>{v.fuelType}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate/20">
                        <p className="font-mono text-lg text-pure-white">£{v.price.toLocaleString()}</p>
                        <p className="font-mono text-xs text-electric-blue">£{v.monthlyPayment}/mo</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="py-16 bg-gradient-to-r from-obsidian to-midnight">
        <div className="container-apex">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-[800px] mx-auto text-center"
          >
            <h2 className="font-display font-bold text-pure-white mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              Love This Car?
            </h2>
            <p className="text-frost mb-6">
              Reserve it now with a fully refundable £99 deposit. Do not miss out — popular cars go fast.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => { resetReserveForm(); setShowReserveModal(true); }}
                className="px-10 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all"
              >
                Reserve Now — £99
              </button>
              <a
                href="tel:07983183814"
                className="flex items-center gap-2 px-8 py-3.5 border-2 border-pure-white/30 text-pure-white font-semibold rounded-full hover:bg-pure-white/10 hover:border-electric-blue transition-all"
              >
                <Phone size={16} /> Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
