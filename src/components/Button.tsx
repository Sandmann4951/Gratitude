import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-forest-500 text-white disabled:bg-forest-100 disabled:text-ink-400',
  secondary: 'bg-forest-50 text-forest-600 dark:bg-ink-600 dark:text-cream-100',
  ghost: 'text-forest-500 dark:text-forest-400',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-3 text-sm font-semibold transition-opacity active:opacity-80 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
