// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save, CheckCircle, Globe, Bell, Shield, Palette,
  User, Building2, Image, Megaphone, BarChart3, HelpCircle,
  RefreshCw,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface BusinessSettings {
  dealershipName: string
  address: string
  phone: string
  email: string
  vatNumber: string
  openingHours: { day: string; open: string; close: string; closed: boolean }[]
  socialMedia: { facebook: string; instagram: string; twitter: string; youtube: string; linkedin: string }
  seoDefaults: { metaTitle: string; metaDescription: string }
}

const DEFAULT_SETTINGS: BusinessSettings = {
  dealershipName: 'APEX Automotive',
  address: '123 Motorway Lane, London, EC1A 1BB',
  phone: '0800 123 4567',
  email: 'hello@apexauto.co.uk',
  vatNumber: 'GB 123 4567 89',
  openingHours: [
    { day: 'Monday', open: '09:00', close: '18:00', closed: false },
    { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
    { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
    { day: 'Thursday', open: '09:00', close: '19:00', closed: false },
    { day: 'Friday', open: '09:00', close: '19:00', closed: false },
    { day: 'Saturday', open: '09:00', close: '17:00', closed: false },
    { day: 'Sunday', open: '10:00', close: '16:00', closed: false },
  ],
  socialMedia: { facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '' },
  seoDefaults: { metaTitle: 'APEX Automotive | Premium Used Cars UK', metaDescription: 'Find your perfect car at APEX Automotive. RAC-approved vehicles, best price guarantee, same-day drive away.' },
}

/* ═══════════════════════════════════════════
   SETTINGS PAGE — Supabase Sync
   ═══════════════════════════════════════════ */

export default function AdminSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('business')

  /* Load settings from Supabase on mount */
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'business')
      .single()

    if (!error && data?.value) {
      setSettings({ ...DEFAULT_SETTINGS, ...data.value })
    }
    setLoading(false)
  }

  /* Save to Supabase */
  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'business', value: settings, updated_at: new Date().toISOString() })

    if (error) {
      console.error('Save settings error:', error)
      // Fallback: save to localStorage
      localStorage.setItem('apex_settings', JSON.stringify(settings))
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateSettings = (patch: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }

  const updateHours = (index: number, field: string, value: any) => {
    const hours = [...settings.openingHours]
    hours[index] = { ...hours[index], [field]: value }
    updateSettings({ openingHours: hours })
  }

  const updateSocial = (platform: string, value: string) => {
    updateSettings({ socialMedia: { ...settings.socialMedia, [platform]: value } })
  }

  const tabs = [
    { key: 'business', label: 'Business Info', icon: Building2 },
    { key: 'hours', label: 'Opening Hours', icon: Globe },
    { key: 'social', label: 'Social Media', icon: Megaphone },
    { key: 'seo', label: 'SEO', icon: BarChart3 },
  ]

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
          <h1 className="font-display font-bold text-2xl text-pure-white">Settings</h1>
          <p className="text-chrome text-sm mt-1">Manage your dealership settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadSettings} className="px-4 py-2 bg-obsidian/60 border border-slate/15 rounded-xl text-sm text-chrome hover:text-pure-white hover:border-electric-blue transition-all flex items-center gap-2">
            <RefreshCw size={14} /> Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-electric-blue text-pure-white rounded-xl text-sm font-medium hover:bg-blue-glow transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Saved toast */}
      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20">
          <CheckCircle size={16} className="text-success" />
          <span className="text-sm text-success font-medium">Settings saved successfully</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-electric-blue/10 border-electric-blue/30 text-pure-white'
                : 'bg-obsidian/40 border-slate/10 text-chrome hover:border-slate/30'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Business Info Tab */}
      {activeTab === 'business' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 max-w-[700px]">
          <h2 className="font-display font-semibold text-lg text-pure-white mb-5">Business Information</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Dealership Name', key: 'dealershipName', type: 'text' },
              { label: 'Address', key: 'address', type: 'textarea' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'VAT Number', key: 'vatNumber', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm text-chrome mb-1.5">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={settings[field.key as keyof BusinessSettings] as string}
                    onChange={e => updateSettings({ [field.key]: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue transition-all resize-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={settings[field.key as keyof BusinessSettings] as string}
                    onChange={e => updateSettings({ [field.key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Opening Hours Tab */}
      {activeTab === 'hours' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 max-w-[700px]">
          <h2 className="font-display font-semibold text-lg text-pure-white mb-5">Opening Hours</h2>
          <div className="flex flex-col gap-3">
            {settings.openingHours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-3 p-3 rounded-xl bg-obsidian/40 border border-slate/10">
                <span className="text-sm text-pure-white font-medium w-24">{h.day}</span>
                <input type="checkbox" checked={!h.closed} onChange={e => updateHours(i, 'closed', !e.target.checked)} className="w-4 h-4 accent-electric-blue" />
                <span className="text-xs text-chrome mr-2">Open</span>
                <input
                  type="time"
                  value={h.open}
                  onChange={e => updateHours(i, 'open', e.target.value)}
                  disabled={h.closed}
                  className="px-2 py-1.5 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue disabled:opacity-30"
                />
                <span className="text-chrome">—</span>
                <input
                  type="time"
                  value={h.close}
                  onChange={e => updateHours(i, 'close', e.target.value)}
                  disabled={h.closed}
                  className="px-2 py-1.5 rounded-lg bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue disabled:opacity-30"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 max-w-[700px]">
          <h2 className="font-display font-semibold text-lg text-pure-white mb-5">Social Media Links</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Facebook', key: 'facebook' },
              { label: 'Instagram', key: 'instagram' },
              { label: 'Twitter / X', key: 'twitter' },
              { label: 'YouTube', key: 'youtube' },
              { label: 'LinkedIn', key: 'linkedin' },
            ].map(social => (
              <div key={social.key}>
                <label className="block text-sm text-chrome mb-1.5">{social.label}</label>
                <input
                  type="url"
                  value={settings.socialMedia[social.key as keyof typeof settings.socialMedia]}
                  onChange={e => updateSocial(social.key, e.target.value)}
                  placeholder={`https://${social.key}.com/yourpage`}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm placeholder-slate outline-none focus:border-electric-blue transition-all"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 max-w-[700px]">
          <h2 className="font-display font-semibold text-lg text-pure-white mb-5">SEO Defaults</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-chrome mb-1.5">Default Meta Title</label>
              <input
                type="text"
                value={settings.seoDefaults.metaTitle}
                onChange={e => updateSettings({ seoDefaults: { ...settings.seoDefaults, metaTitle: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue transition-all"
              />
              <p className="text-xs text-chrome mt-1">{settings.seoDefaults.metaTitle.length}/60 characters</p>
            </div>
            <div>
              <label className="block text-sm text-chrome mb-1.5">Default Meta Description</label>
              <textarea
                value={settings.seoDefaults.metaDescription}
                onChange={e => updateSettings({ seoDefaults: { ...settings.seoDefaults, metaDescription: e.target.value } })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[rgba(0,8,20,0.6)] border border-slate/20 text-pure-white text-sm outline-none focus:border-electric-blue transition-all resize-none"
              />
              <p className="text-xs text-chrome mt-1">{settings.seoDefaults.metaDescription.length}/160 characters</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
