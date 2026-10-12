import { Slot } from "game/models/game.model"
import { placeSlots, shortName } from "game/utils/slot-placement"

const slot = (index: number, position: string, line: Slot["line"]): Slot => ({ index, position, line, player: null })

describe("placeSlots", () => {
  const slots: Slot[] = [
    slot(0, "GK", "GOALKEEPER"),
    slot(1, "RB", "DEFENDER"),
    slot(2, "CB", "DEFENDER"),
    slot(3, "CB", "DEFENDER"),
    slot(4, "LB", "DEFENDER"),
    slot(5, "ST", "ATTACKER"),
  ]

  it("places the goalkeeper at the bottom center", () => {
    const goalkeeper = placeSlots(slots).find((placed) => placed.slot.index === 0)

    expect(goalkeeper).toEqual({ slot: slots[0], x: 48, y: 86 })
  })

  it("spreads a line from left to right", () => {
    const defenders = placeSlots(slots).filter((placed) => placed.slot.line === "DEFENDER")

    expect(defenders.map((placed) => placed.slot.position)).toEqual(["LB", "CB", "CB", "RB"])
    expect(defenders.map((placed) => placed.x)).toEqual([12.5, 37.5, 62.5, 87.5])
  })

  it("keeps every slot", () => {
    expect(placeSlots(slots).length).toBe(slots.length)
  })
})

describe("shortName", () => {
  it("keeps a single name", () => expect(shortName("Pelé")).toBe("Pelé"))
  it("abbreviates the first name", () => expect(shortName("Lionel Messi")).toBe("L.Messi"))
  it("keeps compound surnames", () => expect(shortName("Kevin De Bruyne")).toBe("K.De Bruyne"))
})
