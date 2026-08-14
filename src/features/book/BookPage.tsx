import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '@/db/schema'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { PhotoThumbnail } from '@/components/PhotoThumbnail'
import { dateKey, formatDateDe } from '@/lib/date'
import { moodEmoji, moodLabel } from '@/lib/mood'
import type { Period } from '@/types'

type Range = 'month' | 'year' | 'all'

const PERIOD_LABEL: Record<Period, string> = { morning: 'Morgens', evening: 'Abends' }
const RANGE_LABEL: Record<Range, string> = { month: 'Dieser Monat', year: 'Dieses Jahr', all: 'Alle Einträge' }

/**
 * Druck-/PDF-Ansicht: fasst einen Zeitraum als lesbares "Dankbarkeitsbuch" zusammen.
 * Es gibt bewusst keinen eigenen PDF-Generator – `window.print()` plus einem
 * gedruckten Stylesheet lässt jeden Browser (auch mobil, über den nativen
 * Druckdialog "Als PDF sichern") ohne zusätzliche Abhängigkeit ein PDF erzeugen.
 */
export function BookPage() {
  const [range, setRange] = useState<Range>('year')
  const allEntries = useLiveQuery(() => db.entries.orderBy('date').toArray(), [])

  const today = dateKey()
  const filtered = useMemo(() => {
    if (!allEntries) return []
    if (range === 'all') return allEntries
    const prefix = range === 'year' ? today.slice(0, 4) : today.slice(0, 7) // "YYYY" bzw. "YYYY-MM"
    return allEntries.filter((e) => e.date.startsWith(prefix))
  }, [allEntries, range, today])

  if (allEntries === undefined) return null

  return (
    <div className="book-page">
      <Header title="Als Buch exportieren" subtitle="Zum Drucken oder als PDF speichern." />

      <div className="space-y-4 px-4 pb-4 print:hidden">
        <div className="flex gap-1 rounded-full bg-cream-200 p-1.5 dark:bg-ink-600/60">
          {(['month', 'year', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all ${
                range === r ? 'bg-paper text-forest-600 shadow-md dark:bg-ink-900 dark:text-cream-100' : 'text-ink-400'
              }`}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>

        <Button onClick={() => window.print()} disabled={filtered.length === 0} className="w-full">
          Drucken / als PDF speichern
        </Button>
        <Link to="/settings" className="block text-center text-sm font-medium text-ink-400">
          ← Zurück zu den Einstellungen
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4">
          <EmptyState icon="📖" title="Keine Einträge in diesem Zeitraum" />
        </div>
      ) : (
        <div className="px-4 pb-8 print:max-w-none print:px-0">
          <div className="mb-8 text-center print:mb-12">
            <p className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-cream-100">
              Mein Dankbarkeitstagebuch
            </p>
            <p className="mt-1 text-sm text-ink-400">
              {RANGE_LABEL[range]} · {filtered.length} {filtered.length === 1 ? 'Eintrag' : 'Einträge'}
            </p>
          </div>

          <div className="space-y-6 print:space-y-10">
            {filtered.map((entry) => (
              <article
                key={entry.id}
                className="break-inside-avoid border-b border-ink-400/15 pb-6 last:border-none print:border-none"
              >
                <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  {formatDateDe(entry.date)} · {PERIOD_LABEL[entry.period]}
                </p>
                <p className="mt-1 text-sm text-ink-900 dark:text-cream-100">
                  <span aria-hidden>{moodEmoji(entry.mood)}</span> {entry.mood}/10 · {moodLabel(entry.mood)}
                </p>

                {entry.dayPhotoId && (
                  <div className="mt-3">
                    <PhotoThumbnail
                      photoId={entry.dayPhotoId}
                      alt="Bild des Tages"
                      className="h-48 w-full rounded-xl object-cover print:h-64"
                    />
                    {entry.dayPhotoCaption && <p className="mt-1 text-xs text-ink-400 italic">{entry.dayPhotoCaption}</p>}
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  {entry.questions.map((q) => (
                    <div key={q.questionId}>
                      <p className="text-sm font-medium text-ink-600 dark:text-cream-100">{q.text}</p>
                      <p className="mt-0.5 text-sm whitespace-pre-wrap text-ink-900 dark:text-cream-50">{q.answer}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
