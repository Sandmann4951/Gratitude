import { Card } from '@/components/Card'

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="text-center">
      <p className="text-2xl font-semibold text-forest-500 dark:text-forest-400">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-600 dark:text-cream-100">{label}</p>
      {hint && <p className="text-[11px] text-ink-400">{hint}</p>}
    </Card>
  )
}
