import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDateShortDe } from '@/lib/date'
import type { DayMood } from '@/features/stats/aggregate'

const MORNING_COLOR = '#e0a94a'
const EVENING_COLOR = '#2d6a4f'

export function MoodTrendChart({ series }: { series: DayMood[] }) {
  const data = series.map((d) => ({ ...d, label: formatDateShortDe(d.date) }))

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-forest-100 dark:stroke-ink-600" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-ink-400" />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-ink-400" width={24} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }}
            formatter={(value, name) => [value, name === 'morning' ? 'Morgens' : 'Abends']}
          />
          <Line
            type="monotone"
            dataKey="morning"
            name="morning"
            stroke={MORNING_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="evening"
            name="evening"
            stroke={EVENING_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-1 flex justify-center gap-4 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MORNING_COLOR }} /> Morgens
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EVENING_COLOR }} /> Abends
        </span>
      </div>
    </div>
  )
}
