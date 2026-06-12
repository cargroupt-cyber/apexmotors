// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'
import type { BusinessSettings, UserProfile } from '@/lib/store'
import {
  User,
  Building2,
  Clock,
  Share2,
  Search,
  Save,
  Check,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Receipt,
} from 'lucide-react'

type SettingTab = 'profile' | 'business' | 'hours' | 'social' | 'seo'

const tabs: { key: SettingTab; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'business', label: 'Business', icon: Building2 },
  { key: 'hours', label: 'Opening Hours', icon: Clock },
  { key: 'social', label: 'Social Media', icon: Share2 },
  { key: 'seo', label: 'SEO Defaults', icon: Search },
]

export default function AdminSettingsContent() {
  const { settings, profile, updateSettings, updateProfile } = useSettings()
  const [activeTab, setActiveTab] = useState<SettingTab>('profile')
  const [localProfile, setLocalProfile] = useState<UserProfile>({ ...profile })
  const [localBusiness, setLocalBusiness] = useState<BusinessSettings>({ ...settings })
  const [saved, setSaved] = useState(false)

  // Sync local state when external data changes
  useEffect(() => {
    setLocalProfile({ ...profile })
  }, [profile])

  useEffect(() => {
    setLocalBusiness({ ...settings })
  }, [settings])

  function handleSave() {
    updateSettings(localBusiness)
    updateProfile(localProfile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updateHours(index: number, field: string, value: string | boolean) {
    setLocalBusiness((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    }))
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Settings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-[#5C677D] mt-0.5"
        >
          Manage your account and dealership settings
        </motion.p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:w-56 flex-shrink-0"
        >
          <div className="glass rounded-xl p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[#0077B6]/15 text-[#00B4D8]'
                      : 'text-[#C8D3D9] hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-[#00B4D8]' : 'text-[#5C677D]')} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </motion.nav>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 glass rounded-xl p-6"
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Profile Settings</h2>
                <p className="text-sm text-[#5C677D]">Update your personal information</p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#0077B6] flex items-center justify-center text-xl font-bold text-white">
                  {localProfile.avatar || localProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{localProfile.name}</p>
                  <p className="text-xs text-[#5C677D]">{localProfile.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input value={localProfile.name} onChange={(e) => setLocalProfile((p) => ({ ...p, name: e.target.value }))} className="input-admin" />
                </Field>
                <Field label="Email">
                  <input type="email" value={localProfile.email} onChange={(e) => setLocalProfile((p) => ({ ...p, email: e.target.value }))} className="input-admin" />
                </Field>
                <Field label="Phone">
                  <input value={localProfile.phone} onChange={(e) => setLocalProfile((p) => ({ ...p, phone: e.target.value }))} className="input-admin" />
                </Field>
                <Field label="Role">
                  <input value={localProfile.role} disabled className="input-admin opacity-50 cursor-not-allowed" />
                </Field>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Business Settings</h2>
                <p className="text-sm text-[#5C677D]">Your dealership information</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Dealership Name">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.dealershipName} onChange={(e) => setLocalBusiness((p) => ({ ...p, dealershipName: e.target.value }))} className="input-admin pl-9" />
                  </div>
                </Field>
                <Field label="VAT Number">
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.vatNumber} onChange={(e) => setLocalBusiness((p) => ({ ...p, vatNumber: e.target.value }))} className="input-admin pl-9" />
                  </div>
                </Field>
                <Field label="Address">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.address} onChange={(e) => setLocalBusiness((p) => ({ ...p, address: e.target.value }))} className="input-admin pl-9" />
                  </div>
                </Field>
                <Field label="Phone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.phone} onChange={(e) => setLocalBusiness((p) => ({ ...p, phone: e.target.value }))} className="input-admin pl-9" />
                  </div>
                </Field>
                <Field label="Email" className="sm:col-span-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input type="email" value={localBusiness.email} onChange={(e) => setLocalBusiness((p) => ({ ...p, email: e.target.value }))} className="input-admin pl-9" />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Opening Hours Tab */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Opening Hours</h2>
                <p className="text-sm text-[#5C677D]">Configure when your dealership is open</p>
              </div>

              <div className="space-y-3">
                {localBusiness.openingHours.map((h, i) => (
                  <div
                    key={h.day}
                    className={cn(
                      'flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all',
                      h.closed
                        ? 'bg-[#FF4D6D]/5 border-[#FF4D6D]/15'
                        : 'bg-[#001233]/40 border-[#33415C]/20'
                    )}
                  >
                    <div className="flex items-center gap-3 sm:w-32">
                      <button
                        onClick={() => updateHours(i, 'closed', !h.closed)}
                        className={cn(
                          'w-10 h-6 rounded-full transition-colors relative flex-shrink-0',
                          h.closed ? 'bg-[#33415C]' : 'bg-[#0077B6]'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm',
                            h.closed ? 'left-0.5' : 'left-[18px]'
                          )}
                        />
                      </button>
                      <span className="text-sm font-medium text-white">{h.day}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      {h.closed ? (
                        <span className="text-sm text-[#FF4D6D]">Closed</span>
                      ) : (
                        <>
                          <input
                            type="time"
                            value={h.open}
                            onChange={(e) => updateHours(i, 'open', e.target.value)}
                            className="input-admin w-auto"
                          />
                          <span className="text-[#5C677D]">to</span>
                          <input
                            type="time"
                            value={h.close}
                            onChange={(e) => updateHours(i, 'close', e.target.value)}
                            className="input-admin w-auto"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Social Media Links</h2>
                <p className="text-sm text-[#5C677D]">Connect your social media profiles</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Facebook">
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.socialMedia.facebook} onChange={(e) => setLocalBusiness((p) => ({ ...p, socialMedia: { ...p.socialMedia, facebook: e.target.value } }))} className="input-admin pl-9" placeholder="https://facebook.com/..." />
                  </div>
                </Field>
                <Field label="Instagram">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.socialMedia.instagram} onChange={(e) => setLocalBusiness((p) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: e.target.value } }))} className="input-admin pl-9" placeholder="https://instagram.com/..." />
                  </div>
                </Field>
                <Field label="Twitter / X">
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.socialMedia.twitter} onChange={(e) => setLocalBusiness((p) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: e.target.value } }))} className="input-admin pl-9" placeholder="https://twitter.com/..." />
                  </div>
                </Field>
                <Field label="YouTube">
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.socialMedia.youtube} onChange={(e) => setLocalBusiness((p) => ({ ...p, socialMedia: { ...p.socialMedia, youtube: e.target.value } }))} className="input-admin pl-9" placeholder="https://youtube.com/..." />
                  </div>
                </Field>
                <Field label="LinkedIn" className="sm:col-span-2">
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C677D]" />
                    <input value={localBusiness.socialMedia.linkedin} onChange={(e) => setLocalBusiness((p) => ({ ...p, socialMedia: { ...p.socialMedia, linkedin: e.target.value } }))} className="input-admin pl-9" placeholder="https://linkedin.com/..." />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">SEO Defaults</h2>
                <p className="text-sm text-[#5C677D]">Default SEO settings for your website</p>
              </div>

              <div className="space-y-4 max-w-2xl">
                <Field label="Default Meta Title">
                  <input value={localBusiness.seoDefaults.metaTitle} onChange={(e) => setLocalBusiness((p) => ({ ...p, seoDefaults: { ...p.seoDefaults, metaTitle: e.target.value } }))} className="input-admin" />
                  <p className="text-[11px] text-[#5C677D] mt-1">{localBusiness.seoDefaults.metaTitle.length} / 60 characters</p>
                </Field>
                <Field label="Default Meta Description">
                  <textarea value={localBusiness.seoDefaults.metaDescription} onChange={(e) => setLocalBusiness((p) => ({ ...p, seoDefaults: { ...p.seoDefaults, metaDescription: e.target.value } }))} className="input-admin min-h-[80px] resize-y" />
                  <p className="text-[11px] text-[#5C677D] mt-1">{localBusiness.seoDefaults.metaDescription.length} / 160 characters</p>
                </Field>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-8 pt-6 border-t border-[#33415C]/20 flex items-center gap-3">
            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                saved
                  ? 'bg-[#00C896] text-white'
                  : 'bg-[#0077B6] hover:bg-[#0077B6]/90 text-white shadow-lg shadow-[#0077B6]/20'
              )}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .input-admin {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.75rem;
          border-radius: 0.5rem;
          background: rgba(0, 8, 20, 0.5);
          border: 1px solid rgba(92, 103, 125, 0.3);
          color: #E5E5E5;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.25s ease-out;
        }
        .input-admin::placeholder {
          color: #5C677D;
        }
        .input-admin:focus {
          border-color: rgba(0, 119, 182, 0.5);
          box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.15);
        }
        .input-admin option {
          background: #001233;
          color: #E5E5E5;
        }
        select.input-admin {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C677D' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2rem;
        }
        textarea.input-admin {
          height: auto;
          padding: 0.625rem 0.75rem;
        }
      `}</style>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-[#C8D3D9] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
