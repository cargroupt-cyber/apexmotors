import { useState, useRef, useEffect } from 'react';
import { Bell, Check, MessageSquare, Car, CalendarDays, Wallet, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Notification {
  id: string;
  type: 'new-lead' | 'test-drive' | 'finance-app' | 'valuation' | 'message';
  title: string;
  description: string;
  read: boolean;
  timestamp: string;
  leadId?: string;
}

const initialNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'new-lead',
    title: 'New Lead Received',
    description: 'James Richardson enquired about BMW M4 Competition',
    read: false,
    timestamp: '2024-12-11T09:30:00',
    leadId: 'CE-2024-001',
  },
  {
    id: 'NOTIF-002',
    type: 'test-drive',
    title: 'Test Drive Request',
    description: 'Sophia Lewis booked for BMW M4 Competition on 14 Dec',
    read: false,
    timestamp: '2024-12-11T09:00:00',
    leadId: 'TD-2024-001',
  },
  {
    id: 'NOTIF-003',
    type: 'finance-app',
    title: 'Finance Application',
    description: 'Daniel Turner applied for Porsche 911 Carrera finance',
    read: false,
    timestamp: '2024-12-11T09:30:00',
    leadId: 'FA-2024-005',
  },
  {
    id: 'NOTIF-004',
    type: 'valuation',
    title: 'Valuation Request',
    description: 'Nathan Cooper requested valuation for AB21 XYZ',
    read: false,
    timestamp: '2024-12-11T08:00:00',
    leadId: 'SC-2024-001',
  },
  {
    id: 'NOTIF-005',
    type: 'new-lead',
    title: 'New Enquiry',
    description: 'Olivia Parker enquired about Porsche 911 Carrera',
    read: true,
    timestamp: '2024-12-11T08:45:00',
    leadId: 'CE-2024-004',
  },
  {
    id: 'NOTIF-006',
    type: 'message',
    title: 'Note Added',
    description: 'Tom Bradley added a note to CE-2024-002',
    read: true,
    timestamp: '2024-12-10T14:20:00',
  },
  {
    id: 'NOTIF-007',
    type: 'test-drive',
    title: 'Test Drive No-Show',
    description: 'Ethan Wright did not show for F-Type R Coupe test drive',
    read: true,
    timestamp: '2024-12-11T15:30:00',
    leadId: 'TD-2024-006',
  },
];

const iconMap = {
  'new-lead': MessageSquare,
  'test-drive': CalendarDays,
  'finance-app': Wallet,
  'valuation': Car,
  'message': Star,
};

const iconColorMap = {
  'new-lead': 'text-[#00B4D8] bg-[#0077B6]/20',
  'test-drive': 'text-purple-400 bg-purple-500/20',
  'finance-app': 'text-[#00C896] bg-[#00C896]/20',
  'valuation': 'text-[#FFB703] bg-[#FFB703]/20',
  'message': 'text-[#C8D3D9] bg-[#33415C]/30',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.leadId) {
      navigate(`/admin/leads?id=${notif.leadId}`);
    }
    setOpen(false);
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date('2024-12-11T12:00:00');
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5 text-[#C8D3D9]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#FF4D6D] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[360px] rounded-xl overflow-hidden z-50"
          style={{
            background: 'rgba(0, 18, 51, 0.95)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(92, 103, 125, 0.25)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#33415C]/30">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#0077B6] hover:text-[#00B4D8] transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#C8D3D9]/50">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = iconMap[notif.type];
                const iconColors = iconColorMap[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-[#33415C]/20 ${
                      !notif.read ? 'bg-[#0077B6]/5' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white font-medium truncate">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#0077B6] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#C8D3D9]/70 mt-0.5 line-clamp-2">
                        {notif.description}
                      </p>
                      <p className="text-[10px] text-[#C8D3D9]/40 mt-1">
                        {formatTimestamp(notif.timestamp)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#33415C]/30 text-center">
            <button
              onClick={() => {
                navigate('/admin/leads');
                setOpen(false);
              }}
              className="text-xs text-[#0077B6] hover:text-[#00B4D8] transition-colors"
            >
              View all leads
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
