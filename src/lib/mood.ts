/**
 * Farb- und Emoji-Zuordnung für den Stimmungswert 0–10.
 * Rot (schlecht) -> Amber (neutral) -> Grün (gut), konsistent in Entry-Flow,
 * History und Statistik verwendet.
 */
const MOOD_STOPS = [
  { max: 2, color: '#c0533f', emoji: '😞', label: 'Sehr schlecht' },
  { max: 4, color: '#d98c4a', emoji: '🙁', label: 'Eher schlecht' },
  { max: 6, color: '#cc8f2c', emoji: '😐', label: 'Neutral' },
  { max: 8, color: '#7a9e4f', emoji: '🙂', label: 'Gut' },
  { max: 10, color: '#2d6a4f', emoji: '😄', label: 'Sehr gut' },
]

export function moodColor(mood: number): string {
  return (MOOD_STOPS.find((s) => mood <= s.max) ?? MOOD_STOPS[MOOD_STOPS.length - 1]).color
}

export function moodEmoji(mood: number): string {
  return (MOOD_STOPS.find((s) => mood <= s.max) ?? MOOD_STOPS[MOOD_STOPS.length - 1]).emoji
}

export function moodLabel(mood: number): string {
  return (MOOD_STOPS.find((s) => mood <= s.max) ?? MOOD_STOPS[MOOD_STOPS.length - 1]).label
}
