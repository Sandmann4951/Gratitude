import { addDays, dateKey, parseDateKey } from '@/lib/date'
import { DayCell } from './DayCell'
import type { JournalEntry } from '@/types'

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

interface CalendarGridProps {
  month: string // "YYYY-MM-DD", 1. des Monats
  entriesByDate: Map<string, { morning?: JournalEntry; evening?: JournalEntry }>
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

export function CalendarGrid({ month, entriesByDate, selectedDate, onSelectDate }: CalendarGridProps) {
  const first = parseDateKey(month)
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const firstWeekday = (first.getDay() + 6) % 7 // 0 = Montag
  const today = dateKey()

  const cells: { day: number | null; date: string | null }[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, date: null })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, date: addDays(month, d - 1) })

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-ink-400">
        {WEEKDAY_LABELS.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => (
          <DayCell
            key={c.date ?? `blank-${i}`}
            day={c.day}
            dateKey={c.date}
            entries={c.date ? entriesByDate.get(c.date) : undefined}
            isToday={c.date === today}
            isSelected={c.date === selectedDate}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  )
}
