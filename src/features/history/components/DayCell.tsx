import { moodColor } from '@/lib/mood'
import type { JournalEntry } from '@/types'

interface DayCellProps {
  day: number | null
  dateKey: string | null
  entries?: { morning?: JournalEntry; evening?: JournalEntry }
  isToday: boolean
  isSelected: boolean
  onSelect: (dateKey: string) => void
}

export function DayCell({ day, dateKey, entries, isToday, isSelected, onSelect }: DayCellProps) {
  if (day === null || dateKey === null) return <div />

  const hasMorning = !!entries?.morning
  const hasEvening = !!entries?.evening
  const avgMood =
    hasMorning && hasEvening
      ? (entries!.morning!.mood + entries!.evening!.mood) / 2
      : (entries?.morning?.mood ?? entries?.evening?.mood)

  return (
    <button
      type="button"
      onClick={() => onSelect(dateKey)}
      className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-medium transition-colors ${
        isSelected
          ? 'bg-forest-500 text-white'
          : isToday
            ? 'bg-forest-50 font-semibold text-forest-600 dark:bg-ink-600 dark:text-cream-100'
            : 'text-ink-600 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-ink-600/60'
      }`}
    >
      <span>{day}</span>
      {avgMood !== undefined ? (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: isSelected ? 'white' : moodColor(avgMood) }}
          aria-hidden
        />
      ) : (
        <span className="h-1.5 w-1.5" />
      )}
    </button>
  )
}
