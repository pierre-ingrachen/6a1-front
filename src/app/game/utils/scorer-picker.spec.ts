import { Slot } from "game/models/game.model"
import { pickScorer, scorersOfSquad } from "game/utils/scorer-picker"

const slotOf = (index: number, position: string, line: Slot["line"], rating: number): Slot => ({
  index,
  position,
  line,
  player: { playerId: index, name: `Player ${index}`, rating, teamName: "", seasonLabel: "", positions: [position] },
})

const scorersOf = (...slots: Slot[]) => scorersOfSquad(slots)

const squad = scorersOf(slotOf(0, "GK", "GOALKEEPER", 90), slotOf(1, "CB", "DEFENDER", 90), slotOf(2, "ST", "ATTACKER", 90))

describe("pickScorer", () => {
  it("returns null when nobody is on the pitch", () => {
    expect(pickScorer(scorersOfSquad([{ index: 0, position: "GK", line: "GOALKEEPER", player: null }]), () => 0.5)).toBeNull()
  })

  it("favours attackers over defenders and goalkeepers", () => {
    expect(pickScorer(squad, () => 0.5)?.name).toBe("Player 2")
  })

  it("can still pick a defender with a low roll", () => {
    expect(pickScorer(squad, () => 0.05)?.name).toBe("Player 1")
  })

  it("never fails on the highest roll", () => {
    expect(pickScorer(squad, () => 0.999999)?.name).toBe("Player 2")
  })

  it("favours the better rated player on the same line", () => {
    const strikers = scorersOf(slotOf(0, "ST", "ATTACKER", 60), slotOf(1, "ST", "ATTACKER", 95))
    const picks = Array.from({ length: 100 }, (_, i) => pickScorer(strikers, () => i / 100)?.name)
    expect(picks.filter((name) => name === "Player 1").length).toBeGreaterThan(70)
  })
})
