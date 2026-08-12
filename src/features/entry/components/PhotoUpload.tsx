import { useEffect, useRef, useState } from 'react'
import { compressImage } from '@/lib/photo'

interface PhotoUploadProps {
  value: { blob: Blob; mimeType: string } | null
  onChange: (photo: { blob: Blob; mimeType: string } | null) => void
}

/** Optionaler Foto-Upload zur Stimmungs-Dokumentation: Kamera oder Galerie, wird vor der Anzeige komprimiert. */
export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(value.blob)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [value])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    try {
      onChange(await compressImage(file))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-600 dark:text-cream-100">
        Foto zur Stimmung <span className="font-normal text-ink-400">(optional)</span>
      </p>

      {previewUrl ? (
        <div className="relative">
          <img src={previewUrl} alt="Ausgewähltes Foto" className="h-48 w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-full bg-ink-900/60 px-2.5 py-1 text-xs font-medium text-white"
          >
            Entfernen
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-forest-100 text-sm text-ink-400 dark:border-ink-600"
        >
          <span className="text-2xl" aria-hidden>
            📷
          </span>
          {busy ? 'Wird verarbeitet …' : 'Foto hinzufügen'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
