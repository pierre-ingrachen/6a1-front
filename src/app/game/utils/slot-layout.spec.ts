import { Slot } from "game/models/game.model"
import { groupSlotsByLine } from "game/utils/slot-layout"

const slot = (index: number, position: string, line: Slot["line"]): Slot => ({ index, position, line, player: null })

describe("groupSlotsByLine", () => {
  const fourThreeThree: Slot[] = [
    slot(0, "GK", "GOALKEEPER"),
    slot(1, "LB", "DEFENDER"),
    slot(2, "CB", "DEFENDER"),
    slot(3, "CB", "DEFENDER"),
    slot(4, "RB", "DEFENDER"),
    slot(5, "CM", "MIDFIELDER"),
    slot(6, "CM", "MIDFIELDER"),
    slot(7, "CM", "MIDFIELDER"),
    slot(8, "RW", "ATTACKER"),
    slot(9, "ST", "ATTACKER"),
    slot(10, "LW", "ATTACKER"),
  ]

  it("orders the lines from attack to goalkeeper", () => {
    expect(groupSlotsByLine(fourThreeThree).map((row) => row.line)).toEqual([
      "ATTACKER",
      "MIDFIELDER",
      "DEFENDER",
      "GOALKEEPER",
    ])
  })

  it("places left players on the left and right players on the right", () => {
    const attack = groupSlotsByLine(fourThreeThree)[0]

    expect(attack.slots.map((item) => item.position)).toEqual(["LW", "ST", "RW"])
  })

  it("keeps every slot", () => {
    const total = groupSlotsByLine(fourThreeThree).reduce((count, row) => count + row.slots.length, 0)

    expect(total).toBe(11)
  })
})
