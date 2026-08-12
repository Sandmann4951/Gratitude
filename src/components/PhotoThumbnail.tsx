import { useEffect, useState } from 'react'
import { getPhoto } from '@/db/repository'
import { blobToObjectUrl } from '@/lib/photo'

interface PhotoThumbnailProps {
  photoId: number
  alt?: string
  className?: string
}

/** Lädt ein Foto anhand seiner ID aus IndexedDB und zeigt es an; verwaltet die Object-URL-Freigabe. */
export function PhotoThumbnail({ photoId, alt = 'Foto zum Eintrag', className }: PhotoThumbnailProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    getPhoto(photoId).then((photo) => {
      if (cancelled || !photo) return
      objectUrl = blobToObjectUrl(photo.blob)
      setUrl(objectUrl)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoId])

  if (!url) {
    return <div className={`animate-pulse rounded-xl bg-forest-100 dark:bg-ink-600 ${className ?? ''}`} />
  }

  return <img src={url} alt={alt} className={`object-cover ${className ?? ''}`} />
}
