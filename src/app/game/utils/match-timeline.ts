import { MatchResult } from "game/models/competition.model"
import { GoalEvent, GoalSide } from "game/models/simulation.model"
import { Slot } from "game/models/game.model"
import { Random, Scorer, pickScorer, scorersOfSquad } from "game/utils/scorer-picker"

export const REGULAR_TIME = 90
export const FULL_TIME = 120

interface PeriodGoals {
  regular: number
  extra: number
}

const randomMinutes = (count: number, first: number, last: number, random: Random): number[] =>
  Array.from({ length: count }, () => first + Math.floor(random() * (last - first + 1))).sort((a, b) => a - b)

const extraTimeGoalsOf = (goalsFor: number, goalsAgainst: number, random: Random): { for: number; against: number } => {
  const gap = goalsFor - goalsAgainst
  const mandatoryFor = Math.max(gap, 0)
  const mandatoryAgainst = Math.max(-gap, 0)
  const shared = Math.floor(random() * (Math.min(goalsFor - mandatoryFor, goalsAgainst - mandatoryAgainst, 1) + 1))
  return { for: mandatoryFor + shared, against: mandatoryAgainst + shared }
}

const periodGoalsOf = (total: number, extra: number): PeriodGoals => ({ regular: total - extra, extra })

export const matchDuration = (match: MatchResult): number => (match.extraTime ? FULL_TIME : REGULAR_TIME)

export const buildGoals = (match: MatchResult, squad: Slot[], random: Random = Math.random): GoalEvent[] => {
  const extra = match.extraTime ? extraTimeGoalsOf(match.goalsFor, match.goalsAgainst, random) : { for: 0, against: 0 }

  const squadScorers = scorersOfSquad(squad)
  const opponentScorers: Scorer[] = match.opponent.players ?? []

  const goalsOf = (side: GoalSide, period: PeriodGoals, scorers: Scorer[]): GoalEvent[] =>
    [
      ...randomMinutes(period.regular, 1, REGULAR_TIME, random),
      ...randomMinutes(period.extra, REGULAR_TIME + 1, FULL_TIME, random),
    ].map((minute) => ({
      minute,
      side,
      scorerName: pickScorer(scorers, random)?.name ?? null,
    }))

  return [
    ...goalsOf("FOR", periodGoalsOf(match.goalsFor, extra.for), squadScorers),
    ...goalsOf("AGAINST", periodGoalsOf(match.goalsAgainst, extra.against), opponentScorers),
  ].sort((a, b) => a.minute - b.minute)
}
