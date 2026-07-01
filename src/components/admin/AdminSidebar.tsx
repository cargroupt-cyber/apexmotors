import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageSquare,
  Car,
  CalendarDays,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface AdminSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/leads', icon: Users, label: 'Leads', end: false },
  { to: '/admin/vehicles', icon: Car, label: 'Vehicles', end: false },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', end: false },
  { to: '/admin/leads?tab=contact', icon: MessageSquare, label: 'Enquiries', end: false },
  { to: '/admin/leads?tab=sell-my-car', icon: Car, label: 'Sell My Car', end: false },
  { to: '/admin/leads?tab=test-drive', icon: CalendarDays, label: 'Test Drives', end: false },
  { to: '/admin/leads?tab=finance', icon: Wallet, label: 'Finance', end: false },
  { to: '/admin/settings', icon: Settings, label: 'Settings', end: false },
];

export default function AdminSidebar({ onCollapseChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    onCollapseChange?.(collapsed);
  }, [collapsed, onCollapseChange]);

  const handleToggle = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
      style={{
        background: 'rgba(0, 18, 51, 0.7)',
        backdropFilter: 'blur(32px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.2)',
        borderRight: '1px solid rgba(92, 103, 125, 0.2)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[72px] border-b border-[#33415C]/30">
        <div className="w-9 h-9 rounded-lg bg-[#0077B6] flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white tracking-wide whitespace-nowrap font-[Space_Grotesk]">
              CarZee CRM
            </h1>
            <p className="text-[10px] text-[#C8D3D9]/60 whitespace-nowrap">Lead Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-[#0077B6]/20 text-white border border-[#0077B6]/30'
                  : 'text-[#C8D3D9]/70 hover:text-white hover:bg-white/5 border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-3 border-t border-[#33415C]/30">
        <button
          onClick={handleToggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#C8D3D9]/50 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-[18px] h-[18px]" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
