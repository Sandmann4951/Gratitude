import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl bg-paper p-4 shadow-[0_1px_2px_rgba(15,23,25,0.04),0_12px_28px_-16px_rgba(15,45,40,0.22)] ring-1 ring-black/[0.03] dark:bg-ink-600/50 dark:shadow-none dark:ring-white/5 ${className}`}
      {...props}
    />
  )
}
