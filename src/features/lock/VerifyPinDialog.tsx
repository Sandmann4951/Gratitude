import { useState } from 'react'
import { verifyPin } from '@/lib/appLock'
import { PinPad } from './PinPad'

interface VerifyPinDialogProps {
  open: boolean
  title: string
  description?: string
  pinSalt: string
  pinHash: string
  onCancel: () => void
  onVerified: () => void
}

/** Fragt die aktuelle PIN ab, bevor eine sicherheitsrelevante Aktion (Sperre deaktivieren) ausgeführt wird. */
export function VerifyPinDialog({
  open,
  title,
  description,
  pinSalt,
  pinHash,
  onCancel,
  onVerified,
}: VerifyPinDialogProps) {
  const [error, setError] = useState(false)

  if (!open) return null

  async function handlePin(pin: string) {
    const ok = await verifyPin(pin, pinSalt, pinHash)
    if (ok) onVerified()
    else setError(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-pin-title"
    >
      <div className="w-full max-w-sm rounded-t-[28px] bg-paper p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-2xl sm:rounded-[28px] sm:pb-6 dark:bg-ink-600">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-400/25 sm:hidden" />
        <p id="verify-pin-title" className="text-center text-lg font-bold tracking-tight text-ink-900 dark:text-cream-100">
          {title}
        </p>
        <p className="mt-1 text-center text-sm text-ink-400">
          {error ? 'Falsche PIN. Versuch es noch einmal.' : (description ?? 'Gib deine PIN ein.')}
        </p>

        <div className="mt-6 text-ink-900 dark:text-cream-100">
          <PinPad onComplete={(pin) => void handlePin(pin)} error={error} onErrorShown={() => setError(false)} />
        </div>

        <button type="button" onClick={onCancel} className="mt-8 block w-full text-center text-sm font-semibold text-ink-400">
          Abbrechen
        </button>
      </div>
    </div>
  )
}
