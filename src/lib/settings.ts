import type { ReminderSettings } from '@/types'

const STORAGE_KEY = 'gratitude-journal:settings'

export const DEFAULT_SETTINGS: ReminderSettings = {
  remindersEnabled: false,
  morningReminderTime: '08:00',
  eveningReminderTime: '20:00',
  middayCutoff: '15:00',
}

export function loadSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<ReminderSettings>) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: ReminderSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
