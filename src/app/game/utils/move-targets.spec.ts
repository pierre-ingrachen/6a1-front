import { PickedPlayer, Slot } from "game/models/game.model"
import { moveTargetsOf } from "game/utils/move-targets"

const picked = (positions: string[]): PickedPlayer => ({
  playerId: 1,
  name: "Test",
  rating: 80,
  teamName: "Team",
  seasonLabel: "2020/2021",
  positions,
})
const slot = (index: number, position: string, player: PickedPlayer | null = null): Slot => ({
  index,
  position,
  line: "MIDFIELDER",
  player,
})

describe("moveTargetsOf", () => {
  it("offers empty slots the player can play", () => {
    const slots = [slot(0, "CM", picked(["CM", "RB"])), slot(1, "RB"), slot(2, "ST")]

    expect(moveTargetsOf(slots, 0)).toEqual([1])
  })

  it("offers a swap only when both players can play each other's slot", () => {
    const slots = [
      slot(0, "CM", picked(["CM", "RB"])),
      slot(1, "RB", picked(["RB", "CM"])),
      slot(2, "RB", picked(["RB"])),
    ]

    expect(moveTargetsOf(slots, 0)).toEqual([1])
  })

  it("offers nothing without a selection or for an empty slot", () => {
    const slots = [slot(0, "CM")]

    expect(moveTargetsOf(slots, null)).toEqual([])
    expect(moveTargetsOf(slots, 0)).toEqual([])
  })
})
