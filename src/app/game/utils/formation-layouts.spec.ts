import { Slot } from "game/models/game.model"
import { layoutRowsOf } from "game/utils/formation-layouts"

const slotsOf = (positions: string[]): Slot[] =>
  positions.map((position, index) => ({ index, position, line: "DEFENDER", player: null }))

const positionsByRow = (rows: Slot[][] | null) => rows?.map((row) => row.map((slot) => slot.position))

describe("layoutRowsOf", () => {
  it("puts the attacking midfielder above the two defensive midfielders in a 4-2-3-1", () => {
    const slots = slotsOf(["GK", "LB", "CB", "CB", "RB", "DM", "DM", "LW", "AM", "RW", "ST"])

    expect(positionsByRow(layoutRowsOf("4-2-3-1", slots))).toEqual([
      ["ST"],
      ["LW", "AM", "RW"],
      ["DM", "DM"],
      ["LB", "CB", "CB", "RB"],
      ["GK"],
    ])
  })

  it("puts the wide midfielders on the midfield row in a 3-5-2", () => {
    const slots = slotsOf(["GK", "CB", "CB", "CB", "LM", "RM", "CM", "CM", "CM", "ST", "ST"])

    expect(positionsByRow(layoutRowsOf("3-5-2", slots))).toEqual([
      ["ST", "ST"],
      ["LM", "CM", "CM", "CM", "RM"],
      ["CB", "CB", "CB"],
      ["GK"],
    ])
  })

  it("puts the wide midfielders on the midfield row in a 4-4-2", () => {
    const slots = slotsOf(["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"])

    expect(positionsByRow(layoutRowsOf("4-4-2", slots))?.[1]).toEqual(["LM", "CM", "CM", "RM"])
  })

  it("puts the attacking midfielder between the strikers and the central midfielders in a 4-1-2-1-2", () => {
    const slots = slotsOf(["GK", "LB", "CB", "CB", "RB", "DM", "CM", "CM", "AM", "ST", "ST"])

    expect(positionsByRow(layoutRowsOf("4-1-2-1-2", slots))).toEqual([
      ["ST", "ST"],
      ["AM"],
      ["CM", "CM"],
      ["DM"],
      ["LB", "CB", "CB", "RB"],
      ["GK"],
    ])
  })

  it("returns null for an unknown formation", () => {
    expect(layoutRowsOf("9-0-1", slotsOf(["GK"]))).toBeNull()
  })

  it("returns null when the slots do not match the formation", () => {
    expect(layoutRowsOf("4-3-3", slotsOf(["GK", "ST"]))).toBeNull()
  })
})
