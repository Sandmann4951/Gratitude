import type { ReactNode } from 'react'

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl bg-paper/60 px-6 py-12 text-center ring-1 ring-black/[0.03] dark:bg-ink-600/30 dark:ring-white/5">
      {icon && <div className="text-3xl">{icon}</div>}
      <p className="font-medium text-ink-600 dark:text-cream-100">{title}</p>
      {description && <p className="text-sm text-ink-400">{description}</p>}
    </div>
  )
}
