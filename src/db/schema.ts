import Dexie, { type EntityTable } from 'dexie'
import type { JournalEntry, Photo, ReminderSettings } from '@/types'

/**
 * Spiegel der in localStorage geführten Reminder-Einstellungen, ausschließlich
 * damit der Service Worker (der keinen Zugriff auf localStorage hat) im
 * periodicsync-Handler die aktuellen Zeiten lesen kann. localStorage bleibt
 * die Quelle der Wahrheit für die UI (siehe lib/settings.ts).
 */
export interface PrefsMirrorRow extends ReminderSettings {
  id: 1
}

export class GratitudeDB extends Dexie {
  entries!: EntityTable<JournalEntry, 'id'>
  photos!: EntityTable<Photo, 'id'>
  prefsMirror!: EntityTable<PrefsMirrorRow, 'id'>

  constructor() {
    super('gratitude-journal')
    this.version(1).stores({
      // "&[date+period]" = unique compound index: verhindert strukturell einen
      // zweiten Eintrag für denselben Tag+Slot (zentraler Unveränderbarkeits-Mechanismus).
      entries: '++id, date, period, &[date+period]',
      photos: '++id',
      prefsMirror: 'id',
    })
  }
}

export const db = new GratitudeDB()
