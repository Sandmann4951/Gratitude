import { addDays, dateKey, daysBetween } from '@/lib/date'
import type { JournalEntry } from '@/types'

export interface DayMood {
  date: string
  morning?: number
  evening?: number
}

/** Baut für jeden Tag im Bereich [startDate, endDateExclusive) einen Eintrag, auch wenn kein Journal-Eintrag existiert. */
export function buildDailySeries(entries: JournalEntry[], startDate: string, endDateExclusive: string): DayMood[] {
  const byDate = new Map<string, DayMood>()
  for (const e of entries) {
    if (e.date < startDate || e.date >= endDateExclusive) continue
    const day = byDate.get(e.date) ?? { date: e.date }
    day[e.period] = e.mood
    byDate.set(e.date, day)
  }
  const numDays = daysBetween(startDate, endDateExclusive)
  const series: DayMood[] = []
  for (let i = 0; i < numDays; i++) {
    const date = addDays(startDate, i)
    series.push(byDate.get(date) ?? { date })
  }
  return series
}

/** Durchschnittliche Stimmung über alle vorhandenen Werte (morgens+abends zusammen), oder null ohne Daten. */
export function averageMood(entries: JournalEntry[]): number | null {
  if (entries.length === 0) return null
  const sum = entries.reduce((acc, e) => acc + e.mood, 0)
  return sum / entries.length
}

/** Anteil tatsächlich ausgefüllter Slots (0–1) im Bereich [startDate, endDateExclusive), bis maximal heute. */
export function completionRate(entries: JournalEntry[], startDate: string, endDateExclusive: string): number {
  const today = dateKey()
  const effectiveEnd = endDateExclusive > addDays(today, 1) ? addDays(today, 1) : endDateExclusive
  const numDays = Math.max(0, daysBetween(startDate, effectiveEnd))
  if (numDays === 0) return 0
  const inRange = entries.filter((e) => e.date >= startDate && e.date < effectiveEnd)
  return inRange.length / (numDays * 2)
}

/**
 * Aktuelle Serie aufeinanderfolgender Tage mit mindestens einem Eintrag.
 * Fehlt der heutige Eintrag noch, wird trotzdem ab gestern gezählt (der Tag ist ja noch nicht vorbei).
 */
export function currentStreak(entries: JournalEntry[]): number {
  const datesWithEntry = new Set(entries.map((e) => e.date))
  const today = dateKey()
  let anchor = datesWithEntry.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (datesWithEntry.has(anchor)) {
    streak++
    anchor = addDays(anchor, -1)
  }
  return streak
}

/** Längste je erreichte Serie aufeinanderfolgender Tage mit mindestens einem Eintrag. */
export function longestStreak(entries: JournalEntry[]): number {
  const dates = [...new Set(entries.map((e) => e.date))].sort()
  let longest = 0
  let running = 0
  let prev: string | null = null
  for (const date of dates) {
    running = prev !== null && daysBetween(prev, date) === 1 ? running + 1 : 1
    longest = Math.max(longest, running)
    prev = date
  }
  return longest
}
