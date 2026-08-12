/**
 * Dünner Wrapper um die Notification-Permission-API. Wird NIE automatisch
 * aufgerufen – nur über einen expliziten Button in den Einstellungen.
 */

export type PermissionState = 'unsupported' | NotificationPermission

export function notificationSupport(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.requestPermission()
}

/** Zeigt eine native Benachrichtigung – bevorzugt über den Service Worker (nötig für iOS-Homescreen-PWAs). */
export async function showLocalNotification(title: string, options: NotificationOptions): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return
    } catch {
      // fällt unten auf die direkte Notification-API zurück
    }
  }
  new Notification(title, options)
}

/** Ob Periodic Background Sync grundsätzlich verfügbar ist (nur Chromium/Android mit installierter PWA). */
export function periodicSyncSupported(): boolean {
  return 'serviceWorker' in navigator && 'PeriodicSyncManager' in window
}

export async function registerPeriodicReminderSync(): Promise<boolean> {
  if (!periodicSyncSupported()) return false
  try {
    const reg = await navigator.serviceWorker.ready
    // @ts-expect-error periodicSync/permission-name sind noch nicht in allen TS-DOM-Typings vorhanden
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' })
    if (status.state !== 'granted') return false
    // @ts-expect-error siehe oben
    await reg.periodicSync.register('reminder-check', { minInterval: 60 * 60 * 1000 })
    return true
  } catch {
    return false
  }
}
