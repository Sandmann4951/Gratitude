import { NavLink } from 'react-router-dom'

const ITEMS = [
  { to: '/', label: 'Heute', icon: HomeIcon },
  { to: '/history', label: 'Verlauf', icon: HistoryIcon },
  { to: '/stats', label: 'Statistik', icon: ChartIcon },
  { to: '/settings', label: 'Einstellungen', icon: SettingsIcon },
]

export function BottomNavBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      aria-label="Hauptnavigation"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-[28px] bg-paper/90 p-2 shadow-xl shadow-ink-900/10 ring-1 ring-black/[0.03] backdrop-blur-lg dark:bg-ink-900/90 dark:ring-white/5">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-forest-50 text-forest-600 dark:bg-forest-500/15 dark:text-forest-400'
                    : 'text-ink-400'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16" strokeLinecap="round" />
      <path d="M8 3v3M16 3v3" strokeLinecap="round" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M5 19V10M12 19V5M19 19v-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 13a7.6 7.6 0 0 0 0-2l1.9-1.5-2-3.4-2.2.9a7.6 7.6 0 0 0-1.7-1L15 3.5h-4L10.6 6a7.6 7.6 0 0 0-1.7 1l-2.2-.9-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-1.9 1.5 2 3.4 2.2-.9c.5.44 1.08.79 1.7 1l.4 2.5h4l.4-2.5c.62-.21 1.2-.56 1.7-1l2.2.9 2-3.4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
