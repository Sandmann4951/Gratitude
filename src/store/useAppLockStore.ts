import { create } from 'zustand'
import type { AppLockSettings } from '@/types'
import { loadAppLockSettings, saveAppLockSettings } from '@/lib/appLockSettings'

interface AppLockState {
  config: AppLockSettings
  /** true = Sperrbildschirm muss zuerst durchlaufen werden. */
  locked: boolean
  setConfig: (patch: Partial<AppLockSettings>) => void
  unlock: () => void
  lock: () => void
}

const initial = loadAppLockSettings()

/** Reaktiver Wrapper um die in localStorage persistierte App-Sperre. */
export const useAppLockStore = create<AppLockState>((set, get) => ({
  config: initial,
  locked: initial.enabled,
  setConfig: (patch) => {
    const next = { ...get().config, ...patch }
    saveAppLockSettings(next)
    set({ config: next })
  },
  unlock: () => set({ locked: false }),
  lock: () => set((s) => (s.config.enabled ? { locked: true } : s)),
}))

// Beim Verlassen der App (Tab-Wechsel, Home-Button, Bildschirm sperren) erneut
// sperren – wie bei nativen Apps üblich, damit die Sperre tatsächlich schützt.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') useAppLockStore.getState().lock()
  })
}
