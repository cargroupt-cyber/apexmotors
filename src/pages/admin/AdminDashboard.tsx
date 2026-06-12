// @ts-nocheck
import { useMemo } from 'react';
import {
  Users,
  MessageSquare,
  Car,
  CalendarDays,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import { useLeads } from '@/hooks/useLeads';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import type { Lead } from '@/lib/store';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New': 'bg-[#0077B6]/10 text-[#00B4D8] border-[#0077B6]/25',
    'Contacted': 'bg-[#FFB703]/10 text-[#FFB703] border-[#FFB703]/25',
    'Qualified': 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/25',
    'Test Drive': 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    'Closed': 'bg-[#FF4D6D]/10 text-[#FF4D6D] border-[#FF4D6D]/25',
  };
  return colors[status] || 'bg-[#33415C]/10 text-[#5C677D] border-[#33415C]/25';
}

function getStatusLabel(status: string): string {
  return status;
}

function getLeadIcon(type: string) {
  switch (type) {
    case 'contact':
      return <MessageSquare className="w-4 h-4 text-[#00B4D8]" />;
    case 'sell-my-car':
      return <Car className="w-4 h-4 text-[#FFB703]" />;
    case 'test-drive':
      return <CalendarDays className="w-4 h-4 text-purple-400" />;
    case 'finance':
      return <Wallet className="w-4 h-4 text-[#00C896]" />;
    default:
      return <MessageSquare className="w-4 h-4 text-[#00B4D8]" />;
  }
}

function getLeadSubject(lead: Lead): string {
  const l = lead as unknown as Record<string, unknown>;
  switch (lead.type) {
    case 'contact':
      return lead.vehicleInterest || '';
    case 'sell-my-car':
      return `Reg: ${l.registration || ''}`;
    case 'test-drive':
      return lead.vehicleInterest || '';
    case 'finance':
      return `${lead.vehicleInterest || ''} - £${l.amount || ''}`;
    default:
      return lead.vehicleInterest || '';
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { vehicles } = useVehicles();
  const { leads } = useLeads();
  const { vehicleCounts, leadCounts } = useAnalytics();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLeads = leads.filter((l) => {
      const d = new Date(l.date);
      return d.toDateString() === today.toDateString();
    });

    const activeStatuses = ['New', 'Contacted', 'Qualified', 'Test Drive'];
    const activeLeads = leads.filter((l) => activeStatuses.includes(l.status));

    const newLeads = leads.filter((l) => l.status === 'New');

    const byType = (type: string) => leads.filter((l) => l.type === type).length;

    return {
      newLeadsToday: todayLeads.length,
      totalActive: activeLeads.length,
      requiresAttention: newLeads.length,
      contactForms: byType('contact'),
      sellMyCar: byType('sell-my-car'),
      testDrives: byType('test-drive'),
      financeApps: byType('finance'),
    };
  }, [leads]);

  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [leads]);

  // Recent vehicles added
  const recentVehicles = useMemo(() => {
    return [...vehicles]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 4);
  }, [vehicles]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-[Space_Grotesk]">Dashboard</h1>
          <p className="text-sm text-[#5C677D] mt-1">
            Overview of your lead management system
          </p>
        </div>
        <div className="text-xs text-[#5C677D]">
          Last updated: {formatTime(new Date().toISOString())}
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'New Leads Today',
            value: stats.newLeadsToday,
            icon: TrendingUp,
            color: '#00B4D8',
            bg: 'bg-[#0077B6]/10',
            trend: '+3',
          },
          {
            label: 'Total Active Leads',
            value: stats.totalActive,
            icon: Users,
            color: '#FFB703',
            bg: 'bg-[#FFB703]/10',
            trend: '+8%',
          },
          {
            label: 'Requires Attention',
            value: stats.requiresAttention,
            icon: AlertCircle,
            color: '#FF4D6D',
            bg: 'bg-[#FF4D6D]/10',
            trend: 'New',
          },
          {
            label: 'Avg Response Time',
            value: '2.4h',
            icon: Clock,
            color: '#A855F7',
            bg: 'bg-purple-500/10',
            trend: '-0.3h',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-xl p-5 hover:border-[#0077B6]/30 transition-all cursor-pointer"
            onClick={() => {
              if (stat.label === 'Requires Attention') {
                navigate('/admin/leads');
              }
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="flex items-center gap-1 text-xs">
                <ArrowUpRight className="w-3 h-3 text-[#00C896]" />
                <span className="text-[#00C896]">{stat.trend}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-[Space_Grotesk]">
              {stat.value}
            </p>
            <p className="text-xs text-[#5C677D] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* KPI Cards with Real Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Vehicles',
            value: vehicleCounts.total,
            icon: Car,
            color: '#0077B6',
            path: '/admin/vehicles',
          },
          {
            label: 'Available Stock',
            value: vehicleCounts.available,
            icon: Car,
            color: '#00C896',
            path: '/admin/vehicles',
          },
          {
            label: 'Total Leads',
            value: leadCounts.total,
            icon: Users,
            color: '#FFB703',
            path: '/admin/leads',
          },
          {
            label: 'New Leads',
            value: leadCounts.new,
            icon: MessageSquare,
            color: '#FF4D6D',
            path: '/admin/leads',
          },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="glass rounded-xl p-4 flex items-center gap-4 hover:border-[#0077B6]/30 transition-all text-left"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}15` }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white font-[Space_Grotesk]">
                {item.value}
              </p>
              <p className="text-xs text-[#5C677D]">{item.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Type Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Contact Forms',
            value: stats.contactForms,
            icon: MessageSquare,
            color: '#0077B6',
            path: '/admin/leads?tab=contact',
          },
          {
            label: 'Sell My Car',
            value: stats.sellMyCar,
            icon: Car,
            color: '#FFB703',
            path: '/admin/leads?tab=sell-my-car',
          },
          {
            label: 'Test Drives',
            value: stats.testDrives,
            icon: CalendarDays,
            color: '#A855F7',
            path: '/admin/leads?tab=test-drive',
          },
          {
            label: 'Finance Apps',
            value: stats.financeApps,
            icon: Wallet,
            color: '#00C896',
            path: '/admin/leads?tab=finance',
          },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="glass rounded-xl p-4 flex items-center gap-4 hover:border-[#0077B6]/30 transition-all text-left"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}15` }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white font-[Space_Grotesk]">
                {item.value}
              </p>
              <p className="text-xs text-[#5C677D]">{item.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Vehicles */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#33415C]/20">
          <h2 className="text-sm font-semibold text-white font-[Space_Grotesk]">
            Recently Added Vehicles
          </h2>
          <button
            onClick={() => navigate('/admin/vehicles')}
            className="text-xs text-[#0077B6] hover:text-[#00B4D8] transition-colors flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-[#33415C]/20">
          {recentVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors group cursor-pointer"
              onClick={() => navigate('/admin/vehicles')}
            >
              <div className="w-8 h-8 rounded-lg bg-[#0077B6]/10 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-[#00B4D8]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{vehicle.make} {vehicle.model}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(vehicle.status)}`}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <p className="text-xs text-[#5C677D] mt-0.5">
                  {vehicle.registration} &middot; &pound;{vehicle.cashPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[#C8D3D9]">{formatDate(vehicle.dateAdded)}</p>
              </div>
              <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#0077B6]/20 text-[#5C677D] hover:text-[#00B4D8] transition-all flex-shrink-0">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {recentVehicles.length === 0 && (
            <div className="px-5 py-8 text-center text-[#5C677D] text-sm">
              No vehicles found
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#33415C]/20">
          <h2 className="text-sm font-semibold text-white font-[Space_Grotesk]">
            Recent Leads
          </h2>
          <button
            onClick={() => navigate('/admin/leads')}
            className="text-xs text-[#0077B6] hover:text-[#00B4D8] transition-colors flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-[#33415C]/20">
          {recentLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors group cursor-pointer"
              onClick={() => navigate(`/admin/leads?id=${lead.id}`)}
            >
              <div className="w-8 h-8 rounded-lg bg-[#0077B6]/10 flex items-center justify-center flex-shrink-0">
                {getLeadIcon(lead.type || 'contact')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(lead.status)}`}
                  >
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
                <p className="text-xs text-[#5C677D] mt-0.5">
                  {getLeadSubject(lead)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[#C8D3D9]">{formatDate(lead.date)}</p>
                <p className="text-[10px] text-[#5C677D]">{formatTime(lead.date)}</p>
              </div>
              <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#0077B6]/20 text-[#5C677D] hover:text-[#00B4D8] transition-all flex-shrink-0">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {recentLeads.length === 0 && (
            <div className="px-5 py-8 text-center text-[#5C677D] text-sm">
              No leads found
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'View Analytics',
            description: 'Detailed lead performance reports',
            icon: TrendingUp,
            action: () => navigate('/admin/analytics'),
          },
          {
            label: 'Manage Leads',
            description: 'Review and update all leads',
            icon: CheckCircle2,
            action: () => navigate('/admin/leads'),
          },
          {
            label: 'Manage Vehicles',
            description: 'Review and update inventory',
            icon: Car,
            action: () => navigate('/admin/vehicles'),
          },
        ].map((action) => (
          <button
            key={action.label}
            onClick={action.action}
            className="glass rounded-xl p-4 flex items-center gap-4 hover:border-[#0077B6]/30 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0077B6]/10 flex items-center justify-center flex-shrink-0">
              <action.icon className="w-5 h-5 text-[#00B4D8]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{action.label}</p>
              <p className="text-xs text-[#5C677D]">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
