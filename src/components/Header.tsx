import type { ReactNode } from 'react'

export function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 px-4 pt-6 pb-3">
      <div>
        <h1 className="text-xl font-semibold text-ink-900 dark:text-cream-100">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
