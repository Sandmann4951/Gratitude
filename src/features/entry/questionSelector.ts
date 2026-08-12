import type { JournalEntry, Period, Question } from '@/types'

/**
 * Wählt `count` Fragen aus `pool` aus, bevorzugt solche, die in `recentEntries`
 * (neueste zuerst, gleicher Slot) am längsten nicht gestellt wurden.
 *
 * Vorgehen ("least-recently-used mit etwas Zufall"):
 * 1. Für jede Frage im Pool wird ihr Rang in `recentEntries` ermittelt (0 = zuletzt
 *    gestellt, höher = länger her / nie gestellt).
 * 2. Die am längsten nicht gestellten Kandidaten werden vorgezogen.
 * 3. Aus den vordersten `candidatePoolSize` wird zufällig ohne Zurücklegen gezogen.
 *
 * Reine Funktion mit injizierbarem RNG, damit sie deterministisch testbar ist.
 */
export function selectQuestions(
  pool: Question[],
  recentEntries: JournalEntry[],
  count = 3,
  candidatePoolSize = 8,
  rng: () => number = Math.random,
): Question[] {
  const lastUsedIndex = new Map<string, number>()
  recentEntries.forEach((entry, entryIndex) => {
    for (const q of entry.questions) {
      if (!lastUsedIndex.has(q.questionId)) {
        lastUsedIndex.set(q.questionId, entryIndex)
      }
    }
  })

  const ranked = [...pool].sort((a, b) => {
    const rankA = lastUsedIndex.get(a.id) ?? Number.POSITIVE_INFINITY
    const rankB = lastUsedIndex.get(b.id) ?? Number.POSITIVE_INFINITY
    return rankB - rankA // größerer Abstand zur letzten Nutzung zuerst
  })

  const candidates = ranked.slice(0, Math.max(candidatePoolSize, count))
  return sampleWithoutReplacement(candidates, Math.min(count, candidates.length), rng)
}

function sampleWithoutReplacement<T>(items: T[], count: number, rng: () => number): T[] {
  const pool = [...items]
  const result: T[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}

/** Bequemer Wrapper: lädt den Frage-Pool für den Slot und wählt 3 Fragen aus. */
export function selectQuestionsForPeriod(
  allQuestions: Question[],
  period: Period,
  recentEntries: JournalEntry[],
  rng?: () => number,
): Question[] {
  const pool = allQuestions.filter((q) => q.period === period)
  return selectQuestions(pool, recentEntries, 3, 8, rng)
}
