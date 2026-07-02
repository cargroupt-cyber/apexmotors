// @ts-nocheck
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Users, Eye, DollarSign, Car, CreditCard,
  ChevronDown, ArrowUpRight,
} from 'lucide-react'
import { useSupabaseAnalytics } from '@/hooks/useSupabaseAnalytics'

/* ═══════════════════════════════════════════
   SIMPLE SVG BAR CHART COMPONENT
   ═══════════════════════════════════════════ */

function BarChart({ data, color = '#0077B6', maxHeight = 120 }: { data: number[]; color?: string; maxHeight?: number }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1 h-[140px]">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
          style={{
            height: `${(v / max) * maxHeight}px`,
            backgroundColor: color,
            opacity: 0.6 + (v / max) * 0.4,
            minHeight: 4,
          }}
          title={`${v}`}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   DONUT CHART COMPONENT
   ═══════════════════════════════════════════ */

function DonutChart({ segments, size = 140 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  let cumulative = 0

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const startAngle = (cumulative / total) * 360
          cumulative += seg.value
          const endAngle = (cumulative / total) * 360
          const startRad = ((startAngle - 90) * Math.PI) / 180
          const endRad = ((endAngle - 90) * Math.PI) / 180
          const cx = size / 2, cy = size / 2, r = size / 2 - 10
          const x1 = cx + r * Math.cos(startRad)
          const y1 = cy + r * Math.sin(startRad)
          const x2 = cx + r * Math.cos(endRad)
          const y2 = cy + r * Math.sin(endRad)
          const largeArc = endAngle - startAngle > 180 ? 1 : 0

          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={seg.color}
              stroke="#0a1628"
              strokeWidth={2}
            />
          )
        })}
        <circle cx={size / 2} cy={size / 2} r={size / 4} fill="#0a1628" />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="#FAFAFA" fontSize={size / 10} fontWeight="bold">{total}</text>
        <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fill="#8B95A5" fontSize={size / 14}>Total</text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-chrome">{seg.label}</span>
            <span className="text-xs text-pure-white font-medium ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function AdminAnalytics() {
  const { summary, statusChart, timeChart, sourceChart, typeChart, vehicleCount, loading, refresh } = useSupabaseAnalytics()
  const [period, setPeriod] = useState('30d')

  /* Top stats */
  const topStats = [
    { label: 'Total Leads', value: summary.totalLeads, change: '+12%', up: true, icon: Users, color: 'text-electric-blue', bg: 'bg-electric-blue/10' },
    { label: 'New This Week', value: summary.thisWeek, change: '+8%', up: true, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'New This Month', value: summary.thisMonth, change: '+15%', up: true, icon: Eye, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Sell My Car', value: summary.sellCar, change: '+23%', up: true, icon: DollarSign, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Finance Apps', value: summary.finance, change: '+10%', up: true, icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Test Drives', value: summary.testDriveReq, change: '+5%', up: true, icon: Car, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ]

  /* Funnel stages */
  const funnelStages = [
    { label: 'New', count: summary.newLeads, color: '#0077B6' },
    { label: 'Contacted', count: summary.contacted, color: '#F59E0B' },
    { label: 'Qualified', count: summary.qualified, color: '#8B5CF6' },
    { label: 'Test Drive', count: summary.testDrive, color: '#06B6D4' },
    { label: 'Closed', count: summary.closed, color: '#00C896' },
  ]

  const maxFunnel = Math.max(...funnelStages.map(s => s.count), 1)

  /* Status donut data */
  const statusColors = ['#0077B6', '#F59E0B', '#8B5CF6', '#06B6D4', '#00C896', '#EF4444', '#EC4899']
  const statusDonutData = useMemo(() =>
    statusChart.labels.map((label, i) => ({
      label,
      value: statusChart.datasets[0].data[i],
      color: statusColors[i % statusColors.length],
    })).filter(d => d.value > 0),
    [statusChart]
  )

  /* Source donut data */
  const sourceDonutData = useMemo(() =>
    sourceChart.labels.map((label, i) => ({
      label,
      value: sourceChart.datasets[0].data[i],
      color: statusColors[(i + 3) % statusColors.length],
    })).filter(d => d.value > 0),
    [sourceChart]
  )

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
          <h1 className="font-display font-bold text-2xl text-pure-white">Analytics</h1>
          <p className="text-chrome text-sm mt-1">Real-time data from your Supabase database</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 rounded-xl bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button onClick={refresh} className="px-4 py-2 bg-obsidian/60 border border-slate/15 rounded-xl text-sm text-chrome hover:text-pure-white hover:border-electric-blue transition-all">
            Refresh
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {topStats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
            <div className="p-5 rounded-2xl glass hover:border-electric-blue/30 transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display font-bold text-xl text-pure-white">{stat.value}</p>
                <span className="text-xs font-medium text-success flex items-center gap-0.5">
                  {stat.change} <ArrowUpRight size={10} />
                </span>
              </div>
              <p className="text-xs text-chrome">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Leads Over Time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg text-pure-white mb-4">Leads Over Time (30 Days)</h3>
          {timeChart.datasets[0].data.every(v => v === 0) ? (
            <div className="text-center py-10 text-chrome text-sm">No data yet — leads will appear here</div>
          ) : (
            <BarChart data={timeChart.datasets[0].data} color="#0077B6" />
          )}
          <div className="flex justify-between text-xs text-chrome mt-3">
            <span>{timeChart.labels[0]}</span>
            <span>{timeChart.labels[timeChart.labels.length - 1]}</span>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg text-pure-white mb-4">Conversion Funnel</h3>
          <div className="flex flex-col gap-3">
            {funnelStages.map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-frost">{stage.label}</span>
                  <span className="text-sm font-semibold text-pure-white">{stage.count}</span>
                </div>
                <div className="h-8 bg-obsidian/60 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / maxFunnel) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-lg flex items-center px-3"
                    style={{ backgroundColor: stage.color }}
                  >
                    <span className="text-xs font-medium text-pure-white">{maxFunnel > 0 ? Math.round((stage.count / maxFunnel) * 100) : 0}%</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg text-pure-white mb-4">Status Distribution</h3>
          {statusDonutData.length === 0 ? (
            <div className="text-center py-10 text-chrome text-sm">No data yet</div>
          ) : (
            <DonutChart segments={statusDonutData} />
          )}
        </motion.div>

        {/* Source Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg text-pure-white mb-4">Lead Sources</h3>
          {sourceDonutData.length === 0 ? (
            <div className="text-center py-10 text-chrome text-sm">No data yet</div>
          ) : (
            <DonutChart segments={sourceDonutData} />
          )}
        </motion.div>
      </div>

      {/* Lead Types Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="glass rounded-2xl p-6 mb-8">
        <h3 className="font-display font-semibold text-lg text-pure-white mb-4">Enquiry Types</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate/15">
                <th className="px-4 py-3 text-left text-xs font-semibold text-chrome uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-chrome uppercase tracking-wider">Count</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-chrome uppercase tracking-wider">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-chrome uppercase tracking-wider">Bar</th>
              </tr>
            </thead>
            <tbody>
              {typeChart.labels.map((label, i) => {
                const count = typeChart.datasets[0].data[i]
                const pct = summary.totalLeads > 0 ? Math.round((count / summary.totalLeads) * 100) : 0
                const typeColors: Record<string, string> = {
                  contact: '#0077B6',
                  'sell-my-car': '#F59E0B',
                  sell_car: '#F59E0B',
                  'test-drive': '#00C896',
                  finance: '#8B5CF6',
                }
                return (
                  <tr key={label} className="border-b border-slate/10">
                    <td className="px-4 py-3 text-sm text-pure-white capitalize">{label.replace(/-/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-frost">{count}</td>
                    <td className="px-4 py-3 text-sm text-frost">{pct}%</td>
                    <td className="px-4 py-3">
                      <div className="h-2 bg-obsidian/60 rounded-full overflow-hidden w-32">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: typeColors[label] || '#0077B6' }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
