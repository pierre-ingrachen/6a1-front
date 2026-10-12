import { Slot } from "game/models/game.model"
import { layoutRowsOf } from "game/utils/formation-layouts"

const slotsOf = (positions: string[]): Slot[] =>
  positions.map((position, index) => ({ index, position, line: "DEFENDER", player: null }))

const positionsByRow = (rows: Slot[][] | null) => rows?.map((row) => row.map((slot) => slot.position))

describe("layoutRowsOf", () => {
  it("puts the attacking midfielder above the two central midfielders in a 4-2-3-1", () => {
    const slots = slotsOf(["GK", "LB", "CB", "CB", "RB", "CM", "CM", "LW", "AM", "RW", "ST"])

    expect(positionsByRow(layoutRowsOf("4-2-3-1", slots))).toEqual([
      ["ST"],
      ["LW", "AM", "RW"],
      ["CM", "CM"],
      ["LB", "CB", "CB", "RB"],
      ["GK"],
    ])
  })

  it("puts the wing backs on the midfield row in a 3-5-2", () => {
    const slots = slotsOf(["GK", "CB", "CB", "CB", "LWB", "RWB", "CM", "CM", "CM", "ST", "ST"])

    expect(positionsByRow(layoutRowsOf("3-5-2", slots))).toEqual([
      ["ST", "ST"],
      ["LWB", "CM", "CM", "CM", "RWB"],
      ["CB", "CB", "CB"],
      ["GK"],
    ])
  })

  it("puts the wingers on the midfield row in a 4-4-2", () => {
    const slots = slotsOf(["GK", "LB", "CB", "CB", "RB", "LW", "CM", "CM", "RW", "ST", "ST"])

    expect(positionsByRow(layoutRowsOf("4-4-2", slots))?.[1]).toEqual(["LW", "CM", "CM", "RW"])
  })

  it("returns null for an unknown formation", () => {
    expect(layoutRowsOf("4-1-2-1-2", slotsOf(["GK"]))).toBeNull()
  })

  it("returns null when the slots do not match the formation", () => {
    expect(layoutRowsOf("4-3-3", slotsOf(["GK", "ST"]))).toBeNull()
  })
})
