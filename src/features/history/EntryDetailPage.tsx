import { useLiveQuery } from 'dexie-react-hooks'
import { Link, Navigate, useParams } from 'react-router-dom'
import { db } from '@/db/schema'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { PhotoThumbnail } from '@/components/PhotoThumbnail'
import { MoodSlider } from '@/components/MoodSlider'
import { formatDateDe } from '@/lib/date'
import type { Period } from '@/types'

const PERIOD_TITLE: Record<Period, string> = { morning: 'Morgen-Eintrag', evening: 'Abend-Eintrag' }

/**
 * Rein lesbare Detailansicht eines gespeicherten Eintrags. Enthält bewusst
 * keinerlei Eingabe-, Edit- oder Lösch-Elemente – das ist Teil der
 * Unveränderbarkeits-Garantie (siehe db/repository.ts).
 */
// Eindeutiger Platzhalter, um "Query lädt noch" von "Query fertig, nichts gefunden" zu unterscheiden.
const LOADING = Symbol('loading')

export function EntryDetailPage() {
  const { date, period } = useParams<{ date: string; period: string }>()
  const isValid = !!date && (period === 'morning' || period === 'evening')

  const entry = useLiveQuery(
    () => (isValid ? db.entries.where('[date+period]').equals([date, period]).first() : undefined),
    [date, period, isValid],
    LOADING,
  )

  if (!isValid) return <Navigate to="/history" replace />
  if (entry === LOADING) {
    return <div className="px-4 pt-6 text-sm text-ink-400">Wird geladen …</div>
  }
  if (!entry) {
    return (
      <div>
        <Header title="Eintrag nicht gefunden" />
        <div className="px-4">
          <Link to="/history" className="text-sm font-medium text-forest-500">
            ← Zurück zum Verlauf
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title={PERIOD_TITLE[entry.period]}
        subtitle={`${formatDateDe(entry.date)} · ${new Date(entry.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`}
      />

      <div className="space-y-3 px-4 pb-6">
        {entry.photoId && <PhotoThumbnail photoId={entry.photoId} className="h-56 w-full rounded-2xl" />}

        <Card>
          <MoodSlider value={entry.mood} onChange={() => {}} disabled />
        </Card>

        {entry.questions.map((q) => (
          <Card key={q.questionId}>
            <p className="mb-1.5 text-sm font-medium text-ink-600 dark:text-cream-100">{q.text}</p>
            <p className="whitespace-pre-wrap text-sm text-ink-900 dark:text-cream-50">{q.answer}</p>
          </Card>
        ))}

        <Link to="/history" className="block pt-2 text-center text-sm font-medium text-forest-500">
          ← Zurück zum Verlauf
        </Link>
      </div>
    </div>
  )
}
