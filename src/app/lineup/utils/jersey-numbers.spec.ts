import { assignJerseyNumbers } from "lineup/utils/jersey-numbers"

describe("assignJerseyNumbers", () => {
  it("gives 1 to the goalkeeper and 9 to the striker", () => {
    expect(assignJerseyNumbers(["GK", "ST"])).toEqual([1, 9])
  })

  it("numbers fullbacks and wingers by side", () => {
    expect(assignJerseyNumbers(["RB", "LB", "RW", "LW"])).toEqual([2, 3, 7, 11])
  })

  it("gives successive numbers to players sharing a position", () => {
    expect(assignJerseyNumbers(["CB", "CB", "ST", "ST"])).toEqual([4, 5, 9, 19])
  })

  it("never repeats a number", () => {
    const numbers = assignJerseyNumbers(["RB", "RM", "LB", "LM", "CM", "CM", "CM", "CM", "AM", "AM", "ST"])

    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it("falls back to a free number for unknown positions", () => {
    expect(assignJerseyNumbers(["XX", "XX"])).toEqual([30, 31])
  })
})
