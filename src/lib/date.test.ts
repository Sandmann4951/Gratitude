import { describe, expect, it } from 'vitest'
import {
  addDays,
  currentPeriod,
  dateKey,
  daysBetween,
  parseDateKey,
  startOfMonth,
  startOfWeek,
} from './date'

describe('dateKey / parseDateKey', () => {
  it('rundtrippt ein Datum verlustfrei', () => {
    const d = new Date(2026, 7, 12, 23, 55) // 12. August 2026, 23:55 lokal
    expect(dateKey(d)).toBe('2026-08-12')
    expect(dateKey(parseDateKey('2026-08-12'))).toBe('2026-08-12')
  })

  it('bleibt beim lokalen Tag, auch kurz vor Mitternacht', () => {
    const kurzVorMitternacht = new Date(2026, 7, 12, 23, 59)
    expect(dateKey(kurzVorMitternacht)).toBe('2026-08-12')
  })
})

describe('currentPeriod', () => {
  it('liefert morning vor der Mittags-Grenze', () => {
    const early = new Date(2026, 7, 12, 8, 0)
    expect(currentPeriod('15:00', early)).toBe('morning')
  })

  it('liefert evening ab der Mittags-Grenze', () => {
    const afternoon = new Date(2026, 7, 12, 15, 0)
    expect(currentPeriod('15:00', afternoon)).toBe('evening')
  })
})

describe('daysBetween / addDays', () => {
  it('berechnet die Differenz zweier Datums-Keys korrekt', () => {
    expect(daysBetween('2026-08-10', '2026-08-12')).toBe(2)
    expect(daysBetween('2026-08-12', '2026-08-10')).toBe(-2)
  })

  it('addDays ist die Umkehrung von daysBetween', () => {
    expect(addDays('2026-08-10', 2)).toBe('2026-08-12')
    expect(addDays('2026-08-10', -1)).toBe('2026-08-09')
  })

  it('kommt über Monatsgrenzen hinweg korrekt', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
  })
})

describe('startOfWeek / startOfMonth', () => {
  it('findet den Montag der Woche', () => {
    // 12. August 2026 ist ein Mittwoch
    expect(startOfWeek('2026-08-12')).toBe('2026-08-10')
  })

  it('bleibt auf einem Montag stehen', () => {
    expect(startOfWeek('2026-08-10')).toBe('2026-08-10')
  })

  it('findet den ersten Tag des Monats', () => {
    expect(startOfMonth('2026-08-12')).toBe('2026-08-01')
  })
})
