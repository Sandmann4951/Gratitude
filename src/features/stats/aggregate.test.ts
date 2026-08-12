import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { averageMood, buildDailySeries, completionRate, currentStreak, longestStreak } from './aggregate'
import type { JournalEntry } from '@/types'

function entry(date: string, period: 'morning' | 'evening', mood: number): JournalEntry {
  return {
    date,
    period,
    mood,
    createdAt: Date.now(),
    questions: [
      { questionId: 'a', text: 'A', answer: 'x' },
      { questionId: 'b', text: 'B', answer: 'x' },
      { questionId: 'c', text: 'C', answer: 'x' },
    ],
  }
}

describe('buildDailySeries', () => {
  it('füllt fehlende Tage mit leeren Einträgen auf', () => {
    const series = buildDailySeries([entry('2026-08-10', 'morning', 7)], '2026-08-09', '2026-08-12')
    expect(series.map((d) => d.date)).toEqual(['2026-08-09', '2026-08-10', '2026-08-11'])
    expect(series[1].morning).toBe(7)
    expect(series[0].morning).toBeUndefined()
  })
})

describe('averageMood', () => {
  it('mittelt alle übergebenen Werte', () => {
    expect(averageMood([entry('2026-08-10', 'morning', 4), entry('2026-08-10', 'evening', 8)])).toBe(6)
  })

  it('liefert null bei leerer Liste', () => {
    expect(averageMood([])).toBeNull()
  })
})

describe('completionRate', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(new Date(2026, 7, 12)))
  afterEach(() => vi.useRealTimers())

  it('berechnet den Anteil ausgefüllter Slots', () => {
    // 2 Tage Bereich = 4 mögliche Slots, 2 ausgefüllt -> 0.5
    const entries = [entry('2026-08-10', 'morning', 5), entry('2026-08-11', 'evening', 5)]
    expect(completionRate(entries, '2026-08-10', '2026-08-12')).toBe(0.5)
  })

  it('zählt keine zukünftigen Tage mit', () => {
    // Bereich reicht bis übermorgen, heute ist aber erst der 12. -> deckelt auf morgen
    const entries = [entry('2026-08-12', 'morning', 5)]
    const rate = completionRate(entries, '2026-08-12', '2026-08-20')
    expect(rate).toBe(0.5) // 1 von 2 möglichen Slots am einzig zählenden Tag
  })
})

describe('currentStreak', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(new Date(2026, 7, 12)))
  afterEach(() => vi.useRealTimers())

  it('zählt aufeinanderfolgende Tage bis heute', () => {
    const entries = [
      entry('2026-08-10', 'morning', 5),
      entry('2026-08-11', 'evening', 5),
      entry('2026-08-12', 'morning', 5),
    ]
    expect(currentStreak(entries)).toBe(3)
  })

  it('zählt ab gestern weiter, falls heute noch kein Eintrag existiert', () => {
    const entries = [entry('2026-08-10', 'morning', 5), entry('2026-08-11', 'evening', 5)]
    expect(currentStreak(entries)).toBe(2)
  })

  it('bricht bei einer Lücke ab', () => {
    const entries = [entry('2026-08-09', 'morning', 5), entry('2026-08-12', 'morning', 5)]
    expect(currentStreak(entries)).toBe(1)
  })
})

describe('longestStreak', () => {
  it('findet die längste zusammenhängende Serie, nicht nur die aktuelle', () => {
    const entries = [
      entry('2026-08-01', 'morning', 5),
      entry('2026-08-02', 'morning', 5),
      entry('2026-08-03', 'morning', 5),
      entry('2026-08-05', 'morning', 5),
      entry('2026-08-06', 'morning', 5),
    ]
    expect(longestStreak(entries)).toBe(3)
  })
})
