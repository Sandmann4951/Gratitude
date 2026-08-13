import { useEffect, useRef, useState } from 'react'
import { verifyBiometric, verifyPin } from '@/lib/appLock'
import { useAppLockStore } from '@/store/useAppLockStore'
import { PinPad } from './PinPad'

/** Vollflächiger Sperrbildschirm: PIN-Eingabe, optional mit Face-/Touch-ID-Kurzweg. */
export function LockScreen() {
  const config = useAppLockStore((s) => s.config)
  const unlock = useAppLockStore((s) => s.unlock)
  const [error, setError] = useState(false)
  const [biometricBusy, setBiometricBusy] = useState(false)
  const attempted = useRef(false)

  async function tryBiometric() {
    if (!config.biometricEnabled || !config.biometricCredentialId || biometricBusy) return
    setBiometricBusy(true)
    const ok = await verifyBiometric(config.biometricCredentialId)
    setBiometricBusy(false)
    if (ok) unlock()
  }

  useEffect(() => {
    // Beim ersten Anzeigen des Sperrbildschirms direkt Face-/Touch-ID anbieten.
    if (attempted.current) return
    attempted.current = true
    void tryBiometric()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePin(pin: string) {
    const ok = await verifyPin(pin, config.pinSalt, config.pinHash)
    if (ok) unlock()
    else setError(true)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-forest-500 to-forest-700 px-6 pb-[env(safe-area-inset-bottom)] text-white">
      <div className="mb-10 flex flex-col items-center gap-2">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl" aria-hidden>
          🔒
        </span>
        <p className="mt-2 text-lg font-bold tracking-tight">Gesperrt</p>
        <p className="text-sm text-white/70">Gib deine PIN ein, um dein Tagebuch zu öffnen.</p>
      </div>

      <PinPad onComplete={(pin) => void handlePin(pin)} error={error} onErrorShown={() => setError(false)} />

      {config.biometricEnabled && config.biometricCredentialId && (
        <button
          type="button"
          onClick={() => void tryBiometric()}
          disabled={biometricBusy}
          className="mt-10 flex flex-col items-center gap-1.5 text-white/85 transition-opacity active:opacity-70"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl" aria-hidden>
            🆔
          </span>
          <span className="text-xs font-semibold">Face ID / Touch ID</span>
        </button>
      )}
    </div>
  )
}
