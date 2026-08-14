import Dexie from 'dexie'
import { db } from '@/db/schema'
import type { AnsweredQuestion, JournalEntry, Period, Photo, ReminderSettings } from '@/types'

/**
 * Diese Datei ist bewusst die EINZIGE Schnittstelle zur Datenbank.
 * Sie exponiert absichtlich kein `updateEntry`/`deleteEntry` für einzelne
 * Einträge – das ist der zentrale Unveränderbarkeits-Mechanismus auf App-Ebene
 * (ergänzt durch den `&[date+period]`-Unique-Index in schema.ts). Die einzige
 * Lösch-Operation ist `wipeAllData`, ein bewusster kompletter Reset.
 */

export class EntryAlreadyExistsError extends Error {
  constructor(date: string, period: Period) {
    super(`Für ${date} (${period}) existiert bereits ein Eintrag.`)
    this.name = 'EntryAlreadyExistsError'
  }
}

export interface CreateEntryInput {
  date: string
  period: Period
  questions: [AnsweredQuestion, AnsweredQuestion, AnsweredQuestion]
  mood: number
  photo?: { blob: Blob; mimeType: string }
  /** Zusätzliches, vom Stimmungsfoto unabhängiges "Bild des Tages" mit optionaler Bildunterschrift. */
  dayPhoto?: { blob: Blob; mimeType: string; caption: string }
}

/** Legt einen neuen, ab sofort unveränderlichen Eintrag an. */
export async function createEntry(input: CreateEntryInput): Promise<JournalEntry> {
  try {
    return await db.transaction('rw', db.entries, db.photos, async () => {
      let photoId: number | undefined
      if (input.photo) {
        photoId = await db.photos.add({
          blob: input.photo.blob,
          mimeType: input.photo.mimeType,
          createdAt: Date.now(),
        })
      }
      let dayPhotoId: number | undefined
      if (input.dayPhoto) {
        dayPhotoId = await db.photos.add({
          blob: input.dayPhoto.blob,
          mimeType: input.dayPhoto.mimeType,
          createdAt: Date.now(),
        })
      }
      const entry: JournalEntry = {
        date: input.date,
        period: input.period,
        questions: input.questions,
        mood: input.mood,
        photoId,
        dayPhotoId,
        dayPhotoCaption: input.dayPhoto?.caption || undefined,
        createdAt: Date.now(),
      }
      const id = await db.entries.add(entry)
      return { ...entry, id }
    })
  } catch (err) {
    if (err instanceof Dexie.ConstraintError || (err as { name?: string }).name === 'ConstraintError') {
      throw new EntryAlreadyExistsError(input.date, input.period)
    }
    throw err
  }
}

export function getEntryByDateAndPeriod(date: string, period: Period): Promise<JournalEntry | undefined> {
  return db.entries.where('[date+period]').equals([date, period]).first()
}

export function getEntryById(id: number): Promise<JournalEntry | undefined> {
  return db.entries.get(id)
}

export function getAllEntries(): Promise<JournalEntry[]> {
  return db.entries.orderBy('date').toArray()
}

/** Letzte `limit` Einträge desselben Slots, neueste zuerst – Basis für die Fragen-Rotation. */
export async function getRecentEntriesForPeriod(period: Period, limit: number): Promise<JournalEntry[]> {
  const all = await db.entries.where('period').equals(period).sortBy('date')
  return all.reverse().slice(0, limit)
}

export function getPhoto(id: number): Promise<Photo | undefined> {
  return db.photos.get(id)
}

/** Exportiert das gesamte Tagebuch als reines JSON (Fotos als Base64) – lokaler Backup-Download. */
export async function exportAllData(): Promise<string> {
  const entries = await db.entries.toArray()
  const photos = await db.photos.toArray()
  const photosSerialized = await Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      mimeType: p.mimeType,
      createdAt: p.createdAt,
      base64: await blobToBase64(p.blob),
    })),
  )
  return JSON.stringify(
    { version: 1, exportedAt: Date.now(), entries, photos: photosSerialized },
    null,
    2,
  )
}

interface ExportedPhoto {
  id?: number
  mimeType: string
  createdAt: number
  base64: string
}
interface ExportedData {
  version: number
  exportedAt: number
  entries: JournalEntry[]
  photos: ExportedPhoto[]
}

/**
 * Importiert ein zuvor per `exportAllData` erzeugtes Backup. Bereits vorhandene
 * Tag+Slot-Kombinationen werden übersprungen statt überschrieben – Import kann
 * also nie einen bestehenden (unveränderlichen) Eintrag verändern.
 */
export async function importAllData(json: string): Promise<{ imported: number; skipped: number }> {
  const data = JSON.parse(json) as ExportedData
  if (!Array.isArray(data.entries)) throw new Error('Ungültiges Backup-Format')

  let imported = 0
  let skipped = 0

  await db.transaction('rw', db.entries, db.photos, async () => {
    for (const entry of data.entries) {
      const exists = await db.entries.where('[date+period]').equals([entry.date, entry.period]).first()
      if (exists) {
        skipped++
        continue
      }
      let photoId: number | undefined
      const sourcePhoto = data.photos.find((p) => p.id === entry.photoId)
      if (sourcePhoto) {
        const blob = base64ToBlob(sourcePhoto.base64, sourcePhoto.mimeType)
        photoId = await db.photos.add({ blob, mimeType: sourcePhoto.mimeType, createdAt: sourcePhoto.createdAt })
      }
      let dayPhotoId: number | undefined
      const sourceDayPhoto = data.photos.find((p) => p.id === entry.dayPhotoId)
      if (sourceDayPhoto) {
        const blob = base64ToBlob(sourceDayPhoto.base64, sourceDayPhoto.mimeType)
        dayPhotoId = await db.photos.add({
          blob,
          mimeType: sourceDayPhoto.mimeType,
          createdAt: sourceDayPhoto.createdAt,
        })
      }
      await db.entries.add({
        date: entry.date,
        period: entry.period,
        questions: entry.questions,
        mood: entry.mood,
        photoId,
        dayPhotoId,
        dayPhotoCaption: entry.dayPhotoCaption,
        createdAt: entry.createdAt,
      })
      imported++
    }
  })

  return { imported, skipped }
}

/** Löscht ALLE Einträge und Fotos unwiderruflich. Einzige bewusste Ausnahme von "keine Löschung". */
export async function wipeAllData(): Promise<void> {
  await db.transaction('rw', db.entries, db.photos, async () => {
    await db.entries.clear()
    await db.photos.clear()
  })
}

/** Spiegelt die Reminder-Einstellungen nach IndexedDB, damit der Service Worker sie lesen kann. */
export function mirrorPrefs(settings: ReminderSettings): Promise<number> {
  return db.prefsMirror.put({ id: 1, ...settings })
}

export function getPrefsMirror(): Promise<ReminderSettings | undefined> {
  return db.prefsMirror.get(1)
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(dataUrl: string, mimeType: string): Blob {
  const base64 = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mimeType })
}
