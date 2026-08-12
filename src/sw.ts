/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import Dexie from 'dexie'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
// Workbox-Manifest wird von vite-plugin-pwa (injectManifest) hier eingesetzt.
precacheAndRoute(self.__WB_MANIFEST)

/**
 * Schlanker, eigenständiger Dexie-Zugriff im SW-Kontext (kein Import des vollen
 * App-Schemas, um den SW-Bundle klein zu halten) – nur für den
 * Periodic-Background-Sync-Fällig-Check unten verwendet.
 */
const db = new Dexie('gratitude-journal')
db.version(1).stores({
  entries: '++id, date, period, &[date+period]',
  photos: '++id',
  prefsMirror: 'id',
})

interface PrefsRow {
  id: 1
  remindersEnabled: boolean
  morningReminderTime: string
  eveningReminderTime: string
  middayCutoff: string
}

function dateKeyNow(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function minutesNow(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Best-Effort-Fällig-Check für Periodic Background Sync. Nur auf Chromium/Android
 * mit installierter PWA überhaupt erreichbar (Feature-Detection in
 * features/reminders/notifications.ts) – auf iOS Safari wird dieser Code-Pfad
 * nie ausgelöst; dort trägt allein der In-App-Banner (useReminderScheduler).
 */
async function checkAndNotify(): Promise<void> {
  const prefs = (await db.table('prefsMirror').get(1)) as PrefsRow | undefined
  if (!prefs?.remindersEnabled) return

  const today = dateKeyNow()
  const period = minutesNow() < toMinutes(prefs.middayCutoff) ? 'morning' : 'evening'
  const reminderTime = period === 'morning' ? prefs.morningReminderTime : prefs.eveningReminderTime
  if (minutesNow() < toMinutes(reminderTime)) return

  const existing = await db.table('entries').where('[date+period]').equals([today, period]).first()
  if (existing) return

  await self.registration.showNotification('Zeit für dein Dankbarkeitstagebuch', {
    body: period === 'morning' ? 'Zeit für deinen Morgen-Eintrag.' : 'Zeit für deinen Abend-Eintrag.',
    tag: `sw-reminder-${today}-${period}`,
    data: { period },
  })
}

self.addEventListener('periodicsync', (event) => {
  const syncEvent = event as unknown as { tag: string; waitUntil: (p: Promise<unknown>) => void }
  if (syncEvent.tag === 'reminder-check') {
    syncEvent.waitUntil(checkAndNotify())
  }
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const period = (event.notification.data as { period?: string } | undefined)?.period
  const path = period ? `/entry/${period}` : '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) {
          await client.focus()
          client.postMessage({ type: 'navigate', path })
          return
        }
      }
      await self.clients.openWindow(`/#${path}`)
    }),
  )
})
