import { previewSlotsOf } from "game/utils/preview-slots"

describe("previewSlotsOf", () => {
  it("builds one empty slot per position with its line", () => {
    expect(previewSlotsOf(["GK", "CB", "AM", "ST"])).toEqual([
      { index: 0, position: "GK", line: "GOALKEEPER", player: null },
      { index: 1, position: "CB", line: "DEFENDER", player: null },
      { index: 2, position: "AM", line: "MIDFIELDER", player: null },
      { index: 3, position: "ST", line: "ATTACKER", player: null },
    ])
  })

  it("returns no slot when there is no position", () => {
    expect(previewSlotsOf([])).toEqual([])
  })
})
