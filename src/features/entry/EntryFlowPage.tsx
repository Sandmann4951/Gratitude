import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { createEntry, EntryAlreadyExistsError, getRecentEntriesForPeriod } from '@/db/repository'
import { QUESTIONS } from '@/data/questions'
import { selectQuestionsForPeriod } from '@/features/entry/questionSelector'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { MoodSlider } from '@/components/MoodSlider'
import { PhotoUpload } from '@/features/entry/components/PhotoUpload'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { currentPeriod, dateKey } from '@/lib/date'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { Period, Question } from '@/types'

const PERIOD_TITLES: Record<Period, string> = {
  morning: 'Morgen-Eintrag',
  evening: 'Abend-Eintrag',
}

export function EntryFlowPage() {
  const { period } = useParams<{ period: string }>()
  const navigate = useNavigate()
  const today = dateKey()
  const middayCutoff = useSettingsStore((s) => s.settings.middayCutoff)

  const isValidPeriod = period === 'morning' || period === 'evening'
  const existingEntry = useLiveQuery(
    () => (isValidPeriod ? db.entries.where('[date+period]').equals([today, period]).first() : undefined),
    [today, period, isValidPeriod],
  )

  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [mood, setMood] = useState<number | null>(null)
  const [photo, setPhoto] = useState<{ blob: Blob; mimeType: string } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isValidPeriod) return
    let cancelled = false
    getRecentEntriesForPeriod(period as Period, 15).then((recent) => {
      if (cancelled) return
      setQuestions(selectQuestionsForPeriod(QUESTIONS, period as Period, recent))
    })
    return () => {
      cancelled = true
    }
  }, [period, isValidPeriod])

  if (!isValidPeriod) return <Navigate to="/" replace />
  // Nur der aktuelle Zeit-Slot darf ausgefüllt werden – kein rückwirkendes Nachtragen.
  if (period !== currentPeriod(middayCutoff)) return <Navigate to="/" replace />
  // Für heute+Slot existiert bereits ein (unveränderlicher) Eintrag -> nur Ansicht.
  if (existingEntry) return <Navigate to={`/history/${today}/${period}`} replace />

  const allAnswered = questions !== null && questions.every((q) => (answers[q.id] ?? '').trim().length > 0)
  const canSubmit = allAnswered && mood !== null && !saving

  async function handleConfirmedSave() {
    if (!questions || mood === null) return
    setSaving(true)
    setError(null)
    try {
      const entry = await createEntry({
        date: today,
        period: period as Period,
        mood,
        questions: questions.map((q) => ({ questionId: q.id, text: q.text, answer: answers[q.id].trim() })) as [
          { questionId: string; text: string; answer: string },
          { questionId: string; text: string; answer: string },
          { questionId: string; text: string; answer: string },
        ],
        photo: photo ?? undefined,
      })
      navigate(`/history/${entry.date}/${entry.period}`, { replace: true })
    } catch (err) {
      if (err instanceof EntryAlreadyExistsError) {
        navigate(`/history/${today}/${period}`, { replace: true })
        return
      }
      setError('Der Eintrag konnte nicht gespeichert werden. Bitte versuch es noch einmal.')
      setSaving(false)
    }
  }

  return (
    <div>
      <Header title={PERIOD_TITLES[period as Period]} subtitle="Drei kurze Fragen, ganz für dich." />

      <div className="space-y-3 px-4">
        {questions === null ? (
          <Card className="text-center text-sm text-ink-400">Fragen werden geladen …</Card>
        ) : (
          questions.map((q, i) => (
            <Card key={q.id}>
              <label htmlFor={`q-${q.id}`} className="mb-2 block text-sm font-medium text-ink-600 dark:text-cream-100">
                {i + 1}. {q.text}
              </label>
              <textarea
                id={`q-${q.id}`}
                rows={3}
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder="Deine Antwort …"
                className="w-full resize-none rounded-xl border border-forest-100 bg-cream-50 p-3 text-sm text-ink-900 outline-none focus:border-forest-400 dark:border-ink-600 dark:bg-ink-600/40 dark:text-cream-100"
              />
            </Card>
          ))
        )}

        <Card>
          <MoodSlider value={mood} onChange={setMood} />
        </Card>

        <Card>
          <PhotoUpload value={photo} onChange={setPhoto} />
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={() => setConfirmOpen(true)} disabled={!canSubmit} className="w-full">
          Eintrag speichern
        </Button>
        <p className="pb-4 text-center text-xs text-ink-400">
          Nach dem Speichern kann der Eintrag nicht mehr geändert werden.
        </p>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eintrag speichern?"
        description="Dein Eintrag wird ab jetzt dauerhaft gespeichert und kann danach nicht mehr bearbeitet werden – nur noch angesehen."
        confirmLabel={saving ? 'Wird gespeichert …' : 'Speichern'}
        onConfirm={() => {
          setConfirmOpen(false)
          void handleConfirmedSave()
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
