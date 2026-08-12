import { moodColor, moodEmoji, moodLabel } from '@/lib/mood'

interface MoodSliderProps {
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
}

/** Interaktiver Stimmungs-Regler 0–10 mit Farbverlauf und Emoji-Feedback. */
export function MoodSlider({ value, onChange, disabled }: MoodSliderProps) {
  const shown = value ?? 5
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-600 dark:text-cream-100">Wie fühlst du dich?</span>
        <span className="flex items-center gap-1.5 text-sm text-ink-400">
          <span className="text-lg" aria-hidden>
            {moodEmoji(shown)}
          </span>
          {value === null ? 'Noch nicht gewählt' : `${value}/10 · ${moodLabel(value)}`}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={shown}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Stimmung von 0 bis 10"
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full outline-none accent-forest-500 disabled:cursor-default"
        style={{
          background: `linear-gradient(to right, ${moodColor(0)}, ${moodColor(5)}, ${moodColor(10)})`,
        }}
      />
      <div className="mt-1 flex justify-between text-[11px] text-ink-400">
        <span>0</span>
        <span>10</span>
      </div>
    </div>
  )
}
