import { useState } from 'react'
import { PinPad } from './PinPad'

interface SetPinDialogProps {
  open: boolean
  /** Wenn gesetzt, muss zuerst die aktuelle PIN bestätigt werden, bevor eine neue vergeben wird. */
  title?: string
  onCancel: () => void
  onComplete: (pin: string) => void
}

/** Zwei-Schritt-Dialog zum Vergeben einer neuen PIN: einmal eingeben, einmal bestätigen. */
export function SetPinDialog({ open, title = 'PIN festlegen', onCancel, onComplete }: SetPinDialogProps) {
  const [firstPin, setFirstPin] = useState<string | null>(null)
  const [mismatch, setMismatch] = useState(false)

  if (!open) return null

  function reset() {
    setFirstPin(null)
    setMismatch(false)
  }

  function handleDigits(pin: string) {
    if (firstPin === null) {
      setFirstPin(pin)
      return
    }
    if (pin === firstPin) {
      onComplete(pin)
      reset()
    } else {
      setMismatch(true)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-pin-title"
    >
      <div className="w-full max-w-sm rounded-t-[28px] bg-paper p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-2xl sm:rounded-[28px] sm:pb-6 dark:bg-ink-600">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-400/25 sm:hidden" />
        <p id="set-pin-title" className="text-center text-lg font-bold tracking-tight text-ink-900 dark:text-cream-100">
          {firstPin === null ? title : 'PIN bestätigen'}
        </p>
        <p className="mt-1 text-center text-sm text-ink-400">
          {mismatch
            ? 'Die PINs stimmen nicht überein. Versuch es noch einmal.'
            : firstPin === null
              ? '4-stellige PIN wählen'
              : 'Gib die PIN erneut ein'}
        </p>

        <div className="mt-6 text-ink-900 dark:text-cream-100">
          <PinPad onComplete={handleDigits} error={mismatch} onErrorShown={reset} />
        </div>

        <button
          type="button"
          onClick={() => {
            reset()
            onCancel()
          }}
          className="mt-8 block w-full text-center text-sm font-semibold text-ink-400"
        >
          Abbrechen
        </button>
      </div>
    </div>
  )
}
