import { MatchResult } from "game/models/competition.model"
import { Slot } from "game/models/game.model"
import { GoalSide, PenaltyKick } from "game/models/simulation.model"
import { Random, Scorer, pickScorer, scorersOfSquad } from "game/utils/scorer-picker"

const REGULAR_KICKS = 5

const scoredPattern = (scored: number, rounds: number, random: Random): boolean[] => {
  if (rounds > REGULAR_KICKS) {
    return Array.from({ length: rounds }, (_, round) => round < scored)
  }

  const scoringRounds = Array.from({ length: rounds }, (_, round) => ({ round, key: random() }))
    .sort((a, b) => a.key - b.key)
    .slice(0, scored)
    .map(({ round }) => round)
  return Array.from({ length: rounds }, (_, round) => scoringRounds.includes(round))
}

const takersOf = (scorers: Scorer[], rounds: number, random: Random): (string | null)[] => {
  let pool = scorers
  return Array.from({ length: rounds }, () => {
    pool = pool.length > 0 ? pool : scorers
    const taker = pickScorer(pool, random)
    pool = pool.filter((candidate) => candidate !== taker)
    return taker?.name ?? null
  })
}

const kicksOf = (side: GoalSide, scored: number, rounds: number, scorers: Scorer[], random: Random): PenaltyKick[] => {
  const pattern = scoredPattern(scored, rounds, random)
  return takersOf(scorers, rounds, random).map((takerName, round) => ({ side, takerName, scored: pattern[round] }))
}

export const buildShootout = (match: MatchResult, squad: Slot[], random: Random = Math.random): PenaltyKick[] => {
  if (match.penaltiesFor === null || match.penaltiesAgainst === null) {
    return []
  }

  const rounds = Math.max(REGULAR_KICKS, match.penaltiesFor, match.penaltiesAgainst)
  const ours = kicksOf("FOR", match.penaltiesFor, rounds, scorersOfSquad(squad), random)
  const theirs = kicksOf("AGAINST", match.penaltiesAgainst, rounds, match.opponent.players ?? [], random)
  return ours.flatMap((kick, round) => [kick, theirs[round]])
}
