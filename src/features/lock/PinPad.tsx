import { useEffect, useState } from 'react'

interface PinPadProps {
  length?: number
  onComplete: (pin: string) => void
  /** Zeigt die Punkte rot an und schüttelt kurz, danach wird die Eingabe geleert. */
  error?: boolean
  onErrorShown?: () => void
  disabled?: boolean
}

/** Numerischer PIN-Eingabe-Block mit Punkt-Anzeige, für Sperrbildschirm & PIN-Einrichtung. */
export function PinPad({ length = 4, onComplete, error = false, onErrorShown, disabled = false }: PinPadProps) {
  const [digits, setDigits] = useState('')

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => {
      setDigits('')
      onErrorShown?.()
    }, 450)
    return () => clearTimeout(t)
  }, [error, onErrorShown])

  function press(digit: string) {
    if (disabled || error) return
    const next = (digits + digit).slice(0, length)
    setDigits(next)
    if (next.length === length) onComplete(next)
  }

  function backspace() {
    if (disabled || error) return
    setDigits((d) => d.slice(0, -1))
  }

  return (
    <div>
      <div
        className={`flex justify-center gap-4 ${error ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        aria-hidden
      >
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full transition-colors ${
              error ? 'bg-red-500' : i < digits.length ? 'bg-forest-500' : 'bg-current opacity-20'
            }`}
          />
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-xs grid-cols-3 gap-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => press(n)}
            disabled={disabled}
            className="aspect-square rounded-full bg-white text-2xl font-semibold text-ink-900 shadow-md ring-1 ring-black/[0.05] transition-transform active:scale-95"
          >
            {n}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => press('0')}
          disabled={disabled}
          className="aspect-square rounded-full bg-white text-2xl font-semibold text-ink-900 shadow-md ring-1 ring-black/[0.05] transition-transform active:scale-95"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          disabled={disabled}
          aria-label="Letzte Ziffer löschen"
          className="flex aspect-square items-center justify-center text-2xl text-current opacity-70 transition-transform active:scale-95"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
