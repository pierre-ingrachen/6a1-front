import { DrawPlayer, Slot } from "game/models/game.model"
import { slotChoicesOf } from "game/utils/slot-choices"

const slot = (index: number, position: string): Slot => ({ index, position, line: "DEFENDER", player: null })
const player = (eligibleSlots: number[]): DrawPlayer => ({
  playerId: 1,
  name: "Test",
  rating: 80,
  line: "DEFENDER",
  positions: [],
  eligibleSlots,
  alreadyPicked: false,
})

describe("slotChoicesOf", () => {
  const slots = [slot(1, "LB"), slot(2, "CB"), slot(3, "CB")]

  it("proposes one choice per position even when several slots share it", () => {
    expect(slotChoicesOf(player([2, 3]), slots)).toEqual([{ position: "CB", slotIndex: 2 }])
  })

  it("proposes each distinct position", () => {
    expect(slotChoicesOf(player([1, 2]), slots).map((choice) => choice.position)).toEqual(["LB", "CB"])
  })

  it("proposes nothing when no slot is eligible", () => {
    expect(slotChoicesOf(player([]), slots)).toEqual([])
  })
})
