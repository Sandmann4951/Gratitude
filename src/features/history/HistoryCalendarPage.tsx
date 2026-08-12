import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '@/db/schema'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { CalendarGrid } from '@/features/history/components/CalendarGrid'
import { addMonths, formatDateDe, formatMonthDe } from '@/lib/date'
import { moodEmoji } from '@/lib/mood'
import { useUiStore } from '@/store/useUiStore'
import type { JournalEntry, Period } from '@/types'

const PERIOD_LABEL: Record<Period, string> = { morning: 'Morgens', evening: 'Abends' }

export function HistoryCalendarPage() {
  const month = useUiStore((s) => s.historyMonth)
  const setMonth = useUiStore((s) => s.setHistoryMonth)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthEntries = useLiveQuery(() => {
    const nextMonth = addMonths(month, 1)
    return db.entries.where('date').between(month, nextMonth, true, false).toArray()
  }, [month])

  const hasAnyEntries = useLiveQuery(() => db.entries.limit(1).count(), [])

  const entriesByDate = useMemo(() => {
    const map = new Map<string, { morning?: JournalEntry; evening?: JournalEntry }>()
    for (const e of monthEntries ?? []) {
      const existing = map.get(e.date) ?? {}
      existing[e.period] = e
      map.set(e.date, existing)
    }
    return map
  }, [monthEntries])

  const selectedEntries = selectedDate ? entriesByDate.get(selectedDate) : undefined

  return (
    <div>
      <Header title="Verlauf" subtitle="Deine bisherigen Einträge – nur zum Ansehen." />

      <div className="space-y-4 px-4 pb-4">
        {hasAnyEntries === 0 ? (
          <EmptyState icon="📖" title="Noch keine Einträge" description="Sobald du deinen ersten Eintrag speicherst, erscheint er hier." />
        ) : (
          <>
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMonth(addMonths(month, -1))}
                  aria-label="Vorheriger Monat"
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600/60"
                >
                  ←
                </button>
                <p className="font-medium text-ink-900 dark:text-cream-100">{formatMonthDe(month)}</p>
                <button
                  type="button"
                  onClick={() => setMonth(addMonths(month, 1))}
                  aria-label="Nächster Monat"
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600/60"
                >
                  →
                </button>
              </div>
              <CalendarGrid
                month={month}
                entriesByDate={entriesByDate}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d === selectedDate ? null : d)}
              />
            </Card>

            {selectedDate && (
              <Card>
                <p className="mb-2 text-sm font-medium text-ink-600 dark:text-cream-100">{formatDateDe(selectedDate)}</p>
                {selectedEntries?.morning || selectedEntries?.evening ? (
                  <div className="space-y-2">
                    {(['morning', 'evening'] as Period[]).map((period) => {
                      const entry = selectedEntries?.[period]
                      if (!entry) return null
                      return (
                        <Link
                          key={period}
                          to={`/history/${selectedDate}/${period}`}
                          className="flex items-center justify-between rounded-xl bg-cream-200 px-3 py-2.5 text-sm dark:bg-ink-600/60"
                        >
                          <span className="text-ink-600 dark:text-cream-100">{PERIOD_LABEL[period]}</span>
                          <span aria-hidden>{moodEmoji(entry.mood)}</span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-ink-400">An diesem Tag gibt es keinen Eintrag.</p>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
