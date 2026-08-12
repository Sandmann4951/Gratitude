/**
 * Skaliert ein hochgeladenes Bild client-seitig auf eine maximale Kantenlänge
 * herunter und komprimiert es als JPEG, bevor es in IndexedDB landet – hält
 * die lokale Datenbank schlank (Foto-Blobs sind sonst schnell mehrere MB groß).
 */
export async function compressImage(
  file: File,
  maxDimension = 800,
  quality = 0.8,
): Promise<{ blob: Blob; mimeType: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas-Kontext nicht verfügbar')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new Error('Bild konnte nicht komprimiert werden')
  return { blob, mimeType: 'image/jpeg' }
}

/** Erstellt eine Object-URL für einen Blob; Aufrufer muss sie per URL.revokeObjectURL wieder freigeben. */
export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}
