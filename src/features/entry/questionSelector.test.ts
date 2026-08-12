import { describe, expect, it } from 'vitest'
import { selectQuestions } from './questionSelector'
import type { JournalEntry, Question } from '@/types'

function makeQuestion(id: string): Question {
  return { id, period: 'evening', text: `Frage ${id}` }
}

function makeEntry(questionIds: string[], date: string): JournalEntry {
  return {
    date,
    period: 'evening',
    mood: 5,
    createdAt: Date.now(),
    questions: questionIds.map((id) => ({ questionId: id, text: `Frage ${id}`, answer: 'x' })) as JournalEntry['questions'],
  }
}

describe('selectQuestions', () => {
  const pool = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map(makeQuestion)

  it('liefert die geforderte Anzahl Fragen ohne Duplikate', () => {
    const result = selectQuestions(pool, [], 3, 8, () => 0.5)
    expect(result).toHaveLength(3)
    expect(new Set(result.map((q) => q.id)).size).toBe(3)
  })

  it('ist deterministisch bei fixem RNG', () => {
    const rngValues = [0.1, 0.4, 0.9]
    let i = 0
    const rng = () => rngValues[i++ % rngValues.length]
    const a = selectQuestions(pool, [], 3, 8, rng)
    i = 0
    const b = selectQuestions(pool, [], 3, 8, rng)
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id))
  })

  it('bevorzugt Fragen, die zuletzt am längsten nicht gestellt wurden', () => {
    // 'a' und 'b' wurden gerade erst gestellt (Rang 0 und 1) -> sollten
    // gegenüber nie gestellten Fragen zurückgestellt werden.
    const recent: JournalEntry[] = [
      makeEntry(['a', 'c', 'd'], '2026-08-10'),
      makeEntry(['b', 'e', 'f'], '2026-08-09'),
    ]
    // candidatePoolSize=2 zwingt die Auswahl auf die 2 am längsten unbenutzten
    const result = selectQuestions(pool, recent, 2, 2, () => 0)
    const ids = result.map((q) => q.id)
    expect(ids).not.toContain('a')
    expect(ids).not.toContain('b')
  })

  it('funktioniert auch mit leerem Verlauf (erster Eintrag überhaupt)', () => {
    const result = selectQuestions(pool, [], 3, 8, Math.random)
    expect(result).toHaveLength(3)
  })
})
