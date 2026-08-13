import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-forest-500 text-white shadow-lg shadow-forest-500/25 disabled:bg-forest-100 disabled:text-ink-400 disabled:shadow-none',
  secondary: 'bg-forest-50 text-forest-600 dark:bg-ink-600 dark:text-cream-100',
  ghost: 'text-forest-500 dark:text-forest-400',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-full px-5 py-3.5 text-sm font-semibold tracking-tight transition-all active:scale-[0.98] active:opacity-90 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
