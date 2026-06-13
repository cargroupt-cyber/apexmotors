     1	// @ts-nocheck
     2	import { useState, useMemo, useEffect } from 'react';
     3	import { useParams, Link } from 'react-router-dom';
     4	import { motion, AnimatePresence } from 'framer-motion';
     5	import {
     6	  ChevronLeft, ChevronRight, Calendar, Gauge, Fuel,
     7	  Settings, Zap, Check, CheckCircle, Heart, Share2,
     8	  Phone, Mail, User, MessageSquare, Send, Clock,
     9	  MapPin, Cog, ArrowRight
    10	} from 'lucide-react';
    11	import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles';
    12	
    13	/* ═══════════════════════════════════════════
    14	   Fallback vehicle data for offline / detail fields
    15	   ═══════════════════════════════════════════ */
    16	const fallbackData: Record<string, Record<string, unknown>> = {
    17	  '1': { power: '194 bhp', torque: '400 Nm', acceleration: '7.3', topSpeed: '145', mpg: '55.4', co2: '117', taxBand: 'C', length: '4,751 mm', width: '1,820 mm', height: '1,437 mm', bootCapacity: '455 L', gears: '9', drivetrain: 'RWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Stunning Mercedes C-Class in excellent condition with full service history. Recently serviced and ready to drive away.' },
    18	  '2': { power: '181 bhp', torque: '300 Nm', acceleration: '7.4', topSpeed: '149', mpg: '44.1', co2: '135', taxBand: 'E', length: '4,709 mm', width: '1,827 mm', height: '1,442 mm', bootCapacity: '480 L', gears: '8', drivetrain: 'RWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Premium BMW 3 Series with M Sport Pro pack. Low mileage and in pristine condition throughout.' },
    19	  '3': { power: '161 bhp', torque: '370 Nm', acceleration: '8.2', topSpeed: '142', mpg: '58.9', co2: '108', taxBand: 'B', length: '4,762 mm', width: '1,847 mm', height: '1,429 mm', bootCapacity: '460 L', gears: '7', drivetrain: 'FWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Stylish Audi A4 Black Edition with all premium options. Virtual cockpit and LED matrix headlights.' },
    20	  '4': { power: '296 bhp', torque: '650 Nm', acceleration: '6.6', topSpeed: '140', mpg: '32.5', co2: '189', taxBand: 'J', length: '4,877 mm', width: '2,073 mm', height: '1,803 mm', bootCapacity: '780 L', gears: '8', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Powerful Range Rover Sport with HSE Dynamic pack and air suspension. Perfect for family adventures.' },
    21	  '5': { power: '631 bhp', torque: '850 Nm', acceleration: '3.3', topSpeed: '186', mpg: '20.4', co2: '268', taxBand: 'M', length: '4,936 mm', width: '1,995 mm', height: '1,636 mm', bootCapacity: '549 L', gears: '8', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'High-performance Porsche Cayenne Turbo GT Coupe with sports chrono package. Ultimate driving machine.' },
    22	  '6': { power: '434 bhp', torque: '493 Nm', acceleration: '4.2', topSpeed: '145', mpg: 'N/A', co2: '0', taxBand: 'A', length: '4,694 mm', width: '1,850 mm', height: '1,443 mm', bootCapacity: '425 L', gears: '1', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Low mileage Tesla Model 3 Long Range with full self-driving capability. Autopilot and glass roof.' },
    23	  '7': { power: '296 bhp', torque: '650 Nm', acceleration: '6.4', topSpeed: '145', mpg: '36.7', co2: '164', taxBand: 'I', length: '4,737 mm', width: '2,175 mm', height: '1,653 mm', bootCapacity: '508 L', gears: '8', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Elegant Jaguar F-PACE R-Dynamic with HSE specification. Meridian audio and panoramic roof.' },
    24	  '8': { power: '308 bhp', torque: '335 Nm', acceleration: '7.7', topSpeed: '124', mpg: '34.4', co2: '121', taxBand: 'D', length: '4,890 mm', width: '1,895 mm', height: '1,690 mm', bootCapacity: '461 L', gears: 'CVT', drivetrain: 'AWD', ncapRating: '5 Star', condition: 'Excellent', owners: 1, description: 'Luxurious Lexus RX 450h hybrid with Mark Levinson audio. Premium navigation and heads-up display.' },
    25	};
    26	
    27	export default function VehicleDetail() {
    28	  const { id } = useParams<{ id: string }>();
    29	  const { getVehicleById, vehicles: allVehicles, loading: hookLoading } = useSupabaseVehicles();
    30	
    31	  const [vehicle, setVehicle] = useState<any>(null);
    32	  const [loading, setLoading] = useState(true);
    33	  const [activeImage, setActiveImage] = useState(0);
    34	
    35	  // Keyboard navigation for image gallery
    36	  useEffect(() => {
    37	    const handleKeyDown = (e: KeyboardEvent) => {
    38	      if (e.key === 'ArrowLeft') {
    39	        setActiveImage(prev => prev > 0 ? prev - 1 : (vehicle?.images?.length || 1) - 1);
    40	      } else if (e.key === 'ArrowRight') {
    41	        setActiveImage(prev => prev < (vehicle?.images?.length || 1) - 1 ? prev + 1 : 0);
    42	      }
    43	    };
    44	    window.addEventListener('keydown', handleKeyDown);
    45	    return () => window.removeEventListener('keydown', handleKeyDown);
    46	  }, [vehicle?.images?.length]);
    47	  const [isWishlisted, setIsWishlisted] = useState(false);
    48	  const [deposit, setDeposit] = useState(10);
    49	  const [term, setTerm] = useState(48);
    50	  const [enquiryForm, setEnquiryForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    51	  const [testDriveForm, setTestDriveForm] = useState({ date: '', time: '', location: '' });
    52	
    53	  // Fetch vehicle from Supabase
    54	  useEffect(() => {
    55	    let cancelled = false;
    56	    const fetchVehicle = async () => {
    57	      if (!id) return;
    58	      setLoading(true);
    59	      try {
    60	        const data = await getVehicleById(id);
    61	        if (!cancelled) {
    62	          if (data) {
    63	            // Merge with fallback detail data if available
    64	            const extra = fallbackData[id] || {};
    65	            setVehicle({ ...extra, ...data });
    66	          } else {
    67	            setVehicle(null);
    68	          }
    69	          setLoading(false);
    70	        }
    71	      } catch {
    72	        if (!cancelled) {
    73	          setVehicle(null);
    74	          setLoading(false);
    75	        }
    76	      }
    77	    };
    78	    fetchVehicle();
    79	    return () => { cancelled = true; };
    80	  }, [id, getVehicleById]);
    81	
    82	  // Similar vehicles: same make or similar price range
    83	  const similarVehicles = useMemo(() => {
    84	    if (!vehicle) return [];
    85	    return allVehicles
    86	      .filter(v => v.id !== vehicle.id && (v.make === vehicle.make || Math.abs(v.price - vehicle.price) < 15000))
    87	      .slice(0, 3);
    88	  }, [vehicle, allVehicles]);
    89	
    90	  // Finance calculations
    91	  const depositAmount = vehicle ? Math.round(vehicle.price * (deposit / 100)) : 0;
    92	  const amountFinanced = vehicle ? vehicle.price - depositAmount : 0;
    93	  const apr = 9.9;
    94	  const monthlyRate = apr / 100 / 12;
    95	  const monthlyPayment = amountFinanced > 0
    96	    ? Math.round((amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1))
    97	    : 0;
    98	  const totalPayable = monthlyPayment * term + depositAmount;
    99	
   100	  // Loading state
   101	  if (loading || hookLoading) {
   102	    return (
   103	      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
   104	        <div className="text-center">
   105	          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
   106	          <p className="text-chrome">Loading vehicle details...</p>
   107	        </div>
   108	      </div>
   109	    );
   110	  }
   111	
   112	  // Not found state
   113	  if (!vehicle) {
   114	    return (
   115	      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
   116	        <div className="text-center">
   117	          <h1 className="font-display text-3xl font-bold text-pure-white mb-4">Vehicle Not Found</h1>
   118	          <p className="text-chrome mb-6">The vehicle you are looking for does not exist.</p>
   119	          <Link to="/inventory" className="px-8 py-3 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow transition-all">
   120	            Browse All Vehicles
   121	          </Link>
   122	        </div>
   123	      </div>
   124	    );
   125	  }
   126	
   127	  // Field helpers with fallbacks
   128	  const v = {
   129	    make: vehicle.make || '',
   130	    model: vehicle.model || '',
   131	    variant: vehicle.variant || '',
   132	    year: vehicle.year || 0,
   133	    mileage: vehicle.mileage || 0,
   134	    transmission: vehicle.transmission || 'Auto',
   135	    fuel_type: vehicle.fuel_type || '',
   136	    price: vehicle.price || 0,
   137	    monthly_payment: vehicle.monthly_payment || 0,
   138	    description: vehicle.description || 'No description available.',
   139	    features: vehicle.features || [],
   140	    images: vehicle.images || [],
   141	    registration: vehicle.registration || 'N/A',
   142	    engine_size: vehicle.engine_size || vehicle.engineSize || 'N/A',
   143	    power: vehicle.power || 'See description',
   144	    torque: vehicle.torque || 'See description',
   145	    acceleration: vehicle.acceleration || 'N/A',
   146	    topSpeed: vehicle.topSpeed || 'N/A',
   147	    mpg: vehicle.mpg || 'N/A',
   148	    co2: vehicle.co2 || 'N/A',
   149	    taxBand: vehicle.taxBand || 'N/A',
   150	    length: vehicle.length || 'N/A',
   151	    width: vehicle.width || 'N/A',
   152	    height: vehicle.height || 'N/A',
   153	    bootCapacity: vehicle.bootCapacity || 'N/A',
   154	    gears: vehicle.gears || 'Auto',
   155	    drivetrain: vehicle.drivetrain || 'N/A',
   156	    ncapRating: vehicle.ncapRating || '5 Star',
   157	    condition: vehicle.condition || 'Excellent',
   158	    owners: vehicle.owners ?? 1,
   159	  };
   160	
   161	  const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };
   162	  const staggerContainer = { initial: {}, whileInView: { transition: { staggerChildren: 0.06 } } };
   163	  const staggerItem = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };
   164	
   165	  return (
   166	    <div className="min-h-[100dvh] bg-obsidian">
   167	      {/* ============ HERO GALLERY ============ */}
   168	      <section className="relative h-[70vh] min-h-[500px] overflow-hidden group/gallery">
   169	        {/* Background Image with smooth transition */}
   170	        <div className="absolute inset-0">
   171	          <AnimatePresence mode="wait">
   172	            <motion.img
   173	              key={activeImage}
   174	              initial={{ opacity: 0, scale: 1.05 }}
   175	              animate={{ opacity: 1, scale: 1 }}
   176	              exit={{ opacity: 0 }}
   177	              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
   178	              src={v.images[activeImage] || '/vehicle-thumb-01.jpg'}
   179	              alt={`${v.make} ${v.model}`}
   180	              className="w-full h-full object-cover"
   181	            />
   182	          </AnimatePresence>
   183	          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-[rgba(0,8,20,0.3)]" />
   184	        </div>
   185	
   186	        {/* SIDE Navigation Arrows — large, visible on hover */}
   187	        {v.images.length > 1 && (
   188	          <>
   189	            <button
   190	              onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : v.images.length - 1)}
   191	              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-obsidian/60 backdrop-blur-sm border border-slate/30 flex items-center justify-center text-pure-white hover:bg-electric-blue hover:border-electric-blue transition-all duration-300 opacity-0 group-hover/gallery:opacity-100"
   192	              style={{ opacity: undefined }} /* Always show on mobile via below */
   193	            >
   194	              <ChevronLeft size={28} />
   195	            </button>
   196	            <button
   197	              onClick={() => setActiveImage(prev => prev < v.images.length - 1 ? prev + 1 : 0)}
   198	              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-obsidian/60 backdrop-blur-sm border border-slate/30 flex items-center justify-center text-pure-white hover:bg-electric-blue hover:border-electric-blue transition-all duration-300"
   199	            >
   200	              <ChevronRight size={28} />
   201	            </button>
   202	          </>
   203	        )}
   204	
   205	        {/* Image Counter — top right */}
   206	        {v.images.length > 1 && (
   207	          <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full bg-obsidian/70 backdrop-blur-sm border border-slate/30">
   208	            <span className="font-mono text-sm text-frost">{activeImage + 1} / {v.images.length}</span>
   209	          </div>
   210	        )}
   211	
   212	        {/* Thumbnail Strip — bottom center */}
   213	        {v.images.length > 1 && (
   214	          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 max-w-[80%] overflow-x-auto pb-2 px-2">
   215	            {v.images.map((img, i) => (
   216	              <button
   217	                key={i}
   218	                onClick={() => setActiveImage(i)}
   219	                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${i === activeImage ? 'border-electric-blue opacity-100 ring-2 ring-electric-blue/30' : 'border-transparent opacity-50 hover:opacity-80'}`}
   220	              >
   221	                <img src={img} alt="" className="w-full h-full object-cover" />
   222	              </button>
   223	            ))}
   224	          </div>
   225	        )}
   226	
   227	        {/* Content Overlay */}
   228	        <div className="absolute bottom-24 left-0 right-0 z-10 px-[clamp(1.5rem,5vw,4rem)]">
   229	          <div className="max-w-[1400px] mx-auto">
   230	            {/* Breadcrumb */}
   231	            <motion.div
   232	              initial={{ opacity: 0 }}
   233	              animate={{ opacity: 1 }}
   234	              transition={{ delay: 0.3 }}
   235	              className="text-sm text-chrome mb-4"
   236	            >
   237	              <Link to="/" className="text-frost hover:text-pure-white transition-colors">Home</Link>
   238	              <span className="mx-2 text-slate">/</span>
   239	              <Link to="/inventory" className="text-frost hover:text-pure-white transition-colors">Inventory</Link>
   240	              <span className="mx-2 text-slate">/</span>
   241	              <span>{v.make}</span>
   242	              <span className="mx-2 text-slate">/</span>
   243	              <span>{v.model}</span>
   244	            </motion.div>
   245	
   246	            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
   247	              <div>
   248	                <motion.h1
   249	                  initial={{ opacity: 0, y: 30 }}
   250	                  animate={{ opacity: 1, y: 0 }}
   251	                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
   252	                  className="font-display font-bold text-pure-white"
   253	                  style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
   254	                >
   255	                  {v.make} {v.model} {v.variant}
   256	                </motion.h1>
   257	                <motion.p
   258	                  initial={{ opacity: 0, y: 20 }}
   259	                  animate={{ opacity: 1, y: 0 }}
   260	                  transition={{ duration: 0.7, delay: 0.3 }}
   261	                  className="mt-2 font-mono text-sm text-chrome"
   262	                >
   263	                  {v.year} &middot; {v.mileage.toLocaleString()} miles &middot; {v.transmission} &middot; {v.fuel_type}
   264	                </motion.p>
   265	                <motion.div
   266	                  initial={{ opacity: 0, y: 20 }}
   267	                  animate={{ opacity: 1, y: 0 }}
   268	                  transition={{ duration: 0.7, delay: 0.4 }}
   269	                  className="flex items-baseline gap-4 mt-4"
   270	                >
   271	                  <span className="font-display font-bold text-3xl text-pure-white">&pound;{v.price.toLocaleString()}</span>
   272	                  <span className="text-base text-electric-blue">or &pound;{v.monthly_payment}/month</span>
   273	                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">PCP</span>
   274	                </motion.div>
   275	                <motion.div
   276	                  initial={{ opacity: 0, y: 20 }}
   277	                  animate={{ opacity: 1, y: 0 }}
   278	                  transition={{ duration: 0.7, delay: 0.5 }}
   279	                  className="flex flex-wrap gap-2 mt-3"
   280	                >
   281	                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">RAC Approved</span>
   282	                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">200-Point Inspected</span>
   283	                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-electric-blue/15 text-electric-blue">3-Month Warranty</span>
   284	                </motion.div>
   285	              </div>
   286	
   287	              {/* CTAs */}
   288	              <motion.div
   289	                initial={{ opacity: 0, y: 20 }}
   290	                animate={{ opacity: 1, y: 0 }}
   291	                transition={{ duration: 0.7, delay: 0.5 }}
   292	                className="flex flex-col items-start lg:items-end gap-3"
   293	              >
   294	                <button className="px-8 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all duration-300 text-center">
   295	                  Reserve This Car — &pound;99
   296	                </button>
   297	                <Link
   298	                  to="/contact"
   299	                  className="px-8 py-3 border-2 border-pure-white/30 text-pure-white font-semibold rounded-full hover:bg-pure-white/10 hover:border-electric-blue transition-all duration-300 text-center"
   300	                >
   301	                  Book Test Drive
   302	                </Link>
   303	                <div className="flex items-center gap-2">
   304	                  <button
   305	                    onClick={() => setIsWishlisted(!isWishlisted)}
   306	                    className="flex items-center gap-2 px-4 py-2 text-sm text-frost hover:text-pure-white transition-colors"
   307	                  >
   308	                    <Heart size={16} className={isWishlisted ? 'fill-error text-error' : ''} />
   309	                    {isWishlisted ? 'Saved' : 'Save'}
   310	                  </button>
   311	                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-frost hover:text-pure-white transition-colors">
   312	                    <Share2 size={16} /> Share
   313	                  </button>
   314	                </div>
   315	              </motion.div>
   316	            </div>
   317	          </div>
   318	        </div>
   319	      </section>
   320	
   321	      {/* ============ KEY HIGHLIGHTS ============ */}
   322	      <section className="bg-midnight py-12">
   323	        <div className="container-apex">
   324	          <motion.div
   325	            variants={staggerContainer}
   326	            initial="initial"
   327	            whileInView="whileInView"
   328	            viewport={{ once: true }}
   329	            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
   330	          >
   331	            {[
   332	              { icon: <Calendar size={28} />, label: 'Year', value: String(v.year) },
   333	              { icon: <Gauge size={28} />, label: 'Mileage', value: `${v.mileage.toLocaleString()} miles` },
   334	              { icon: <Fuel size={28} />, label: 'Fuel Type', value: v.fuel_type },
   335	              { icon: <Settings size={28} />, label: 'Transmission', value: v.transmission },
   336	              { icon: <Cog size={28} />, label: 'Engine Size', value: v.engine_size },
   337	              { icon: <Zap size={28} />, label: 'Power', value: v.power },
   338	            ].map((item, i) => (
   339	              <motion.div
   340	                key={i}
   341	                variants={staggerItem}
   342	                className="flex flex-col items-center text-center py-6 px-4 border-r border-slate/20 last:border-r-0"
   343	              >
   344	                <span className="text-electric-blue mb-2">{item.icon}</span>
   345	                <span className="text-[0.75rem] font-medium text-chrome uppercase tracking-[0.06em]">{item.label}</span>
   346	                <span className="font-display font-semibold text-base text-pure-white mt-1">{item.value}</span>
   347	              </motion.div>
   348	            ))}
   349	          </motion.div>
   350	        </div>
   351	      </section>
   352	
   353	      {/* ============ DESCRIPTION & FEATURES ============ */}
   354	      <section className="py-24 bg-obsidian">
   355	        <div className="container-apex">
   356	          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
   357	            {/* Left - Description */}
   358	            <motion.div
   359	              initial={{ opacity: 0, x: -30 }}
   360	              whileInView={{ opacity: 1, x: 0 }}
   361	              viewport={{ once: true }}
   362	              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
   363	              className="lg:col-span-3"
   364	            >
   365	              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">About This Vehicle</h2>
   366	              <p className="text-frost leading-relaxed mb-4">{v.description}</p>
   367	              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
   368	                <CheckCircle size={16} className="text-success" />
   369	                <span className="text-sm text-success font-medium">Condition: {v.condition}</span>
   370	              </div>
   371	              <p className="mt-3 text-sm text-chrome">{v.owners} previous owner{v.owners !== 1 ? 's' : ''} &middot; Registration: {v.registration}</p>
   372	            </motion.div>
   373	
   374	            {/* Right - Features */}
   375	            <motion.div
   376	              initial={{ opacity: 0, x: 30 }}
   377	              whileInView={{ opacity: 1, x: 0 }}
   378	              viewport={{ once: true }}
   379	              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
   380	              className="lg:col-span-2"
   381	            >
   382	              <h2 className="font-display font-semibold text-lg text-pure-white mb-4">Key Features</h2>
   383	              <motion.div
   384	                variants={staggerContainer}
   385	                initial="initial"
   386	                whileInView="whileInView"
   387	                viewport={{ once: true }}
   388	                className="grid grid-cols-2 gap-2.5"
   389	              >
   390	                {v.features.map((feature, i) => (
   391	                  <motion.div
   392	                    key={i}
   393	                    variants={staggerItem}
   394	                    className="flex items-center gap-2"
   395	                  >
   396	                    <Check size={16} className="text-success shrink-0" />
   397	                    <span className="text-sm text-frost">{feature}</span>
   398	                  </motion.div>
   399	                ))}
   400	              </motion.div>
   401	            </motion.div>
   402	          </div>
   403	        </div>
   404	      </section>
   405	
   406	      {/* ============ FULL SPECIFICATIONS ============ */}
   407	      <section className="py-24 bg-midnight">
   408	        <div className="container-apex">
   409	          <motion.div
   410	            {...fadeUp}
   411	            className="max-w-[1000px] mx-auto"
   412	          >
   413	            <h2 className="font-display font-semibold text-2xl text-pure-white mb-8">Full Specifications</h2>
   414	            <motion.div
   415	              variants={staggerContainer}
   416	              initial="initial"
   417	              whileInView="whileInView"
   418	              viewport={{ once: true }}
   419	              className="space-y-0"
   420	            >
   421	              {[
   422	                { label: 'Make', value: v.make },
   423	                { label: 'Model', value: `${v.model} ${v.variant}` },
   424	                { label: 'Year', value: String(v.year) },
   425	                { label: 'Mileage', value: `${v.mileage.toLocaleString()} miles` },
   426	                { label: 'Registration', value: v.registration },
   427	                { label: 'Previous Owners', value: String(v.owners) },
   428	                { label: 'Engine Size', value: v.engine_size },
   429	                { label: 'Power', value: v.power },
   430	                { label: 'Torque', value: v.torque },
   431	                { label: 'Acceleration (0-60)', value: `${v.acceleration}s` },
   432	                { label: 'Top Speed', value: `${v.topSpeed} mph` },
   433	                { label: 'Fuel Type', value: v.fuel_type },
   434	                { label: 'MPG (Combined)', value: v.mpg === 'N/A' ? 'N/A' : `${v.mpg} mpg` },
   435	                { label: 'CO2 Emissions', value: `${v.co2} g/km` },
   436	                { label: 'Tax Band', value: v.taxBand },
   437	                { label: 'Length', value: v.length },
   438	                { label: 'Width', value: v.width },
   439	                { label: 'Height', value: v.height },
   440	                { label: 'Boot Capacity', value: v.bootCapacity },
   441	                { label: 'Transmission', value: v.transmission },
   442	                { label: 'Gears', value: v.gears },
   443	                { label: 'Drivetrain', value: v.drivetrain },
   444	                { label: 'NCAP Rating', value: v.ncapRating },
   445	              ].map((spec, i) => (
   446	                <motion.div
   447	                  key={i}
   448	                  variants={staggerItem}
   449	                  className={`flex items-center justify-between py-3.5 border-b border-slate/20 ${i % 2 === 0 ? 'bg-[rgba(0,8,20,0.3)]' : ''} px-4 -mx-4`}
   450	                >
   451	                  <span className="text-sm font-medium text-chrome">{spec.label}</span>
   452	                  <span className="text-sm text-pure-white">{spec.value}</span>
   453	                </motion.div>
   454	              ))}
   455	            </motion.div>
   456	          </motion.div>
   457	        </div>
   458	      </section>
   459	
   460	      {/* ============ FINANCE CALCULATOR ============ */}
   461	      <section className="py-24 bg-obsidian">
   462	        <div className="container-apex">
   463	          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
   464	            {/* Left - Calculator */}
   465	            <motion.div
   466	              initial={{ opacity: 0, x: -30 }}
   467	              whileInView={{ opacity: 1, x: 0 }}
   468	              viewport={{ once: true }}
   469	              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
   470	            >
   471	              <h2 className="font-display font-semibold text-2xl text-pure-white mb-6">Finance Calculator</h2>
   472	
   473	              {/* Tabs */}
   474	              <div className="flex gap-2 mb-6">
   475	                {['PCP', 'HP', 'Cash'].map((tab) => (
   476	                  <button
   477	                    key={tab}
   478	                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === 'PCP' ? 'bg-electric-blue text-pure-white' : 'bg-slate/20 text-chrome hover:text-frost'}`}
   479	                  >
   480	                    {tab}
   481	                  </button>
   482	                ))}
   483	              </div>
   484	
   485	              <div className="space-y-5">
   486	                {/* Vehicle Price */}
   487	                <div>
   488	                  <label className="block text-sm text-chrome mb-2">Vehicle Price</label>
   489	                  <div className="px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-pure-white font-mono">
   490	                    &pound;{v.price.toLocaleString()}
   491	                  </div>
   492	                </div>
   493	
   494	                {/* Deposit Slider */}
   495	                <div>
   496	                  <label className="flex justify-between text-sm text-chrome mb-2">
   497	                    <span>Deposit ({deposit}%)</span>
   498	                    <span className="text-pure-white font-mono">&pound;{depositAmount.toLocaleString()}</span>
   499	                  </label>
   500	                  <input
   501	                    type="range"
   502	                    min="0"
   503	                    max="50"
   504	                    value={deposit}
   505	                    onChange={e => setDeposit(Number(e.target.value))}
   506	                    className="w-full h-2 bg-slate/30 rounded-full appearance-none cursor-pointer accent-electric-blue"
   507	                  />
   508	                  <div className="flex justify-between text-xs text-slate mt-1">
   509	                    <span>0%</span>
   510	                    <span>25%</span>
   511	                    <span>50%</span>
   512	                  </div>
   513	                </div>
   514	
   515	                {/* Term */}
   516	                <div>
   517	                  <label className="block text-sm text-chrome mb-2">Term</label>
   518	                  <div className="flex gap-2">
   519	                    {[24, 36, 48, 60].map((t) => (
   520	                      <button
   521	                        key={t}
   522	                        onClick={() => setTerm(t)}
   523	                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${term === t ? 'bg-electric-blue text-pure-white' : 'bg-[rgba(0,8,20,0.6)] border border-slate/30 text-frost hover:border-electric-blue'}`}
   524	                      >
   525	                        {t} mo
   526	                      </button>
   527	                    ))}
   528	                  </div>
   529	                </div>
   530	
   531	                {/* Credit Rating */}
   532	                <div>
   533	                  <label className="block text-sm text-chrome mb-2">Credit Rating</label>
   534	                  <select className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue">
   535	                    <option>Excellent</option>
   536	                    <option>Good</option>
   537	                    <option>Fair</option>
   538	                  </select>
   539	                </div>
   540	              </div>
   541	            </motion.div>
   542	
   543	            {/* Right - Results */}
   544	            <motion.div
   545	              initial={{ opacity: 0, x: 30 }}
   546	              whileInView={{ opacity: 1, x: 0 }}
   547	              viewport={{ once: true }}
   548	              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
   549	              className="flex items-center"
   550	            >
   551	              <div className="w-full glass rounded-2xl p-8">
   552	                <p className="font-mono text-sm text-chrome mb-1">Monthly Payment</p>
   553	                <p className="font-display font-bold text-electric-blue" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
   554	                  &pound;{monthlyPayment.toLocaleString()}
   555	                </p>
   556	                <p className="text-sm text-chrome mb-6">per month</p>
   557	
   558	                <div className="border-t border-slate/30 my-5" />
   559	
   560	                <div className="space-y-3">
   561	                  {[
   562	                    { label: 'Vehicle Price', value: `&pound;${v.price.toLocaleString()}` },
   563	                    { label: 'Deposit', value: `-&pound;${depositAmount.toLocaleString()}` },
   564	                    { label: 'Term', value: `${term} months` },
   565	                    { label: 'Total Payable', value: `&pound;${totalPayable.toLocaleString()}` },
   566	                    { label: 'Representative APR', value: `${apr}%` },
   567	                  ].map((row, i) => (
   568	                    <div key={i} className="flex justify-between">
   569	                      <span className="text-sm text-chrome">{row.label}</span>
   570	                      <span className="text-sm font-mono text-pure-white">{row.value}</span>
   571	                    </div>
   572	                  ))}
   573	                </div>
   574	
   575	                <button className="w-full mt-6 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">
   576	                  Apply for Finance
   577	                </button>
   578	                <p className="text-xs text-slate text-center mt-3">
   579	                  Representative example. Subject to status and affordability checks.
   580	                </p>
   581	              </div>
   582	            </motion.div>
   583	          </div>
   584	        </div>
   585	      </section>
   586	
   587	      {/* ============ ENQUIRY FORM ============ */}
   588	      <section className="py-24 bg-midnight">
   589	        <div className="container-apex">
   590	          <motion.div
   591	            initial={{ opacity: 0, y: 30 }}
   592	            whileInView={{ opacity: 1, y: 0 }}
   593	            viewport={{ once: true }}
   594	            className="max-w-[800px] mx-auto text-center"
   595	          >
   596	            <h2 className="font-display font-semibold text-2xl text-pure-white mb-3">Interested in This Car?</h2>
   597	            <p className="text-frost mb-8">Send us an enquiry and our team will get back to you within 30 minutes during opening hours.</p>
   598	
   599	            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
   600	              <div className="text-left">
   601	                <label className="block text-sm text-chrome mb-2">First Name</label>
   602	                <input
   603	                  type="text"
   604	                  value={enquiryForm.firstName}
   605	                  onChange={e => setEnquiryForm(prev => ({ ...prev, firstName: e.target.value }))}
   606	                  placeholder="John"
   607	                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all"
   608	                />
   609	              </div>
   610	              <div className="text-left">
   611	                <label className="block text-sm text-chrome mb-2">Last Name</label>
   612	                <input
   613	                  type="text"
   614	                  value={enquiryForm.lastName}
   615	                  onChange={e => setEnquiryForm(prev => ({ ...prev, lastName: e.target.value }))}
   616	                  placeholder="Smith"
   617	                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all"
   618	                />
   619	              </div>
   620	              <div className="text-left sm:col-span-2">
   621	                <label className="block text-sm text-chrome mb-2">Email Address</label>
   622	                <input
   623	                  type="email"
   624	                  value={enquiryForm.email}
   625	                  onChange={e => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
   626	                  placeholder="john@example.com"
   627	                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all"
   628	                />
   629	              </div>
   630	              <div className="text-left sm:col-span-2">
   631	                <label className="block text-sm text-chrome mb-2">Phone Number</label>
   632	                <input
   633	                  type="tel"
   634	                  value={enquiryForm.phone}
   635	                  onChange={e => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))}
   636	                  placeholder="07XXX XXXXXX"
   637	                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all"
   638	                />
   639	              </div>
   640	              <div className="text-left sm:col-span-2">
   641	                <label className="block text-sm text-chrome mb-2">Your Message</label>
   642	                <textarea
   643	                  value={enquiryForm.message}
   644	                  onChange={e => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
   645	                  placeholder="I'd like to know more about this vehicle..."
   646	                  rows={4}
   647	                  className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white placeholder-slate outline-none focus:border-electric-blue focus:shadow-[0_0_0_3px_rgba(0,119,182,0.2)] transition-all resize-none"
   648	                />
   649	              </div>
   650	            </div>
   651	
   652	            <button className="mt-6 w-full sm:w-auto px-10 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all flex items-center justify-center gap-2 mx-auto">
   653	              <Send size={16} /> Send Enquiry
   654	            </button>
   655	          </motion.div>
   656	        </div>
   657	      </section>
   658	
   659	      {/* ============ TEST DRIVE ============ */}
   660	      <section className="py-24 bg-obsidian">
   661	        <div className="container-apex">
   662	          <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
   663	            <motion.div
   664	              initial={{ opacity: 0, x: -30 }}
   665	              whileInView={{ opacity: 1, x: 0 }}
   666	              viewport={{ once: true }}
   667	              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
   668	            >
   669	              <h2 className="font-display font-semibold text-2xl text-pure-white mb-4">Book a Test Drive</h2>
   670	              <p className="text-frost leading-relaxed mb-6">
   671	                Nothing compares to getting behind the wheel. Book a test drive at your nearest showroom and experience this vehicle firsthand.
   672	              </p>
   673	              <ul className="space-y-3">
   674	                {[
   675	                  'No obligation or pressure',
   676	                  'Available 7 days a week',
   677	                  'Bring your part exchange for valuation',
   678	                  'Finance pre-approval available',
   679	                ].map((item, i) => (
   680	                  <li key={i} className="flex items-center gap-3">
   681	                    <CheckCircle size={18} className="text-success shrink-0" />
   682	                    <span className="text-sm text-frost">{item}</span>
   683	                  </li>
   684	                ))}
   685	              </ul>
   686	            </motion.div>
   687	
   688	            <motion.div
   689	              initial={{ opacity: 0, x: 30 }}
   690	              whileInView={{ opacity: 1, x: 0 }}
   691	              viewport={{ once: true }}
   692	              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
   693	              className="glass rounded-2xl p-8"
   694	            >
   695	              <div className="space-y-4">
   696	                <div>
   697	                  <label className="block text-sm text-chrome mb-2">Preferred Date</label>
   698	                  <input
   699	                    type="date"
   700	                    value={testDriveForm.date}
   701	                    onChange={e => setTestDriveForm(prev => ({ ...prev, date: e.target.value }))}
   702	                    className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-pure-white outline-none focus:border-electric-blue"
   703	                  />
   704	                </div>
   705	                <div>
   706	                  <label className="block text-sm text-chrome mb-2">Preferred Time</label>
   707	                  <select
   708	                    value={testDriveForm.time}
   709	                    onChange={e => setTestDriveForm(prev => ({ ...prev, time: e.target.value }))}
   710	                    className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue"
   711	                  >
   712	                    <option value="">Select time</option>
   713	                    <option>Morning (9am - 12pm)</option>
   714	                    <option>Afternoon (12pm - 5pm)</option>
   715	                    <option>Evening (5pm - 7pm)</option>
   716	                  </select>
   717	                </div>
   718	                <div>
   719	                  <label className="block text-sm text-chrome mb-2">Showroom Location</label>
   720	                  <select
   721	                    value={testDriveForm.location}
   722	                    onChange={e => setTestDriveForm(prev => ({ ...prev, location: e.target.value }))}
   723	                    className="w-full px-4 py-3.5 bg-[rgba(0,8,20,0.6)] border border-slate/30 rounded-xl text-sm text-frost outline-none focus:border-electric-blue"
   724	                  >
   725	                    <option value="">Select location</option>
   726	                    <option>London</option>
   727	                    <option>Manchester</option>
   728	                    <option>Birmingham</option>
   729	                    <option>Edinburgh</option>
   730	                  </select>
   731	                </div>
   732	                <button className="w-full mt-4 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">
   733	                  Book Test Drive
   734	                </button>
   735	              </div>
   736	            </motion.div>
   737	          </div>
   738	        </div>
   739	      </section>
   740	
   741	      {/* ============ SIMILAR VEHICLES ============ */}
   742	      <section className="py-24 bg-midnight">
   743	        <div className="container-apex">
   744	          <motion.div
   745	            initial={{ opacity: 0, y: 30 }}
   746	            whileInView={{ opacity: 1, y: 0 }}
   747	            viewport={{ once: true }}
   748	          >
   749	            <h2 className="font-display font-semibold text-2xl text-pure-white mb-2">Similar Vehicles</h2>
   750	            <p className="text-chrome mb-8">More cars you might love</p>
   751	          </motion.div>
   752	
   753	          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
   754	            {similarVehicles.map((sv, i) => (
   755	              <motion.div
   756	                key={sv.id}
   757	                initial={{ opacity: 0, y: 40 }}
   758	                whileInView={{ opacity: 1, y: 0 }}
   759	                viewport={{ once: true }}
   760	                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.1 }}
   761	              >
   762	                <Link to={`/vehicle/${sv.id}`} className="block group">
   763	                  <div className="rounded-2xl overflow-hidden bg-[rgba(0,18,51,0.5)] backdrop-blur-16 border border-slate/25 shadow-card transition-all duration-400 group-hover:shadow-card-hover group-hover:-translate-y-2">
   764	                    <div className="relative aspect-[4/3] overflow-hidden">
   765	                      <img src={sv.images?.[0] || '/vehicle-thumb-01.jpg'} alt={`${sv.make} ${sv.model}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
   766	                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
   767	                    </div>
   768	                    <div className="p-5">
   769	                      <h3 className="font-display font-semibold text-base text-pure-white">{sv.make} {sv.model}</h3>
   770	                      <p className="text-xs text-chrome mt-1">{sv.variant}</p>
   771	                      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-chrome">
   772	                        <span>{sv.year}</span><span>|</span><span>{sv.mileage.toLocaleString()} mi</span><span>|</span><span>{sv.fuel_type}</span>
   773	                      </div>
   774	                      <div className="mt-3 pt-3 border-t border-slate/20">
   775	                        <p className="font-mono text-lg text-pure-white">&pound;{sv.price.toLocaleString()}</p>
   776	                        <p className="font-mono text-xs text-electric-blue">&pound;{sv.monthly_payment}/mo</p>
   777	                      </div>
   778	                    </div>
   779	                  </div>
   780	                </Link>
   781	              </motion.div>
   782	            ))}
   783	          </div>
   784	        </div>
   785	      </section>
   786	
   787	      {/* ============ CTA BANNER ============ */}
   788	      <section className="py-16 bg-gradient-to-r from-obsidian to-midnight">
   789	        <div className="container-apex">
   790	          <motion.div
   791	            initial={{ opacity: 0, y: 30 }}
   792	            whileInView={{ opacity: 1, y: 0 }}
   793	            viewport={{ once: true }}
   794	            className="max-w-[800px] mx-auto text-center"
   795	          >
   796	            <h2 className="font-display font-bold text-pure-white mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
   797	              Love This Car?
   798	            </h2>
   799	            <p className="text-frost mb-6">
   800	              Reserve it now with a fully refundable &pound;99 deposit. Do not miss out — popular cars go fast.
   801	            </p>
   802	            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
   803	              <button className="px-10 py-3.5 bg-electric-blue text-pure-white font-semibold rounded-full hover:bg-blue-glow hover:shadow-glow transition-all">
   804	                Reserve Now — &pound;99
   805	              </button>
   806	              <a
   807	                href="tel:08001234567"
   808	                className="flex items-center gap-2 px-8 py-3.5 border-2 border-pure-white/30 text-pure-white font-semibold rounded-full hover:bg-pure-white/10 hover:border-electric-blue transition-all"
   809	              >
   810	                <Phone size={16} /> Call Us
   811	              </a>
   812	            </div>
   813	          </motion.div>
   814	        </div>
   815	      </section>
   816	    </div>
   817	  );
   818	}
   819	
