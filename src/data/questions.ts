import type { Question } from '@/types'

/**
 * Fragenkatalog: 10 morgens (zukunftsgerichtet) + 10 abends (reflektierend).
 * IDs sind stabil und werden in gespeicherten Einträgen referenziert – niemals
 * umbenennen oder wiederverwenden, sonst bricht die Rotationslogik/Statistik.
 * Der Fragetext selbst darf sich ändern, ohne bestehende Einträge zu beeinflussen,
 * da jeder Eintrag den Text zum Zeitpunkt der Beantwortung als Snapshot speichert.
 */
export const QUESTIONS: Question[] = [
  // Morgens – zukunftsgerichtet
  { id: 'm-freude', period: 'morning', text: 'Worauf freust du dich heute am meisten?' },
  { id: 'm-dankbar-jetzt', period: 'morning', text: 'Wofür bist du in diesem Moment dankbar?' },
  { id: 'm-vornehmen', period: 'morning', text: 'Was möchtest du dir für den heutigen Tag vornehmen?' },
  { id: 'm-person', period: 'morning', text: 'Welche Person wird dir heute besonders wichtig sein?' },
  { id: 'm-guter-tag', period: 'morning', text: 'Was würde diesen Tag zu einem guten Tag machen?' },
  { id: 'm-erstes-gefuehl', period: 'morning', text: 'Was hat dir heute Morgen schon ein gutes Gefühl gegeben?' },
  { id: 'm-schenken', period: 'morning', text: 'Welche kleine Sache kannst du heute jemandem schenken?' },
  { id: 'm-fuehlen', period: 'morning', text: 'Wie möchtest du dich am Ende des Tages fühlen?' },
  { id: 'm-kraft', period: 'morning', text: 'Was gibt dir heute Kraft?' },
  { id: 'm-gelassen', period: 'morning', text: 'Welcher Herausforderung siehst du heute gelassen entgegen?' },

  // Abends – reflektierend
  { id: 'e-gelungen', period: 'evening', text: 'Was ist dir heute gelungen?' },
  { id: 'e-dankbar', period: 'evening', text: 'Wofür warst du heute besonders dankbar?' },
  { id: 'e-laecheln', period: 'evening', text: 'Was hat dir heute ein Lächeln ins Gesicht gezaubert?' },
  { id: 'e-moment', period: 'evening', text: 'Welchen schönen Moment möchtest du dir merken?' },
  { id: 'e-einfluss', period: 'evening', text: 'Wer hat deinen Tag heute positiv beeinflusst?' },
  { id: 'e-gelernt', period: 'evening', text: 'Was hast du heute über dich selbst gelernt?' },
  { id: 'e-freude', period: 'evening', text: 'Welche kleine Freude hast du heute erlebt?' },
  { id: 'e-bedanken', period: 'evening', text: 'Wofür möchtest du dich heute bei jemandem bedanken?' },
  { id: 'e-lachen', period: 'evening', text: 'Was hat dich heute zum Lächeln oder Lachen gebracht?' },
  { id: 'e-stolz', period: 'evening', text: 'Worauf bist du heute stolz?' },
]

export function questionsForPeriod(period: Question['period']): Question[] {
  return QUESTIONS.filter((q) => q.period === period)
}

export function findQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id)
}
