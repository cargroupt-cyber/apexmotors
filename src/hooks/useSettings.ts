import { useState, useEffect, useCallback } from 'react'
import {
  getSettings,
  saveSettings,
  getProfile,
  saveProfile,
  subscribe,
} from '@/lib/store'
import type { BusinessSettings, UserProfile } from '@/lib/store'

export function useSettings() {
  const [settings, setSettingsState] = useState<BusinessSettings>(getSettings())
  const [profile, setProfileState] = useState<UserProfile>(getProfile())

  useEffect(() => {
    return subscribe(() => {
      setSettingsState(getSettings())
      setProfileState(getProfile())
    })
  }, [])

  const updateSettings = useCallback((newSettings: Partial<BusinessSettings>) => {
    const current = getSettings()
    const merged = { ...current, ...newSettings }
    saveSettings(merged)
    setSettingsState(merged)
  }, [])

  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    const current = getProfile()
    const merged = { ...current, ...newProfile }
    saveProfile(merged)
    setProfileState(merged)
  }, [])

  return {
    settings,
    profile,
    updateSettings,
    updateProfile,
  }
}

export type { BusinessSettings, UserProfile }
