/**
 * Datums-Helfer, die konsequent mit dem LOKALEN Kalendertag arbeiten statt mit UTC.
 * Wichtig, damit ein Eintrag um 23:50 Ortszeit nicht versehentlich dem nächsten
 * UTC-Tag zugeordnet wird (Date#toISOString() liefert UTC und wäre hier falsch).
 */

/** Liefert den lokalen Datums-Key "YYYY-MM-DD" für das übergebene Datum (Default: jetzt). */
export function dateKey(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parst einen "YYYY-MM-DD"-Key als lokales Datum (Mitternacht Ortszeit). */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Aktuelle Uhrzeit als Minuten seit Mitternacht, lokal. */
export function minutesNow(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** Parst "HH:MM" in Minuten seit Mitternacht. */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Bestimmt den "aktuellen" Zeit-Slot anhand der Mittags-Grenze (middayCutoff, "HH:MM").
 * Vor der Grenze gilt "morning", ab der Grenze "evening".
 */
export function currentPeriod(middayCutoff: string, now: Date = new Date()): 'morning' | 'evening' {
  return minutesNow(now) < parseTimeToMinutes(middayCutoff) ? 'morning' : 'evening'
}

/** Anzahl ganzer Kalendertage zwischen zwei "YYYY-MM-DD"-Keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const da = parseDateKey(a)
  const db = parseDateKey(b)
  // Auf Mitternacht normalisiert -> DST-sichere Ganzzahl-Differenz
  return Math.round((db.getTime() - da.getTime()) / msPerDay)
}

/** Liefert den Datums-Key für "n Tage vor key" (n darf negativ sein). */
export function addDays(key: string, n: number): string {
  const d = parseDateKey(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

/** Montag der Woche, in der `key` liegt, als Datums-Key (ISO-Wochenstart). */
export function startOfWeek(key: string): string {
  const d = parseDateKey(key)
  const dow = d.getDay() // 0 = Sonntag
  const diffToMonday = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diffToMonday)
  return dateKey(d)
}

/** Erster Tag des Monats, in dem `key` liegt, als Datums-Key. */
export function startOfMonth(key: string): string {
  const d = parseDateKey(key)
  return dateKey(new Date(d.getFullYear(), d.getMonth(), 1))
}

/** Verschiebt einen Monats-Anfangs-Key um `n` Monate (kann negativ sein). */
export function addMonths(key: string, n: number): string {
  const d = parseDateKey(key)
  d.setMonth(d.getMonth() + n)
  return dateKey(d)
}

/** Formatiert einen Monats-Anfangs-Key als "August 2026". */
export function formatMonthDe(key: string): string {
  return parseDateKey(key).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}

/** Formatiert einen Datums-Key als deutsches Anzeigedatum, z.B. "12. August 2026". */
export function formatDateDe(key: string): string {
  return parseDateKey(key).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Formatiert einen Datums-Key kompakt, z.B. "Mi, 12. Aug". */
export function formatDateShortDe(key: string): string {
  return parseDateKey(key).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
