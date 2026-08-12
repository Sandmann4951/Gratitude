import { create } from 'zustand'
import { dateKey, startOfMonth } from '@/lib/date'

interface UiState {
  /** "YYYY-MM-DD" (auf 1. des Monats normalisiert) – aktuell angezeigter Monat in der History. */
  historyMonth: string
  setHistoryMonth: (month: string) => void
  /** Datums-Keys, für die der Reminder-Banner in dieser Sitzung bereits weggeklickt wurde. */
  dismissedReminderDates: Set<string>
  dismissReminder: (date: string) => void
}

export const useUiStore = create<UiState>((set, get) => ({
  historyMonth: startOfMonth(dateKey()),
  setHistoryMonth: (month) => set({ historyMonth: month }),
  dismissedReminderDates: new Set(),
  dismissReminder: (date) => {
    const next = new Set(get().dismissedReminderDates)
    next.add(date)
    set({ dismissedReminderDates: next })
  },
}))
