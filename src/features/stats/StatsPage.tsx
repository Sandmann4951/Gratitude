import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { MoodTrendChart } from '@/features/stats/components/MoodTrendChart'
import { StatCard } from '@/features/stats/components/StatCard'
import { averageMood, buildDailySeries, completionRate, currentStreak, longestStreak } from '@/features/stats/aggregate'
import { addDays, addMonths, dateKey, startOfMonth, startOfWeek } from '@/lib/date'

type Range = 'week' | 'month'

export function StatsPage() {
  const [range, setRange] = useState<Range>('week')
  const allEntries = useLiveQuery(() => db.entries.toArray(), [])

  const today = dateKey()
  const { startDate, endDateExclusive } =
    range === 'week'
      ? { startDate: startOfWeek(today), endDateExclusive: addDays(startOfWeek(today), 7) }
      : { startDate: startOfMonth(today), endDateExclusive: addMonths(startOfMonth(today), 1) }

  const entriesInRange = useMemo(
    () => (allEntries ?? []).filter((e) => e.date >= startDate && e.date < endDateExclusive),
    [allEntries, startDate, endDateExclusive],
  )
  const series = useMemo(() => buildDailySeries(allEntries ?? [], startDate, endDateExclusive), [allEntries, startDate, endDateExclusive])

  const avg = averageMood(entriesInRange)
  const rate = completionRate(entriesInRange, startDate, endDateExclusive)
  const streak = currentStreak(allEntries ?? [])
  const best = longestStreak(allEntries ?? [])

  if (allEntries === undefined) return null

  return (
    <div>
      <Header title="Statistik" subtitle="Dein Verlauf über Woche oder Monat." />

      <div className="space-y-4 px-4 pb-6">
        {allEntries.length === 0 ? (
          <EmptyState icon="📊" title="Noch keine Daten" description="Sobald du ein paar Einträge gemacht hast, siehst du hier deine Statistik." />
        ) : (
          <>
            <div className="flex gap-2 rounded-xl bg-cream-200 p-1 dark:bg-ink-600/60">
              {(['week', 'month'] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                    range === r ? 'bg-cream-50 text-forest-600 shadow-sm dark:bg-ink-900 dark:text-cream-100' : 'text-ink-400'
                  }`}
                >
                  {r === 'week' ? 'Diese Woche' : 'Dieser Monat'}
                </button>
              ))}
            </div>

            <Card>
              <MoodTrendChart series={series} />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Ø Stimmung" value={avg === null ? '–' : avg.toFixed(1)} hint="von 10" />
              <StatCard label="Vollständigkeit" value={`${Math.round(rate * 100)}%`} hint="ausgefüllte Einträge" />
              <StatCard label="Aktuelle Serie" value={`${streak}`} hint={streak === 1 ? 'Tag in Folge' : 'Tage in Folge'} />
              <StatCard label="Beste Serie" value={`${best}`} hint={best === 1 ? 'Tag' : 'Tage'} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
