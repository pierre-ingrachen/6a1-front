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
    expect(defenders.map((placed) => Math.round(placed.x * 10) / 10)).toEqual([12.5, 36.2, 59.8, 83.5])
  })

  it("puts a pair of wide midfielders on the sides, between the rows around them", () => {
    const wide4132 = [
      slot(0, "GK", "GOALKEEPER"),
      slot(1, "LB", "DEFENDER"),
      slot(2, "CB", "DEFENDER"),
      slot(3, "CB", "DEFENDER"),
      slot(4, "RB", "DEFENDER"),
      slot(5, "DM", "MIDFIELDER"),
      slot(6, "LM", "MIDFIELDER"),
      slot(7, "AM", "MIDFIELDER"),
      slot(8, "RM", "MIDFIELDER"),
      slot(9, "ST", "ATTACKER"),
      slot(10, "ST", "ATTACKER"),
    ]
    const placed = placeSlots(wide4132, "4-1-3-2")
    const at = (position: string) => placed.find((entry) => entry.slot.position === position)!

    expect(at("LM").x).toBe(12.5)
    expect(placed.find((entry) => entry.slot.position === "RM")!.x).toBe(83.5)
    expect(at("LM").y).toBeGreaterThan(at("AM").y)
    expect(at("LM").y).toBeLessThan(at("DM").y)
  })

  it("lifts the wing-backs slightly above the centre-backs in a back five", () => {
    const backFive = [
      slot(0, "GK", "GOALKEEPER"),
      slot(1, "LB", "DEFENDER"),
      slot(2, "CB", "DEFENDER"),
      slot(3, "CB", "DEFENDER"),
      slot(4, "CB", "DEFENDER"),
      slot(5, "RB", "DEFENDER"),
      slot(6, "ST", "ATTACKER"),
    ]
    const placed = placeSlots(backFive)
    const heightOf = (position: string) => placed.find((entry) => entry.slot.position === position)!.y

    expect(heightOf("LB")).toBeLessThan(heightOf("CB"))
    expect(heightOf("RB")).toBe(heightOf("LB"))
  })

  it("keeps the full-backs level with the centre-backs in a back four", () => {
    const placed = placeSlots(slots)
    const heightOf = (position: string) => placed.find((entry) => entry.slot.position === position)!.y

    expect(heightOf("LB")).toBe(heightOf("CB"))
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
