import { CompetitionResult, MatchResult } from "game/models/competition.model"
import { buildSimulationSteps } from "game/utils/simulation-steps"

const matchOf = (round: MatchResult["round"], goalsFor: number): MatchResult => ({
  round,
  opponent: { teamId: 1, teamName: "Rival", seasonLabel: "2020", rating: 80, players: [] },
  goalsFor,
  goalsAgainst: 0,
  extraTime: false,
  penaltiesFor: null,
  penaltiesAgainst: null,
  won: true,
})

const result: CompetitionResult = {
  squadStrength: { attack: 80, defense: 80 },
  groupStage: {
    matches: [matchOf("GROUP_STAGE", 1), matchOf("GROUP_STAGE", 2), matchOf("GROUP_STAGE", 0)],
    standings: [],
    rank: 1,
  },
  knockoutMatches: [matchOf("ROUND_OF_16", 1), matchOf("QUARTER_FINAL", 3)],
  outcome: "SEMI_FINAL",
  champion: false,
}

describe("buildSimulationSteps", () => {
  const steps = buildSimulationSteps(result, [], () => 0.5)

  it("plays group matches, then the knockout rounds", () => {
    expect(steps.map((step) => step.match.round)).toEqual([
      "GROUP_STAGE",
      "GROUP_STAGE",
      "GROUP_STAGE",
      "ROUND_OF_16",
      "QUARTER_FINAL",
    ])
  })

  it("labels each step", () => {
    expect(steps.map((step) => step.label)).toEqual([
      "Phase de groupes · Match 1/3",
      "Phase de groupes · Match 2/3",
      "Phase de groupes · Match 3/3",
      "Huitième de finale",
      "Quart de finale",
    ])
  })

  it("generates as many goals as the final score", () => {
    expect(steps[4].goals.length).toBe(3)
  })
})
