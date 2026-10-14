import { MatchResult } from "game/models/competition.model"
import { Slot } from "game/models/game.model"
import { PenaltyKick } from "game/models/simulation.model"
import { buildShootout } from "game/utils/penalty-shootout"

const matchOf = (penaltiesFor: number | null, penaltiesAgainst: number | null): MatchResult => ({
  round: "FINAL",
  opponent: {
    teamId: 1,
    teamName: "Rival",
    seasonLabel: "2020",
    rating: 80,
    players: [
      { name: "R1", rating: 80, line: "ATTACKER" },
      { name: "R2", rating: 80, line: "MIDFIELDER" },
    ],
  },
  goalsFor: 1,
  goalsAgainst: 1,
  extraTime: true,
  penaltiesFor,
  penaltiesAgainst,
  won: (penaltiesFor ?? 0) > (penaltiesAgainst ?? 0),
})

const squad: Slot[] = ["A", "B", "C"].map((name, index) => ({
  index,
  position: "ST",
  line: "ATTACKER",
  player: { playerId: index, name, rating: 85, teamName: "", seasonLabel: "", positions: ["ST"] },
}))

const scoredBy = (kicks: PenaltyKick[], side: PenaltyKick["side"]) =>
  kicks.filter((kick) => kick.side === side && kick.scored).length

describe("buildShootout", () => {
  it("returns nothing without a shootout", () => {
    expect(buildShootout(matchOf(null, null), squad, () => 0.5)).toEqual([])
  })

  it("alternates the teams and matches the final tally", () => {
    const kicks = buildShootout(matchOf(4, 3), squad, Math.random)
    expect(kicks.length).toBe(10)
    expect(kicks.map((kick) => kick.side)).toEqual(Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? "FOR" : "AGAINST")))
    expect(scoredBy(kicks, "FOR")).toBe(4)
    expect(scoredBy(kicks, "AGAINST")).toBe(3)
  })

  it("goes to sudden death when the tally exceeds five", () => {
    const kicks = buildShootout(matchOf(6, 7), squad, Math.random)
    expect(kicks.length).toBe(14)
    expect(scoredBy(kicks, "FOR")).toBe(6)
    expect(scoredBy(kicks, "AGAINST")).toBe(7)
  })

  it("uses different takers during the regular kicks", () => {
    const kicks = buildShootout(matchOf(3, 2), squad, Math.random)
    const opponentTakers = kicks.filter((kick) => kick.side === "AGAINST").map((kick) => kick.takerName)
    expect(opponentTakers.slice(0, 2)).toContain("R1")
    expect(opponentTakers.slice(0, 2)).toContain("R2")
  })
})
