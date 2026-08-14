import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { BottomNavBar } from '@/components/BottomNavBar'
import { HomePage } from '@/features/home/HomePage'
import { EntryFlowPage } from '@/features/entry/EntryFlowPage'
import { HistoryCalendarPage } from '@/features/history/HistoryCalendarPage'
import { EntryDetailPage } from '@/features/history/EntryDetailPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { BookPage } from '@/features/book/BookPage'
import { LockScreen } from '@/features/lock/LockScreen'
import { useAppLockStore } from '@/store/useAppLockStore'

// Recharts ist der mit Abstand größte Dependency-Anteil im Bundle – die
// Statistik-Seite daher separat nachladen, damit der Start-Screen schlank bleibt.
const StatsPage = lazy(() => import('@/features/stats/StatsPage').then((m) => ({ default: m.StatsPage })))

export default function App() {
  const locked = useAppLockStore((s) => s.locked && s.config.enabled)

  if (locked) return <LockScreen />

  return (
    <div className="min-h-dvh pb-28 print:pb-0">
      <div className="mx-auto max-w-md print:max-w-none">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entry/:period" element={<EntryFlowPage />} />
          <Route path="/history" element={<HistoryCalendarPage />} />
          <Route path="/history/:date/:period" element={<EntryDetailPage />} />
          <Route
            path="/stats"
            element={
              <Suspense fallback={<div className="px-4 pt-6 text-sm text-ink-400">Wird geladen …</div>}>
                <StatsPage />
              </Suspense>
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNavBar />
    </div>
  )
}
