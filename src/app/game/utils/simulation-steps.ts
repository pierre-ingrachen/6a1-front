import { CompetitionResult, MatchResult } from "game/models/competition.model"
import { Slot } from "game/models/game.model"
import { MatchStep } from "game/models/simulation.model"
import { buildGoals, matchDuration } from "game/utils/match-timeline"
import { buildShootout } from "game/utils/penalty-shootout"
import { roundLabel } from "game/utils/position-labels"
import { Random } from "game/utils/scorer-picker"

const matchStepOf = (label: string, match: MatchResult, squad: Slot[], random: Random): MatchStep => ({
  label,
  match,
  goals: buildGoals(match, squad, random),
  shootout: buildShootout(match, squad, random),
  duration: matchDuration(match),
})

export const buildSimulationSteps = (
  result: CompetitionResult,
  squad: Slot[],
  random: Random = Math.random,
): MatchStep[] => {
  const groupMatches = result.groupStage.matches
  return [
    ...groupMatches.map((match, index) =>
      matchStepOf(`${roundLabel("GROUP_STAGE")} · Match ${index + 1}/${groupMatches.length}`, match, squad, random),
    ),
    ...result.knockoutMatches.map((match) => matchStepOf(roundLabel(match.round), match, squad, random)),
  ]
}
