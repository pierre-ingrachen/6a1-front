import { GoalEvent } from "game/models/simulation.model"
import { topScorerOf } from "game/utils/top-scorer"

const goal = (scorerName: string | null, side: GoalEvent["side"] = "FOR"): GoalEvent => ({ minute: 1, side, scorerName })

describe("topScorerOf", () => {
  it("returns null without goals", () => {
    expect(topScorerOf([])).toBeNull()
  })

  it("ignores goals scored against us", () => {
    expect(topScorerOf([goal("Rival", "AGAINST")])).toBeNull()
  })

  it("returns the player with the most goals", () => {
    expect(topScorerOf([goal("A"), goal("B"), goal("B")])).toEqual({ name: "B", goals: 2 })
  })

  it("keeps the first player to reach the top on a tie", () => {
    expect(topScorerOf([goal("A"), goal("B"), goal("A"), goal("B")])).toEqual({ name: "A", goals: 2 })
  })
})
