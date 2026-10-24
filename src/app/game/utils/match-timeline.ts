import { MatchResult } from "game/models/competition.model"
import { GoalEvent, GoalSide } from "game/models/simulation.model"
import { Slot } from "game/models/game.model"
import { Random, Scorer, pickScorer, scorersOfSquad } from "game/utils/scorer-picker"

export const REGULAR_TIME = 90
export const FULL_TIME = 120

export const MIN_GOAL_GAP = 5

const spacedMinutes = (count: number, first: number, last: number, random: Random): number[] => {
  if (count === 0) {
    return []
  }
  const gap = count > 1 ? Math.min(MIN_GOAL_GAP, Math.floor((last - first) / (count - 1))) : 0
  const start = Math.min(first, last - (count - 1) * gap)
  const room = last - start - (count - 1) * gap
  return Array.from({ length: count }, () => start + Math.floor(random() * (room + 1)))
    .sort((a, b) => a - b)
    .map((minute, index) => minute + index * gap)
}

const shuffled = <T>(items: T[], random: Random): T[] =>
  items.reduceRight((deck, _, index) => {
    const other = Math.floor(random() * (index + 1))
    ;[deck[index], deck[other]] = [deck[other], deck[index]]
    return deck
  }, [...items])

const extraTimeGoalsOf = (goalsFor: number, goalsAgainst: number, random: Random): { for: number; against: number } => {
  const gap = goalsFor - goalsAgainst
  const mandatoryFor = Math.max(gap, 0)
  const mandatoryAgainst = Math.max(-gap, 0)
  const shared = Math.floor(random() * (Math.min(goalsFor - mandatoryFor, goalsAgainst - mandatoryAgainst, 1) + 1))
  return { for: mandatoryFor + shared, against: mandatoryAgainst + shared }
}

export const matchDuration = (match: MatchResult): number => (match.extraTime ? FULL_TIME : REGULAR_TIME)

export const buildGoals = (match: MatchResult, squad: Slot[], random: Random = Math.random): GoalEvent[] => {
  const extra = match.extraTime ? extraTimeGoalsOf(match.goalsFor, match.goalsAgainst, random) : { for: 0, against: 0 }

  const squadScorers = scorersOfSquad(squad)
  const opponentScorers: Scorer[] = match.opponent.players ?? []

  const sidesOf = (period: { for: number; against: number }): GoalSide[] =>
    shuffled(
      [
        ...Array.from({ length: period.for }, (): GoalSide => "FOR"),
        ...Array.from({ length: period.against }, (): GoalSide => "AGAINST"),
      ],
      random,
    )

  const goalsOf = (sides: GoalSide[], minutes: number[]): GoalEvent[] =>
    sides.map((side, index) => ({
      minute: minutes[index],
      side,
      scorerName: pickScorer(side === "FOR" ? squadScorers : opponentScorers, random)?.name ?? null,
    }))

  const regularFor = match.goalsFor - extra.for
  const regularAgainst = match.goalsAgainst - extra.against
  const regularSides = sidesOf({ for: regularFor, against: regularAgainst })
  const regularMinutes = spacedMinutes(regularSides.length, 1, REGULAR_TIME, random)
  const extraSides = sidesOf(extra)
  const extraStart = Math.max(REGULAR_TIME + 1, (regularMinutes.at(-1) ?? 0) + MIN_GOAL_GAP)
  const extraMinutes = spacedMinutes(extraSides.length, extraStart, FULL_TIME, random)

  return [...goalsOf(regularSides, regularMinutes), ...goalsOf(extraSides, extraMinutes)]
}
