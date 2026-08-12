import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '@/db/schema'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { ReminderBanner } from '@/features/reminders/ReminderBanner'
import { currentPeriod, dateKey, formatDateDe } from '@/lib/date'
import { moodEmoji } from '@/lib/mood'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { JournalEntry, Period } from '@/types'

const PERIOD_META: Record<Period, { label: string; icon: string; hint: string }> = {
  morning: { label: 'Morgens', icon: '🌅', hint: 'Blick nach vorn' },
  evening: { label: 'Abends', icon: '🌙', hint: 'Rückblick auf den Tag' },
}

export function HomePage() {
  const today = dateKey()
  const middayCutoff = useSettingsStore((s) => s.settings.middayCutoff)
  const active = currentPeriod(middayCutoff)

  const todaysEntries = useLiveQuery(() => db.entries.where('date').equals(today).toArray(), [today])

  const byPeriod = new Map<Period, JournalEntry>()
  todaysEntries?.forEach((e) => byPeriod.set(e.period, e))

  return (
    <div>
      <Header title="Dankbarkeitstagebuch" subtitle={formatDateDe(today)} />
      <ReminderBanner />

      <div className="space-y-3 px-4">
        {(['morning', 'evening'] as Period[]).map((period) => {
          const entry = byPeriod.get(period)
          const meta = PERIOD_META[period]
          const isActive = period === active
          // "Verpasst" gilt nur für den Morgen-Slot, wenn wir schon im Abend-Slot sind –
          // der Abend-Slot am Morgen ist nicht "verpasst", sondern einfach noch nicht dran.
          const isMissed = !entry && !isActive && period === 'morning' && active === 'evening'

          return (
            <Card key={period}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {meta.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-cream-100">{meta.label}</p>
                    <p className="text-xs text-ink-400">{meta.hint}</p>
                  </div>
                </div>
                {entry && (
                  <span className="text-2xl" aria-label="Erledigt" title="Erledigt">
                    {moodEmoji(entry.mood)}
                  </span>
                )}
              </div>

              <div className="mt-3">
                {entry ? (
                  <Link
                    to={`/history/${entry.date}/${entry.period}`}
                    className="block rounded-xl bg-forest-50 px-3 py-2.5 text-center text-sm font-medium text-forest-600 dark:bg-ink-600 dark:text-cream-100"
                  >
                    Eintrag ansehen
                  </Link>
                ) : isActive ? (
                  <Link
                    to={`/entry/${period}`}
                    className="block rounded-xl bg-forest-500 px-3 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Jetzt eintragen
                  </Link>
                ) : isMissed ? (
                  <p className="rounded-xl bg-cream-200 px-3 py-2.5 text-center text-sm text-ink-400 dark:bg-ink-600/60">
                    Für heute verpasst
                  </p>
                ) : (
                  <p className="rounded-xl bg-cream-200 px-3 py-2.5 text-center text-sm text-ink-400 dark:bg-ink-600/60">
                    Später verfügbar
                  </p>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
