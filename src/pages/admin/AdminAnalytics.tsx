// @ts-nocheck
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { allLeads, contactEnquiries } from '../../data/leadsData';
import type { Lead } from '../../data/leadsData';

function gf(lead: Lead, field: string): unknown {
  return (lead as unknown as Record<string, unknown>)[field];
}

function getStatus(lead: Lead): string {
  return String(gf(lead, 'status') || '');
}

const COLORS = ['#0077B6', '#00B4D8', '#00C896', '#FFB703', '#FF4D6D', '#A855F7'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-sm"
        style={{
          background: 'rgba(0, 8, 20, 0.95)',
          border: '1px solid rgba(92, 103, 125, 0.3)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-[#C8D3D9] text-xs">
            {p.name}: <span className="text-white font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  // Lead Funnel Data
  const funnelData = useMemo(() => {
    const newLeads = allLeads.filter((l) => {
      const s = getStatus(l);
      return s === 'new' || s === 'pending';
    }).length;
    const contacted = allLeads.filter((l) => {
      const s = getStatus(l);
      return s === 'contacted' || s === 'confirmed' || s === 'valued' || s === 'referred';
    }).length;
    const qualified = allLeads.filter((l) => {
      const s = getStatus(l);
      return s === 'qualified' || s === 'appointment';
    }).length;
    const converted = allLeads.filter((l) => {
      const s = getStatus(l);
      return s === 'closed' || s === 'completed' || s === 'approved' || s === 'sold';
    }).length;

    return [
      { name: 'New', value: newLeads, fill: '#0077B6' },
      { name: 'Contacted', value: contacted, fill: '#00B4D8' },
      { name: 'Qualified', value: qualified, fill: '#A855F7' },
      { name: 'Converted', value: converted, fill: '#00C896' },
    ];
  }, []);

  // Source Breakdown
  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    allLeads.forEach((l) => {
      sources[l.source] = (sources[l.source] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, []);

  // Monthly Lead Volume
  const monthlyData = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month) => ({
      name: month,
      enquiries: Math.floor(Math.random() * 20) + 10,
      'sell-my-car': Math.floor(Math.random() * 12) + 5,
      'test-drives': Math.floor(Math.random() * 15) + 8,
      finance: Math.floor(Math.random() * 10) + 3,
    }));
  }, []);

  // Conversion by Type
  const conversionByType = useMemo(() => {
    const types = [
      { name: 'Contact Forms', total: contactEnquiries.length, converted: contactEnquiries.filter((l) => l.status === 'closed').length },
      { name: 'Sell My Car', total: allLeads.filter((l) => l.type === 'sell-my-car').length, converted: allLeads.filter((l) => l.type === 'sell-my-car' && getStatus(l) === 'sold').length },
      { name: 'Test Drives', total: allLeads.filter((l) => l.type === 'test-drive').length, converted: allLeads.filter((l) => l.type === 'test-drive' && getStatus(l) === 'completed').length },
      { name: 'Finance', total: allLeads.filter((l) => l.type === 'finance').length, converted: allLeads.filter((l) => l.type === 'finance' && getStatus(l) === 'approved').length },
    ];
    return types.map((t) => ({
      ...t,
      rate: t.total > 0 ? ((t.converted / t.total) * 100).toFixed(1) : '0',
    }));
  }, []);

  // Top Vehicles
  const topVehicles = useMemo(() => {
    const vehicles: Record<string, number> = {};
    allLeads.forEach((l) => {
      let vehicle = '';
      if (l.type === 'contact') {
        vehicle = String(gf(l, 'vehicleInterested') || '');
      } else if (l.type === 'test-drive') {
        vehicle = String(gf(l, 'vehicle') || '');
      } else if (l.type === 'finance') {
        vehicle = String(gf(l, 'vehicle') || '');
      }
      if (vehicle && vehicle !== 'N/A') {
        vehicles[vehicle] = (vehicles[vehicle] || 0) + 1;
      }
    });
    return Object.entries(vehicles)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, []);

  // Staff Performance
  const staffPerformance = useMemo(() => {
    const staff = ['Tom Bradley', 'Emma Watson', 'Sarah Jenkins', 'James Cooper'];
    return staff.map((name) => ({
      name,
      leads: Math.floor(Math.random() * 20) + 15,
      converted: Math.floor(Math.random() * 12) + 5,
      response: (Math.random() * 4 + 0.5).toFixed(1),
    }));
  }, []);

  const stats = [
    {
      label: 'Total Leads',
      value: allLeads.length,
      change: '+12.5%',
      up: true,
      icon: Users,
      color: '#0077B6',
    },
    {
      label: 'Avg Conversion',
      value: '34.2%',
      change: '+5.1%',
      up: true,
      icon: Target,
      color: '#00C896',
    },
    {
      label: 'Avg Response',
      value: '2.4h',
      change: '-0.8h',
      up: true,
      icon: Clock,
      color: '#FFB703',
    },
    {
      label: 'This Month',
      value: '47',
      change: '+8.2%',
      up: true,
      icon: TrendingUp,
      color: '#A855F7',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-[Space_Grotesk]">Analytics Dashboard</h1>
        <p className="text-sm text-[#5C677D] mt-1">Lead performance metrics and insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 hover:border-[#0077B6]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="flex items-center gap-1 text-xs">
                {stat.up ? (
                  <ArrowUpRight className="w-3 h-3 text-[#00C896]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-[#FF4D6D]" />
                )}
                <span className={stat.up ? 'text-[#00C896]' : 'text-[#FF4D6D]'}>{stat.change}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-[Space_Grotesk]">{stat.value}</p>
            <p className="text-xs text-[#5C677D] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Funnel */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 font-[Space_Grotesk]">Lead Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415C30" horizontal={false} />
              <XAxis type="number" stroke="#5C677D" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#C8D3D9" fontSize={12} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 font-[Space_Grotesk]">Lead Source Breakdown</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="60%" height={280}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sourceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {sourceData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-[#C8D3D9]">{s.name}</span>
                  <span className="text-xs text-white font-medium ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Volume */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 font-[Space_Grotesk]">Monthly Lead Volume</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0077B6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0077B6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB703" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFB703" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415C30" />
              <XAxis dataKey="name" stroke="#5C677D" fontSize={12} />
              <YAxis stroke="#5C677D" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#C8D3D9' }}
                formatter={(value: string) => <span style={{ color: '#C8D3D9' }}>{value}</span>}
              />
              <Area type="monotone" dataKey="enquiries" stroke="#0077B6" fillOpacity={1} fill="url(#colorEnq)" strokeWidth={2} />
              <Area type="monotone" dataKey="sell-my-car" stroke="#FFB703" fillOpacity={1} fill="url(#colorSell)" strokeWidth={2} />
              <Area type="monotone" dataKey="test-drives" stroke="#A855F7" fillOpacity={0} fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="finance" stroke="#00C896" fillOpacity={0} fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion by Type */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 font-[Space_Grotesk]">Conversion Rate by Lead Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={conversionByType} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415C30" />
              <XAxis dataKey="name" stroke="#5C677D" fontSize={11} />
              <YAxis stroke="#5C677D" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
                formatter={(value: string) => <span style={{ color: '#C8D3D9' }}>{value}</span>}
              />
              <Bar dataKey="total" fill="#33415C" radius={[6, 6, 0, 0]} name="Total" />
              <Bar dataKey="converted" fill="#00C896" radius={[6, 6, 0, 0]} name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vehicles */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 font-[Space_Grotesk]">Most Enquired Vehicles</h3>
          <div className="space-y-3">
            {topVehicles.map((v, i) => (
              <div key={v.name} className="flex items-center gap-3">
                <span className="text-xs text-[#5C677D] w-4 text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#C8D3D9]">{v.name}</span>
                    <span className="text-xs text-white font-medium">{v.count} enquiries</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#33415C]/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0077B6] transition-all"
                      style={{ width: `${(v.count / topVehicles[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 font-[Space_Grotesk]">Sales Staff Performance</h3>
          <div className="space-y-4">
            {staffPerformance.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0077B6]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#00B4D8]">
                    {s.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white truncate">{s.name}</span>
                    <span className="text-xs text-[#00C896] font-medium">
                      {((s.converted / s.leads) * 100).toFixed(0)}% conv.
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-[#33415C]/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0077B6]"
                        style={{ width: `${(s.leads / 35) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#5C677D] whitespace-nowrap">{s.leads} leads</span>
                    <span className="text-[10px] text-[#5C677D] whitespace-nowrap">{s.response}h resp</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
