import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { useSettingsStore } from '@/store/useSettingsStore'
import { currentPeriod, dateKey, minutesNow, parseTimeToMinutes } from '@/lib/date'
import { showLocalNotification } from '@/features/reminders/notifications'
import type { Period, ReminderSettings } from '@/types'

const CHECK_INTERVAL_MS = 5 * 60 * 1000
const NOTIFIED_KEY_PREFIX = 'gratitude-journal:notified:'

function isReminderDue(settings: ReminderSettings, now: Date): Period | null {
  const period = currentPeriod(settings.middayCutoff, now)
  const reminderTime = period === 'morning' ? settings.morningReminderTime : settings.eveningReminderTime
  return minutesNow(now) >= parseTimeToMinutes(reminderTime) ? period : null
}

/**
 * Vordergrund-Reminder-Check: prüft beim Mount, bei Sichtbarkeitswechsel und
 * alle 5 Minuten, ob eine Erinnerung fällig ist. Das ist der VERLÄSSLICHE
 * Mechanismus – er hängt nur davon ab, dass die App offen ist, nicht von
 * Benachrichtigungs-Berechtigungen oder Background-APIs (wichtig v.a. für iOS).
 * Zusätzlich wird – falls Berechtigung erteilt – einmal pro Tag+Slot eine
 * native Benachrichtigung ausgelöst.
 */
export function useReminderScheduler(): Period | null {
  const settings = useSettingsStore((s) => s.settings)
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), CHECK_INTERVAL_MS)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') setTick((t) => t + 1)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const today = dateKey()
  const due = settings.remindersEnabled ? isReminderDue(settings, new Date()) : null

  const entryExists = useLiveQuery(
    () => (due ? db.entries.where('[date+period]').equals([today, due]).first() : undefined),
    [today, due],
  )

  const duePeriod = due && !entryExists ? due : null

  useEffect(() => {
    if (!duePeriod) return
    const notifiedKey = `${NOTIFIED_KEY_PREFIX}${today}:${duePeriod}`
    if (localStorage.getItem(notifiedKey)) return
    localStorage.setItem(notifiedKey, '1')
    const label = duePeriod === 'morning' ? 'deinen Morgen-Eintrag' : 'deinen Abend-Eintrag'
    void showLocalNotification('Zeit für dein Dankbarkeitstagebuch', {
      body: `Zeit für ${label}.`,
      tag: notifiedKey,
    })
  }, [duePeriod, today])

  return duePeriod
}
