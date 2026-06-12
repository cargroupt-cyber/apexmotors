// @ts-nocheck
import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  CalendarDays,
  Wallet,
  MessageSquare,
  X,
  UserCheck,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import type { Lead, LeadStatus } from '@/lib/store';
import LeadDetail from '../../components/admin/LeadDetail';

type TabType = 'all' | 'contact' | 'sell-my-car' | 'test-drive' | 'finance';
type SortField = 'name' | 'type' | 'status' | 'date' | 'assignedTo';
type SortDirection = 'asc' | 'desc';

function gf(lead: Lead, field: string): unknown {
  return (lead as unknown as Record<string, unknown>)[field];
}

function getStatus(lead: Lead): string {
  return lead.status || '';
}

function getAssignedTo(lead: Lead): string {
  return String(gf(lead, 'assignedTo') || 'N/A');
}

const typeConfig: Record<string, { label: string; icon: typeof MessageSquare; color: string }> = {
  contact: { label: 'Contact', icon: MessageSquare, color: 'bg-[#0077B6]/20 text-[#00B4D8] border-[#0077B6]/30' },
  'sell-my-car': { label: 'Sell Car', icon: CalendarDays, color: 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/30' },
  'test-drive': { label: 'Test Drive', icon: CalendarDays, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  finance: { label: 'Finance', icon: Wallet, color: 'bg-[#00C896]/20 text-[#00C896] border-[#00C896]/30' },
};

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New': 'bg-[#0077B6]/10 text-[#00B4D8] border-[#0077B6]/25',
    'Contacted': 'bg-[#FFB703]/10 text-[#FFB703] border-[#FFB703]/25',
    'Qualified': 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/25',
    'Test Drive': 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    'Closed': 'bg-[#FF4D6D]/10 text-[#FF4D6D] border-[#FF4D6D]/25',
    'pending': 'bg-[#0077B6]/10 text-[#00B4D8] border-[#0077B6]/25',
    'contacted': 'bg-[#FFB703]/10 text-[#FFB703] border-[#FFB703]/25',
    'qualified': 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/25',
    'valued': 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/25',
    'appointment': 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    'confirmed': 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    'completed': 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/25',
    'approved': 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/25',
    'sold': 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/25',
    'closed': 'bg-[#FF4D6D]/10 text-[#FF4D6D] border-[#FF4D6D]/25',
  };
  return colors[status] || 'bg-[#33415C]/10 text-[#5C677D] border-[#33415C]/25';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'new': 'New',
    'contacted': 'Contacted',
    'qualified': 'Qualified',
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'approved': 'Approved',
    'declined': 'Declined',
    'referred': 'Referred',
    'closed': 'Closed',
    'valued': 'Valued',
    'appointment': 'Appointment',
    'completed': 'Completed',
    'sold': 'Sold',
    'cancelled': 'Cancelled',
    'no-show': 'No Show',
  };
  return labels[status] || status;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const staffMembers = ['James Wilson', 'Emily Parker', 'Unassigned'];

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All Leads' },
  { key: 'contact', label: 'Contact Forms' },
  { key: 'sell-my-car', label: 'Sell My Car' },
  { key: 'test-drive', label: 'Test Drives' },
  { key: 'finance', label: 'Finance Apps' },
];

export default function AdminLeads() {
  const { leads: storeLeads, updateLead, deleteLead } = useLeads();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detailLead, setDetailLead] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Use store leads as the data source
  const leads = storeLeads;

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (activeTab !== 'all') {
      result = result.filter((l) => l.type === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.id.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((l) => getStatus(l) === statusFilter);
    }

    if (assigneeFilter !== 'all') {
      result = result.filter((l) => getAssignedTo(l) === assigneeFilter);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'type':
          cmp = (a.type || '').localeCompare(b.type || '');
          break;
        case 'status':
          cmp = getStatus(a).localeCompare(getStatus(b));
          break;
        case 'date':
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'assignedTo':
          cmp = getAssignedTo(a).localeCompare(getAssignedTo(b));
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [leads, activeTab, searchQuery, statusFilter, assigneeFilter, sortField, sortDir]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLeads = leads.filter((l) => {
      const d = new Date(l.date);
      return d.toDateString() === today.toDateString();
    });

    const activeStatuses = ['New', 'Contacted', 'Qualified', 'Test Drive'];
    const activeLeads = leads.filter((l) => activeStatuses.includes(l.status));

    const convertedLeads = leads.filter((l) => l.status === 'Closed');
    const conversionRate = leads.length > 0 ? ((convertedLeads.length / leads.length) * 100).toFixed(1) : '0';

    return {
      newLeadsToday: todayLeads.length,
      totalActive: activeLeads.length,
      conversionRate,
      avgResponseTime: '2.4h',
    };
  }, [leads]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    if (action === 'delete') {
      selectedLeads.forEach((id) => deleteLead(id));
    } else if (action === 'contacted') {
      selectedLeads.forEach((id) => {
        const lead = leads.find((l) => l.id === id);
        if (lead) {
          updateLead(id, { status: 'Contacted' as LeadStatus });
        }
      });
    }
    setSelectedLeads(new Set());
  };

  const exportCSV = () => {
    const headers = ['ID', 'Type', 'Name', 'Email', 'Phone', 'Status', 'Date', 'Assigned To'];
    const rows = filteredLeads.map((l) => [
      l.id,
      l.type || 'contact',
      l.name,
      l.email,
      l.phone,
      l.status,
      formatDate(l.date),
      getAssignedTo(l),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateLead = useCallback((updated: any) => {
    updateLead(updated.id, updated);
    setDetailLead((current: any) => (current && current.id === updated.id ? updated : current));
  }, [updateLead]);

  const subjectColumn = (lead: Lead): string => {
    switch (lead.type) {
      case 'contact':
        return String(gf(lead, 'subject') || lead.vehicleInterest || lead.name);
      case 'sell-my-car':
        return `Reg: ${String(gf(lead, 'registration') || '')}`;
      case 'test-drive':
        return String(gf(lead, 'vehicle') || lead.vehicleInterest || '');
      case 'finance':
        return `${String(gf(lead, 'vehicle') || lead.vehicleInterest || '')} - £${String(gf(lead, 'amount') || '')}`;
      default:
        return lead.vehicleInterest || '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New Leads Today', value: stats.newLeadsToday, icon: MessageSquare, color: 'text-[#00B4D8]', bg: 'bg-[#0077B6]/10' },
          { label: 'Total Active Leads', value: stats.totalActive, icon: UserCheck, color: 'text-[#FFB703]', bg: 'bg-[#FFB703]/10' },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: X, color: 'text-[#00C896]', bg: 'bg-[#00C896]/10' },
          { label: 'Avg Response Time', value: stats.avgResponseTime, icon: ArrowUpDown, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-[#0077B6]/30 transition-all">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-[Space_Grotesk]">{stat.value}</p>
              <p className="text-xs text-[#5C677D]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedLeads(new Set());
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-[#0077B6]/20 text-white border border-[#0077B6]/30'
                : 'text-[#C8D3D9]/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs text-[#5C677D]">
              {tab.key === 'all' ? leads.length : leads.filter((l) => l.type === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-[#5C677D] glass-input"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-3 rounded-lg text-sm flex items-center gap-2 transition-all ${
              showFilters
                ? 'bg-[#0077B6]/20 text-white border border-[#0077B6]/30'
                : 'text-[#C8D3D9]/60 hover:text-white glass-input border-transparent'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        <div className="flex items-center gap-2">
          {selectedLeads.size > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkAction(e.target.value);
                e.target.value = '';
              }}
              className="h-9 px-3 rounded-lg text-xs text-white glass-input appearance-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Bulk Actions ({selectedLeads.size})</option>
              <option value="contacted">Mark as Contacted</option>
              <option value="delete">Delete</option>
            </select>
          )}
          <button
            onClick={exportCSV}
            className="h-10 px-3 rounded-lg text-sm text-[#C8D3D9]/60 hover:text-white glass-input border-transparent flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-4">
          <div>
            <label className="text-xs text-[#5C677D] block mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs text-white glass-input appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all" className="bg-[#001233]">All Statuses</option>
              <option value="New" className="bg-[#001233]">New</option>
              <option value="Contacted" className="bg-[#001233]">Contacted</option>
              <option value="Qualified" className="bg-[#001233]">Qualified</option>
              <option value="Test Drive" className="bg-[#001233]">Test Drive</option>
              <option value="Closed" className="bg-[#001233]">Closed</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#5C677D] block mb-1.5">Assigned To</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs text-white glass-input appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all" className="bg-[#001233]">All Staff</option>
              {staffMembers.map((s) => (
                <option key={s} value={s} className="bg-[#001233]">{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setStatusFilter('all');
              setAssigneeFilter('all');
              setSearchQuery('');
            }}
            className="h-9 px-3 rounded-lg text-xs text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-colors flex items-center gap-1 mt-5"
          >
            <X className="w-3 h-3" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#33415C]/30">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#33415C] bg-transparent checked:bg-[#0077B6] accent-[#0077B6]"
                  />
                </th>
                {[
                  { field: 'name' as SortField, label: 'Name' },
                  { field: 'type' as SortField, label: 'Type' },
                  { field: 'status' as SortField, label: 'Subject/Details' },
                  { field: 'status' as SortField, label: 'Status' },
                  { field: 'date' as SortField, label: 'Date' },
                  { field: 'assignedTo' as SortField, label: 'Assigned' },
                ].map((col) => (
                  <th
                    key={col.label}
                    className="px-4 py-3 text-left text-xs font-medium text-[#5C677D] uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => toggleSort(col.field)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-[#5C677D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#33415C]/20">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-10 h-10 text-[#33415C]" />
                      <p className="text-sm text-[#5C677D]">No leads found</p>
                      <p className="text-xs text-[#5C677D]/60">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const tConfig = typeConfig[lead.type || 'contact'] || typeConfig.contact;
                  const TypeIcon = tConfig.icon;
                  const status = getStatus(lead);
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setDetailLead(lead)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-[#33415C] bg-transparent checked:bg-[#0077B6] accent-[#0077B6]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{lead.name}</p>
                          <p className="text-xs text-[#5C677D]">{lead.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${tConfig.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {tConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-sm text-[#C8D3D9] truncate">{subjectColumn(lead)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-[#C8D3D9]">{formatDate(lead.date)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-[#C8D3D9]">{getAssignedTo(lead)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDetailLead(lead); }}
                            className="p-1.5 rounded-md hover:bg-[#0077B6]/20 text-[#5C677D] hover:text-[#00B4D8] transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${lead.email}`; }}
                            className="p-1.5 rounded-md hover:bg-[#0077B6]/20 text-[#5C677D] hover:text-[#00B4D8] transition-colors"
                            title="Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${lead.phone}`; }}
                            className="p-1.5 rounded-md hover:bg-[#00C896]/20 text-[#5C677D] hover:text-[#00C896] transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#33415C]/20">
          <p className="text-xs text-[#5C677D]">Showing {filteredLeads.length} of {leads.length} leads</p>
          {selectedLeads.size > 0 && <p className="text-xs text-[#0077B6]">{selectedLeads.size} selected</p>}
        </div>
      </div>

      {/* Lead Detail Panel */}
      {detailLead && (
        <LeadDetail lead={detailLead} onClose={() => setDetailLead(null)} onUpdate={handleUpdateLead} />
      )}
    </div>
  );
}
