import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Lead } from './useSupabaseLeads'

export interface AnalyticsSummary {
  totalLeads: number
  newLeads: number
  contacted: number
  qualified: number
  testDrive: number
  closed: number
  sellCar: number
  finance: number
  testDriveReq: number
  contact: number
  thisWeek: number
  thisMonth: number
  conversionRate: number
  avgResponse: string
  topSource: string
}

export interface ChartData {
  labels: string[]
  datasets: { label: string; data: number[]; color: string }[]
}

export function useSupabaseAnalytics() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [vehicleCount, setVehicleCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data: leadsData, error: leadsErr } = await supabase
      .from('leads')
      .select('*')
      .order('date', { ascending: false })

    if (!leadsErr) setLeads((leadsData as Lead[]) || [])

    const { count: vCount, error: vErr } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })

    if (!vErr) setVehicleCount(vCount || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const summary: AnalyticsSummary = useMemo(() => {
    const total = leads.length
    const newLeads = leads.filter(l => l.status === 'New' || l.status === 'new').length
    const contacted = leads.filter(l => l.status === 'Contacted' || l.status === 'contacted').length
    const qualified = leads.filter(l => l.status === 'Qualified' || l.status === 'qualified').length
    const testDrive = leads.filter(l => l.status === 'Test Drive' || l.status === 'confirmed').length
    const closed = leads.filter(l => l.status === 'Closed' || l.status === 'closed' || l.status === 'sold').length
    const sellCar = leads.filter(l => l.type === 'sell_car' || l.type === 'sell-my-car').length
    const finance = leads.filter(l => l.type === 'finance').length
    const testDriveReq = leads.filter(l => l.type === 'test-drive').length
    const contact = leads.filter(l => l.type === 'contact' || !l.type).length

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thisWeek = leads.filter(l => new Date(l.date) >= weekAgo).length
    const thisMonth = leads.filter(l => new Date(l.date) >= monthAgo).length

    const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0
    const sourceCounts: Record<string, number> = {}
    leads.forEach(l => { sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1 })
    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Website'

    return {
      totalLeads: total,
      newLeads,
      contacted,
      qualified,
      testDrive,
      closed,
      sellCar,
      finance,
      testDriveReq,
      contact,
      thisWeek,
      thisMonth,
      conversionRate,
      avgResponse: '< 2 hours',
      topSource,
    }
  }, [leads])

  const statusChart: ChartData = useMemo(() => {
    const statusMap: Record<string, number> = {}
    leads.forEach(l => { const s = l.status || 'New'; statusMap[s] = (statusMap[s] || 0) + 1 })
    return { labels: Object.keys(statusMap), datasets: [{ label: 'Leads', data: Object.values(statusMap), color: '#0077B6' }] }
  }, [leads])

  const timeChart: ChartData = useMemo(() => {
    const days: Record<string, number> = {}
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      days[d.toISOString().split('T')[0]] = 0
    }
    leads.forEach(l => { const date = l.date ? l.date.split('T')[0] : ''; if (date in days) days[date]++ })
    return { labels: Object.keys(days), datasets: [{ label: 'Daily Leads', data: Object.values(days), color: '#0077B6' }] }
  }, [leads])

  const sourceChart: ChartData = useMemo(() => {
    const sourceMap: Record<string, number> = {}
    leads.forEach(l => { const s = l.source || 'Website'; sourceMap[s] = (sourceMap[s] || 0) + 1 })
    const sorted = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    return { labels: sorted.map(s => s[0]), datasets: [{ label: 'Source', data: sorted.map(s => s[1]), color: '#00C896' }] }
  }, [leads])

  const typeChart: ChartData = useMemo(() => {
    const typeMap: Record<string, number> = {}
    leads.forEach(l => { const t = l.type || 'contact'; typeMap[t] = (typeMap[t] || 0) + 1 })
    return { labels: Object.keys(typeMap), datasets: [{ label: 'Type', data: Object.values(typeMap), color: '#F59E0B' }] }
  }, [leads])

  const recentActivity = useMemo(() => {
    return leads.slice(0, 10).map(l => ({
      id: l.id,
      action: `${l.type || 'contact'} enquiry`,
      target: l.name,
      time: l.date,
    }))
  }, [leads])

  return {
    leads,
    vehicleCount,
    summary,
    statusChart,
    timeChart,
    sourceChart,
    typeChart,
    recentActivity,
    loading,
    refresh,
  }
}
