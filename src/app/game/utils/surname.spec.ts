import { surname } from "game/utils/surname"

describe("surname", () => {
  it("keeps a single name as is", () => {
    expect(surname("Neymar")).toBe("Neymar")
  })

  it("drops the first names", () => {
    expect(surname("Lionel Andrés Messi")).toBe("Messi")
  })

  it("keeps the particles of a compound surname", () => {
    expect(surname("Matthijs de Ligt")).toBe("de Ligt")
    expect(surname("Virgil van Dijk")).toBe("van Dijk")
  })

  it("ignores surrounding spaces", () => {
    expect(surname("  Karim Benzema ")).toBe("Benzema")
  })
})
