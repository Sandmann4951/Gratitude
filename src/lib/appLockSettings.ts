import type { AppLockSettings } from '@/types'

const STORAGE_KEY = 'gratitude-journal:applock'

export const DEFAULT_APP_LOCK_SETTINGS: AppLockSettings = {
  enabled: false,
  pinSalt: '',
  pinHash: '',
  biometricEnabled: false,
  biometricCredentialId: null,
}

export function loadAppLockSettings(): AppLockSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_APP_LOCK_SETTINGS
    return { ...DEFAULT_APP_LOCK_SETTINGS, ...(JSON.parse(raw) as Partial<AppLockSettings>) }
  } catch {
    return DEFAULT_APP_LOCK_SETTINGS
  }
}

export function saveAppLockSettings(settings: AppLockSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
