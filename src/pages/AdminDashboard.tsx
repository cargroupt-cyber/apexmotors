// AdminDashboard.tsx - Supabase Connected
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Car,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronRight,
  ShoppingCart,
  MessageSquare,
  Star,
  Eye,
} from 'lucide-react'
import { useSupabaseVehicles } from '@/hooks/useSupabaseVehicles'
import { useSupabaseLeads } from '@/hooks/useSupabaseLeads'
import { useSupabaseAnalytics } from '@/hooks/useSupabaseAnalytics'

/* ═══════════════════════════════════════════
   DASHBOARD PAGE — Supabase Connected
   ═══════════════════════════════════════════ */

export default function AdminDashboard() {
  const { vehicles, loading: vLoading } = useSupabaseVehicles()
  const { leads, loading: lLoading } = useSupabaseLeads()
  const { summary, recentActivity, loading: aLoading } = useSupabaseAnalytics()

  const loading = vLoading || lLoading || aLoading

  /* Summary cards */
  const stats = [
    {
      label: 'Total Vehicles',
      value: vehicles.length,
      change: '+12%',
      up: true,
      icon: Car,
      href: '/admin/vehicles',
    },
    {
      label: 'Active Enquiries',
      value: summary.newLeads + summary.contacted + summary.qualified,
      change: '+8%',
      up: true,
      icon: MessageSquare,
      href: '/admin/leads',
    },
    {
      label: 'Sell My Car',
      value: summary.sellCar,
      change: '+23%',
      up: true,
      icon: DollarSign,
      href: '/admin/leads?sellcar=true',
    },
    {
      label: 'Finance Apps',
      value: summary.finance,
      change: '+15%',
      up: true,
      icon: TrendingUp,
      href: '/admin/leads?finance=true',
    },
    {
      label: 'Test Drives',
      value: summary.testDrive,
      change: '+5%',
      up: true,
      icon: Eye,
      href: '/admin/leads?testdrive=true',
    },
    {
      label: 'Conversion Rate',
      value: `${summary.conversionRate}%`,
      change: '+3%',
      up: true,
      icon: Activity,
      href: '/admin/analytics',
    },
  ]

  /* Quick actions */
  const actions = [
    { label: 'Add Vehicle', icon: Car, href: '/admin/vehicles', color: 'bg-electric-blue/20 text-electric-blue' },
    { label: 'View Enquiries', icon: MessageSquare, href: '/admin/leads', color: 'bg-success/20 text-success' },
    { label: 'Analytics', icon: TrendingUp, href: '/admin/analytics', color: 'bg-warning/20 text-warning' },
    { label: 'Settings', icon: LayoutDashboard, href: '/admin/settings', color: 'bg-slate/20 text-slate' },
  ]

  /* Recent enquiries preview */
  const recentLeads = leads.slice(0, 5)

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-pure-white">Dashboard</h1>
          <p className="text-chrome text-sm mt-1">Welcome back to CarZee Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-chrome bg-obsidian/60 px-3 py-1.5 rounded-lg border border-slate/15">
            <Clock size={12} className="inline mr-1" />
            Live Data
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link
              to={stat.href}
              className="block p-5 rounded-2xl glass hover:border-electric-blue/30 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={20} className="text-electric-blue" />
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-success' : 'text-error'}`}>
                  {stat.change}
                  {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </span>
              </div>
              <p className="font-display font-bold text-2xl text-pure-white">{stat.value}</p>
              <p className="text-xs text-chrome mt-1">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-pure-white">Recent Enquiries</h2>
            <Link to="/admin/leads" className="text-xs text-electric-blue hover:text-blue-glow transition-colors flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={32} className="text-slate/30 mx-auto mb-3" />
              <p className="text-chrome text-sm">No enquiries yet</p>
              <p className="text-slate text-xs mt-1">Enquiries will appear here when customers submit forms</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  to={`/admin/leads?id=${lead.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-obsidian/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-electric-blue/10 flex items-center justify-center shrink-0">
                    <Users size={16} className="text-electric-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pure-white truncate">{lead.name}</p>
                    <p className="text-xs text-chrome truncate">
                      {lead.vehicle_interest || lead.subject || lead.type || 'General enquiry'}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md shrink-0 ${
                    lead.status === 'New' || lead.status === 'new'
                      ? 'bg-electric-blue/10 text-electric-blue'
                      : lead.status === 'Closed' || lead.status === 'closed' || lead.status === 'sold'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                  }`}>
                    {lead.status}
                  </span>
                  <ChevronRight size={14} className="text-slate group-hover:text-electric-blue transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display font-semibold text-lg text-pure-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-obsidian/40 hover:bg-obsidian/60 border border-slate/10 hover:border-electric-blue/30 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-xs font-medium text-frost">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display font-semibold text-lg text-pure-white mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-chrome text-sm text-center py-4">No recent activity</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentActivity.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-electric-blue mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-frost">{item.action} from <span className="text-pure-white font-medium">{item.target}</span></p>
                      <p className="text-xs text-chrome mt-0.5">
                        {new Date(item.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display font-semibold text-lg text-pure-white mb-4">Performance</h2>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Response Time', value: summary.avgResponse, icon: Clock, color: 'text-success' },
                { label: 'Customer Rating', value: '4.9/5', icon: Star, color: 'text-warning' },
                { label: 'Top Source', value: summary.topSource, icon: ShoppingCart, color: 'text-electric-blue' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className="text-chrome" />
                    <span className="text-sm text-chrome">{item.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
