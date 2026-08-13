import type { ReactNode } from 'react'

export function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-4">
      <div>
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-ink-900 dark:text-cream-100">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
