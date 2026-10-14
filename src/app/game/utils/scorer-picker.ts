import { Line, Slot } from "game/models/game.model"

export type Random = () => number

export interface Scorer {
  name: string
  rating: number
  line: Line
  position?: string
}

const LINE_WEIGHTS: Record<Line, number> = {
  GOALKEEPER: 0.01,
  DEFENDER: 1,
  MIDFIELDER: 3,
  ATTACKER: 8,
}

const POSITION_BONUSES: Record<string, number> = {
  ST: 1.5,
  LW: 1.2,
  RW: 1.2,
  AM: 1.2,
}

const RATING_EXPONENT = 4

const scoringWeight = (scorer: Scorer): number =>
  LINE_WEIGHTS[scorer.line] *
  (POSITION_BONUSES[scorer.position ?? ""] ?? 1) *
  Math.pow(scorer.rating / 100, RATING_EXPONENT)

export const scorersOfSquad = (squad: Slot[]): Scorer[] =>
  squad.flatMap((slot) =>
    slot.player
      ? [{ name: slot.player.name, rating: slot.player.rating, line: slot.line, position: slot.position }]
      : [],
  )

export const pickScorer = (scorers: Scorer[], random: Random): Scorer | null => {
  const total = scorers.reduce((sum, scorer) => sum + scoringWeight(scorer), 0)
  if (total <= 0) {
    return null
  }

  const target = random() * total
  let cumulated = 0
  return (
    scorers.find((scorer) => {
      cumulated += scoringWeight(scorer)
      return target < cumulated
    }) ?? scorers[scorers.length - 1]
  )
}
