import { create } from 'zustand'
import type { ReminderSettings } from '@/types'
import { loadSettings, saveSettings } from '@/lib/settings'
import { mirrorPrefs } from '@/db/repository'

interface SettingsState {
  settings: ReminderSettings
  update: (patch: Partial<ReminderSettings>) => void
}

const initial = loadSettings()
// Einmalig beim Start spiegeln, damit der Service Worker auch ohne vorherige
// Änderung stets aktuelle Werte in IndexedDB vorfindet.
void mirrorPrefs(initial)

/** Reaktiver Wrapper um die in localStorage persistierten Erinnerungs-Einstellungen. */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: initial,
  update: (patch) => {
    const next = { ...get().settings, ...patch }
    saveSettings(next)
    void mirrorPrefs(next)
    set({ settings: next })
  },
}))
