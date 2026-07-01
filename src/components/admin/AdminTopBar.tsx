import { Search, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/hooks/useAuth';

interface AdminTopBarProps {
  sidebarCollapsed: boolean;
}

export default function AdminTopBar({ sidebarCollapsed }: AdminTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <header
      className="fixed top-0 right-0 h-[72px] z-30 flex items-center justify-between px-6 transition-all duration-300"
      style={{
        left: sidebarCollapsed ? '68px' : '240px',
        background: 'rgba(0, 8, 20, 0.8)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
        borderBottom: '1px solid rgba(92, 103, 125, 0.2)',
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
          <input
            type="text"
            placeholder="Search leads, contacts, vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-[#5C677D] glass-input"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        <div className="w-px h-6 bg-[#33415C]/40 mx-2" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0077B6]/20 border border-[#0077B6]/30 flex items-center justify-center">
            <User className="w-4 h-4 text-[#00B4D8]" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-white font-medium">{user?.email || 'Admin'}</p>
            <p className="text-[10px] text-[#C8D3D9]/60">Administrator</p>
          </div>
        </div>

        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 transition-colors ml-2" title="Sign out">
          <LogOut className="w-4 h-4 text-[#C8D3D9]/60" />
        </button>
      </div>
    </header>
  );
}
