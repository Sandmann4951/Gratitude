import { Link } from 'react-router-dom'
import { useReminderScheduler } from '@/features/reminders/useReminderScheduler'
import { useUiStore } from '@/store/useUiStore'
import { dateKey } from '@/lib/date'

const LABEL = { morning: 'deinen Morgen-Eintrag', evening: 'deinen Abend-Eintrag' } as const

/** Zuverlässiger In-App-Hinweis, wenn ein Eintrag fällig ist – funktioniert unabhängig von Notification-Berechtigungen. */
export function ReminderBanner() {
  const duePeriod = useReminderScheduler()
  const dismissed = useUiStore((s) => s.dismissedReminderDates)
  const dismiss = useUiStore((s) => s.dismissReminder)
  const today = dateKey()
  const dismissKey = duePeriod ? `${today}:${duePeriod}` : null

  if (!duePeriod || !dismissKey || dismissed.has(dismissKey)) return null

  return (
    <div className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-xl bg-amber-100 px-4 py-3 text-sm dark:bg-ink-600">
      <div>
        <span aria-hidden>⏰ </span>
        Zeit für {LABEL[duePeriod]}!
      </div>
      <div className="flex items-center gap-2">
        <Link to={`/entry/${duePeriod}`} className="rounded-lg bg-forest-500 px-3 py-1.5 font-medium text-white">
          Los geht's
        </Link>
        <button
          type="button"
          onClick={() => dismiss(dismissKey)}
          aria-label="Erinnerung ausblenden"
          className="px-1 text-ink-400"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
