import { useRef, useState } from 'react'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Toggle } from '@/components/Toggle'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useSettingsStore } from '@/store/useSettingsStore'
import { exportAllData, importAllData, wipeAllData } from '@/db/repository'
import {
  notificationSupport,
  registerPeriodicReminderSync,
  requestNotificationPermission,
} from '@/features/reminders/notifications'
import { isIOS, isStandalonePwa } from '@/lib/platform'
import { dateKey } from '@/lib/date'

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const [permission, setPermission] = useState(notificationSupport())
  const [resetOpen, setResetOpen] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ios = isIOS()
  const standalone = isStandalonePwa()

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') await registerPeriodicReminderSync()
  }

  async function handleExport() {
    const json = await exportAllData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dankbarkeitstagebuch-backup-${dateKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(file: File | undefined) {
    if (!file) return
    setImportStatus('Wird importiert …')
    try {
      const text = await file.text()
      const { imported, skipped } = await importAllData(text)
      setImportStatus(`${imported} Einträge importiert, ${skipped} bereits vorhanden übersprungen.`)
    } catch {
      setImportStatus('Die Datei konnte nicht gelesen werden. Ist es ein gültiges Backup?')
    }
  }

  return (
    <div>
      <Header title="Einstellungen" />

      <div className="space-y-4 px-4 pb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-ink-900 dark:text-cream-100">Erinnerungen</p>
              <p className="text-xs text-ink-400">Zeigt einen Hinweis, wenn ein Eintrag fällig ist.</p>
            </div>
            <Toggle
              checked={settings.remindersEnabled}
              onChange={(v) => update({ remindersEnabled: v })}
              label="Erinnerungen aktivieren"
            />
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between text-sm">
              <span className="text-ink-600 dark:text-cream-100">Morgens ab</span>
              <input
                type="time"
                value={settings.morningReminderTime}
                onChange={(e) => update({ morningReminderTime: e.target.value })}
                className="rounded-lg border border-forest-100 bg-cream-50 px-2 py-1 dark:border-ink-600 dark:bg-ink-600/40 dark:text-cream-100"
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span className="text-ink-600 dark:text-cream-100">Abends ab</span>
              <input
                type="time"
                value={settings.eveningReminderTime}
                onChange={(e) => update({ eveningReminderTime: e.target.value })}
                className="rounded-lg border border-forest-100 bg-cream-50 px-2 py-1 dark:border-ink-600 dark:bg-ink-600/40 dark:text-cream-100"
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span className="text-ink-600 dark:text-cream-100">Wechsel Morgen → Abend</span>
              <input
                type="time"
                value={settings.middayCutoff}
                onChange={(e) => update({ middayCutoff: e.target.value })}
                className="rounded-lg border border-forest-100 bg-cream-50 px-2 py-1 dark:border-ink-600 dark:bg-ink-600/40 dark:text-cream-100"
              />
            </label>
          </div>
        </Card>

        <Card>
          <p className="font-medium text-ink-900 dark:text-cream-100">Benachrichtigungen</p>
          <p className="mt-1 text-xs text-ink-400">
            Status:{' '}
            {permission === 'unsupported'
              ? 'In diesem Browser nicht verfügbar'
              : permission === 'granted'
                ? 'Aktiviert'
                : permission === 'denied'
                  ? 'Blockiert (in den Browser-Einstellungen änderbar)'
                  : 'Noch nicht angefragt'}
          </p>

          {permission === 'default' && (
            <Button variant="secondary" onClick={handleEnableNotifications} className="mt-3 w-full">
              Benachrichtigungen aktivieren
            </Button>
          )}

          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Der Hinweis-Banner in der App funktioniert immer, unabhängig von dieser Einstellung. Echte
            Push-Benachrichtigungen sind ohne eigenen Server nur eingeschränkt möglich
            {ios && (
              <>
                {' '}
                – auf dem iPhone insbesondere: Safari erlaubt sie nur, wenn diese App zum Home-Bildschirm hinzugefügt
                wurde{standalone ? ' (das hast du bereits getan ✓)' : ''}, und selbst dann garantiert iOS keine
                Zustellung im Hintergrund
              </>
            )}
            . Verlass dich daher primär auf den Banner, wenn du die App öffnest.
          </p>
        </Card>

        <Card>
          <p className="font-medium text-ink-900 dark:text-cream-100">Daten</p>
          <p className="mt-1 text-xs text-ink-400">
            Dein Tagebuch wird ausschließlich lokal auf diesem Gerät gespeichert. Ein Backup schützt dich davor, bei
            einem Gerätewechsel oder gelöschten Browserdaten alles zu verlieren.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="secondary" onClick={() => void handleExport()}>
              Backup exportieren (JSON)
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Backup importieren
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                void handleImportFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            {importStatus && <p className="text-xs text-ink-400">{importStatus}</p>}
          </div>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50">
          <p className="font-medium text-red-700 dark:text-red-400">Gefahrenzone</p>
          <p className="mt-1 text-xs text-ink-400">
            Löscht alle Einträge und Fotos unwiderruflich von diesem Gerät. Erstelle vorher ein Backup, falls du die
            Daten behalten möchtest.
          </p>
          <Button
            variant="secondary"
            onClick={() => setResetOpen(true)}
            className="mt-3 w-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          >
            Alle Daten löschen
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Wirklich alles löschen?"
        description="Alle Tagebuch-Einträge und Fotos werden unwiderruflich von diesem Gerät gelöscht. Das kann nicht rückgängig gemacht werden."
        confirmLabel="Endgültig löschen"
        destructive
        onConfirm={() => {
          setResetOpen(false)
          void wipeAllData()
        }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  )
}
