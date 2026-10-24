import { SimulationSpeed, minuteDelayMs } from "game/utils/simulation-speed"

const speed: SimulationSpeed = { id: "test", label: "Test", minuteMs: 100, kickMs: 1000 }

describe("minuteDelayMs", () => {
  it("keeps the base pace for most of the match", () => {
    expect(minuteDelayMs(speed, 1)).toBe(100)
    expect(minuteDelayMs(speed, 60)).toBe(100)
    expect(minuteDelayMs(speed, 80)).toBe(100)
  })

  it("slows down progressively towards the end of regular time", () => {
    expect([81, 85, 88, 90].map((minute) => minuteDelayMs(speed, minute))).toEqual([150, 250, 400, 400])
  })

  it("applies the same suspense at the end of extra time", () => {
    expect(minuteDelayMs(speed, 100)).toBe(100)
    expect(minuteDelayMs(speed, 118)).toBe(400)
  })
})
