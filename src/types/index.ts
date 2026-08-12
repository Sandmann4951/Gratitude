/** Tageszeit-Slot: morgens oder abends. */
export type Period = 'morning' | 'evening'

/** Eine im Katalog definierte Frage. */
export interface Question {
  id: string
  period: Period
  text: string
}

/** Eine beantwortete Frage innerhalb eines Eintrags (Text als Snapshot gespeichert). */
export interface AnsweredQuestion {
  questionId: string
  text: string
  answer: string
}

/** Ein vollständiger Tagebuch-Eintrag (morgens oder abends). Wird nach dem Speichern nie mehr verändert. */
export interface JournalEntry {
  id?: number
  date: string // "YYYY-MM-DD", lokales Datum
  period: Period
  questions: [AnsweredQuestion, AnsweredQuestion, AnsweredQuestion]
  mood: number // 0–10
  photoId?: number
  createdAt: number // epoch ms
}

/**
 * Foto zu einem Eintrag, in eigener Tabelle gespeichert (damit Statistik-Queries
 * über `entries` nie Bild-Blobs laden müssen). Referenziert wird es einseitig
 * über `JournalEntry.photoId` – ein Rückverweis ist nicht nötig.
 */
export interface Photo {
  id?: number
  blob: Blob
  mimeType: string
  createdAt: number
}

/** Persönliche Einstellungen für Erinnerungen (in localStorage gespeichert). */
export interface ReminderSettings {
  remindersEnabled: boolean
  morningReminderTime: string // "HH:MM"
  eveningReminderTime: string // "HH:MM"
  /** Grenze zwischen Morgen- und Abend-Slot, "HH:MM". Ab hier gilt der Abend-Slot als "aktuell". */
  middayCutoff: string
}
