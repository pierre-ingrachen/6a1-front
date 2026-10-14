import { MatchResult } from "game/models/competition.model"
import { Slot } from "game/models/game.model"
import { buildGoals, matchDuration } from "game/utils/match-timeline"

const matchOf = (overrides: Partial<MatchResult>): MatchResult => ({
  round: "ROUND_OF_16",
  opponent: { teamId: 1, teamName: "Rival", seasonLabel: "2020", rating: 80, players: [{ name: "Rival Striker", rating: 85, line: "ATTACKER" }] },
  goalsFor: 0,
  goalsAgainst: 0,
  extraTime: false,
  penaltiesFor: null,
  penaltiesAgainst: null,
  won: true,
  ...overrides,
})

const squad: Slot[] = [
  {
    index: 0,
    position: "ST",
    line: "ATTACKER",
    player: { playerId: 1, name: "Striker", rating: 90, teamName: "", seasonLabel: "", positions: ["ST"] },
  },
]

const seeded = (): (() => number) => {
  let state = 42
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const score = (goals: ReturnType<typeof buildGoals>, until: number) => ({
  for: goals.filter((goal) => goal.side === "FOR" && goal.minute <= until).length,
  against: goals.filter((goal) => goal.side === "AGAINST" && goal.minute <= until).length,
})

describe("buildGoals", () => {
  it("produces exactly the final score", () => {
    const goals = buildGoals(matchOf({ goalsFor: 3, goalsAgainst: 2 }), squad, seeded())
    expect(score(goals, 120)).toEqual({ for: 3, against: 2 })
  })

  it("sorts goals chronologically within regular time", () => {
    const goals = buildGoals(matchOf({ goalsFor: 4, goalsAgainst: 3 }), squad, seeded())
    const minutes = goals.map((goal) => goal.minute)
    expect(minutes).toEqual([...minutes].sort((a, b) => a - b))
    expect(minutes.every((minute) => minute >= 1 && minute <= 90)).toBeTrue()
  })

  it("attributes each goal to a player of the scoring team", () => {
    const goals = buildGoals(matchOf({ goalsFor: 2, goalsAgainst: 2 }), squad, seeded())
    expect(goals.filter((goal) => goal.side === "FOR").every((goal) => goal.scorerName === "Striker")).toBeTrue()
    expect(goals.filter((goal) => goal.side === "AGAINST").every((goal) => goal.scorerName === "Rival Striker")).toBeTrue()
  })

  it("is level after 90 minutes when the match goes to extra time", () => {
    const outcomes = [
      matchOf({ goalsFor: 2, goalsAgainst: 1, extraTime: true }),
      matchOf({ goalsFor: 1, goalsAgainst: 3, extraTime: true, won: false }),
      matchOf({ goalsFor: 2, goalsAgainst: 2, extraTime: true, penaltiesFor: 4, penaltiesAgainst: 3 }),
    ]
    const random = seeded()
    outcomes.forEach((match) => {
      const goals = buildGoals(match, squad, random)
      const regular = score(goals, 90)
      expect(regular.for).toBe(regular.against)
      expect(score(goals, 120)).toEqual({ for: match.goalsFor, against: match.goalsAgainst })
    })
  })

  it("returns no goal for a goalless draw", () => {
    expect(buildGoals(matchOf({}), squad, seeded())).toEqual([])
  })
})

describe("matchDuration", () => {
  it("lasts 90 minutes in regular time", () => {
    expect(matchDuration(matchOf({}))).toBe(90)
  })

  it("lasts 120 minutes with extra time", () => {
    expect(matchDuration(matchOf({ extraTime: true }))).toBe(120)
  })
})
