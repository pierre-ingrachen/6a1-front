import { formationName } from "game/utils/position-labels"

describe("formationName", () => {
  it("names every formation offered by the game", () => {
    const labels = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "5-3-2", "4-1-2-1-2", "4-3-2-1", "4-4-1-1", "4-5-1", "3-4-3", "3-4-2-1", "5-4-1"]

    expect(labels.every((label) => formationName(label).length > 0)).toBeTrue()
  })

  it("returns an empty name for an unknown formation", () => {
    expect(formationName("9-0-1")).toBe("")
  })
})
