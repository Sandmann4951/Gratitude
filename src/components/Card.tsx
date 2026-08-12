import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-forest-100 bg-cream-50 p-4 shadow-sm dark:border-ink-600 dark:bg-ink-600/40 ${className}`}
      {...props}
    />
  )
}
