import { playerPositionLabel } from "utils/position-label"

describe("playerPositionLabel", () => {
  it("translates known positions", () => {
    expect(["Forward", "Midfielder", "Defender", "Goalkeeper"].map(playerPositionLabel)).toEqual(["Attaquant", "Milieu", "Défenseur", "Gardien"])
  })

  it("does not resolve inherited object properties", () => expect(playerPositionLabel("toString")).toBe("toString"))

  it("keeps unknown positions unchanged", () => expect(playerPositionLabel("Coach")).toBe("Coach"))
})
