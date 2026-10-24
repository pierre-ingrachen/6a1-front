import { formationDisplayName, formationTitle, formationVariant } from "game/utils/position-labels"

describe("formation display", () => {
  it("shows the family title and the variant of a tactical variant", () => {
    expect(formationTitle("4-1-2-3")).toBe("4-3-3")
    expect(formationVariant("4-1-2-3")).toBe("Défensif")
    expect(formationVariant("5-2-1-2")).toBe("Offensif")
  })

  it("gives no word to a formation without variants", () => {
    expect(formationTitle("4-2-3-1")).toBe("4-2-3-1")
    expect(formationVariant("4-2-3-1")).toBe("")
    expect(formationVariant("5-4-1")).toBe("")
  })

  it("keeps the large and diamond words for the 4-1-2-1-2 family", () => {
    expect(formationVariant("4-1-3-2")).toBe("Large")
    expect(formationVariant("4-1-2-1-2")).toBe("Losange")
  })

  it("builds a readable full name", () => {
    expect(formationDisplayName("3-1-4-2")).toBe("3-5-2 défensif")
    expect(formationDisplayName("4-2-3-1")).toBe("4-2-3-1")
    expect(formationDisplayName("4-3-3")).toBe("4-3-3 équilibré")
  })

  it("gives a word to every formation that has variants", () => {
    const labels = ["4-3-3", "4-1-2-3", "4-2-1-3", "4-4-2", "4-2-2-2", "3-4-3", "3-2-2-3", "4-1-2-1-2", "4-1-3-2", "3-5-2", "3-1-4-2", "3-4-1-2", "5-3-2", "5-1-2-2", "5-2-1-2"]

    expect(labels.every((label) => formationVariant(label).length > 0)).toBeTrue()
  })

  it("never shows the same title and variant twice", () => {
    const labels = ["4-3-3", "4-1-2-3", "4-2-1-3", "4-4-2", "4-2-2-2", "4-1-2-1-2", "4-1-3-2", "3-2-2-3", "3-5-2", "3-1-4-2", "3-4-1-2", "5-3-2", "5-1-2-2", "5-2-1-2"]
    const names = labels.map(formationDisplayName)

    expect(new Set(names).size).toBe(labels.length)
  })
})
