import type { ReactNode } from 'react'

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-forest-100 px-6 py-10 text-center dark:border-ink-600">
      {icon && <div className="text-3xl">{icon}</div>}
      <p className="font-medium text-ink-600 dark:text-cream-100">{title}</p>
      {description && <p className="text-sm text-ink-400">{description}</p>}
    </div>
  )
}
